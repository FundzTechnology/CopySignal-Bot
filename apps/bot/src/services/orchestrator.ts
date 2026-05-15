import { db } from '../db/cocobase.js';
import { parseSignal, scoreSignal, classifyConfidence, containsTriggerKeyword } from '../parser/signalParser.js';
import { parseManagementCommand } from '../parser/managementParser.js';
import { getDefaultTPSelection } from '../parser/tpSelector.js';
import { executeManagementAction } from './tradeManager.js';
import { executeBybit } from '../executors/bybitExecutor.js';
import { executeBinance } from '../executors/binanceExecutor.js';
import { notify } from './notificationService.js';

export async function handleSignal(
  rawMessage: string,
  messageId: string,
  channelDoc: any
) {
  const userId = channelDoc.user_id;
  console.log(`[Orchestrator] 📨 Signal received from channel "${channelDoc.name}" for user ${userId}`);
  console.log(`[Orchestrator] Raw message (first 200 chars): ${rawMessage.substring(0, 200)}`);

  // ── GATE 1: Deduplication ──────────────────────────────────
  try {
    const existing = await db.listDocuments("signals", {
      filters: { channel_id: channelDoc.id, telegram_message_id: messageId }
    });
    if (existing.length > 0) {
      console.log(`[Orchestrator] ⏭️ Duplicate signal — skipping`);
      return;
    }
  } catch {
    // signals collection may not exist — proceed
  }

  // ── GATE 2: Trigger Keyword Filtering ───────────────────────
  const keyword = channelDoc.trigger_keyword;
  if (!containsTriggerKeyword(rawMessage, keyword)) {
    // Check if it's a management command (e.g., "HOLD TO TP2") before discarding entirely
    const mgmt = parseManagementCommand(rawMessage, keyword);
    if (mgmt.action) {
      await executeManagementAction(userId, mgmt.symbol, mgmt.action, channelDoc);
    }
    console.log(`[Orchestrator] ⏭️ No trigger keyword match — skipping`);
    return; // Discard non-signals
  }

  // ── GATE 3: Initial Parsing ─────────────────────────────────
  const parsed = parseSignal(rawMessage);
  console.log(`[Orchestrator] 📊 Parsed: ${parsed.symbol} ${parsed.side} entry=${parsed.entry} SL=${parsed.stop_loss} TPs=${parsed.take_profits.join(',')}`);

  // Check if it is actually a management command with the trigger keyword included
  const mgmt = parseManagementCommand(rawMessage, keyword);
  if (mgmt.action && !parsed.entry) {
    await executeManagementAction(userId, mgmt.symbol, mgmt.action, channelDoc);
    return;
  }

  // ── GATE 4: Confidence Scoring ──────────────────────────────
  const score = scoreSignal(parsed, channelDoc);
  parsed.confidence_score = score;
  parsed.confidence = classifyConfidence(score);
  console.log(`[Orchestrator] 🎯 Confidence: ${parsed.confidence} (score: ${score})`);

  // Store in DB for observability
  const signalDoc = await db.createDocument("signals", {
    channel_id: channelDoc.id,
    user_id: userId,
    telegram_message_id: messageId,
    raw_message: rawMessage,
    parsed,
    status: parsed.confidence === 'failed' ? 'failed' : 'parsed',
    received_at: new Date().toISOString()
  });

  // ── GATE 5: Quality Enforcement ─────────────────────────────
  if (parsed.confidence === 'failed' || parsed.confidence === 'low') {
    await db.updateDocument("signals", signalDoc.id, { status: 'skipped_quality' });
    console.log(`[Orchestrator] ⏭️ Signal quality too low (${parsed.confidence}) — skipping`);
    return;
  }
  if (parsed.confidence === 'medium' && !channelDoc.allow_medium_confidence) {
    await db.updateDocument("signals", signalDoc.id, { status: 'skipped_quality' });
    console.log(`[Orchestrator] ⏭️ Medium confidence not allowed for this channel — skipping`);
    return;
  }

  // ── GATE 6: TP Selection Rule ───────────────────────────────
  const tpSelection = getDefaultTPSelection(parsed.take_profits, parsed.side as 'Buy' | 'Sell');

  // ── GATE 7: Billing & API Check ─────────────────────────────
  let user: any;
  try {
    user = await db.auth.getUserById(userId);
  } catch {
    console.log(`[Orchestrator] ⏭️ Could not fetch user ${userId} — skipping`);
    return;
  }
  if (user?.data?.plan === 'free') {
    console.log(`[Orchestrator] ⏭️ User on free plan — skipping`);
    return;
  }

  // Fetch API keys — handle Cocobase .data nesting
  let apiKeyDoc: any = null;
  try {
    const apiKeys = await db.listDocuments("api_keys", {
      filters: { user_id: userId, exchange: channelDoc.exchange }
    });
    if (apiKeys.length > 0) apiKeyDoc = apiKeys[0];
  } catch {}

  // Fallback: fetch all and filter in code
  if (!apiKeyDoc) {
    try {
      const allKeys = await db.listDocuments("api_keys", {}) as any[];
      apiKeyDoc = allKeys.find((k: any) => {
        const d = k.data || k;
        return (d.user_id || k.user_id) === userId &&
               (d.exchange || k.exchange) === channelDoc.exchange;
      });
      
      if (!apiKeyDoc) {
         console.log(`[Orchestrator DB Debug] Database has ${allKeys.length} total keys.`);
         allKeys.forEach((k: any) => {
           const d = k.data || k;
           console.log(`[Orchestrator DB Debug] Found key for user: ${d.user_id || k.user_id}, Exchange: ${d.exchange || k.exchange}`);
         });
      }
    } catch {}
  }

  if (!apiKeyDoc) {
    console.log(`[Orchestrator] ⏭️ No API key found for ${channelDoc.exchange} for user ${userId} — skipping`);
    return;
  }

  // Unwrap .data nesting for the executor
  const unwrappedKey = {
    api_key: apiKeyDoc.data?.api_key || apiKeyDoc.api_key,
    api_secret: apiKeyDoc.data?.api_secret || apiKeyDoc.api_secret,
    testnet: apiKeyDoc.data?.testnet ?? apiKeyDoc.testnet ?? false,
    demo_mode: apiKeyDoc.data?.demo_mode ?? apiKeyDoc.demo_mode ?? false,
  };

  // ── EXECUTION ───────────────────────────────────────────────
  const multiTpPercent = user.data?.multi_tp_partial || 0;
  
  let result;
  try {
    console.log(`[Orchestrator] 🚀 Executing ${parsed.symbol} ${parsed.side} on ${channelDoc.exchange} (demo=${unwrappedKey.demo_mode})`);
    if (channelDoc.exchange === 'bybit') {
      result = await executeBybit(unwrappedKey as any, parsed, channelDoc.risk_percent, multiTpPercent);
    } else {
      result = await executeBinance(unwrappedKey as any, parsed, channelDoc.risk_percent, multiTpPercent);
    }
  } catch (execErr: any) {
    // Alert admin on critical execution failures
    await notify({
      type: 'SYSTEM_ERROR',
      payload: {
        context: `Trade Execution Failed — ${parsed.symbol} on ${channelDoc.exchange}`,
        error: execErr.message || String(execErr)
      }
    });
    result = { success: false, qty: 0, entryPrice: 0, error: execErr.message };
  }

  console.log(`[Orchestrator] ${result.success ? '✅' : '❌'} Execution result: ${JSON.stringify(result)}`);

  // ── RECORDING ───────────────────────────────────────────────
  await db.createDocument("trade_logs", {
    user_id: userId,
    signal_id: signalDoc.id,
    channel_id: channelDoc.id,
    exchange: channelDoc.exchange,
    symbol: parsed.symbol,
    side: parsed.side,
    order_type: 'Market',
    qty: result.qty,
    entry_price: result.entryPrice,
    take_profit: tpSelection.initialTP,
    stop_loss: parsed.stop_loss,
    all_tps: tpSelection.allTPs,
    active_tp_index: tpSelection.activeTPIndex,
    status: result.success ? 'filled' : 'error',
    error_msg: result.error || null,
    executed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });

  await db.updateDocument("signals", signalDoc.id, {
    status: result.success ? 'executed' : 'failed'
  });

  // ── ALERT ───────────────────────────────────────────────────
  if (result.success) {
    await notify({
      type: 'TRADE_OPENED',
      userId,
      payload: {
        symbol: parsed.symbol!,
        side: parsed.side!,
        qty: result.qty,
        entry_price: result.entryPrice,
        take_profit: tpSelection.initialTP,
        stop_loss: parsed.stop_loss ?? undefined,
        exchange: channelDoc.exchange
      }
    });
  }
}
