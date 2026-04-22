/**
 * CopySignal Bot — Main Entry Point
 * Boots the Telegram listener and loads all active channels from Cocobase.
 *
 * Run: npm run dev
 */
import * as dotenv from "dotenv";
dotenv.config();

import { telegramListener } from "./listener/telegramListener.js";
import { db } from "./db/cocobase.js";
import { parseSignal } from "./parser/signalParser.js";

async function boot() {
  console.log("🚀 CopySignal Bot starting...");

  // 1. Connect the Telegram MTProto client
  await telegramListener.connect();

  // 2. Load all active channel subscriptions from Cocobase
  let channels: any[] = [];
  try {
    channels = await db.listDocuments("channels");
    console.log(`📋 Loaded ${channels.length} active channel(s) from Cocobase`);
  } catch (err: any) {
    console.error("⚠️  Could not load channels from Cocobase:", err.message);
    console.log("Running in standalone mode (parser only).");
  }

  // 3. Register each active channel with the listener
  for (const channel of channels) {
    if (!channel.is_active) continue;

    const channelId = channel.telegram_channel_id || channel.channel_username;
    if (!channelId) continue;

    telegramListener.addChannel(channelId, async (rawMessage: string, msgId: string) => {
      console.log(`\n📩 Signal received from ${channel.channel_name}`);

      const parsed = parseSignal(rawMessage);
      console.log(`🔍 Parsed: ${parsed.symbol} ${parsed.side} | Confidence: ${parsed.confidence}`);

      // TODO Phase 3: hand off to orchestrator for execution
      // await handleIncomingSignal(rawMessage, channel);
    });
  }

  console.log("\n✅ Bot is running and listening for signals...");
  console.log("   Press Ctrl+C to stop.\n");
}

boot().catch((err) => {
  console.error("❌ Fatal boot error:", err);
  process.exit(1);
});
