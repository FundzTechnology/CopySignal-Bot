import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import { bufferMessage } from "../parser/messageBuffer.js";
class TelegramListener {
    client = null;
    activeChannels = new Map();
    async connect() {
        const apiId = parseInt(process.env.TELEGRAM_API_ID || '0');
        const apiHash = process.env.TELEGRAM_API_HASH || '';
        const sessionStr = process.env.TELEGRAM_SESSION || '';
        if (!apiId || !apiHash || !sessionStr) {
            console.error('❌ Missing Telegram env vars (TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION). Telegram listener disabled.');
            return;
        }
        this.client = new TelegramClient(new StringSession(sessionStr), apiId, apiHash, { connectionRetries: 5, retryDelay: 1000 });
        await this.client.connect();
        console.log("✅ Telegram client connected");
        this.client.addEventHandler(async (event) => {
            const message = event.message;
            const text = message?.text || message?.message || '';
            console.log(`[GramJS Debug] Event Fired! Text: "${text.substring(0, 50).replace(/\n/g, ' ')}"`);
            if (!text)
                return;
            const chat = await event.getChat().catch(() => null);
            // Use peerId as fallback if getChat() fails (common for channels)
            const peer = message.peerId;
            const rawId = peer?.channelId || peer?.chatId || peer?.userId || chat?.id;
            console.log(`[GramJS Debug] Chat resolved: rawId=${rawId}, Username=${chat?.username}`);
            if (!rawId)
                return;
            const senderId = String(message.senderId || 'unknown');
            const chatId = String(rawId);
            const strippedChatId = chatId.replace('-100', '');
            const username = chat && chat.username ? `@${chat.username}` : null;
            const messageId = String(message.id);
            const replyToMsgId = message.replyToMsgId ? String(message.replyToMsgId) : message.replyTo?.replyToMsgId ? String(message.replyTo?.replyToMsgId) : undefined;
            for (const [channelKey, channelData] of this.activeChannels.entries()) {
                const keyLower = channelKey.toLowerCase();
                // Match by raw ID, stripped ID (-100 removed), username, or resolved numeric ID
                if (chatId === channelKey ||
                    strippedChatId === channelKey.replace('-100', '') ||
                    (username && username.toLowerCase() === keyLower) ||
                    (channelData.resolvedId && (chatId === channelData.resolvedId ||
                        strippedChatId === channelData.resolvedId.replace('-100', '')))) {
                    console.log(`📨 New message buffering from ${channelKey}`);
                    bufferMessage(channelKey, senderId, text, messageId, channelData.bufferWindowMs, replyToMsgId, (combinedText, messageIds, firstReplyId) => {
                        // Pass the combined text and the first message ID as the deduplication key
                        channelData.callback(combinedText, messageIds[0], firstReplyId);
                    });
                    return; // matched, stop searching
                }
            }
        }, new NewMessage({ incoming: true, outgoing: true }) // Explicitly capture both in case user posts from the same account
        );
    }
    async addChannel(channelIdentifier, onMessage, bufferWindowMs) {
        const channelData = { callback: onMessage, bufferWindowMs };
        this.activeChannels.set(channelIdentifier, channelData);
        console.log(`📡 Now listening: ${channelIdentifier}`);
        // Attempt to resolve the username to a numeric ID for more reliable matching
        if (this.client && channelIdentifier.startsWith('@')) {
            try {
                const entity = await this.client.getEntity(channelIdentifier);
                if (entity && entity.id) {
                    channelData.resolvedId = String(entity.id);
                    console.log(`   ↳ Resolved ${channelIdentifier} to numeric ID: ${channelData.resolvedId}`);
                }
            }
            catch (err) {
                console.warn(`   ↳ Could not resolve ${channelIdentifier} (might be private or not joined): ${err.message}`);
            }
        }
    }
    removeChannel(channelIdentifier) {
        this.activeChannels.delete(channelIdentifier);
        console.log(`🔇 Stopped listening: ${channelIdentifier}`);
    }
    getActiveChannels() {
        return Array.from(this.activeChannels.keys());
    }
}
export const telegramListener = new TelegramListener();
//# sourceMappingURL=telegramListener.js.map