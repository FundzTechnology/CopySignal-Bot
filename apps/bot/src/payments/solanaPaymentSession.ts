import { Connection } from '@solana/web3.js';
import { createHelius } from 'helius-sdk';
import { db } from '../db/cocobase.js';
import { getDerivedUSDCAddress, sweepUSDCToMaster } from './solanaWalletDeriver.js';
import { activateSubscription } from './subscriptionManager.js';

const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
);
const helius = createHelius({ apiKey: process.env.HELIUS_API_KEY! });

const SESSION_EXPIRY_HOURS = 2;

// Called when user clicks "Pay" on billing page
export async function createPaymentSession(
  userId: string,
  userIndex: number,  // Stable integer — store in user record
  plan: 'starter' | 'pro'
): Promise<{ address: string; expiresAt: string; sessionId: string }> {

  const usdcAddress = await getDerivedUSDCAddress(userIndex, connection);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

  // Save session to Cocobase
  const session = await db.createDocument("payment_sessions", {
    user_id: userId,
    user_index: userIndex,
    plan,
    solana_usdc_address: usdcAddress,
    amount_expected: plan === 'starter' ? 29 : 79,
    status: 'pending',          // 'pending' | 'confirmed' | 'expired' | 'failed'
    chain: 'solana',
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString()
  });

  // Register this address with Helius webhook
  await addAddressToHeliusWebhook(usdcAddress);

  return {
    address: usdcAddress,
    expiresAt: expiresAt.toISOString(),
    sessionId: session.id
  };
}

// Helius dynamically supports adding addresses to an existing webhook
async function addAddressToHeliusWebhook(address: string) {
  try {
    const webhooks = await helius.getAllWebhooks();
    const webhook = webhooks.find(
      (w: any) => w.webhookURL === process.env.HELIUS_WEBHOOK_URL
    );
    if (!webhook) return;

    // Add the new address to the existing webhook's address list
    const currentAddresses: string[] = webhook.accountAddresses || [];
    if (!currentAddresses.includes(address)) {
      await helius.editWebhook(webhook.webhookID, {
        accountAddresses: [...currentAddresses, address],
        webhookURL: process.env.HELIUS_WEBHOOK_URL!,
        transactionTypes: ['TRANSFER'],
        webhookType: 'enhanced'
      });
    }
  } catch (error) {
    console.error("Error adding address to Helius webhook:", error);
  }
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

  // ── Find matching payment session ──
  const sessions = await db.listDocuments("payment_sessions", {
    filters: {
      solana_usdc_address: toAddress,
      status: 'pending'
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
    return;
  }

  const session = sessions[0] as any;

  // ── Verify amount is close enough (allow ±$0.50 for rounding) ──
  const expectedAmount = session.amount_expected;
  const diff = Math.abs(amountUSDC - expectedAmount);
  if (diff > 0.5) {
    await db.updateDocument("payment_sessions", session.id, {
      status: 'wrong_amount',
      received_amount: amountUSDC,
      tx_signature: txSignature
    });
    console.log(`⚠️ Wrong amount: expected $${expectedAmount}, got $${amountUSDC} for session ${session.id}`);
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
    console.log(`✅ Late Payment confirmed for user ${session.user_id} — ${session.plan} activated`);
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

  // ── Sweep funds to master wallet ──
  await sweepUSDCToMaster(session.user_index, connection);

  console.log(`✅ Payment confirmed for user ${session.user_id} — ${session.plan} activated`);
}
