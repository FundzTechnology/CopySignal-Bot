import { db } from '../db/cocobase.js';
import { activateSubscription } from './subscriptionManager.js';
import { sweepSuiUSDCToMaster } from './suiWalletDeriver.js';

// ── Config ──────────────────────────────────────────────────────
// Official Circle USDC coin type on SUI mainnet
const SUI_USDC_TYPE =
  '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';

// Fallback to the legacy coin type if the official one doesn't match
const SUI_USDC_TYPE_LEGACY =
  '0x7f821d44c87a6c44689298672fea7e54800a8a4f9cba2edd6776d8233c7b819f::usdc::USDC';

const SUI_RPC = 'https://fullnode.mainnet.sui.io:443';

// ── Plan detection thresholds ────────────────────────────────────
// Starter: $10+ USDC. Pro: $25+ USDC.
const STARTER_THRESHOLD = 10;
const PRO_THRESHOLD = 25;

// Per-address cursor tracking to avoid re-processing old transactions
const addressCursors: Record<string, string | null> = {};

/** Call SUI JSON-RPC directly — avoids SDK abstract class issues */
async function suiRpc(method: string, params: unknown[]): Promise<any> {
  const res = await fetch(SUI_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json() as any;
  if (json.error) throw new Error(`SUI RPC error: ${JSON.stringify(json.error)}`);
  return json.result;
}

export async function startSuiWatcher() {
  // Validate we have the master wallet configured (for sweeping funds)
  const masterWallet = process.env.SUI_MASTER_WALLET;
  if (!masterWallet) {
    console.warn('⚠️  SUI watcher: SUI_MASTER_WALLET not set — sweeping will be disabled');
  }
  if (!process.env.SUI_MASTER_MNEMONIC) {
    console.warn('⚠️  SUI watcher: SUI_MASTER_MNEMONIC not set — sweeping will be disabled');
  }

  console.log('👁  SUI payment watcher started — polling active sessions every 10s');

  setInterval(async () => {
    try {
      await checkAllActiveSuiSessions();
    } catch (err) {
      console.error('SUI watcher error:', err);
    }
  }, 10_000);
}

/**
 * Fetches all pending SUI payment sessions from DB and checks each
 * derived wallet address for incoming USDC transactions.
 */
async function checkAllActiveSuiSessions() {
  // Get all payment sessions for SUI chain that are still pending
  const allSessions = await db.listDocuments('payment_sessions', {
    filters: { chain: 'sui', status: 'pending' },
  }) as any[];

  if (allSessions.length === 0) return;

  for (const session of allSessions) {
    const suiAddress: string = session.sui_address || session[`sui_address`];
    if (!suiAddress) continue;

    try {
      await checkSuiTransactionsForAddress(suiAddress, session);
    } catch (err) {
      console.error(`SUI watcher error for address ${suiAddress}:`, err);
    }
  }
}

async function checkSuiTransactionsForAddress(walletAddress: string, session: any) {
  const cursor = addressCursors[walletAddress] ?? null;

  const result = await suiRpc('suix_queryTransactionBlocks', [
    { filter: { ToAddress: walletAddress } },
    cursor,   // cursor (null = start from latest)
    20,       // limit
    false,    // descending (newest first)
  ]);

  const blocks: any[] = result?.data ?? [];
  if (blocks.length === 0) return;

  if (result?.nextCursor) {
    addressCursors[walletAddress] = result.nextCursor;
  }

  for (const block of blocks) {
    try {
      const txDetail = await suiRpc('sui_getTransactionBlock', [
        block.digest,
        {
          showInput: true,
          showEffects: true,
          showBalanceChanges: true,
        },
      ]);
      await processSuiTransaction(txDetail, walletAddress, session);
    } catch (err) {
      console.error(`Error fetching SUI tx ${block.digest}:`, err);
    }
  }
}

async function processSuiTransaction(txBlock: any, walletAddress: string, session: any) {
  const digest: string = txBlock.digest;

  // ── Guard 1: Must be successful ──
  const status = txBlock.effects?.status?.status;
  if (status !== 'success') {
    console.log(`❌ Failed SUI tx ignored: ${digest}`);
    return;
  }

  // ── Guard 2: Deduplication ──
  const existing = await db.listDocuments('payments', {
    filters: { tx_signature: digest },
  });
  if (existing.length > 0) return;

  // ── Find USDC balance change to our derived wallet ──
  const balanceChanges: any[] = txBlock.balanceChanges ?? [];
  const usdcReceived = balanceChanges.find(
    (bc: any) =>
      (bc.owner?.AddressOwner ?? '').toLowerCase() === walletAddress.toLowerCase() &&
      (bc.coinType === SUI_USDC_TYPE || bc.coinType === SUI_USDC_TYPE_LEGACY) &&
      parseInt(bc.amount) > 0
  );
  if (!usdcReceived) return;

  // USDC on SUI uses 6 decimal places
  const amountUSDC = parseInt(usdcReceived.amount) / 1_000_000;

  console.log(`💰 SUI: Received $${amountUSDC} USDC on ${walletAddress} (digest: ${digest})`);

  // ── Guard 3: If session already confirmed, just sweep ──
  if (session.status === 'confirmed' || session.status === 'confirmed_late') {
    console.log(`ℹ️  Session already confirmed — sweeping extra SUI payment.`);
    await sweepSuiUSDCToMaster(session.user_index).catch(e =>
      console.error('SUI sweep error:', e)
    );
    return;
    return;
  }

  // ── Unconditional Sweep ──
  // We MUST sweep any funds received in this wallet to the master wallet early
  await sweepSuiUSDCToMaster(session.user_index).catch(e =>
    console.error('SUI sweep error (non-fatal):', e)
  );

  // ── Accumulate partial payments ──
  const previousAmount = session.received_amount || 0;
  const totalAmountUSDC = previousAmount + amountUSDC;

  // ── Determine plan from total amount ──
  let plan: 'starter' | 'pro' | null = null;
  if (totalAmountUSDC >= PRO_THRESHOLD) {
    plan = 'pro';
  } else if (totalAmountUSDC >= STARTER_THRESHOLD) {
    plan = 'starter';
  }

  if (!plan) {
    // Total is still below threshold. Update session and notify.
    await db.updateDocument('payment_sessions', session.id, {
      status: 'wrong_amount',
      received_amount: totalAmountUSDC,
      tx_signature: digest
    });

    // Determine the target the user is probably aiming for based on session
    const targetAmount = session.amount_expected === 25 ? 25.5 : 10.5;
    const remaining = Math.max(0, targetAmount - totalAmountUSDC);

    console.log(`⚠️ SUI payment amount $${totalAmountUSDC} is below the minimum threshold ($${STARTER_THRESHOLD}). Session updated. Funds swept.`);
    
    // Send INCOMPLETE notification
    const { notify } = await import('../services/notificationService.js');
    await notify({
      type: 'PAYMENT_INCOMPLETE',
      userId: session.user_id,
      payload: {
        chain: 'sui',
        received: totalAmountUSDC,
        target: targetAmount,
        remaining,
        walletAddress,
      }
    }).catch((e: any) => console.error('Notify error:', e));
    
    return;
  }

  // ── Check session expiry ──
  const isLate = new Date(session.expires_at) < new Date();

  // ── Update session record ──
  await db.updateDocument('payment_sessions', session.id, {
    status: isLate ? 'confirmed_late' : 'confirmed',
    received_amount: totalAmountUSDC,
    tx_signature: digest,
    confirmed_at: new Date().toISOString(),
  });

  // ── Activate subscription ──
  await activateSubscription({
    userId: session.user_id,
    plan,
    amountUSDC: totalAmountUSDC,
    txSignature: digest,
    chain: 'sui',
  });

  console.log(`✅ SUI payment processed — ${plan} for user ${session.user_id} (${isLate ? 'late' : 'on-time'})`);
}
