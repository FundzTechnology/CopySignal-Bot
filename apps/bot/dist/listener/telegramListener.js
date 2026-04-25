import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import * as dotenv from "dotenv";
dotenv.config();
const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const sessionStr = process.env.TELEGRAM_SESSION;
class TelegramListener {
    client;
    activeChannels = new Map();
    constructor() {
        this.client = new TelegramClient(new StringSession(sessionStr), apiId, apiHash, { connectionRetries: 5, retryDelay: 1000 });
    }
    async connect() {
        await this.client.connect();
        console.log("✅ Telegram client connected");
        // Single handler for ALL messages — routes to the right channel callback
        this.client.addEventHandler(async (event) => {
            const message = event.message;
            if (!message?.text || message.text.trim().length < 10)
                return;
            const chat = await event.getChat();
            if (!chat)
                return;
            // Build identifiers for this chat
            const chatId = String(chat.id);
            const username = chat.username ? `@${chat.username}` : null;
            // Check if any of our registered channels match
            for (const [channelKey, callback] of this.activeChannels.entries()) {
                if (chatId === channelKey ||
                    (username && username.toLowerCase() === channelKey.toLowerCase())) {
                    console.log(`📨 New message from ${channelKey}`);
                    callback(message.text, String(message.id));
                    break;
                }
            }
        }, new NewMessage({}));
    }
    // Called when a user adds a new channel to watch
    addChannel(channelIdentifier, onMessage) {
        this.activeChannels.set(channelIdentifier, onMessage);
        console.log(`📡 Now listening: ${channelIdentifier}`);
    }
    removeChannel(channelIdentifier) {
        this.activeChannels.delete(channelIdentifier);
        console.log(`🔇 Stopped listening: ${channelIdentifier}`);
    }
    getActiveChannels() {
        return Array.from(this.activeChannels.keys());
    }
}
// Export singleton — one process handles all users' channels
export const telegramListener = new TelegramListener();
//# sourceMappingURL=telegramListener.js.map