import { Connection } from '@solana/web3.js';
import { db } from '../db/cocobase.js';
import { getDerivedSolanaWalletAddress, sweepUSDCToMaster } from './solanaWalletDeriver.js';
import { activateSubscription } from './subscriptionManager.js';
import { addAddressToHeliusWebhook } from './setupHeliusWebhook.js';

const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
);

const SESSION_EXPIRY_HOURS = 2;

// Called when user clicks "Pay" on billing page
export async function createPaymentSession(
  userId: string,
  userIndex: number,  // Stable integer — store in user record
  plan: 'starter' | 'pro'
): Promise<{ address: string; expiresAt: string; sessionId: string }> {

  const walletAddress = await getDerivedSolanaWalletAddress(userIndex);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

  // Save session to Cocobase
  const session = await db.createDocument("payment_sessions", {
    user_id: userId,
    user_index: userIndex,
    plan,
    solana_usdc_address: walletAddress, // DB field still called this, but now stores base wallet
    amount_expected: plan === 'starter' ? 29 : 79,
    status: 'pending',          // 'pending' | 'confirmed' | 'expired' | 'failed'
    chain: 'solana',
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString()
  });

  // Register this address with Helius webhook
  await addAddressToHeliusWebhook(walletAddress);

  return {
    address: walletAddress,
    expiresAt: expiresAt.toISOString(),
    sessionId: session.id
  };
}



// Called by Helius webhook when USDC lands on any monitored address
export async function handleSolanaPayment(
  toAddress: string,
  amountUSDC: number,
  txSignature: string
) {
  // ── Deduplication ──
  const existing = await db.listDocuments("payments", {
    filters: { tx_signature: txSignature }
  });
  if (existing.length > 0) return; // Already processed

  // ── Find matching payment session to identify the user ──
  const sessions = await db.listDocuments("payment_sessions", {
    filters: {
      solana_usdc_address: toAddress
    }
  });

  if (!sessions.length) {
    // Payment to an address we don't recognize — log for manual review
    await db.createDocument("unmatched_payments", {
      chain: 'solana',
      to_address: toAddress,
      amount_usdc: amountUSDC,
      tx_signature: txSignature,
      received_at: new Date().toISOString()
    });
    console.log(`⚠️ Unmatched payment to ${toAddress}. Cannot sweep because user is unknown.`);
    return;
  }

  // Sort by created_at descending (latest session first)
  sessions.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const session = sessions[0] as any;
  const userIndex = session.user_index;

  // If the session was already confirmed from a previous transaction, this is a duplicate or extra payment.
  // We still sweep it below, but we don't re-activate the subscription.
  if (session.status === 'confirmed' || session.status === 'confirmed_late') {
    try {
      await sweepUSDCToMaster(userIndex, connection);
      console.log(`✅ Swept extra payment from user ${userIndex} to master.`);
    } catch (e) {
      console.error(`Error sweeping extra payment for user ${userIndex}`, e);
    }
    return;
  }

  // ── We MUST sweep any funds received in this wallet to the master wallet ──
  // Do this early so even if it fails validation, we still sweep.
  let txSignatureSwept = null;
  try {
    txSignatureSwept = await sweepUSDCToMaster(userIndex, connection);
  } catch (e) {
    console.error(`Error sweeping for user ${userIndex}`, e);
  }

  // ── Verify amount is close enough (allow ±$1.00 for rounding/fees) ──
  const expectedAmount = session.amount_expected;
  const diff = Math.abs(amountUSDC - expectedAmount);
  if (diff > 1.0) {
    await db.updateDocument("payment_sessions", session.id, {
      status: 'wrong_amount',
      received_amount: amountUSDC,
      tx_signature: txSignature
    });
    console.log(`⚠️ Wrong amount: expected $${expectedAmount}, got $${amountUSDC} for session ${session.id}. Funds swept to master.`);
    return;
  }

  // ── Check session not expired ──
  if (new Date(session.expires_at) < new Date()) {
    // Still credit the payment — we received the money
    await db.updateDocument("payment_sessions", session.id, {
      status: 'confirmed_late',
      received_amount: amountUSDC,
      tx_signature: txSignature
    });
    await activateSubscription({
      userId: session.user_id,
      plan: session.plan,
      amountUSDC,
      txSignature,
      chain: 'solana'
    });
    console.log(`✅ Late Payment confirmed for user ${session.user_id} — ${session.plan} activated. Funds swept.`);
    return;
  }

  // ── Mark session as confirmed ──
  await db.updateDocument("payment_sessions", session.id, {
    status: 'confirmed',
    received_amount: amountUSDC,
    tx_signature: txSignature,
    confirmed_at: new Date().toISOString()
  });

  // ── Activate subscription ──
  await activateSubscription({
    userId: session.user_id,
    plan: session.plan,
    amountUSDC,
    txSignature,
    chain: 'solana'
  });

  console.log(`✅ Payment confirmed for user ${session.user_id} — ${session.plan} activated. Funds swept.`);
}
