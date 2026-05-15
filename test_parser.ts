import { parseSignal } from './apps/bot/src/parser/signalParser.js';

const text = `🔴 SELL SOL/USDT
📌 Entry: 89.75
🎯 Target 1: 89.36
🛑 Stop: 89.87
⚡ Leverage: 100x`;

const parsed = parseSignal(text);
console.log(parsed);
