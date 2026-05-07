import TelegramBot from 'node-telegram-bot-api';
import { db } from '../db/cocobase.js';

/**
 * CopySignal Alert Bot — t.me/FundzCopySignalBot
 *
 * This bot does three things:
 *  1. Handles /start — links a Telegram user to their CopySignal account
 *  2. Sends trade execution alerts to users
 *  3. Sends system error alerts to the admin (you)
 *
 * The bot runs in POLLING mode as part of the bot engine process.
 */

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';

const bot = botToken
  ? new TelegramBot(botToken, { polling: true })
  : null;

// ── /start Command ──────────────────────────────────────────────────────────
// When a user sends /start <userId>, we link their Telegram account
// to their CopySignal dashboard account.
if (bot) {
  bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    const telegramUsername = msg.from?.username || 'unknown';
    const param = (match?.[1] || '').trim(); // e.g. /start abc123-user-id

    if (!param) {
      // No link param — just greet them
      await bot.sendMessage(
        chatId,
        `👋 *Welcome to CopySignal Bot!*\n\n` +
        `I send you real-time alerts when your trades execute.\n\n` +
        `To link your account:\n` +
        `1. Go to your CopySignal Dashboard → Settings\n` +
        `2. Click *"Connect Telegram Bot"*\n` +
        `3. It will give you a special link to tap here\n\n` +
        `Once linked, you'll get instant notifications for every trade.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // param is the userId from the dashboard
    try {
      // Save the telegram chat ID to the user's profile in Cocobase
      await db.updateDocument('users', param, {
        telegram_user_id: chatId,
        telegram_username: telegramUsername,
      });

      await bot.sendMessage(
        chatId,
        `✅ *Account linked successfully!*\n\n` +
        `Your Telegram is now connected to CopySignal.\n` +
        `You will receive alerts here whenever a trade executes.\n\n` +
        `Commands:\n` +
        `/status — Check bot connection\n` +
        `/help — See all commands`,
        { parse_mode: 'Markdown' }
      );

      console.log(`[AlertBot] Linked Telegram @${telegramUsername} (${chatId}) → user ${param}`);
    } catch (err) {
      console.error(`[AlertBot] Failed to link user ${param}:`, err);
      await bot.sendMessage(
        chatId,
        `❌ Failed to link your account. Please check your link and try again, or contact support.`
      );
    }
  });

  // ── /status Command ─────────────────────────────────────────────────────────
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id.toString();
    await bot.sendMessage(
      chatId,
      `🟢 *Bot Status: Online*\n\n` +
      `Uptime: ${formatUptime(process.uptime())}\n` +
      `Your Chat ID: \`${chatId}\`\n\n` +
      `If trades are executing but you're not getting alerts, ` +
      `make sure your Telegram is linked in Dashboard → Settings.`,
      { parse_mode: 'Markdown' }
    );
  });

  // ── /help Command ─────────────────────────────────────────────────────────
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id.toString();
    await bot.sendMessage(
      chatId,
      `📖 *CopySignal Bot Commands*\n\n` +
      `/start — Link your CopySignal account\n` +
      `/status — Check bot connection status\n` +
      `/help — Show this help message\n\n` +
      `🌐 Dashboard: copysignal-bot.fundztechnology.com\n` +
      `💬 Support: @FundzTechnology`,
      { parse_mode: 'Markdown' }
    );
  });

  console.log('🤖 Telegram Alert Bot started (polling mode)');
}

// ── Trade Alert ─────────────────────────────────────────────────────────────
interface TradeAlertParams {
  symbol: string;
  side: string;
  qty: number;
  entry_price: number;
  take_profit?: number;
  stop_loss?: number;
  status: string;
  exchange: string;
}

export async function sendTradeAlert(telegramUserId: string, trade: TradeAlertParams) {
  if (!bot) {
    console.warn("TELEGRAM_BOT_TOKEN not set, skipping trade alert to user");
    return;
  }

  const emoji = trade.side === 'Buy' ? '🟢' : '🔴';
  const exchangeEmoji = trade.exchange === 'bybit' ? '🔵' : '🟡';

  const msg = `
${emoji} *Trade Executed* ${exchangeEmoji}
━━━━━━━━━━━━━━━━━
*Symbol:* \`${trade.symbol}\`
*Side:* ${trade.side.toUpperCase()}
*Entry:* \`$${trade.entry_price.toLocaleString()}\`
*Qty:* \`${trade.qty}\`
${trade.take_profit ? `*Take Profit:* \`$${trade.take_profit.toLocaleString()}\`` : ''}
${trade.stop_loss ? `*Stop Loss:* \`$${trade.stop_loss.toLocaleString()}\`` : ''}
*Status:* ${trade.status.toUpperCase()} ✅
━━━━━━━━━━━━━━━━━
_CopySignal Bot_
  `.trim();

  try {
    await bot.sendMessage(telegramUserId, msg, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(`Failed to send Telegram alert to ${telegramUserId}: ${err}`);
  }
}

// ── System Error Alert (to Admin) ───────────────────────────────────────────
export async function sendErrorAlert(context: string, error: string) {
  if (!bot || !ADMIN_CHAT_ID) {
    console.warn('[AlertBot] Cannot send admin alert — bot or ADMIN_CHAT_ID not configured');
    return;
  }

  const msg = `
🚨 *SYSTEM ALERT*
━━━━━━━━━━━━━━━━━
*Context:* ${context}
*Error:* \`${error.substring(0, 500)}\`
*Time:* ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━
_CopySignal Bot Engine_
  `.trim();

  try {
    await bot.sendMessage(ADMIN_CHAT_ID, msg, { parse_mode: 'Markdown' });
  } catch (err) {
    // Last resort — just console log
    console.error('[AlertBot] Failed to send admin error alert:', err);
  }
}

// ── Payment Confirmation Alert ──────────────────────────────────────────────
export async function sendPaymentAlert(telegramUserId: string, plan: string, chain: string) {
  if (!bot) return;

  const msg = `
💰 *Payment Confirmed!*
━━━━━━━━━━━━━━━━━
*Plan:* ${plan.charAt(0).toUpperCase() + plan.slice(1)}
*Network:* ${chain.toUpperCase()}
*Status:* Active ✅

Your subscription is now active. Happy trading! 🚀
━━━━━━━━━━━━━━━━━
_CopySignal Bot_
  `.trim();

  try {
    await bot.sendMessage(telegramUserId, msg, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(`[AlertBot] Failed to send payment alert: ${err}`);
  }
}

// ── Helper ──────────────────────────────────────────────────────────────────
function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
