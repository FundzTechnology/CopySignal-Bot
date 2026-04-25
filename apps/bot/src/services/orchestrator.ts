import { db } from '../db/cocobase.js';
import { parseSignal } from '../parser/signalParser.js';
import { executeBybit } from '../executors/bybitExecutor.js';
import { executeBinance } from '../executors/binanceExecutor.js';
import { sendTradeAlert } from './alertBot.js';

export async function handleSignal(
  rawMessage: string,
  messageId: string,
  channelDoc: any   // Document from Cocobase 'channels' collection
) {
  const userId = channelDoc.user_id;

  // ── Guard: Deduplication ──────────────────────────────────
  // Make sure we haven't already processed this exact message
  const existing = await db.listDocuments("signals", {
    filters: {
      channel_id: channelDoc.id,
      telegram_message_id: messageId
    }
  });
  if (existing.length > 0) {
    console.log(`⚠️  Duplicate message ${messageId} — skipping`);
    return;
  }

  // ── Step 1: Parse Signal ──────────────────────────────────
  const parsed = parseSignal(rawMessage);

  // ── Step 2: Store Signal in Cocobase ─────────────────────
  const signalDoc = await db.createDocument("signals", {
    channel_id: channelDoc.id,
    user_id: userId,
    telegram_message_id: messageId,
    raw_message: rawMessage,
    parsed,
    status: parsed.confidence === 'failed' ? 'failed' : 'parsed',
    received_at: new Date().toISOString()
  });

  // ── Step 3: Skip Low Confidence ──────────────────────────
  if (parsed.confidence === 'low' || parsed.confidence === 'failed') {
    console.log(`⚠️  ${parsed.confidence} confidence — not executing`);
    await db.updateDocument("signals", signalDoc.id, { status: 'skipped' });
    return;
  }

  // ── Step 4: Check User Plan ───────────────────────────────
  const user = await db.auth.getUserById(userId);
  if (user?.data?.plan === 'free') {
    console.log(`User ${userId} on free plan — signal saved but not executed`);
    return;
  }

  // ── Step 5: Get User's API Keys ───────────────────────────
  const apiKeys = await db.listDocuments("api_keys", {
    filters: { user_id: userId, exchange: channelDoc.exchange }
  });
  if (!apiKeys.length) {
    console.log(`No API keys found for user ${userId} on ${channelDoc.exchange}`);
    return;
  }

  // ── Step 6: Execute Trade ─────────────────────────────────
  let result;
  if (channelDoc.exchange === 'bybit') {
    result = await executeBybit(apiKeys[0] as any, parsed, channelDoc.risk_percent);
  } else {
    result = await executeBinance(apiKeys[0] as any, parsed, channelDoc.risk_percent);
  }

  // ── Step 7: Log Trade to Cocobase ────────────────────────
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
    take_profit: parsed.take_profits[0] || undefined,
    stop_loss: parsed.stop_loss,
    status: result.success ? 'filled' : 'error',
    error_msg: result.error || null,
    executed_at: new Date().toISOString(),
    closed_at: null,
    pnl: null
  });

  // Update signal status
  await db.updateDocument("signals", signalDoc.id, {
    status: result.success ? 'executed' : 'failed'
  });

  // ── Step 8: Alert User via Telegram ──────────────────────
  if (user?.data?.telegram_user_id && result.success) {
    await sendTradeAlert(user.data.telegram_user_id, {
      symbol: parsed.symbol!,
      side: parsed.side!,
      qty: result.qty,
      entry_price: result.entryPrice,
      take_profit: parsed.take_profits[0] ?? undefined,
      stop_loss: parsed.stop_loss ?? undefined,
      status: 'filled',
      exchange: channelDoc.exchange
    });
  }

  console.log(`${result.success ? '✅' : '❌'} Trade ${result.success ? 'executed' : 'failed'}: ${parsed.symbol} ${parsed.side} | ${result.error || `Order ${result.orderId}`}`);
}
