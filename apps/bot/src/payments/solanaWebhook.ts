import express, { Request, Response } from 'express';
import { Connection } from '@solana/web3.js';
import { db } from '../db/cocobase.js';
import { activateSubscription } from './subscriptionManager.js';

const router = express.Router();

// ── Config ──────────────────────────────────────────────────────
const YOUR_SOLANA_WALLET = process.env.SOLANA_WALLET_ADDRESS!;

// USDC mint address on Solana mainnet (user-provided contract)
const USDC_MINT = 'DSgSbuu4J4tDFjo7qb98TjtNeDwMHH68CwiKZi66P3Y3';

// Helius RPC connection (for on-chain verification)
const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
);

// ── Verify tx exists on-chain (anti-forgery) ──────────────────
async function verifyConfirmedOnChain(signature: string): Promise<boolean> {
  try {
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) return false;
    if (tx.meta?.err !== null && tx.meta?.err !== undefined) return false;
    return true;
  } catch {
    return false;
  }
}

// ── Main Helius Webhook Handler ────────────────────────────────
router.post('/webhook/solana', async (req: Request, res: Response) => {
  // Always respond 200 immediately — Helius retries on timeout
  res.status(200).json({ received: true });

  const transactions: any[] = req.body;
  if (!Array.isArray(transactions)) return;

  for (const tx of transactions) {
    try {
      await processSolanaTransaction(tx);
    } catch (err) {
      console.error('Error processing Solana tx:', err);
    }
  }
});

async function processSolanaTransaction(tx: any) {
  const signature = tx.signature;

  // ── Guard 1: Only confirmed/finalized ──
  const commitment = tx.meta?.commitment || 'confirmed';
  if (!['confirmed', 'finalized'].includes(commitment)) {
    console.log(`⏳ Skipping unconfirmed Solana tx: ${signature}`);
    return;
  }

  // ── Guard 2: Verify on-chain (blocks fake webhook bodies) ──
  const isReal = await verifyConfirmedOnChain(signature);
  if (!isReal) {
    console.warn(`🚨 Unverifiable Solana tx: ${signature} — ignoring`);
    return;
  }

  // ── Guard 3: Failed transactions ──
  if (tx.meta?.err !== null && tx.meta?.err !== undefined) {
    console.log(`❌ Failed Solana tx ignored: ${signature}`);
    return;
  }

  // ── Guard 4: Deduplication ──
  const existing = await db.listDocuments('payments', {
    filters: { tx_signature: signature },
  });
  if (existing.length > 0) {
    console.log(`🔁 Duplicate Solana tx — already processed: ${signature}`);
    return;
  }

  // ── Find USDC transfer to our wallet ──
  const tokenTransfers: any[] = tx.tokenTransfers || [];
  const usdcTransfer = tokenTransfers.find(
    (t: any) =>
      t.mint === USDC_MINT &&
      t.toUserAccount?.toLowerCase() === YOUR_SOLANA_WALLET.toLowerCase()
  );
  if (!usdcTransfer) return;

  const amountUSDC: number = usdcTransfer.tokenAmount;

  // ── Extract reference code from memo ──
  const memo: string = tx.memo || '';
  const refMatch = memo.toUpperCase().match(/SOL-REF-([A-Z0-9]{6})/);

  if (!refMatch) {
    console.log(`⚠️ Solana payment with no valid ref — amount: $${amountUSDC}, sig: ${signature}`);
    await db.createDocument('unmatched_payments', {
      chain: 'solana',
      tx_signature: signature,
      amount_usdc: amountUSDC,
      memo,
      received_at: new Date().toISOString(),
      resolved: false,
    });
    return;
  }

  const refCode = refMatch[0];
  const refs = await db.listDocuments('payment_refs', {
    filters: { sol_ref_code: refCode },
  });
  if (!refs.length) {
    console.log(`⚠️ Unknown SOL ref code: ${refCode}`);
    return;
  }

  const userId = (refs[0] as any).user_id;
  let plan: 'starter' | 'pro' | null = null;
  if (amountUSDC >= 29 && amountUSDC < 79) plan = 'starter';
  if (amountUSDC >= 79) plan = 'pro';

  if (!plan) {
    console.log(`⚠️ Unrecognized Solana amount: $${amountUSDC}`);
    return;
  }

  await activateSubscription({ userId, plan, amountUSDC, txSignature: signature, chain: 'solana' });
  console.log(`✅ Solana payment processed — ${plan} for user ${userId}`);
}

export default router;
