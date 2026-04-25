import { db } from '../db/cocobase.js';
import { activateSubscription } from './subscriptionManager.js';

// ── Config ──────────────────────────────────────────────────────
// Full USDC coin type for SUI mainnet (user-provided contract)
const SUI_USDC_TYPE =
  '0x7f821d44c87a6c44689298672fea7e54800a8a4f9cba2edd6776d8233c7b819f::usdc::USDC';

const SUI_RPC = 'https://fullnode.mainnet.sui.io:443';

// Track pagination cursor so we never re-process old transactions
let lastCursor: string | null = null;

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
  if (!process.env.SUI_WALLET_ADDRESS) {
    console.warn('⚠️  SUI watcher skipped — SUI_WALLET_ADDRESS not set');
    return;
  }
  console.log('👁  SUI payment watcher started — polling every 10s');

  setInterval(async () => {
    try {
      await checkSuiTransactions();
    } catch (err) {
      console.error('SUI watcher error:', err);
    }
  }, 10_000);
}

async function checkSuiTransactions() {
  const walletAddress = process.env.SUI_WALLET_ADDRESS!;

  const result = await suiRpc('suix_queryTransactionBlocks', [
    { filter: { ToAddress: walletAddress } },
    lastCursor,         // cursor (null = start from latest)
    50,                 // limit
    true,               // descending = false means ascending
  ]);

  const blocks: any[] = result?.data ?? [];
  if (blocks.length === 0) return;

  if (result?.nextCursor) {
    lastCursor = result.nextCursor;
  }

  // Fetch full details for each block
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
      await processSuiTransaction(txDetail);
    } catch (err) {
      console.error(`Error fetching SUI tx ${block.digest}:`, err);
    }
  }
}

async function processSuiTransaction(txBlock: any) {
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

  // ── Find USDC balance change to our wallet ──
  const walletAddress = process.env.SUI_WALLET_ADDRESS!;
  const balanceChanges: any[] = txBlock.balanceChanges ?? [];
  const usdcReceived = balanceChanges.find(
    (bc: any) =>
      (bc.owner?.AddressOwner ?? '').toLowerCase() === walletAddress.toLowerCase() &&
      bc.coinType === SUI_USDC_TYPE &&
      parseInt(bc.amount) > 0
  );
  if (!usdcReceived) return;

  // USDC on SUI uses 6 decimal places
  const amountUSDC = parseInt(usdcReceived.amount) / 1_000_000;

  // ── Extract memo / reference code from tx inputs ──
  const txInputs: any[] =
    txBlock.transaction?.data?.transaction?.inputs ?? [];
  const memoInput = txInputs.find(
    (inp: any) => inp.type === 'pure' && inp.valueType === '0x1::string::String'
  );
  const memo: string = memoInput
    ? Buffer.from(memoInput.value as string, 'base64').toString('utf8')
    : '';

  const refMatch = memo.toUpperCase().match(/SUI-REF-([A-Z0-9]{6})/);

  if (!refMatch) {
    console.log(`⚠️ SUI payment no valid ref — $${amountUSDC}, digest: ${digest}`);
    await db.createDocument('unmatched_payments', {
      chain: 'sui',
      tx_signature: digest,
      amount_usdc: amountUSDC,
      memo,
      received_at: new Date().toISOString(),
      resolved: false,
    });
    return;
  }

  const refCode = refMatch[0];
  const refs = await db.listDocuments('payment_refs', {
    filters: { sui_ref_code: refCode },
  });
  if (!refs.length) {
    console.log(`⚠️ Unknown SUI ref code: ${refCode}`);
    return;
  }

  const userId = (refs[0] as any).user_id as string;
  let plan: 'starter' | 'pro' | null = null;
  if (amountUSDC >= 29 && amountUSDC < 79) plan = 'starter';
  if (amountUSDC >= 79) plan = 'pro';
  if (!plan) {
    console.log(`⚠️ Unrecognized SUI amount: $${amountUSDC}`);
    return;
  }

  await activateSubscription({
    userId,
    plan,
    amountUSDC,
    txSignature: digest,
    chain: 'sui',
  });
  console.log(`✅ SUI payment processed — ${plan} for user ${userId}`);
}
