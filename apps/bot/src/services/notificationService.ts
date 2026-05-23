import { db } from '../db/cocobase.js';
import { sendTelegramMessage, sendAdminAlert } from './telegramService.js';

/**
 * Event-Driven Notification Service
 *
 * Instead of calling bot.sendMessage() everywhere, the system emits events.
 * This service handles formatting + delivery for every event type.
 *
 * Usage:
 *   await notify({ type: 'TRADE_OPENED', userId: '123', payload: { ... } });
 */

// ── Event Types ─────────────────────────────────────────────────────────────

interface TradePayload {
  symbol: string;
  side: string;
  qty: number;
  entry_price: number;
  take_profit?: number;
  stop_loss?: number;
  exchange: string;
}

interface TPHitPayload {
  symbol: string;
  side: string;
  entryPrice: number;
  qty: number;
  tpLevel: number;
  pnl: number;
  channelName?: string;
}

interface SLHitPayload {
  symbol: string;
  side: string;
  entryPrice: number;
  qty: number;
  loss: number;
  stopLoss?: number;
  channelName?: string;
}

interface TradeClosedPayload {
  symbol: string;
  side: string;
  entryPrice: number;
  qty: number;
  pnl: number;
  channelName?: string;
}

export type NotificationEvent =
  | { type: 'TRADE_OPENED'; userId: string; payload: TradePayload }
  | { type: 'TRADE_ERROR'; userId: string; payload: { symbol: string; exchange: string; error: string } }
  | { type: 'TP_HIT'; userId: string; payload: TPHitPayload }
  | { type: 'SL_HIT'; userId: string; payload: SLHitPayload }
  | { type: 'TRADE_CLOSED'; userId: string; payload: TradeClosedPayload }
  | { type: 'PAYMENT_CONFIRMED'; userId: string; payload: { plan: string; chain: string } }
  | { type: 'SYSTEM_ERROR'; payload: { context: string; error: string } };

// ── Message Formatters ──────────────────────────────────────────────────────

function formatTradeOpened(p: TradePayload): string {
  const emoji = p.side === 'Buy' ? '🟢' : '🔴';
  const exEmoji = p.exchange === 'bybit' ? '🔵' : '🟡';
  return `
${emoji} *Trade Executed* ${exEmoji}
━━━━━━━━━━━━━━━━━
*Symbol:* \`${p.symbol}\`
*Side:* ${p.side.toUpperCase()}
*Entry:* \`$${p.entry_price.toLocaleString()}\`
*Qty:* \`${p.qty}\`
${p.take_profit ? `*Take Profit:* \`$${p.take_profit.toLocaleString()}\`` : ''}
${p.stop_loss ? `*Stop Loss:* \`$${p.stop_loss.toLocaleString()}\`` : ''}
*Status:* FILLED ✅
━━━━━━━━━━━━━━━━━
_CopySignal Bot_`.trim();
}

function formatTradeError(p: { symbol: string; exchange: string; error: string }): string {
  return `
⚠️ *Trade Execution Failed*
━━━━━━━━━━━━━━━━━
*Symbol:* \`${p.symbol}\`
*Exchange:* ${p.exchange}
*Error:* ${p.error.substring(0, 200)}
━━━━━━━━━━━━━━━━━
_CopySignal Bot_`.trim();
}

function formatPaymentConfirmed(p: { plan: string; chain: string }): string {
  return `
💰 *Payment Confirmed!*
━━━━━━━━━━━━━━━━━
*Plan:* ${p.plan.charAt(0).toUpperCase() + p.plan.slice(1)}
*Network:* ${p.chain.toUpperCase()}
*Status:* Active ✅

Your subscription is now active. Happy trading! 🚀
━━━━━━━━━━━━━━━━━
_CopySignal Bot_`.trim();
}

function formatTPHit(p: TPHitPayload): string {
  const directionEmoji = (p.side === 'Buy' || p.side === 'Long') ? '🟢' : '🔴';
  const pnlStr = `+$${Math.abs(p.pnl).toFixed(2)}`;
  return `
🎯 *Take Profit ${p.tpLevel} Hit!* ${directionEmoji}
━━━━━━━━━━━━━━━━━
*Symbol:* \`${p.symbol}\`
*Side:* ${p.side.toUpperCase()}
*Entry Price:* \`$${p.entryPrice.toLocaleString()}\`
*Qty:* \`${p.qty}\`
*Realised P&L:* \`${pnlStr}\` ✅
${p.channelName ? `*Channel:* ${p.channelName}` : ''}
━━━━━━━━━━━━━━━━━
_CopySignal Bot_`.trim();
}

function formatSLHit(p: SLHitPayload): string {
  const directionEmoji = (p.side === 'Buy' || p.side === 'Long') ? '🟢' : '🔴';
  const lossStr = `-$${Math.abs(p.loss).toFixed(2)}`;
  return `
🛑 *Stop Loss Hit* ${directionEmoji}
━━━━━━━━━━━━━━━━━
*Symbol:* \`${p.symbol}\`
*Side:* ${p.side.toUpperCase()}
*Entry Price:* \`$${p.entryPrice.toLocaleString()}\`
*Qty:* \`${p.qty}\`
${p.stopLoss ? `*SL Level:* \`$${p.stopLoss.toLocaleString()}\`` : ''}
*Realised P&L:* \`${lossStr}\` ❌
${p.channelName ? `*Channel:* ${p.channelName}` : ''}
━━━━━━━━━━━━━━━━━
_CopySignal Bot_`.trim();
}

function formatTradeClosed(p: TradeClosedPayload): string {
  const pnlStr = p.pnl > 0
    ? `+$${p.pnl.toFixed(2)} ✅`
    : p.pnl < 0
      ? `-$${Math.abs(p.pnl).toFixed(2)} ❌`
      : `$0.00 (Break-even)`;
  return `
📊 *Trade Closed*
━━━━━━━━━━━━━━━━━
*Symbol:* \`${p.symbol}\`
*Side:* ${p.side.toUpperCase()}
*Entry Price:* \`$${p.entryPrice.toLocaleString()}\`
*Qty:* \`${p.qty}\`
*Realised P&L:* \`${pnlStr}\`
*Closed:* Manually / Break-even
${p.channelName ? `*Channel:* ${p.channelName}` : ''}
━━━━━━━━━━━━━━━━━
_CopySignal Bot_`.trim();
}

function formatSystemError(p: { context: string; error: string }): string {
  return `
🚨 *SYSTEM ALERT*
━━━━━━━━━━━━━━━━━
*Context:* ${p.context}
*Error:* \`${p.error.substring(0, 500)}\`
*Time:* ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━
_CopySignal Bot Engine_`.trim();
}

// ── Resolve user's Telegram chat ID ─────────────────────────────────────────

async function getUserTelegramChatId(userId: string): Promise<string | null> {
  // Check 1: auth user data (set during registration or if updated there)
  try {
    const user = await db.auth.getUserById(userId);
    if (user?.data?.telegram_user_id) return user.data.telegram_user_id;
  } catch {
    // not found in auth
  }

  // Check 2: 'users' collection — filtered query
  try {
    const docs = await db.listDocuments('users', { filters: { user_id: userId } }) as any[];
    if (docs.length > 0) {
      const doc = docs[0];
      const chatId = doc.telegram_user_id || doc.data?.telegram_user_id || null;
      if (chatId) return chatId;
    }
  } catch {
    // collection doesn't exist or filter failed
  }

  // Check 3: Fallback — fetch ALL users and filter in code (handles Cocobase .data nesting)
  // This is the same pattern used throughout the codebase to work around Cocobase filter limitations.
  try {
    const allUsers = await db.listDocuments('users', {}) as any[];
    const match = allUsers.find((u: any) => {
      const d = u.data || u;
      return (d.user_id || u.user_id) === userId;
    });
    if (match) {
      const d = match.data || match;
      const chatId = d.telegram_user_id || match.telegram_user_id || null;
      if (chatId) {
        console.log(`[Notify] Found Telegram chat ID for user ${userId} via fetch-all fallback.`);
        return chatId;
      }
    }
  } catch {
    // collection doesn't exist
  }

  return null;
}

// ── Main Notify Function ────────────────────────────────────────────────────

export async function notify(event: NotificationEvent): Promise<void> {
  try {
    if (event.type === 'SYSTEM_ERROR') {
      // System errors go to admin only
      const msg = formatSystemError(event.payload);
      await sendAdminAlert(msg);
      return;
    }

    // All other events go to the user
    const chatId = await getUserTelegramChatId(event.userId);
    if (!chatId) {
      console.log(`[Notify] No Telegram linked for user ${event.userId}, skipping ${event.type}`);
      return;
    }

    let message = '';
    switch (event.type) {
      case 'TRADE_OPENED':
        message = formatTradeOpened(event.payload);
        break;
      case 'TRADE_ERROR':
        message = formatTradeError(event.payload);
        // Also alert admin for trade errors
        await sendAdminAlert(formatSystemError({
          context: `Trade Error — ${event.payload.symbol} on ${event.payload.exchange}`,
          error: event.payload.error,
        }));
        break;
      case 'TP_HIT':
        message = formatTPHit(event.payload);
        break;
      case 'SL_HIT':
        message = formatSLHit(event.payload);
        break;
      case 'TRADE_CLOSED':
        message = formatTradeClosed(event.payload);
        break;
      case 'PAYMENT_CONFIRMED':
        message = formatPaymentConfirmed(event.payload);
        break;
    }

    if (message) {
      await sendTelegramMessage(chatId, message);
    }
  } catch (err) {
    console.error(`[Notify] Failed to deliver ${event.type}:`, err);
  }
}
