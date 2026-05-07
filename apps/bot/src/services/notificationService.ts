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

export type NotificationEvent =
  | { type: 'TRADE_OPENED'; userId: string; payload: TradePayload }
  | { type: 'TRADE_ERROR'; userId: string; payload: { symbol: string; exchange: string; error: string } }
  | { type: 'TP_HIT'; userId: string; payload: { symbol: string; tpLevel: number; pnl: number } }
  | { type: 'SL_HIT'; userId: string; payload: { symbol: string; loss: number } }
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

function formatTPHit(p: { symbol: string; tpLevel: number; pnl: number }): string {
  return `
🎯 *Take Profit ${p.tpLevel} Hit!*
━━━━━━━━━━━━━━━━━
*Symbol:* \`${p.symbol}\`
*P&L:* +$${p.pnl.toFixed(2)} ✅
━━━━━━━━━━━━━━━━━
_CopySignal Bot_`.trim();
}

function formatSLHit(p: { symbol: string; loss: number }): string {
  return `
🛑 *Stop Loss Hit*
━━━━━━━━━━━━━━━━━
*Symbol:* \`${p.symbol}\`
*Loss:* -$${Math.abs(p.loss).toFixed(2)}
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
  try {
    const user = await db.auth.getUserById(userId);
    return user?.data?.telegram_user_id || null;
  } catch {
    return null;
  }
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
