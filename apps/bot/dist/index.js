/**
 * CopySignal Bot — Main Entry Point
 * Boots the Telegram listener, loads all active channels from Cocobase,
 * and sets up real-time watches for new or deleted channels.
 *
 * Run: npm run dev
 */
import * as dotenv from "dotenv";
dotenv.config();
import { telegramListener } from './listener/telegramListener.js';
import { handleSignal } from './services/orchestrator.js';
import { db } from './db/cocobase.js';
async function boot() {
    console.log("🚀 CopySignal Bot starting...");
    // Connect Telegram client
    await telegramListener.connect();
    // Load all active channels from Cocobase
    const channels = await db.listDocuments("channels", {
        filters: { is_active: true }
    });
    console.log(`📡 Loading ${channels.length} active channels...`);
    for (const channel of channels) {
        telegramListener.addChannel(channel.telegram_channel_id || channel.channel_username, (message, messageId) => {
            handleSignal(message, messageId, channel);
        });
    }
    // Watch for new channels being added in real time
    db.watchCollection("channels", async (event) => {
        if (event.type === 'create' && event.data.is_active) {
            console.log(`🆕 New channel added: ${event.data.channel_name}`);
            telegramListener.addChannel(event.data.telegram_channel_id || event.data.channel_username, (message, messageId) => {
                handleSignal(message, messageId, event.data);
            });
        }
        if (event.type === 'update' && !event.data.is_active) {
            console.log(`🔇 Channel deactivated: ${event.data.channel_name}`);
            telegramListener.removeChannel(event.data.telegram_channel_id || event.data.channel_username);
        }
    });
    console.log("✅ Bot is fully running. Waiting for signals...");
}
boot().catch(console.error);
//# sourceMappingURL=index.js.map