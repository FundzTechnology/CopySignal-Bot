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

  // ── GATE 1: Deduplication ──────────────────────────────────
  const existing = await db.listDocuments("signals", {
    filters: { channel_id: channelDoc.id, telegram_message_id: messageId }
  });
  if (existing.length > 0) return;

  // ── GATE 2: Trigger Keyword Filtering ───────────────────────
  const keyword = channelDoc.trigger_keyword;
  if (!containsTriggerKeyword(rawMessage, keyword)) {
    // Check if it's a management command (e.g., "HOLD TO TP2") before discarding entirely
    const mgmt = parseManagementCommand(rawMessage, keyword);
    if (mgmt.action) {
      await executeManagementAction(userId, mgmt.symbol, mgmt.action, channelDoc);
    }
    return; // Discard non-signals
  }

  // ── GATE 3: Initial Parsing ─────────────────────────────────
  const parsed = parseSignal(rawMessage);

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
    return;
  }
  if (parsed.confidence === 'medium' && !channelDoc.allow_medium_confidence) {
    await db.updateDocument("signals", signalDoc.id, { status: 'skipped_quality' });
    return;
  }

  // ── GATE 6: TP Selection Rule ───────────────────────────────
  const tpSelection = getDefaultTPSelection(parsed.take_profits, parsed.side as 'Buy' | 'Sell');

  // ── GATE 7: Billing & API Check ─────────────────────────────
  const user = await db.auth.getUserById(userId);
  if (user?.data?.plan === 'free') return; // Must have active plan

  const apiKeys = await db.listDocuments("api_keys", {
    filters: { user_id: userId, exchange: channelDoc.exchange }
  });
  if (!apiKeys.length) return;

  // ── EXECUTION ───────────────────────────────────────────────
  const multiTpPercent = user.data?.multi_tp_partial || 0;
  
  let result;
  try {
    if (channelDoc.exchange === 'bybit') {
      result = await executeBybit(apiKeys[0] as any, parsed, channelDoc.risk_percent, multiTpPercent);
    } else {
      result = await executeBinance(apiKeys[0] as any, parsed, channelDoc.risk_percent, multiTpPercent);
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
  });

  await db.updateDocument("signals", signalDoc.id, {
    status: result.success ? 'executed' : 'failed'
  });

  // ── ALERT ───────────────────────────────────────────────────
  if (user?.data?.telegram_user_id && result.success) {
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
