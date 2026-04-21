# 📡 CopySignal Bot — Full Product Requirements Document (PRD)
### Complete Build, Launch & Monetization Guide

---

## 🧭 Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Cocobase Database Schema](#4-cocobase-database-schema)
5. [Signal Parser Engine](#5-signal-parser-engine)
6. [Telegram Bot Integration](#6-telegram-bot-integration)
7. [Bybit & Binance API Integration](#7-bybit--binance-api-integration)
8. [Backend Services](#8-backend-services)
9. [Frontend Dashboard](#9-frontend-dashboard)
10. [Subscription System & Billing](#10-subscription-system--billing)
11. [Marketing — X (Twitter)](#11-marketing--x-twitter)
12. [Marketing — TikTok](#12-marketing--tiktok)
13. [Marketing — Telegram](#13-marketing--telegram)
14. [Maintenance & Operations](#14-maintenance--operations)
15. [Week-by-Week Build Roadmap](#15-week-by-week-build-roadmap)

---

## 1. Product Overview

### What Is CopySignal Bot?

CopySignal Bot is a SaaS tool that automatically reads trade signals posted in a Telegram channel or group, parses them in real time, and executes the corresponding trade on the user's Bybit or Binance account via their API keys.

The user connects once, sets their risk settings, and the bot does everything else — no manual entry, no missed signals, no emotion.

### Who Is It For?

| Customer Type | Problem It Solves |
|---|---|
| Signal followers | They miss signals or hesitate to enter manually |
| Signal channel owners | They want to offer auto-copy as a premium tier |
| Prop firm traders | They want to mirror one master account across sub-accounts |
| Crypto degens | They follow a caller and want instant execution |

### Core Value Proposition

> "Never miss a signal again. Auto-execute trades from any Telegram signal channel directly on your Bybit or Binance account in under 1 second."

---

## 2. Tech Stack

### Frontend (Dashboard)
| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR, fast, SEO-ready |
| Styling | **Tailwind CSS + shadcn/ui** | Fast, professional dark UI |
| State Management | **Zustand** | Lightweight, simple |
| Charts | **Recharts** | P&L visualisation |
| Auth UI | **Cocobase Auth** | Built-in, no extra setup |

### Backend (Bot Engine)
| Layer | Choice | Reason |
|---|---|---|
| Runtime | **Node.js** (or Python) | Bybit/Binance SDKs are best in these |
| Signal Listener | **Telethon (Python)** or **gramjs (Node)** | Reads Telegram MTProto in real time |
| Trade Executor | **bybit-api** + **binance** npm packages | Official SDKs |
| Signal Parser | Custom **Regex + NLP layer** | Vibe code cannot do this reliably |
| Task Queue | **BullMQ** (Redis-backed) | Queues trade orders to avoid race conditions |
| Hosting | **Railway.app** or **Render.com** | Cheap, always-on Node/Python servers |

### Database & Backend Services
| Layer | Choice | Reason |
|---|---|---|
| Database & Auth | **Cocobase** | Your chosen BaaS — handles collections, real-time, auth |
| Realtime Updates | **Cocobase WebSocket** | Push trade logs to dashboard in real time |
| Payments | **Stripe** (or **Lemonsqueezy**) | Subscription billing |
| Notifications | **Telegram Bot API** | Alert users when trades fire |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER FLOW                            │
│                                                             │
│  [User Signs Up] → [Connects API Keys] → [Selects          │
│   Signal Channel] → [Sets Risk %] → [Bot Runs Forever]     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Telegram   │────▶│  Signal Listener  │────▶│   Parser    │
│   Channel    │     │  (Telethon/gramjs) │     │  Engine     │
└──────────────┘     └──────────────────┘     └──────┬──────┘
                                                      │
                                              ┌───────▼──────┐
                                              │  Cocobase DB  │
                                              │  (signals     │
                                              │   collection) │
                                              └───────┬──────┘
                                                      │
                                              ┌───────▼──────┐
                                              │   BullMQ     │
                                              │  Job Queue   │
                                              └───────┬──────┘
                                                      │
                              ┌───────────────────────┼──────────────────┐
                              │                       │                  │
                      ┌───────▼──────┐       ┌───────▼──────┐  ┌───────▼──────┐
                      │  Bybit API   │       │ Binance API  │  │  Telegram    │
                      │  Executor    │       │  Executor    │  │  Alert Bot   │
                      └───────┬──────┘       └───────┬──────┘  └─────────────┘
                              │                       │
                              └──────────┬────────────┘
                                         │
                                 ┌───────▼──────┐
                                 │  Cocobase    │
                                 │  trade_logs  │
                                 │  collection  │
                                 └───────┬──────┘
                                         │
                                 ┌───────▼──────┐
                                 │   Next.js    │
                                 │  Dashboard   │
                                 │  (Real-time  │
                                 │   via WS)    │
                                 └─────────────┘
```

---

## 4. Cocobase Database Schema

Install the SDK: `npm install cocobase`

Initialize:
```javascript
import { Cocobase } from "cocobase";

const db = new Cocobase({
  apiKey: process.env.COCOBASE_API_KEY,
  projectId: process.env.COCOBASE_PROJECT_ID
});
```

### Collections

#### `users`
Handled by Cocobase Auth. Extended with custom data on register:
```javascript
await db.auth.register({
  email: user.email,
  password: user.password,
  data: {
    username: user.username,
    plan: "free",             // "free" | "starter" | "pro"
    plan_expires_at: null,
    telegram_user_id: null,
    created_at: new Date().toISOString()
  }
});
```

#### `api_keys`
Stores encrypted exchange API credentials per user.
```javascript
await db.createDocument("api_keys", {
  user_id: userId,
  exchange: "bybit",           // "bybit" | "binance"
  api_key: encryptedKey,       // AES-256 encrypted before saving
  api_secret: encryptedSecret,
  testnet: false,
  created_at: new Date().toISOString()
});
```
> ⚠️ NEVER store raw API keys. Always encrypt with AES-256 before saving to Cocobase. Decrypt only at the moment of trade execution in your backend.

#### `channels`
Signal channels the user is subscribed to and listening from.
```javascript
await db.createDocument("channels", {
  user_id: userId,
  telegram_channel_id: "-1001234567890",
  channel_name: "CryptoAlphaCalls",
  channel_username: "@CryptoAlphaCalls",
  is_active: true,
  exchange: "bybit",
  risk_percent: 1.5,          // % of account balance per trade
  max_trades_per_day: 5,
  created_at: new Date().toISOString()
});
```

#### `signals`
Every parsed signal gets stored here.
```javascript
await db.createDocument("signals", {
  channel_id: channelDocId,
  user_id: userId,
  raw_message: "BTC Long $97,200 TP $98,500 SL $96,800",
  parsed: {
    symbol: "BTCUSDT",
    side: "Buy",
    entry: 97200,
    take_profits: [98500],
    stop_loss: 96800,
    leverage: 10,
    confidence: "high"       // "high" | "medium" | "low" | "failed"
  },
  status: "parsed",          // "parsed" | "executed" | "failed" | "skipped"
  received_at: new Date().toISOString()
});
```

#### `trade_logs`
Every executed or attempted trade.
```javascript
await db.createDocument("trade_logs", {
  user_id: userId,
  signal_id: signalDocId,
  channel_id: channelDocId,
  exchange: "bybit",
  symbol: "BTCUSDT",
  side: "Buy",
  order_type: "Market",
  qty: 0.012,
  entry_price: 97210,
  take_profit: 98500,
  stop_loss: 96800,
  status: "filled",           // "filled" | "rejected" | "cancelled" | "error"
  pnl: null,                  // filled when trade closes
  error_msg: null,
  executed_at: new Date().toISOString(),
  closed_at: null
});
```

#### `subscriptions`
Tracks billing status.
```javascript
await db.createDocument("subscriptions", {
  user_id: userId,
  stripe_customer_id: "cus_xxx",
  stripe_subscription_id: "sub_xxx",
  plan: "pro",
  status: "active",           // "active" | "past_due" | "cancelled"
  current_period_end: "2025-06-01T00:00:00Z",
  created_at: new Date().toISOString()
});
```

### Real-time: Push Trade Logs to Dashboard

Use Cocobase's WebSocket to stream new trades to the user's dashboard live:

```javascript
// In your Next.js dashboard component
import { Cocobase } from "cocobase";

const db = new Cocobase({ apiKey: process.env.NEXT_PUBLIC_COCOBASE_API_KEY });

useEffect(() => {
  const connection = db.watchCollection(
    "trade_logs",
    (event) => {
      if (event.type === "create" && event.data.user_id === currentUser.id) {
        // Push new trade into live feed — no page refresh needed
        setTrades(prev => [event.data, ...prev]);
      }
    },
    {
      filters: { user_id: currentUser.id }
    }
  );

  return () => connection.close();
}, [currentUser.id]);
```

---

## 5. Signal Parser Engine

This is the most important and technically hardest part. Signals come in every format imaginable. Your parser needs to handle all of them.

### Common Signal Formats in the Wild

```
// Format 1 - Clean
BTC Long $97,200 TP $98,500 SL $96,800

// Format 2 - Multi TP
ETH SHORT
Entry: 3,450 - 3,480
TP1: 3,400
TP2: 3,350
TP3: 3,280
SL: 3,520

// Format 3 - Leverage included
🚨 SIGNAL 🚨
SOLUSDT LONG x20
Entry: 185
TP: 195 | 200 | 210
SL: 178

// Format 4 - Messy / informal
ape into BTC calls now around 96800, target 99k, stop 95k

// Format 5 - With % risk
#BTCUSDT
Direction: LONG
Entry Zone: 96,500–97,000
Targets: 98,000 / 100,000
Invalidation: 95,800
Leverage: 10x
```

### Parser Implementation (Node.js)

```javascript
// parser/signalParser.js

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'PEPE', 'WIF'];

function parseSignal(rawText) {
  const text = rawText.toUpperCase().replace(/,/g, '');

  const result = {
    symbol: null,
    side: null,
    entry: null,
    take_profits: [],
    stop_loss: null,
    leverage: 10, // default
    confidence: 'low'
  };

  // --- 1. Detect Symbol ---
  for (const sym of SYMBOLS) {
    if (text.includes(sym)) {
      result.symbol = sym + 'USDT';
      break;
    }
  }

  // --- 2. Detect Side ---
  if (/LONG|BUY|CALLS?|BULL/.test(text)) result.side = 'Buy';
  else if (/SHORT|SELL|PUTS?|BEAR/.test(text)) result.side = 'Sell';

  // --- 3. Detect Entry Price ---
  const entryPatterns = [
    /ENTRY[:\s]+(\d+\.?\d*)/,
    /ENTER[:\s]+(\d+\.?\d*)/,
    /(LONG|SHORT)[^\d]*(\d{4,6}\.?\d*)/,
    /AROUND[:\s]+(\d+\.?\d*)/,
    /AT[:\s]+\$?(\d+\.?\d*)/
  ];
  for (const pat of entryPatterns) {
    const match = text.match(pat);
    if (match) {
      result.entry = parseFloat(match[match.length - 1]);
      break;
    }
  }

  // --- 4. Detect Take Profits ---
  const tpPattern = /TP\d?[:\s]+\$?(\d+\.?\d*)/g;
  const targetPattern = /TARGET[S]?[:\s]+([0-9\s\/\|]+)/;
  let tp;
  while ((tp = tpPattern.exec(text)) !== null) {
    result.take_profits.push(parseFloat(tp[1]));
  }
  if (!result.take_profits.length) {
    const tMatch = text.match(targetPattern);
    if (tMatch) {
      const tps = tMatch[1].split(/[\/\|\s]+/).map(Number).filter(Boolean);
      result.take_profits = tps;
    }
  }

  // --- 5. Detect Stop Loss ---
  const slPatterns = [
    /SL[:\s]+\$?(\d+\.?\d*)/,
    /STOP[:\s]+\$?(\d+\.?\d*)/,
    /INVALIDATION[:\s]+\$?(\d+\.?\d*)/,
    /STOP[- ]LOSS[:\s]+\$?(\d+\.?\d*)/
  ];
  for (const pat of slPatterns) {
    const match = text.match(pat);
    if (match) {
      result.stop_loss = parseFloat(match[1]);
      break;
    }
  }

  // --- 6. Detect Leverage ---
  const levMatch = text.match(/X?(\d+)[X×]/);
  if (levMatch) result.leverage = parseInt(levMatch[1]);

  // --- 7. Confidence Score ---
  let score = 0;
  if (result.symbol) score++;
  if (result.side) score++;
  if (result.entry) score++;
  if (result.take_profits.length) score++;
  if (result.stop_loss) score++;

  result.confidence = score >= 5 ? 'high' : score >= 3 ? 'medium' : 'low';

  return result;
}

module.exports = { parseSignal };
```

> **Rule:** If `confidence === 'low'`, do NOT auto-execute. Log it and optionally alert the user for manual review.

---

## 6. Telegram Bot Integration

You need two separate Telegram integrations:

| Integration | Purpose | Library |
|---|---|---|
| **Telegram Client (MTProto)** | Read messages from any channel, even ones the bot isn't admin of | `gramjs` (Node) or `Telethon` (Python) |
| **Telegram Bot API** | Send alerts back to users (trade fired, error, etc.) | `node-telegram-bot-api` |

### 6A. Signal Listener — gramjs (Node.js)

```javascript
// listener/telegramListener.js
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage } from "telegram/events";

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const session = new StringSession(process.env.TELEGRAM_SESSION);

const client = new TelegramClient(session, apiId, apiHash, {
  connectionRetries: 5,
});

export async function startListener(channelUsername, onSignal) {
  await client.connect();

  client.addEventHandler(async (event) => {
    const message = event.message;
    if (!message?.text) return;

    const chat = await event.getChat();
    const chatUsername = chat.username || String(chat.id);

    // Only process messages from the subscribed channel
    if (!channelUsername.includes(chatUsername)) return;

    const rawText = message.text;
    onSignal(rawText); // Hand off to parser → executor
  }, new NewMessage({}));

  console.log(`✅ Listening to ${channelUsername}`);
}
```

> **Important:** You need a real Telegram account's API ID and Hash from https://my.telegram.org. One account can listen to multiple channels. Store the session string in your env — it persists login.

### 6B. Alert Bot — Send Trade Confirmations to User

```javascript
// bot/alertBot.js
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

export async function sendTradeAlert(telegramUserId, tradeData) {
  const { symbol, side, qty, entry_price, take_profit, stop_loss, status } = tradeData;

  const emoji = side === 'Buy' ? '🟢' : '🔴';
  const msg = `
${emoji} *Trade Executed*
━━━━━━━━━━━━━━
*Symbol:* ${symbol}
*Side:* ${side}
*Entry:* $${entry_price}
*Qty:* ${qty}
*TP:* $${take_profit}
*SL:* $${stop_loss}
*Status:* ${status.toUpperCase()}
━━━━━━━━━━━━━━
_Powered by CopySignal Bot_
  `;

  await bot.sendMessage(telegramUserId, msg, { parse_mode: 'Markdown' });
}
```

---

## 7. Bybit & Binance API Integration

### Install SDKs

```bash
npm install bybit-api binance
```

### 7A. Bybit Trade Executor

```javascript
// executors/bybitExecutor.js
import { RestClientV5 } from 'bybit-api';
import crypto from 'crypto';

function getBybitClient(encryptedKey, encryptedSecret) {
  // Decrypt your AES-256 encrypted keys
  const apiKey = decrypt(encryptedKey);
  const apiSecret = decrypt(encryptedSecret);

  return new RestClientV5({
    key: apiKey,
    secret: apiSecret,
    testnet: false,
  });
}

export async function executeTrade(apiKeysDoc, parsedSignal, riskPercent) {
  const client = getBybitClient(apiKeysDoc.api_key, apiKeysDoc.api_secret);

  // 1. Get account balance
  const balanceRes = await client.getWalletBalance({
    accountType: 'UNIFIED',
    coin: 'USDT'
  });
  const balance = parseFloat(
    balanceRes.result.list[0].totalAvailableBalance
  );

  // 2. Calculate position size based on risk %
  const riskAmount = balance * (riskPercent / 100);
  const stopLossDistance = Math.abs(parsedSignal.entry - parsedSignal.stop_loss);
  const qty = parseFloat((riskAmount / stopLossDistance).toFixed(3));

  // 3. Set leverage
  await client.setLeverage({
    category: 'linear',
    symbol: parsedSignal.symbol,
    buyLeverage: String(parsedSignal.leverage),
    sellLeverage: String(parsedSignal.leverage),
  });

  // 4. Place market order
  const orderRes = await client.submitOrder({
    category: 'linear',
    symbol: parsedSignal.symbol,
    side: parsedSignal.side,         // 'Buy' or 'Sell'
    orderType: 'Market',
    qty: String(qty),
    takeProfit: String(parsedSignal.take_profits[0]),
    stopLoss: String(parsedSignal.stop_loss),
    tpTriggerBy: 'LastPrice',
    slTriggerBy: 'LastPrice',
    timeInForce: 'IOC',
    positionIdx: 0,
  });

  return { qty, orderResult: orderRes.result };
}
```

### 7B. Binance Trade Executor

```javascript
// executors/binanceExecutor.js
import Binance from 'binance-api-node';

export async function executeTradeBinance(apiKeysDoc, parsedSignal, riskPercent) {
  const client = Binance({
    apiKey: decrypt(apiKeysDoc.api_key),
    apiSecret: decrypt(apiKeysDoc.api_secret),
  });

  // Change leverage
  await client.futuresLeverage({
    symbol: parsedSignal.symbol,
    leverage: parsedSignal.leverage,
  });

  // Get balance
  const account = await client.futuresAccountBalance();
  const usdt = account.find(b => b.asset === 'USDT');
  const balance = parseFloat(usdt.availableBalance);

  // Calculate qty from risk
  const riskAmount = balance * (riskPercent / 100);
  const stopDist = Math.abs(parsedSignal.entry - parsedSignal.stop_loss);
  const qty = parseFloat((riskAmount / stopDist).toFixed(3));

  // Place order
  const order = await client.futuresOrder({
    symbol: parsedSignal.symbol,
    side: parsedSignal.side === 'Buy' ? 'BUY' : 'SELL',
    type: 'MARKET',
    quantity: qty,
  });

  // Set TP & SL as separate OCO orders
  await client.futuresOrder({
    symbol: parsedSignal.symbol,
    side: parsedSignal.side === 'Buy' ? 'SELL' : 'BUY',
    type: 'TAKE_PROFIT_MARKET',
    stopPrice: parsedSignal.take_profits[0],
    closePosition: 'true',
  });

  await client.futuresOrder({
    symbol: parsedSignal.symbol,
    side: parsedSignal.side === 'Buy' ? 'SELL' : 'BUY',
    type: 'STOP_MARKET',
    stopPrice: parsedSignal.stop_loss,
    closePosition: 'true',
  });

  return { qty, orderId: order.orderId };
}
```

---

## 8. Backend Services

### The Main Signal Orchestrator

This is the central process that ties everything together:

```javascript
// services/orchestrator.js
import { parseSignal } from '../parser/signalParser.js';
import { executeTrade } from '../executors/bybitExecutor.js';
import { executeTradeBinance } from '../executors/binanceExecutor.js';
import { sendTradeAlert } from '../bot/alertBot.js';
import { Cocobase } from 'cocobase';

const db = new Cocobase({ apiKey: process.env.COCOBASE_API_KEY });

export async function handleIncomingSignal(rawMessage, channelDoc) {
  const userId = channelDoc.user_id;

  // 1. Parse the signal
  const parsed = parseSignal(rawMessage);

  // 2. Save signal to Cocobase regardless of outcome
  const signalDoc = await db.createDocument("signals", {
    channel_id: channelDoc.id,
    user_id: userId,
    raw_message: rawMessage,
    parsed,
    status: parsed.confidence === 'low' ? 'skipped' : 'parsed',
    received_at: new Date().toISOString()
  });

  // 3. Skip if confidence too low
  if (parsed.confidence === 'low') {
    console.log(`⚠️ Low confidence signal skipped for user ${userId}`);
    return;
  }

  // 4. Check user's subscription allows trading
  const user = await db.auth.getUser(userId);
  if (user.data.plan === 'free') {
    console.log(`User ${userId} on free plan — no auto-execution`);
    return;
  }

  // 5. Get user's API keys
  const apiKeys = await db.listDocuments("api_keys", {
    filters: { user_id: userId, exchange: channelDoc.exchange }
  });
  if (!apiKeys.length) return;

  try {
    // 6. Execute trade
    let result;
    if (channelDoc.exchange === 'bybit') {
      result = await executeTrade(apiKeys[0], parsed, channelDoc.risk_percent);
    } else {
      result = await executeTradeBinance(apiKeys[0], parsed, channelDoc.risk_percent);
    }

    // 7. Log trade to Cocobase
    const tradeLog = await db.createDocument("trade_logs", {
      user_id: userId,
      signal_id: signalDoc.id,
      channel_id: channelDoc.id,
      exchange: channelDoc.exchange,
      symbol: parsed.symbol,
      side: parsed.side,
      qty: result.qty,
      entry_price: parsed.entry,
      take_profit: parsed.take_profits[0],
      stop_loss: parsed.stop_loss,
      status: 'filled',
      executed_at: new Date().toISOString()
    });

    // 8. Alert user via Telegram
    if (user.data.telegram_user_id) {
      await sendTradeAlert(user.data.telegram_user_id, {
        ...parsed,
        qty: result.qty,
        entry_price: parsed.entry,
        status: 'filled'
      });
    }

  } catch (err) {
    // Log failure
    await db.createDocument("trade_logs", {
      user_id: userId,
      signal_id: signalDoc.id,
      status: 'error',
      error_msg: err.message,
      executed_at: new Date().toISOString()
    });
  }
}
```

### API Key Encryption

Never store raw API keys in Cocobase. Always encrypt first:

```javascript
// utils/crypto.js
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte hex key
const IV_LENGTH = 16;

export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
}
```

---

## 9. Frontend Dashboard

### Pages & Screens

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Marketing, pricing, CTA |
| `/auth/login` | Login | Cocobase Auth |
| `/auth/register` | Register | Cocobase Auth |
| `/dashboard` | Overview | Stats, live trade feed |
| `/dashboard/channels` | Channels | Add/remove signal channels |
| `/dashboard/settings` | Settings | API keys, risk config |
| `/dashboard/trades` | Trade History | Full log with P&L |
| `/dashboard/billing` | Billing | Stripe plan management |

### Dashboard Overview UI Components

```
┌───────────────────────────────────────────────────────────┐
│  CopySignal Bot                          [Pro] [Settings] │
├────────────┬──────────────┬─────────────┬────────────────┤
│ Total P&L  │ Trades Today │ Win Rate    │ Active Bots    │
│ +$842.50   │     7        │   71%       │       2        │
├────────────┴──────────────┴─────────────┴────────────────┤
│                   LIVE TRADE FEED                         │
│  🟢 BTCUSDT Buy   $97,210  qty 0.012   TP $98,500  ✅    │
│  🔴 ETHUSDT Sell  $3,450   qty 0.8     TP $3,380   ✅    │
│  🟢 SOLUSDT Buy   $185     qty 12      SL triggered ❌   │
├───────────────────────────────────────────────────────────┤
│                   P&L CHART (30 days)                     │
│  [Recharts Line Chart]                                    │
└───────────────────────────────────────────────────────────┘
```

### Channel Setup Component

```jsx
// components/AddChannelForm.jsx
'use client';
import { useState } from 'react';

export default function AddChannelForm({ onAdd }) {
  const [form, setForm] = useState({
    channel_username: '',
    exchange: 'bybit',
    risk_percent: 1,
    max_trades_per_day: 5
  });

  const handleSubmit = async () => {
    const res = await fetch('/api/channels', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' }
    });
    const channel = await res.json();
    onAdd(channel);
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
      <h2 className="text-white font-bold text-lg mb-4">Add Signal Channel</h2>
      
      <input
        placeholder="@ChannelUsername or invite link"
        className="w-full bg-zinc-800 text-white rounded-lg p-3 mb-3"
        value={form.channel_username}
        onChange={e => setForm({...form, channel_username: e.target.value})}
      />

      <select
        className="w-full bg-zinc-800 text-white rounded-lg p-3 mb-3"
        value={form.exchange}
        onChange={e => setForm({...form, exchange: e.target.value})}
      >
        <option value="bybit">Bybit</option>
        <option value="binance">Binance</option>
      </select>

      <label className="text-zinc-400 text-sm">Risk per trade: {form.risk_percent}%</label>
      <input
        type="range" min="0.5" max="5" step="0.5"
        className="w-full mb-4"
        value={form.risk_percent}
        onChange={e => setForm({...form, risk_percent: parseFloat(e.target.value)})}
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
      >
        Start Listening
      </button>
    </div>
  );
}
```

---

## 10. Subscription System & Billing

### Pricing Tiers

| Plan | Price | What They Get |
|---|---|---|
| **Free** | $0/mo | Dashboard access, signal view only — NO auto-execute |
| **Starter** | $29/mo | 1 channel, 1 exchange, up to 10 trades/day |
| **Pro** | $59/mo | 5 channels, both exchanges, unlimited trades, P&L analytics |
| **Signal Caller** | $99/mo | Everything + multi-user copy (mirror trades to 10 followers) |

### Why This Pricing Works
- Free tier creates signups and demonstrates value
- Starter catches the cautious buyer who wants to try
- Pro is your main revenue target
- Signal Caller tier sells to Telegram channel owners — one sale covers 3–5 regular customers

### Stripe Integration

```javascript
// api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  starter: 'price_xxx_starter_monthly',
  pro: 'price_xxx_pro_monthly',
  signal_caller: 'price_xxx_caller_monthly'
};

export async function POST(req) {
  const { plan, userId, email } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: PLANS[plan], quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing?cancelled=true`,
    metadata: { userId, plan }
  });

  return Response.json({ url: session.url });
}
```

### Stripe Webhook — Update Cocobase on Payment

```javascript
// api/webhooks/stripe.js
export async function POST(req) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  if (event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.created') {

    const sub = event.data.object;
    const userId = sub.metadata.userId;

    // Update user's plan in Cocobase
    const userDocs = await db.listDocuments("subscriptions", {
      filters: { user_id: userId }
    });

    if (userDocs.length) {
      await db.updateDocument("subscriptions", userDocs[0].id, {
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString()
      });
    } else {
      await db.createDocument("subscriptions", {
        user_id: userId,
        stripe_customer_id: sub.customer,
        stripe_subscription_id: sub.id,
        plan: sub.metadata.plan,
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        created_at: new Date().toISOString()
      });
    }

    // Also update user's plan field in auth data
    await db.auth.updateUserData(userId, { plan: sub.metadata.plan });
  }

  return Response.json({ received: true });
}
```

---

## 11. Marketing — X (Twitter)

### Your Content Strategy: Build in Public

Post every single day. This is non-negotiable. You don't need a big account — you need consistency and the right hooks.

### Content Pillars (Rotate These Daily)

**Pillar 1 — Build Updates (3x per week)**
Show real progress. Screenshot the parser working. Show a trade that fired. Show the dashboard UI. People will follow a builder.

> Example post:
> "Just got the signal parser to correctly read 94% of real Telegram signals from 5 different callers. This is the part vibe coding literally cannot do. Thread on how I built it 🧵"

**Pillar 2 — Trading Education + Soft Sell (2x per week)**
Give genuine value about signals, copy trading, risk management. End with a subtle mention of what you're building.

> Example post:
> "Most signal followers lose money not because the signals are bad, but because they enter 10 minutes late manually. Auto-execution at signal price vs. human entry = massive difference in results. Building a fix for this."

**Pillar 3 — Social Proof / Demo (2x per week)**
Once you have early users, post their results (with permission). Post a video of the bot firing a trade live.

> Example post:
> "Watch this. Signal posted at 14:32:07. Trade executed at 14:32:09. Two seconds. That's CopySignal Bot in action. [video]"

### Hashtags to Use
`#crypto` `#trading` `#copytrading` `#bybit` `#binance` `#buildinpublic` `#forex` `#signalbot` `#web3`

### How to Find Your First 100 Followers Fast
- Reply (with value) to every tweet from big crypto accounts: @AltcoinDailyio, @CryptoCapo_, @IncomeSharks
- Quote-tweet signal callers with your take on the signal
- Post in reply to Bybit and Binance's own tweets — their followers are your exact customer

---

## 12. Marketing — TikTok

### Why TikTok Works for This

Crypto TikTok is massive. Trading "money printer" content goes viral constantly. You have a genuine product that actually does something visual and exciting — a trade auto-firing is inherently watchable.

### Video Formats That Work

**Format 1 — "Watch this trade fire in real time"**
Screen record your phone/laptop. Signal comes in. Bot executes. Green P&L shows. 15-30 seconds. No talking needed.

**Format 2 — "I built a bot that does X"**
Face cam + screen share. "I'm a developer and trader. I got tired of missing signals manually so I spent 3 weeks building a bot that auto-executes them on Bybit. Here's how it works."

**Format 3 — "The problem with copy trading apps"**
Education hook. "3xplainer" style. Call out the problem, position your product as the solution.

**Format 4 — "Day 1 / Day 30 of building my trading bot"**
Authenticity content. People love watching the journey.

### Posting Schedule
- 1 video per day minimum
- Best times: 7–9am, 12–2pm, 7–9pm
- Always add link in bio to your landing page

### What To Say in Your Bio
> "Dev + Trader | Building a bot that auto-copies crypto signals | Link below 👇"

---

## 13. Marketing — Telegram

This is your most direct sales channel.

### Step 1: Find the Right Groups

Search these in Telegram:
- "Crypto signals free"
- "Bybit signals"
- "Binance futures signals"
- "Solana calls"
- "Bitcoin futures"

Join 20–30 of them. You're looking for groups with 500+ members that post signals regularly.

### Step 2: Observe First

Spend 3–5 days in each group. Learn their signal format. See how members respond to signals. See if anyone complains about missing entries. Those complaints are your opening.

### Step 3: Engage Authentically

When someone asks "did anyone catch that BTC signal?" reply with genuine conversation. Build rep before you pitch.

### Step 4: Your Daily Post Template

Once you have a working product, post this once per day in relevant groups (rotate the wording):

> "For anyone tired of manually entering signals — I built a bot that auto-executes Telegram signals on Bybit/Binance instantly. Risk management built in. 7-day free trial running now. DM me if interested."

> Do NOT spam this. 1 group per day max. Organic > spam always.

### Step 5: Partner With Signal Callers

This is your biggest multiplier. Find a caller with 1,000–5,000 members. Offer them a revenue share — they promote CopySignal Bot as their official auto-copy tool, their members pay you, you give the caller 20–30% of what their members pay.

One caller partner = potentially 50–200 paying users overnight.

Message template to send to callers:
> "Hey [name], I've been following your signals. I built a bot that auto-executes your signals on Bybit/Binance for your followers. Would love to offer it as a premium tier to your community. Revenue share on every paying subscriber. Would you be open to a call?"

---

## 14. Maintenance & Operations

### Daily Tasks (10–15 min)
- Check error logs — did any signals fail to parse or execute?
- Review Cocobase trade_logs for any anomalies
- Post 1 content piece on X or TikTok

### Weekly Tasks (1–2 hours)
- Review new signal formats that the parser failed on — improve the regex
- Check Stripe for failed payments — follow up with users
- Reply to all DMs and support questions
- Monitor Bybit/Binance API changelog for breaking changes

### Monthly Tasks
- Update parser for any new signal styles you're seeing
- Review churn — which users cancelled and why
- Add new features based on user feedback
- Check Cocobase for any collections getting large — archive old logs

### What Can Break & How to Handle It

| Issue | Cause | Fix |
|---|---|---|
| Bot stops reading channel | Telegram session expired | Refresh session string in env vars |
| Trade fails to execute | Exchange API rate limit | Add retry logic with 2s backoff |
| Wrong qty calculated | Balance fetch failed | Default to minimum qty, alert user |
| Signal not parsed | New format in wild | Add new regex pattern, redeploy |
| User gets duplicate trades | Message received twice | Add message ID deduplication check in Cocobase |

### Deduplication (Critical)

```javascript
// Before executing any signal, check if this message was already processed
const existingSignals = await db.listDocuments("signals", {
  filters: {
    channel_id: channelDoc.id,
    telegram_message_id: messageId
  }
});

if (existingSignals.length > 0) {
  console.log("Duplicate signal — skipping");
  return;
}
```

---

## 15. Week-by-Week Build Roadmap

### Month 1 — Build Core Engine

| Week | Tasks | Deliverable |
|---|---|---|
| **Week 1** | Set up Next.js + Cocobase + auth. Build landing page. Set up Telegram listener with gramjs. | Login/register works. Bot reads a channel. |
| **Week 2** | Build signal parser. Test against 50 real signals manually. Start posting on X/TikTok daily. | Parser hitting 80%+ accuracy |
| **Week 3** | Integrate Bybit API. Test executions on Bybit testnet. Build basic dashboard. | Trades fire on testnet from real signals |
| **Week 4** | Add Binance executor. Add Cocobase trade logging. Build real-time dashboard feed. | Full MVP working end-to-end on testnet |

### Month 2 — Launch & First Revenue

| Week | Tasks | Deliverable |
|---|---|---|
| **Week 5** | Switch to mainnet. Add Stripe. Add encryption for API keys. Security audit. | Product is live and chargeable |
| **Week 6** | Onboard 3–5 beta users for free. Get feedback. Fix bugs. | First real trades fired on live accounts |
| **Week 7** | Launch publicly — announce on X, TikTok, Telegram groups. Run 7-day free trial offer. | First paying users |
| **Week 8** | DM signal callers for partnership deals. Add multi-TP support to executor. | First partner channel deal |

### Month 3 — Scale & Optimize

| Week | Tasks | Deliverable |
|---|---|---|
| **Week 9–10** | Double down on content. Systemize support. Fix top parser failure patterns. | Growing subscriber base |
| **Week 11–12** | Add Signal Caller plan. Build multi-account mirroring. | $3k target hit or in sight |

### Revenue Target Breakdown

| Source | Users | Price | Monthly Revenue |
|---|---|---|---|
| Starter plan | 10 users | $29/mo | $290 |
| Pro plan | 15 users | $59/mo | $885 |
| Signal Caller plan | 3 callers | $99/mo | $297 |
| **Month 3 Total** | | | **~$1,472/mo** |

> To hit $3,000 total across 3 months: Month 1 = $0–200 (beta), Month 2 = $500–800, Month 3 = $1,500+. This is realistic if you start marketing in Week 1 simultaneously with building.

---

## ✅ Launch Checklist

Before going live with real money on the line:

- [ ] All API keys AES-256 encrypted in Cocobase
- [ ] Tested parser against 100+ real signals
- [ ] Testnet trades all pass
- [ ] Error handling on every executor function
- [ ] Telegram duplicate message deduplication working
- [ ] Stripe webhooks tested with Stripe CLI
- [ ] Rate limit handling on Bybit/Binance (429 errors)
- [ ] Users can disconnect their API keys and stop the bot instantly
- [ ] Legal: Add Terms of Service + Risk Disclaimer (non-negotiable for a trading product)
- [ ] Backups: Cocobase data export scheduled monthly

---

*Document version 1.0 — CopySignal Bot PRD*
*Build it. Ship it. Grow it.*
