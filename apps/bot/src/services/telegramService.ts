import TelegramBot from 'node-telegram-bot-api';
import { db } from '../db/cocobase.js';

/**
 * Telegram Service
 *
 * Handles the actual Telegram bot instance.
 * - Supports both Webhook mode (production) and Polling mode (development).
 * - Handles the /start OTP linking flow.
 */

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
const WEBHOOK_URL = process.env.TELEGRAM_BOT_WEBHOOK_URL || '';

export const bot = botToken
  ? new TelegramBot(botToken, { polling: !WEBHOOK_URL })
  : null;

if (bot) {
  if (WEBHOOK_URL) {
    // Set Webhook for production
    bot.setWebHook(WEBHOOK_URL).then(() => {
      console.log(`🤖 Telegram Bot webhook set to ${WEBHOOK_URL}`);
    }).catch(err => {
      console.error(`❌ Failed to set Telegram webhook:`, err.message);
    });
  } else {
    console.log('🤖 Telegram Bot started in POLLING mode (dev)');
  }

  // ── /start Command (OTP Linking) ──────────────────────────────────────────
  bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    const telegramUsername = msg.from?.username || 'unknown';
    const param = (match?.[1] || '').trim();

    if (!param) {
      // Step 1: Greet and ask for the code
      await bot.sendMessage(
        chatId,
        `👋 *Welcome to CopySignal Bot!*\n\n` +
        `To link your account and receive real-time alerts:\n` +
        `1. Go to Dashboard → Settings\n` +
        `2. Click "Generate Linking Code"\n` +
        `3. Send me the 6-digit code here (e.g., \`/start 123456\` or just type the code if you've already started).\n\n` +
        `Waiting for your code...`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Process code if passed via deep link like /start 123456
    await handleLinkingCode(chatId, telegramUsername, param);
  });

  // Handle bare codes sent as text (e.g., user just types "123456")
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id.toString();
    const text = (msg.text || '').trim();
    
    // Ignore commands
    if (text.startsWith('/')) return;

    // Check if it looks like a 6-digit code
    if (/^\d{6}$/.test(text)) {
      await handleLinkingCode(chatId, msg.from?.username || 'unknown', text);
    }
  });

  // ── /status Command ───────────────────────────────────────────────────────
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id.toString();
    await bot.sendMessage(
      chatId,
      `🟢 *Bot Status: Online*\n\n` +
      `Uptime: ${formatUptime(process.uptime())}\n` +
      `Your Chat ID: \`${chatId}\`\n\n` +
      `Mode: ${WEBHOOK_URL ? 'Webhook' : 'Polling'}`,
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
}

async function handleLinkingCode(chatId: string, telegramUsername: string, code: string) {
  if (!bot) return;

  try {
    // 1. Find valid token — try filtered query first, then fallback to manual search
    let matchedToken: any = null;

    try {
      const tokens = await db.listDocuments('telegram_link_tokens', {
        filters: { code, used: false }
      }) as any[];

      if (tokens.length > 0) {
        matchedToken = tokens[0];
      }
    } catch {
      // filter may have failed
    }

    // Fallback: if Cocobase wraps fields in .data, the filter won't match
    if (!matchedToken) {
      try {
        const allTokens = await db.listDocuments('telegram_link_tokens', {}) as any[];
        matchedToken = allTokens.find((t: any) => {
          const d = t.data || t;
          const tCode = d.code || t.code;
          const tUsed = d.used ?? t.used;
          return tCode === code && tUsed === false;
        });
      } catch {
        // collection doesn't exist
      }
    }

    if (!matchedToken) {
      await bot.sendMessage(chatId, `❌ Invalid or expired code. Please generate a new one in your dashboard settings.`);
      return;
    }

    const d = matchedToken.data || matchedToken;
    const tokenId = matchedToken.id || matchedToken._id;
    const userId = d.user_id || matchedToken.user_id;

    // Check expiry
    const expiresAt = d.expires_at || matchedToken.expires_at;
    if (expiresAt && new Date(expiresAt) < new Date()) {
      await bot.sendMessage(chatId, `❌ This code has expired. Please generate a new one.`);
      return;
    }

    // 2. Mark token used
    await db.updateDocument('telegram_link_tokens', tokenId, { used: true });

    // 3. Link user — check if a users doc exists first, create if not
    const telegramData = {
      telegram_user_id: chatId,
      telegram_username: telegramUsername,
    };

    try {
      // Try filtered query first
      let existingDoc: any = null;
      try {
        const existingUsers = await db.listDocuments('users', {
          filters: { user_id: userId }
        }) as any[];
        if (existingUsers.length > 0) existingDoc = existingUsers[0];
      } catch {}

      // Fallback: fetch all and find by user_id in .data
      if (!existingDoc) {
        try {
          const allUsers = await db.listDocuments('users', {}) as any[];
          existingDoc = allUsers.find((u: any) => {
            const ud = u.data || u;
            return (ud.user_id || u.user_id) === userId;
          });
        } catch {}
      }

      if (existingDoc) {
        // Update existing document
        const existingId = existingDoc.id || existingDoc._id;
        await db.updateDocument('users', existingId, telegramData);
        console.log(`[TelegramService] Updated existing users doc ${existingId} with Telegram link`);
      } else {
        // Create new document in users collection
        await db.createDocument('users', {
          user_id: userId,
          ...telegramData,
          linked_at: new Date().toISOString(),
        });
        console.log(`[TelegramService] Created new users doc for ${userId} with Telegram link`);
      }
    } catch (linkErr) {
      console.error(`[TelegramService] Failed to update/create users doc, trying direct create:`, linkErr);
      // Last resort: create the document
      try {
        await db.createDocument('users', {
          user_id: userId,
          ...telegramData,
          linked_at: new Date().toISOString(),
        });
      } catch (createErr) {
        console.error('[TelegramService] Final create also failed:', createErr);
      }
    }

    await bot.sendMessage(
      chatId,
      `✅ *Account linked successfully!*\n\n` +
      `Your Telegram is now connected to CopySignal.\n` +
      `You will receive alerts here whenever a trade executes.\n\n` +
      `/status — Check bot connection`,
      { parse_mode: 'Markdown' }
    );

    console.log(`[TelegramService] Linked @${telegramUsername} (${chatId}) to user ${userId}`);
  } catch (err) {
    console.error(`[TelegramService] Linking error:`, err);
    await bot.sendMessage(chatId, `❌ Failed to link account due to a system error. Please try again.`);
  }
}

// ── Exported messaging functions for notificationService ───────────────────

export async function sendTelegramMessage(chatId: string, message: string) {
  if (!bot) return;
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(`[TelegramService] Failed to send message to ${chatId}:`, err);
  }
}

export async function sendAdminAlert(message: string) {
  if (!bot || !ADMIN_CHAT_ID) return;
  try {
    await bot.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('[TelegramService] Failed to send admin alert:', err);
  }
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
