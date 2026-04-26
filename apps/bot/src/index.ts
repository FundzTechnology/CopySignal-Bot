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
    const chanId =
      (channel as any).telegram_channel_id || (channel as any).channel_username;
    telegramListener.addChannel(
      chanId,
      (message: string, messageId: string) => {
        handleSignal(message, messageId, channel);
      },
      (channel as any).buffer_window_seconds
    );
  }

  // Watch for new channels being added or removed in real time
  const channelWatcher = db.realtime.collection('channels');
  channelWatcher.connect();

  channelWatcher.onCreate((event: any) => {
    if (event.data?.is_active) {
      console.log(`🆕 New channel added: ${event.data.channel_name}`);
      telegramListener.addChannel(
        event.data.telegram_channel_id || event.data.channel_username,
        (message: string, messageId: string) => {
          handleSignal(message, messageId, event.data);
        },
        event.data.buffer_window_seconds
      );
    }
  });

  channelWatcher.onUpdate((event: any) => {
    if (!event.data?.is_active) {
      console.log(`🔇 Channel deactivated: ${event.data.channel_name}`);
      telegramListener.removeChannel(
        event.data.telegram_channel_id || event.data.channel_username
      );
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

  console.log('✅ Bot is fully running. Waiting for signals...');
}

boot().catch(console.error);
