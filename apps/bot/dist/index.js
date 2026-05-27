/**
 * CopySignal Bot — Main Entry Point
 * Boots the Telegram listener, payment watchers, webhook server,
 * and cron jobs. Loads all active channels from Cocobase on start.
 *
 * Run: npm run dev
 */
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { telegramListener } from './listener/telegramListener.js';
import { handleSignal } from './services/orchestrator.js';
import { db } from './db/cocobase.js';
import { startSuiWatcher } from './payments/suiWatcher.js';
import { ensureHeliusWebhook } from './payments/setupHeliusWebhook.js';
import solanaWebhookRouter from './payments/solanaWebhook.js';
import paymentsApi from './payments/api.js';
import { runDailySubscriptionCheck } from './jobs/dailySubscriptionCheck.js';
import { cleanExpiredPaymentSessions } from './jobs/cleanExpiredSessions.js';
import { notify } from './services/notificationService.js';
import { bot } from './services/telegramService.js';
const PORT = parseInt(process.env.PORT || '3001');
async function boot() {
    console.log('🚀 CopySignal Bot starting...');
    // ── Express Server (Webhooks + Health + APIs) ─────────────────
    const app = express();
    app.use(express.json());
    // Rate-limit all webhook routes
    const webhookLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 60,
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/webhook', webhookLimiter);
    // Health check (required for Fly.io)
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', uptime: process.uptime() });
    });
    // REST APIs for Web Dashboard
    app.use('/api/payments', paymentsApi);
    // Solana USDC payment webhook (from Helius)
    app.use('/', solanaWebhookRouter);
    // Telegram Webhook endpoint
    app.post('/api/telegram/webhook', (req, res) => {
        if (bot) {
            bot.processUpdate(req.body);
        }
        res.sendStatus(200);
    });
    app.listen(PORT, () => {
        console.log(`🌐 Webhook server listening on port ${PORT}`);
    });
    // ── Telegram ─────────────────────────────────────────────────
    await telegramListener.connect();
    // Load all active channels from Cocobase
    const channels = await db.listDocuments('channels', {
        filters: { is_active: true },
    });
    console.log(`📡 Loading ${channels.length} active channels...`);
    for (const channel of channels) {
        // Cocobase wraps fields inside .data — unwrap for consistent access
        const ch = channel.data || channel;
        const chanId = ch.telegram_channel_id ||
            ch.telegram_id ||
            ch.channel_username ||
            channel.telegram_channel_id ||
            channel.telegram_id ||
            channel.channel_username;
        if (!chanId) {
            console.warn(`⚠️ Channel "${ch.name || channel.name || 'unknown'}" has no telegram ID — skipping`);
            continue;
        }
        // Build a normalized channel doc with all fields the orchestrator needs
        const channelDoc = {
            id: channel.id || channel._id,
            user_id: ch.user_id || channel.user_id,
            name: ch.name || channel.name,
            channel_username: ch.channel_username || channel.channel_username || '',
            exchange: ch.exchange || channel.exchange || 'bybit',
            risk_percent: ch.risk_percent || channel.risk_percent || 1,
            trigger_keyword: ch.trigger_keyword || channel.trigger_keyword || '',
            allow_medium_confidence: ch.allow_medium_confidence ?? channel.allow_medium_confidence ?? true,
            buffer_window_seconds: ch.buffer_window_seconds || channel.buffer_window_seconds,
            is_active: true,
        };
        console.log(`  📡 Subscribing to: ${chanId} (${channelDoc.name}) [${channelDoc.exchange}]`);
        telegramListener.addChannel(chanId, (message, messageId, replyToMsgId) => {
            handleSignal(message, messageId, channelDoc, replyToMsgId);
        }, channelDoc.buffer_window_seconds);
    }
    // Watch for new channels being added or removed in real time
    const channelWatcher = db.realtime.collection('channels');
    channelWatcher.connect();
    channelWatcher.onCreate((event) => {
        const ch = event.data || event;
        if (ch.is_active) {
            const chanId = ch.telegram_channel_id || ch.telegram_id || ch.channel_username;
            if (!chanId)
                return;
            console.log(`🆕 New channel added: ${ch.name || ch.channel_name}`);
            const channelDoc = {
                id: event.id || event._id,
                user_id: ch.user_id,
                name: ch.name || ch.channel_name,
                channel_username: ch.channel_username || '',
                exchange: ch.exchange || 'bybit',
                risk_percent: ch.risk_percent || 1,
                trigger_keyword: ch.trigger_keyword || '',
                allow_medium_confidence: ch.allow_medium_confidence ?? true,
                buffer_window_seconds: ch.buffer_window_seconds,
                is_active: true,
            };
            telegramListener.addChannel(chanId, (message, messageId, replyToMsgId) => {
                handleSignal(message, messageId, channelDoc, replyToMsgId);
            }, channelDoc.buffer_window_seconds);
        }
    });
    channelWatcher.onUpdate((event) => {
        const ch = event.data || event;
        if (!ch.is_active) {
            const chanId = ch.telegram_channel_id || ch.telegram_id || ch.channel_username;
            if (chanId) {
                console.log(`🔇 Channel deactivated: ${ch.name || ch.channel_name}`);
                telegramListener.removeChannel(chanId);
            }
        }
    });
    // ── Payment Watchers ─────────────────────────────────────────
    // SUI — polls every 10 seconds
    await startSuiWatcher();
    // Solana — register Helius webhook at startup (idempotent)
    await ensureHeliusWebhook();
    // ── Daily Subscription Cron ──────────────────────────────────
    // Runs at 00:00 UTC every day
    cron.schedule('0 0 * * *', () => {
        runDailySubscriptionCheck().catch(console.error);
    });
    // Runs every hour to clean expired sessions
    cron.schedule('0 * * * *', () => {
        cleanExpiredPaymentSessions().catch(console.error);
    });
    // ── Boot-time Monitor Recovery ────────────────────────────────
    // If the bot crashed or was redeployed while trades were open,
    // any 'filled' trade log that has no 'closed_at' is "orphaned" — no monitor
    // is watching it. Re-start a monitor for each such trade.
    try {
        const { startOrderMonitor } = await import('./services/orderMonitor.js');
        const allTradeLogs = await db.listDocuments('trade_logs', {});
        const orphanedTrades = allTradeLogs.filter((t) => {
            const d = t.data || t;
            const status = d.status || t.status;
            const closedAt = d.closed_at || t.closed_at;
            const orderId = d.order_id || t.order_id;
            const exchange = d.exchange || t.exchange;
            return status === 'filled' && !closedAt && orderId && exchange === 'bybit';
        });
        if (orphanedTrades.length > 0) {
            console.log(`🔁 Recovering monitors for ${orphanedTrades.length} orphaned open trade(s)...`);
            for (const tradeRaw of orphanedTrades) {
                const t = tradeRaw.data || tradeRaw;
                const userId = t.user_id || tradeRaw.user_id;
                const symbol = t.symbol || tradeRaw.symbol;
                const orderId = t.order_id || tradeRaw.order_id;
                const exchange = t.exchange || tradeRaw.exchange || 'bybit';
                if (!userId || !symbol || !orderId)
                    continue;
                // Fetch the API key for this user + exchange
                let apiKeyDoc = null;
                try {
                    const keys = await db.listDocuments('api_keys', {
                        filters: { user_id: userId, exchange }
                    });
                    if (keys.length > 0) {
                        apiKeyDoc = keys[0].data || keys[0];
                    }
                    else {
                        // Fallback: fetch all and filter
                        const allKeys = await db.listDocuments('api_keys', {});
                        const found = allKeys.find((k) => {
                            const d = k.data || k;
                            return (d.user_id || k.user_id) === userId &&
                                (d.exchange || k.exchange) === exchange;
                        });
                        if (found)
                            apiKeyDoc = found.data || found;
                    }
                }
                catch { /* skip if key lookup fails */ }
                if (!apiKeyDoc) {
                    console.warn(`  ⚠️ No API key found for orphaned trade ${orderId} (${symbol}) — skipping recovery`);
                    continue;
                }
                console.log(`  🔁 Resuming monitor for ${symbol} (orderId: ${orderId})`);
                startOrderMonitor({
                    userId,
                    symbol,
                    orderId,
                    exchange,
                    side: t.side || tradeRaw.side || 'Buy',
                    entryPrice: t.entry_price || tradeRaw.entry_price || 0,
                    qty: t.qty || tradeRaw.qty || 0,
                    takeProfit: t.take_profit || tradeRaw.take_profit,
                    stopLoss: t.stop_loss || tradeRaw.stop_loss,
                    channelName: t.channel_name || tradeRaw.channel_name || 'Unknown Channel',
                    // On recovery, the order is already filled (that's why status==='filled'), so skip Phase 1
                    isMarketOrder: true,
                    apiKeyDoc,
                });
            }
        }
        else {
            console.log('✅ No orphaned open trades found.');
        }
    }
    catch (recoveryErr) {
        console.warn('⚠️ Boot-time monitor recovery failed (non-fatal):', recoveryErr.message || recoveryErr);
    }
    console.log('✅ Bot is fully running. Waiting for signals...');
}
boot().catch(async (err) => {
    console.error('FATAL boot error:', err);
    await notify({ type: 'SYSTEM_ERROR', payload: { context: 'Bot Boot Failure', error: String(err) } }).catch(() => { });
    process.exit(1);
});
// Global uncaught exception handler — alert admin
process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    await notify({ type: 'SYSTEM_ERROR', payload: { context: 'Uncaught Exception', error: err.message || String(err) } }).catch(() => { });
});
process.on('unhandledRejection', async (reason) => {
    console.error('Unhandled Rejection:', reason);
    await notify({ type: 'SYSTEM_ERROR', payload: { context: 'Unhandled Promise Rejection', error: String(reason) } }).catch(() => { });
});
//# sourceMappingURL=index.js.map