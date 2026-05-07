import { db } from '../db/cocobase.js';
import { notify } from '../services/notificationService.js';

export interface ActivateParams {
  userId: string;
  plan: 'starter' | 'pro';
  amountUSDC: number;
  txSignature: string;
  chain: 'solana' | 'sui';
}

export async function activateSubscription(params: ActivateParams) {
  const { userId, plan, amountUSDC, txSignature, chain } = params;

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30); // Always 30 days

  // ── 1. Save payment record (idempotency key = tx_signature) ──
  await db.createDocument('payments', {
    user_id: userId,
    plan,
    amount_usdc: amountUSDC,
    tx_signature: txSignature,
    chain,
    paid_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  });

  // ── 2. Update user's live plan state ──
  await db.updateDocument('users', userId, {
    plan,
    plan_expires_at: expiresAt.toISOString(),
    trial_used: true,
    subscription_warning: false,
  });

  // ── 3. Send Telegram confirmation ──
  const user = await db.auth.getUserById(userId);
  if (user?.data?.telegram_user_id) {
    await notify({
      type: 'PAYMENT_CONFIRMED',
      userId,
      payload: { plan, chain }
    });
  }

  console.log(`✅ Subscription activated — user ${userId} → ${plan} until ${expiresAt.toISOString()}`);
}

/** Generate or retrieve a user's payment reference codes */
export async function getOrCreateRefCodes(userId: string) {
  const existing = await db.listDocuments('payment_refs', {
    filters: { user_id: userId },
  });
  if (existing.length > 0) return existing[0];

  const suffix = userId.substring(0, 6).toUpperCase();
  const newRef = await db.createDocument('payment_refs', {
    user_id: userId,
    sol_ref_code: `SOL-REF-${suffix}`,
    sui_ref_code: `SUI-REF-${suffix}`,
    created_at: new Date().toISOString(),
  });
  return newRef;
}
