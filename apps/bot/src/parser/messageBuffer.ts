interface BufferedMessage {
  text: string;
  timestamp: number;
  messageId: string;
}

interface ChannelBuffer {
  messages: BufferedMessage[];
  timer: NodeJS.Timeout | null;
  senderId: string;
}

// Buffer window default: messages within this time are combined
const DEFAULT_BUFFER_WINDOW_MS = 15000; 

// One buffer per channel per sender
const buffers = new Map<string, ChannelBuffer>();

export function bufferMessage(
  channelId: string,
  senderId: string,
  text: string,
  messageId: string,
  bufferWindowMs: number | undefined,
  onComplete: (combinedText: string, messageIds: string[]) => void
) {
  const bufferKey = `${channelId}:${senderId}`;
  const now = Date.now();
  const windowMs = bufferWindowMs ? bufferWindowMs * 1000 : DEFAULT_BUFFER_WINDOW_MS;

  // Get or create buffer for this channel+sender combo
  let buffer = buffers.get(bufferKey);

  if (!buffer) {
    buffer = { messages: [], timer: null, senderId };
    buffers.set(bufferKey, buffer);
  }

  // Add new message to buffer
  buffer.messages.push({ text, timestamp: now, messageId });

  // Clear existing timer and set a new one
  if (buffer.timer) clearTimeout(buffer.timer);

  buffer.timer = setTimeout(() => {
    const buf = buffers.get(bufferKey);
    if (!buf || buf.messages.length === 0) return;

    // Combine all buffered messages into one text block
    const combinedText = buf.messages
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(m => m.text)
      .join('\n');

    const allMessageIds = buf.messages.map(m => m.messageId);

    // Clear the buffer
    buffers.delete(bufferKey);

    // Hand combined text to signal handler
    onComplete(combinedText, allMessageIds);

  }, windowMs);
}
