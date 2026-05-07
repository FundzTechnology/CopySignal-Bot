import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage, NewMessageEvent } from "telegram/events/index.js";
import { bufferMessage } from "../parser/messageBuffer.js";

class TelegramListener {
  private client: TelegramClient | null = null;
  private activeChannels: Map<string, { callback: (msg: string, msgId: string) => void, bufferWindowMs?: number }> = new Map();

  async connect() {
    const apiId = parseInt(process.env.TELEGRAM_API_ID || '0');
    const apiHash = process.env.TELEGRAM_API_HASH || '';
    const sessionStr = process.env.TELEGRAM_SESSION || '';

    if (!apiId || !apiHash || !sessionStr) {
      console.error('❌ Missing Telegram env vars (TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION). Telegram listener disabled.');
      return;
    }

    this.client = new TelegramClient(
      new StringSession(sessionStr),
      apiId,
      apiHash,
      { connectionRetries: 5, retryDelay: 1000 }
    );

    await this.client.connect();
    console.log("✅ Telegram client connected");

    this.client.addEventHandler(
      async (event: NewMessageEvent) => {
        const message = event.message;
        if (!message?.text) return;

        const chat = await event.getChat();
        if (!chat) return;

        const senderId = String(message.senderId || 'unknown');
        const chatId = String(chat.id);
        const username = (chat as any).username ? `@${(chat as any).username}` : null;
        const messageId = String(message.id);

        for (const [channelKey, channelData] of this.activeChannels.entries()) {
          if (
            chatId === channelKey ||
            (username && username.toLowerCase() === channelKey.toLowerCase())
          ) {
            console.log(`📨 New message buffering from ${channelKey}`);
            
            bufferMessage(
              channelKey,
              senderId,
              message.text,
              messageId,
              channelData.bufferWindowMs,
              (combinedText, messageIds) => {
                // Pass the combined text and the first message ID as the deduplication key
                channelData.callback(combinedText, messageIds[0]);
              }
            );
            break;
          }
        }
      },
      new NewMessage({})
    );
  }

  addChannel(channelIdentifier: string, onMessage: (msg: string, msgId: string) => void, bufferWindowMs?: number) {
    this.activeChannels.set(channelIdentifier, { callback: onMessage, bufferWindowMs });
    console.log(`📡 Now listening: ${channelIdentifier}`);
  }

  removeChannel(channelIdentifier: string) {
    this.activeChannels.delete(channelIdentifier);
    console.log(`🔇 Stopped listening: ${channelIdentifier}`);
  }

  getActiveChannels(): string[] {
    return Array.from(this.activeChannels.keys());
  }
}

export const telegramListener = new TelegramListener();
