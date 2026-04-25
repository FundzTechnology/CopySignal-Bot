import TelegramBot from 'node-telegram-bot-api';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = botToken ? new TelegramBot(botToken, { polling: false }) : null;

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
    console.error(`Failed to send Telegram alert: ${err}`);
  }
}
