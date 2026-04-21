# 🗺️ CopySignal Bot — Full Build Roadmap
### Phase 1 → Phase 5 | Detailed Engineering Plan

---

## 📌 How To Use This Roadmap

Each phase has:
- **Goal** — what you must have working by the end of this phase
- **Tasks** — broken into exact steps with code direction
- **Files to create** — the exact folder structure and files
- **Exit criteria** — how you know the phase is truly done before moving on

Do not start Phase 2 until Phase 1 exit criteria are fully met. Each phase builds on the last. Skipping ahead creates bugs that are painful to untangle later.

**Total estimated time:** 8–10 weeks of focused part-time work (3–5 hrs/day)

---

## 🗂️ Full Project Folder Structure

Before anything, understand the full repo layout you're building toward:

```
copysignal-bot/
│
├── apps/
│   ├── web/                        ← Next.js 14 Frontend Dashboard
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── channels/page.tsx
│   │   │   │   ├── trades/page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   └── billing/page.tsx
│   │   │   ├── api/
│   │   │   │   ├── channels/route.ts
│   │   │   │   ├── apikeys/route.ts
│   │   │   │   ├── webhooks/stripe/route.ts
│   │   │   │   └── checkout/route.ts
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx             ← Landing page
│   │   ├── components/
│   │   │   ├── ui/                  ← shadcn/ui components
│   │   │   ├── dashboard/
│   │   │   │   ├── TradeFeed.tsx
│   │   │   │   ├── PnlChart.tsx
│   │   │   │   ├── StatsCards.tsx
│   │   │   │   └── ChannelCard.tsx
│   │   │   └── forms/
│   │   │       ├── AddChannelForm.tsx
│   │   │       └── ApiKeyForm.tsx
│   │   ├── lib/
│   │   │   ├── cocobase.ts          ← Cocobase client singleton
│   │   │   └── stripe.ts
│   │   └── .env.local
│   │
│   └── bot/                         ← Node.js Bot Engine (separate process)
│       ├── src/
│       │   ├── index.ts             ← Entry point — boots all user listeners
│       │   ├── listener/
│       │   │   └── telegramListener.ts
│       │   ├── parser/
│       │   │   ├── signalParser.ts
│       │   │   └── patterns.ts      ← All regex patterns live here
│       │   ├── executors/
│       │   │   ├── bybitExecutor.ts
│       │   │   └── binanceExecutor.ts
│       │   ├── services/
│       │   │   ├── orchestrator.ts  ← Ties parser + executor + logging together
│       │   │   └── alertBot.ts      ← Telegram bot for user alerts
│       │   ├── utils/
│       │   │   ├── crypto.ts        ← AES encryption/decryption
│       │   │   ├── logger.ts
│       │   │   └── riskCalc.ts      ← Position size calculator
│       │   └── db/
│       │       └── cocobase.ts      ← Cocobase client for bot
│       ├── .env
│       └── package.json
│
├── package.json                     ← Root workspace (optional monorepo)
└── README.md
```

---

# PHASE 1 — Foundation & Project Setup
**Duration:** Days 1–5 (Week 1)
**Goal:** Project scaffolded, auth working, Cocobase connected, basic dashboard shell visible in browser.

---

## Phase 1 Tasks

### Task 1.1 — Initialize Repositories

Create the project. Use a monorepo structure so bot and web share one repo.

```bash
mkdir copysignal-bot && cd copysignal-bot
mkdir -p apps/web apps/bot
```

**Initialize the Next.js frontend:**
```bash
cd apps/web
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
```

**Initialize the bot engine:**
```bash
cd ../bot
npm init -y
npm install typescript ts-node @types/node --save-dev
npx tsc --init
```

---

### Task 1.2 — Install All Dependencies

**Web app (apps/web):**
```bash
npm install cocobase stripe @stripe/stripe-js
npm install recharts zustand
npm install @radix-ui/react-dialog @radix-ui/react-switch @radix-ui/react-tabs
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select tabs dialog switch badge
```

**Bot engine (apps/bot):**
```bash
npm install cocobase
npm install telegram                  # gramjs — Telegram MTProto client
npm install node-telegram-bot-api     # Telegram Bot API for alerts
npm install bybit-api                 # Bybit REST + WebSocket
npm install binance-api-node          # Binance Futures
npm install bullmq ioredis            # Job queue
npm install crypto-js                 # AES encryption
npm install dotenv
npm install @types/node typescript ts-node --save-dev
```

---

### Task 1.3 — Environment Variables

**apps/web/.env.local:**
```env
# Cocobase
NEXT_PUBLIC_COCOBASE_API_KEY=your_cocobase_api_key
NEXT_PUBLIC_COCOBASE_PROJECT_ID=your_project_id

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Stripe Price IDs
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_CALLER=price_xxx

NEXT_PUBLIC_URL=https://yourdomain.com
```

**apps/bot/.env:**
```env
# Cocobase
COCOBASE_API_KEY=your_cocobase_api_key

# Telegram MTProto (from https://my.telegram.org)
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abc123def456
TELEGRAM_SESSION=your_saved_session_string

# Telegram Alert Bot (from @BotFather)
TELEGRAM_BOT_TOKEN=123456:ABCdef

# Encryption
ENCRYPTION_KEY=your_64_char_hex_key_here

# Redis (for BullMQ queue)
REDIS_URL=redis://localhost:6379
```

> **How to generate ENCRYPTION_KEY:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

### Task 1.4 — Cocobase Client Setup

Create the singleton client used everywhere in the web app:

**apps/web/lib/cocobase.ts:**
```typescript
import { Cocobase } from "cocobase";

// Singleton pattern — one instance for the whole app
let client: Cocobase | null = null;

export function getDB(): Cocobase {
  if (!client) {
    client = new Cocobase({
      apiKey: process.env.NEXT_PUBLIC_COCOBASE_API_KEY!,
      projectId: process.env.NEXT_PUBLIC_COCOBASE_PROJECT_ID
    });
  }
  return client;
}

export const db = getDB();
```

Same pattern for the bot:

**apps/bot/src/db/cocobase.ts:**
```typescript
import { Cocobase } from "cocobase";
import * as dotenv from "dotenv";
dotenv.config();

export const db = new Cocobase({
  apiKey: process.env.COCOBASE_API_KEY!
});
```

---

### Task 1.5 — Build Auth Pages (Login + Register)

Wire up Cocobase Auth to Next.js pages.

**apps/web/app/(auth)/register/page.tsx:**
```typescript
'use client';
import { useState } from 'react';
import { db } from '@/lib/cocobase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      await db.auth.register({
        email: form.email,
        password: form.password,
        data: {
          username: form.username,
          plan: 'free',
          plan_expires_at: null,
          telegram_user_id: null,
          created_at: new Date().toISOString()
        }
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-white text-2xl font-bold mb-6">Create Account</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <input
          placeholder="Username"
          className="w-full bg-zinc-800 text-white rounded-lg p-3 mb-3 outline-none"
          onChange={e => setForm({...form, username: e.target.value})}
        />
        <input
          placeholder="Email"
          type="email"
          className="w-full bg-zinc-800 text-white rounded-lg p-3 mb-3 outline-none"
          onChange={e => setForm({...form, email: e.target.value})}
        />
        <input
          placeholder="Password"
          type="password"
          className="w-full bg-zinc-800 text-white rounded-lg p-3 mb-6 outline-none"
          onChange={e => setForm({...form, password: e.target.value})}
        />
        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
        >
          Get Started
        </button>
        <p className="text-zinc-500 text-sm text-center mt-4">
          Already have an account? <a href="/login" className="text-blue-400">Sign in</a>
        </p>
      </div>
    </div>
  );
}
```

Build the login page the same way using `db.auth.login({ email, password })`.

---

### Task 1.6 — Build Dashboard Shell

Create the layout wrapper and empty dashboard page so you can see the UI structure before filling it in.

**apps/web/app/(dashboard)/layout.tsx:**
```typescript
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
```

**Sidebar nav links:** Dashboard, Channels, Trades, Settings, Billing, Sign Out.

---

## ✅ Phase 1 Exit Criteria

Before moving to Phase 2, every one of these must be true:

- [ ] `npm run dev` starts the Next.js app with zero errors
- [ ] Register page creates a user in your Cocobase dashboard
- [ ] Login page authenticates and redirects to `/dashboard`
- [ ] Dashboard shell renders with sidebar navigation
- [ ] Bot folder has all dependencies installed and TypeScript compiles
- [ ] Both `.env` files are populated and reading correctly
- [ ] Cocobase collections `users`, `api_keys`, `channels`, `signals`, `trade_logs`, `subscriptions` are created manually in your Cocobase dashboard

---

# PHASE 2 — Signal Listener + Parser Engine
**Duration:** Days 6–12 (Week 2)
**Goal:** Bot reads real Telegram channels. Parser correctly identifies symbol, side, entry, TP, SL from raw messages with 80%+ accuracy.

---

## Phase 2 Tasks

### Task 2.1 — Get Telegram MTProto Credentials

1. Go to **https://my.telegram.org**
2. Log in with your personal Telegram number
3. Click "API Development Tools"
4. Create a new application — name it anything
5. Copy `api_id` and `api_hash` into your `.env`

This is not the same as a Telegram bot. The MTProto client logs in as your personal Telegram account and can read any channel you're a member of.

---

### Task 2.2 — Generate & Save Telegram Session String

Run this ONCE to generate a persistent session. After this you won't need to log in again.

**apps/bot/src/scripts/generateSession.ts:**
```typescript
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";  // npm install input
import * as dotenv from "dotenv";
dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID!);
const apiHash = process.env.TELEGRAM_API_HASH!;
const session = new StringSession("");

(async () => {
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Enter your phone number: "),
    password: async () => await input.text("Enter your 2FA password (if any): "),
    phoneCode: async () => await input.text("Enter the code you received: "),
    onError: (err: Error) => console.error(err),
  });

  console.log("\n✅ SESSION STRING (copy this into your .env):");
  console.log(client.session.save());

  await client.disconnect();
})();
```

Run: `npx ts-node src/scripts/generateSession.ts`
Copy the output string into `TELEGRAM_SESSION` in your `.env`.

---

### Task 2.3 — Build the Telegram Listener

**apps/bot/src/listener/telegramListener.ts:**
```typescript
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage, NewMessageEvent } from "telegram/events/index.js";
import * as dotenv from "dotenv";
dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID!);
const apiHash = process.env.TELEGRAM_API_HASH!;
const sessionStr = process.env.TELEGRAM_SESSION!;

class TelegramListener {
  private client: TelegramClient;
  private activeChannels: Map<string, (msg: string, msgId: string) => void> = new Map();

  constructor() {
    this.client = new TelegramClient(
      new StringSession(sessionStr),
      apiId,
      apiHash,
      { connectionRetries: 5, retryDelay: 1000 }
    );
  }

  async connect() {
    await this.client.connect();
    console.log("✅ Telegram client connected");

    // Single handler for ALL messages
    this.client.addEventHandler(
      async (event: NewMessageEvent) => {
        const message = event.message;
        if (!message?.text || message.text.trim().length < 10) return;

        const chat = await event.getChat();
        if (!chat) return;

        // Build identifiers for this chat
        const chatId = String(chat.id);
        const username = (chat as any).username ? `@${(chat as any).username}` : null;

        // Check if any of our registered channels match
        for (const [channelKey, callback] of this.activeChannels.entries()) {
          if (
            chatId === channelKey ||
            (username && username.toLowerCase() === channelKey.toLowerCase())
          ) {
            callback(message.text, String(message.id));
            break;
          }
        }
      },
      new NewMessage({})
    );
  }

  // Called when a user adds a new channel to watch
  addChannel(channelIdentifier: string, onMessage: (msg: string, msgId: string) => void) {
    this.activeChannels.set(channelIdentifier, onMessage);
    console.log(`📡 Now listening: ${channelIdentifier}`);
  }

  removeChannel(channelIdentifier: string) {
    this.activeChannels.delete(channelIdentifier);
    console.log(`🔇 Stopped listening: ${channelIdentifier}`);
  }
}

// Export singleton
export const telegramListener = new TelegramListener();
```

---

### Task 2.4 — Build the Signal Parser

**apps/bot/src/parser/patterns.ts:**
```typescript
// All regex patterns in one file — easy to add new ones

export const PATTERNS = {
  // Coin symbols — extend this list as needed
  symbols: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'AVAX', 'MATIC',
            'LINK', 'ADA', 'DOT', 'PEPE', 'WIF', 'BONK', 'SHIB', 'OP',
            'ARB', 'LTC', 'NEAR', 'ATOM', 'APT', 'SUI', 'INJ', 'TIA'],

  // Direction patterns
  long: /\b(LONG|BUY|CALLS?|BULL|BULLISH|UP)\b/i,
  short: /\b(SHORT|SELL|PUTS?|BEAR|BEARISH|DOWN)\b/i,

  // Entry price patterns (ordered by specificity, most specific first)
  entry: [
    /ENTRY\s*(?:ZONE\s*)?[:\-]?\s*\$?([\d,]+\.?\d*)\s*[-–]\s*\$?([\d,]+\.?\d*)/i, // range
    /ENTRY\s*[:\-]?\s*\$?([\d,]+\.?\d*)/i,
    /ENTER\s*(?:AT\s*)?[:\-]?\s*\$?([\d,]+\.?\d*)/i,
    /PRICE\s*[:\-]?\s*\$?([\d,]+\.?\d*)/i,
    /NOW\s*(?:AT\s*)?(?:AROUND\s*)?\$?([\d,]+\.?\d*)/i,
    /(?:LONG|SHORT)\s*(?:@|AT)?\s*\$?([\d,]+\.?\d*)/i,
    /\bAPE\s+(?:IN\s+)?(?:AT\s+)?(?:AROUND\s+)?\$?([\d,]+\.?\d*)/i,
  ],

  // Take profit patterns
  takeProfit: [
    /TP\s*\d*\s*[:\-]?\s*\$?([\d,]+\.?\d*)/gi,
    /TAKE\s*PROFIT\s*\d*\s*[:\-]?\s*\$?([\d,]+\.?\d*)/gi,
    /TARGET\s*\d*\s*[:\-]?\s*\$?([\d,]+\.?\d*)/gi,
    /T\/P\s*\d*\s*[:\-]?\s*\$?([\d,]+\.?\d*)/gi,
  ],

  // Target list pattern (e.g., "Targets: 98000 / 100000 / 105000")
  targetList: /TARGETS?\s*[:\-]?\s*([\d,\s\/\|\.]+)/i,

  // Stop loss patterns
  stopLoss: [
    /S\.?L\.?\s*\d*\s*[:\-]?\s*\$?([\d,]+\.?\d*)/i,
    /STOP\s*(?:LOSS\s*)?(?:AT\s*)?[:\-]?\s*\$?([\d,]+\.?\d*)/i,
    /INVALIDATION\s*[:\-]?\s*\$?([\d,]+\.?\d*)/i,
    /CUT\s*(?:AT\s*)?[:\-]?\s*\$?([\d,]+\.?\d*)/i,
  ],

  // Leverage patterns
  leverage: /(?:X|x|×|LEVERAGE[:\s]+)(\d+)(?:X|x|×)?|(\d+)(?:X|x|×)/,
};
```

**apps/bot/src/parser/signalParser.ts:**
```typescript
import { PATTERNS } from './patterns.js';

export interface ParsedSignal {
  symbol: string | null;
  side: 'Buy' | 'Sell' | null;
  entry: number | null;
  entryHigh: number | null;     // For range entries — use midpoint
  take_profits: number[];
  stop_loss: number | null;
  leverage: number;
  confidence: 'high' | 'medium' | 'low' | 'failed';
  confidence_score: number;
  raw: string;
}

function cleanNumber(str: string): number {
  return parseFloat(str.replace(/,/g, ''));
}

export function parseSignal(rawText: string): ParsedSignal {
  const text = rawText.toUpperCase().trim();

  const result: ParsedSignal = {
    symbol: null,
    side: null,
    entry: null,
    entryHigh: null,
    take_profits: [],
    stop_loss: null,
    leverage: 10,  // sensible default
    confidence: 'failed',
    confidence_score: 0,
    raw: rawText
  };

  // ─── 1. SYMBOL DETECTION ─────────────────────────────────
  // Check for "BTCUSDT" style first, then bare "BTC"
  const usdtMatch = text.match(/\b([A-Z]{2,8})USDT\b/);
  if (usdtMatch) {
    result.symbol = usdtMatch[1] + 'USDT';
  } else {
    for (const sym of PATTERNS.symbols) {
      if (new RegExp(`\\b${sym}\\b`).test(text)) {
        result.symbol = sym + 'USDT';
        break;
      }
    }
  }

  // ─── 2. DIRECTION DETECTION ──────────────────────────────
  if (PATTERNS.long.test(text)) result.side = 'Buy';
  else if (PATTERNS.short.test(text)) result.side = 'Sell';

  // ─── 3. ENTRY PRICE ──────────────────────────────────────
  for (const pattern of PATTERNS.entry) {
    const match = text.match(pattern);
    if (match) {
      // If it's a range (e.g., 96500–97000), take midpoint
      if (match[2]) {
        const low = cleanNumber(match[1]);
        const high = cleanNumber(match[2]);
        result.entry = parseFloat(((low + high) / 2).toFixed(2));
        result.entryHigh = high;
      } else {
        result.entry = cleanNumber(match[1]);
      }
      break;
    }
  }

  // ─── 4. TAKE PROFITS ─────────────────────────────────────
  // Try individual TP patterns first
  for (const pattern of PATTERNS.takeProfit) {
    const regex = new RegExp(pattern.source, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const val = cleanNumber(match[1]);
      if (!result.take_profits.includes(val)) {
        result.take_profits.push(val);
      }
    }
  }

  // If still empty, try the "Targets: x / y / z" pattern
  if (result.take_profits.length === 0) {
    const listMatch = text.match(PATTERNS.targetList);
    if (listMatch) {
      const tps = listMatch[1]
        .split(/[\/\|\s]+/)
        .map(s => parseFloat(s.replace(/,/g, '')))
        .filter(n => !isNaN(n) && n > 0);
      result.take_profits = tps;
    }
  }

  // Sort TPs correctly by direction
  if (result.take_profits.length > 1) {
    result.take_profits.sort((a, b) =>
      result.side === 'Buy' ? a - b : b - a
    );
  }

  // ─── 5. STOP LOSS ────────────────────────────────────────
  for (const pattern of PATTERNS.stopLoss) {
    const match = text.match(pattern);
    if (match) {
      result.stop_loss = cleanNumber(match[1]);
      break;
    }
  }

  // ─── 6. LEVERAGE ─────────────────────────────────────────
  const levMatch = text.match(PATTERNS.leverage);
  if (levMatch) {
    result.leverage = parseInt(levMatch[1] || levMatch[2]);
    // Cap leverage at 50x for safety
    result.leverage = Math.min(result.leverage, 50);
  }

  // ─── 7. CONFIDENCE SCORING ───────────────────────────────
  let score = 0;
  if (result.symbol) score += 2;         // Symbol is essential
  if (result.side) score += 2;           // Direction is essential
  if (result.entry) score += 2;          // Entry is essential
  if (result.take_profits.length) score += 1;
  if (result.stop_loss) score += 2;      // SL is critical for risk management
  if (result.leverage !== 10) score += 1; // Explicit leverage found

  result.confidence_score = score;
  result.confidence = score >= 8 ? 'high' : score >= 5 ? 'medium' : score >= 3 ? 'low' : 'failed';

  return result;
}
```

---

### Task 2.5 — Test the Parser Against Real Signals

Before wiring to the bot, test the parser standalone:

**apps/bot/src/scripts/testParser.ts:**
```typescript
import { parseSignal } from '../parser/signalParser.js';

const TEST_SIGNALS = [
  // Add 20-30 real signals you've copied from Telegram groups
  `BTC Long $97,200 TP $98,500 SL $96,800`,
  `🚨 SIGNAL\nSOLUSDT LONG x20\nEntry: 185\nTP: 195 | 200 | 210\nSL: 178`,
  `ETH SHORT\nEntry: 3,450 - 3,480\nTP1: 3,400\nTP2: 3,350\nSL: 3,520`,
  `Ape into BTC calls now around 96800, target 99k, stop 95k`,
  `#BTCUSDT\nDirection: LONG\nEntry Zone: 96,500–97,000\nTargets: 98,000 / 100,000\nInvalidation: 95,800\nLeverage: 10x`,
];

console.log("=== Signal Parser Test Results ===\n");
let passed = 0;

TEST_SIGNALS.forEach((sig, i) => {
  const result = parseSignal(sig);
  const ok = result.confidence !== 'failed' && result.symbol && result.side;
  if (ok) passed++;

  console.log(`Signal ${i + 1}: ${ok ? '✅' : '❌'} [${result.confidence.toUpperCase()}]`);
  console.log(`  Symbol: ${result.symbol} | Side: ${result.side} | Entry: ${result.entry}`);
  console.log(`  TPs: ${result.take_profits.join(', ')} | SL: ${result.stop_loss}`);
  console.log(`  Raw: "${sig.substring(0, 60)}..."\n`);
});

console.log(`=== ${passed}/${TEST_SIGNALS.length} signals parsed successfully ===`);
```

Run: `npx ts-node src/scripts/testParser.ts`

**Target:** 80%+ pass rate before moving on. When a signal fails, add a new pattern to `patterns.ts` to handle it.

---

## ✅ Phase 2 Exit Criteria

- [ ] Telegram session string generated and saved
- [ ] `telegramListener` connects and prints messages from a test channel to console
- [ ] Parser test script passes 80%+ of your test signals
- [ ] `parseSignal()` correctly identifies entry price, side, and SL on all major formats
- [ ] `confidence` score correctly marks incomplete signals as 'low' or 'failed'

---

# PHASE 3 — Trade Execution Engine
**Duration:** Days 13–19 (Week 3)
**Goal:** Bot successfully places real trades on Bybit and Binance testnet based on parsed signals. Risk management calculates correct position sizes.

---

## Phase 3 Tasks

### Task 3.1 — Build the Encryption Utility

This runs before ANY API key touches Cocobase. Never skip this.

**apps/bot/src/utils/crypto.ts:**
```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const IV_LENGTH = 16;

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(ciphertext: string): string {
  const [ivHex, encryptedHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
```

---

### Task 3.2 — Build the Risk Calculator

**apps/bot/src/utils/riskCalc.ts:**
```typescript
export interface RiskParams {
  accountBalance: number;   // Total USDT balance
  riskPercent: number;      // e.g., 1.5 = 1.5% risk
  entryPrice: number;
  stopLossPrice: number;
  leverage: number;
}

export interface PositionSizing {
  qty: number;              // Contracts to buy
  riskAmount: number;       // $ amount being risked
  positionValue: number;    // Total position value
  margin: number;           // Margin required at given leverage
}

export function calculatePositionSize(params: RiskParams): PositionSizing {
  const { accountBalance, riskPercent, entryPrice, stopLossPrice, leverage } = params;

  const riskAmount = accountBalance * (riskPercent / 100);
  const stopDistance = Math.abs(entryPrice - stopLossPrice);

  // How many coins can we buy with our risk amount given the stop distance?
  const qty = parseFloat((riskAmount / stopDistance).toFixed(4));

  const positionValue = qty * entryPrice;
  const margin = positionValue / leverage;

  return { qty, riskAmount, positionValue, margin };
}

// Safety check — never use more than 5% of balance as margin
export function isSafeToTrade(sizing: PositionSizing, balance: number): boolean {
  const marginPercent = (sizing.margin / balance) * 100;
  return marginPercent <= 5;
}
```

---

### Task 3.3 — Build the Bybit Executor

**apps/bot/src/executors/bybitExecutor.ts:**
```typescript
import { RestClientV5 } from 'bybit-api';
import { decrypt } from '../utils/crypto.js';
import { calculatePositionSize, isSafeToTrade } from '../utils/riskCalc.js';
import type { ParsedSignal } from '../parser/signalParser.js';

export interface ApiKeyDoc {
  api_key: string;          // encrypted
  api_secret: string;       // encrypted
  testnet: boolean;
}

export interface ExecutionResult {
  success: boolean;
  qty: number;
  orderId: string;
  entryPrice: number;
  error?: string;
}

export async function executeBybit(
  apiKeyDoc: ApiKeyDoc,
  signal: ParsedSignal,
  riskPercent: number
): Promise<ExecutionResult> {

  const client = new RestClientV5({
    key: decrypt(apiKeyDoc.api_key),
    secret: decrypt(apiKeyDoc.api_secret),
    testnet: apiKeyDoc.testnet,
  });

  try {
    // ── Step 1: Get account balance ──
    const balanceRes = await client.getWalletBalance({ accountType: 'UNIFIED', coin: 'USDT' });
    const balance = parseFloat(
      balanceRes.result.list[0].coin.find((c: any) => c.coin === 'USDT')?.availableToWithdraw || '0'
    );
    if (balance <= 0) throw new Error('Insufficient USDT balance');

    // ── Step 2: Calculate position size ──
    const sizing = calculatePositionSize({
      accountBalance: balance,
      riskPercent,
      entryPrice: signal.entry!,
      stopLossPrice: signal.stop_loss!,
      leverage: signal.leverage
    });

    if (!isSafeToTrade(sizing, balance)) {
      throw new Error(`Trade would use excessive margin: ${(sizing.margin / balance * 100).toFixed(1)}%`);
    }

    // ── Step 3: Set leverage ──
    await client.setLeverage({
      category: 'linear',
      symbol: signal.symbol!,
      buyLeverage: String(signal.leverage),
      sellLeverage: String(signal.leverage),
    });

    // ── Step 4: Place market order ──
    const orderRes = await client.submitOrder({
      category: 'linear',
      symbol: signal.symbol!,
      side: signal.side as 'Buy' | 'Sell',
      orderType: 'Market',
      qty: String(sizing.qty),
      takeProfit: signal.take_profits.length ? String(signal.take_profits[0]) : undefined,
      stopLoss: signal.stop_loss ? String(signal.stop_loss) : undefined,
      tpTriggerBy: 'LastPrice',
      slTriggerBy: 'LastPrice',
      timeInForce: 'IOC',
      positionIdx: 0,
    });

    if (orderRes.retCode !== 0) {
      throw new Error(`Bybit error: ${orderRes.retMsg}`);
    }

    return {
      success: true,
      qty: sizing.qty,
      orderId: orderRes.result.orderId,
      entryPrice: signal.entry!,
    };

  } catch (err: any) {
    return {
      success: false,
      qty: 0,
      orderId: '',
      entryPrice: 0,
      error: err.message
    };
  }
}
```

---

### Task 3.4 — Build the Binance Executor

**apps/bot/src/executors/binanceExecutor.ts:**
```typescript
import Binance from 'binance-api-node';
import { decrypt } from '../utils/crypto.js';
import { calculatePositionSize, isSafeToTrade } from '../utils/riskCalc.js';
import type { ParsedSignal } from '../parser/signalParser.js';
import type { ExecutionResult, ApiKeyDoc } from './bybitExecutor.js';

export async function executeBinance(
  apiKeyDoc: ApiKeyDoc,
  signal: ParsedSignal,
  riskPercent: number
): Promise<ExecutionResult> {

  const client = Binance({
    apiKey: decrypt(apiKeyDoc.api_key),
    apiSecret: decrypt(apiKeyDoc.api_secret),
  });

  try {
    // ── Step 1: Change margin type to ISOLATED ──
    try {
      await client.futuresMarginType({ symbol: signal.symbol!, marginType: 'ISOLATED' });
    } catch (_) { /* already isolated — ignore */ }

    // ── Step 2: Set leverage ──
    await client.futuresLeverage({ symbol: signal.symbol!, leverage: signal.leverage });

    // ── Step 3: Get USDT balance ──
    const account = await client.futuresAccountBalance();
    const usdtBal = account.find((b: any) => b.asset === 'USDT');
    const balance = parseFloat(usdtBal?.availableBalance || '0');
    if (balance <= 0) throw new Error('Insufficient USDT balance');

    // ── Step 4: Get symbol precision ──
    const info = await client.futuresExchangeInfo();
    const symbolInfo = info.symbols.find((s: any) => s.symbol === signal.symbol);
    const qtyPrecision = symbolInfo?.quantityPrecision || 3;

    // ── Step 5: Calculate position size ──
    const sizing = calculatePositionSize({
      accountBalance: balance,
      riskPercent,
      entryPrice: signal.entry!,
      stopLossPrice: signal.stop_loss!,
      leverage: signal.leverage
    });

    if (!isSafeToTrade(sizing, balance)) {
      throw new Error('Trade would use excessive margin');
    }

    const qty = parseFloat(sizing.qty.toFixed(qtyPrecision));

    // ── Step 6: Place market order ──
    const order: any = await client.futuresOrder({
      symbol: signal.symbol!,
      side: signal.side === 'Buy' ? 'BUY' : 'SELL',
      type: 'MARKET',
      quantity: String(qty),
    });

    const closeSide = signal.side === 'Buy' ? 'SELL' : 'BUY';

    // ── Step 7: Place Take Profit order ──
    if (signal.take_profits.length > 0) {
      await client.futuresOrder({
        symbol: signal.symbol!,
        side: closeSide,
        type: 'TAKE_PROFIT_MARKET',
        stopPrice: String(signal.take_profits[0]),
        closePosition: 'true',
        timeInForce: 'GTE_GTC',
      });
    }

    // ── Step 8: Place Stop Loss order ──
    if (signal.stop_loss) {
      await client.futuresOrder({
        symbol: signal.symbol!,
        side: closeSide,
        type: 'STOP_MARKET',
        stopPrice: String(signal.stop_loss),
        closePosition: 'true',
        timeInForce: 'GTE_GTC',
      });
    }

    return { success: true, qty, orderId: order.orderId, entryPrice: signal.entry! };

  } catch (err: any) {
    return { success: false, qty: 0, orderId: '', entryPrice: 0, error: err.message };
  }
}
```

---

### Task 3.5 — Test on Testnet

Both Bybit and Binance have testnets. Use them before touching real money.

**Bybit Testnet:**
1. Go to https://testnet.bybit.com
2. Create account, get test USDT from faucet
3. Create API keys on testnet
4. Set `testnet: true` in your executor during testing

**Binance Testnet:**
1. Go to https://testnet.binancefuture.com
2. Generate API keys there
3. Update your `.env` with testnet keys for testing

**Test script:**
```typescript
// apps/bot/src/scripts/testExecution.ts
import { executeBybit } from '../executors/bybitExecutor.js';
import { parseSignal } from '../parser/signalParser.js';

const testSignal = `BTC Long $30,000 TP $31,000 SL $29,500 x10`;
const parsed = parseSignal(testSignal);
console.log("Parsed:", parsed);

const testApiKey = {
  api_key: encrypt("your_testnet_api_key"),
  api_secret: encrypt("your_testnet_secret"),
  testnet: true
};

const result = await executeBybit(testApiKey, parsed, 1.0);
console.log("Execution result:", result);
```

---

## ✅ Phase 3 Exit Criteria

- [ ] `encrypt()` and `decrypt()` roundtrip works correctly
- [ ] `calculatePositionSize()` returns correct qty for various balance/risk combos
- [ ] `isSafeToTrade()` correctly blocks trades that use excessive margin
- [ ] Bybit testnet trade executes with correct qty, TP, and SL set
- [ ] Binance testnet trade executes with correct qty, TP, and SL as separate orders
- [ ] `ExecutionResult.success === true` on testnet for both exchanges
- [ ] Error responses from the exchange are caught and returned cleanly (not thrown)

---

# PHASE 4 — Full System Integration + Dashboard
**Duration:** Days 20–30 (Weeks 4–5)
**Goal:** Everything is connected. Signals flow from Telegram → Parser → Executor → Cocobase. Dashboard shows live trades in real time. Users can add channels, connect API keys, and manage settings.

---

## Phase 4 Tasks

### Task 4.1 — Build the Orchestrator (The Brain)

**apps/bot/src/services/orchestrator.ts:**
```typescript
import { db } from '../db/cocobase.js';
import { parseSignal } from '../parser/signalParser.js';
import { executeBybit } from '../executors/bybitExecutor.js';
import { executeBinance } from '../executors/binanceExecutor.js';
import { sendTradeAlert } from './alertBot.js';

export async function handleSignal(
  rawMessage: string,
  messageId: string,
  channelDoc: any   // Document from Cocobase 'channels' collection
) {
  const userId = channelDoc.user_id;

  // ── Guard: Deduplication ──────────────────────────────────
  // Make sure we haven't already processed this exact message
  const existing = await db.listDocuments("signals", {
    filters: {
      channel_id: channelDoc.id,
      telegram_message_id: messageId
    }
  });
  if (existing.length > 0) {
    console.log(`⚠️  Duplicate message ${messageId} — skipping`);
    return;
  }

  // ── Step 1: Parse Signal ──────────────────────────────────
  const parsed = parseSignal(rawMessage);

  // ── Step 2: Store Signal in Cocobase ─────────────────────
  const signalDoc = await db.createDocument("signals", {
    channel_id: channelDoc.id,
    user_id: userId,
    telegram_message_id: messageId,
    raw_message: rawMessage,
    parsed,
    status: parsed.confidence === 'failed' ? 'failed' : 'parsed',
    received_at: new Date().toISOString()
  });

  // ── Step 3: Skip Low Confidence ──────────────────────────
  if (parsed.confidence === 'low' || parsed.confidence === 'failed') {
    console.log(`⚠️  ${parsed.confidence} confidence — not executing`);
    await db.updateDocument("signals", signalDoc.id, { status: 'skipped' });
    return;
  }

  // ── Step 4: Check User Plan ───────────────────────────────
  const user = await db.auth.getUser(userId);
  if (user?.data?.plan === 'free') {
    console.log(`User ${userId} on free plan — signal saved but not executed`);
    return;
  }

  // ── Step 5: Get User's API Keys ───────────────────────────
  const apiKeys = await db.listDocuments("api_keys", {
    filters: { user_id: userId, exchange: channelDoc.exchange }
  });
  if (!apiKeys.length) {
    console.log(`No API keys found for user ${userId} on ${channelDoc.exchange}`);
    return;
  }

  // ── Step 6: Execute Trade ─────────────────────────────────
  let result;
  if (channelDoc.exchange === 'bybit') {
    result = await executeBybit(apiKeys[0], parsed, channelDoc.risk_percent);
  } else {
    result = await executeBinance(apiKeys[0], parsed, channelDoc.risk_percent);
  }

  // ── Step 7: Log Trade to Cocobase ────────────────────────
  await db.createDocument("trade_logs", {
    user_id: userId,
    signal_id: signalDoc.id,
    channel_id: channelDoc.id,
    exchange: channelDoc.exchange,
    symbol: parsed.symbol,
    side: parsed.side,
    order_type: 'Market',
    qty: result.qty,
    entry_price: result.entryPrice,
    take_profit: parsed.take_profits[0] || null,
    stop_loss: parsed.stop_loss,
    status: result.success ? 'filled' : 'error',
    error_msg: result.error || null,
    executed_at: new Date().toISOString(),
    closed_at: null,
    pnl: null
  });

  // Update signal status
  await db.updateDocument("signals", signalDoc.id, {
    status: result.success ? 'executed' : 'failed'
  });

  // ── Step 8: Alert User via Telegram ──────────────────────
  if (user?.data?.telegram_user_id && result.success) {
    await sendTradeAlert(user.data.telegram_user_id, {
      symbol: parsed.symbol!,
      side: parsed.side!,
      qty: result.qty,
      entry_price: result.entryPrice,
      take_profit: parsed.take_profits[0],
      stop_loss: parsed.stop_loss,
      status: 'filled',
      exchange: channelDoc.exchange
    });
  }

  console.log(`${result.success ? '✅' : '❌'} Trade ${result.success ? 'executed' : 'failed'}: ${parsed.symbol} ${parsed.side} | ${result.error || `Order ${result.orderId}`}`);
}
```

---

### Task 4.2 — Build the Bot Entry Point

**apps/bot/src/index.ts:**
```typescript
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
    telegramListener.addChannel(
      channel.telegram_channel_id || channel.channel_username,
      (message: string, messageId: string) => {
        handleSignal(message, messageId, channel);
      }
    );
  }

  // Watch for new channels being added in real time
  db.watchCollection("channels", async (event: any) => {
    if (event.type === 'create' && event.data.is_active) {
      console.log(`🆕 New channel added: ${event.data.channel_name}`);
      telegramListener.addChannel(
        event.data.telegram_channel_id || event.data.channel_username,
        (message: string, messageId: string) => {
          handleSignal(message, messageId, event.data);
        }
      );
    }

    if (event.type === 'update' && !event.data.is_active) {
      console.log(`🔇 Channel deactivated: ${event.data.channel_name}`);
      telegramListener.removeChannel(
        event.data.telegram_channel_id || event.data.channel_username
      );
    }
  });

  console.log("✅ Bot is fully running. Waiting for signals...");
}

boot().catch(console.error);
```

---

### Task 4.3 — Build the Telegram Alert Bot

**apps/bot/src/services/alertBot.ts:**
```typescript
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });

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
```

---

### Task 4.4 — Build the Full Dashboard Frontend

**The Live Trade Feed component** — uses Cocobase real-time WebSocket:

**apps/web/components/dashboard/TradeFeed.tsx:**
```typescript
'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/cocobase';
import { useAuth } from '@/hooks/useAuth';  // your custom auth hook

interface TradeLog {
  id: string;
  symbol: string;
  side: string;
  qty: number;
  entry_price: number;
  take_profit: number;
  stop_loss: number;
  status: string;
  executed_at: string;
  pnl: number | null;
}

export default function TradeFeed() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Load existing trades
    db.listDocuments("trade_logs", {
      filters: { user_id: user.id }
    }).then((docs: any[]) => {
      setTrades(docs.sort((a, b) =>
        new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime()
      ));
      setLoading(false);
    });

    // Watch for new trades in real time
    const connection = db.watchCollection(
      "trade_logs",
      (event: any) => {
        if (event.type === 'create' && event.data.user_id === user.id) {
          setTrades(prev => [event.data, ...prev]);
        }
      },
      { filters: { user_id: user.id } }
    );

    return () => connection.close();
  }, [user]);

  if (loading) return <div className="text-zinc-500">Loading trades...</div>;

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <h2 className="text-white font-semibold">Live Trade Feed</h2>
      </div>
      <div className="divide-y divide-zinc-800 max-h-[400px] overflow-y-auto">
        {trades.length === 0 ? (
          <p className="p-4 text-zinc-500 text-sm">No trades yet. Add a channel to start.</p>
        ) : (
          trades.map(trade => (
            <div key={trade.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <span className={`text-lg ${trade.side === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.side === 'Buy' ? '🟢' : '🔴'}
                </span>
                <div>
                  <p className="text-white font-mono font-semibold">{trade.symbol}</p>
                  <p className="text-zinc-500 text-xs">
                    {new Date(trade.executed_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-zinc-300 text-sm">Entry: ${trade.entry_price?.toLocaleString()}</p>
                <p className="text-zinc-500 text-xs">Qty: {trade.qty}</p>
              </div>
              <div className="text-right ml-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  trade.status === 'filled' ? 'bg-green-900/50 text-green-400' :
                  trade.status === 'error' ? 'bg-red-900/50 text-red-400' :
                  'bg-zinc-700 text-zinc-400'
                }`}>
                  {trade.status}
                </span>
                {trade.pnl !== null && (
                  <p className={`text-sm font-semibold mt-1 ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl?.toFixed(2)} USDT
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

**Stats Cards component:**
```typescript
// apps/web/components/dashboard/StatsCards.tsx
export default function StatsCards({ trades }: { trades: any[] }) {
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const filledTrades = trades.filter(t => t.status === 'filled');
  const wins = filledTrades.filter(t => t.pnl && t.pnl > 0);
  const winRate = filledTrades.length ? (wins.length / filledTrades.length * 100).toFixed(0) : 0;
  const todayTrades = trades.filter(t =>
    new Date(t.executed_at).toDateString() === new Date().toDateString()
  );

  const stats = [
    { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'Trades Today', value: todayTrades.length, color: 'text-white' },
    { label: 'Win Rate', value: `${winRate}%`, color: 'text-blue-400' },
    { label: 'Total Trades', value: filledTrades.length, color: 'text-white' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(stat => (
        <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-500 text-sm mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### Task 4.5 — Build the API Routes

**apps/web/app/api/channels/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, channelUsername, exchange, riskPercent, maxTradesPerDay } = body;

  const channel = await db.createDocument("channels", {
    user_id: userId,
    telegram_channel_id: null,  // resolved by the bot when it first sees the channel
    channel_username: channelUsername,
    channel_name: channelUsername,
    is_active: true,
    exchange,
    risk_percent: riskPercent,
    max_trades_per_day: maxTradesPerDay,
    created_at: new Date().toISOString()
  });

  return NextResponse.json(channel);
}

export async function DELETE(req: NextRequest) {
  const { channelId } = await req.json();
  await db.updateDocument("channels", channelId, { is_active: false });
  return NextResponse.json({ success: true });
}
```

**apps/web/app/api/apikeys/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

// NOTE: This route should only be accessible to the authenticated user
// The encryption happens here — API keys must never travel as plaintext

export async function POST(req: NextRequest) {
  const { userId, exchange, apiKey, apiSecret, testnet } = await req.json();

  // Encrypt before storage
  // In Next.js API routes, use the Node crypto module (not the browser crypto)
  const { encrypt } = await import('@/lib/crypto');

  const doc = await db.createDocument("api_keys", {
    user_id: userId,
    exchange,
    api_key: encrypt(apiKey),
    api_secret: encrypt(apiSecret),
    testnet: testnet || false,
    created_at: new Date().toISOString()
  });

  return NextResponse.json({ id: doc.id, exchange, created: true });
}
```

---

### Task 4.6 — Build Stripe Checkout & Webhook

**apps/web/app/api/checkout/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  pro: process.env.STRIPE_PRICE_PRO!,
  signal_caller: process.env.STRIPE_PRICE_CALLER!,
};

export async function POST(req: NextRequest) {
  const { plan, userId, email } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing?cancelled=1`,
    metadata: { userId, plan }
  });

  return NextResponse.json({ url: session.url });
}
```

---

### Task 4.7 — Deploy the Bot Engine

Your bot must run 24/7 as a persistent process. Use Railway.app:

1. Push your `apps/bot` folder to GitHub
2. Go to https://railway.app — create new project from GitHub repo
3. Set all `.env` variables in Railway's environment settings
4. Set start command: `npx ts-node src/index.ts`
5. Railway keeps it running and auto-restarts on crash

**Alternative:** Use PM2 locally or on a VPS:
```bash
npm install -g pm2
pm2 start "npx ts-node src/index.ts" --name "copysignal-bot"
pm2 save
pm2 startup
```

---

## ✅ Phase 4 Exit Criteria

- [ ] Bot index starts, loads all channels from Cocobase, and listens on all of them
- [ ] When a signal is posted to a watched test channel, it flows all the way through to a trade log in Cocobase
- [ ] Dashboard live trade feed shows the new trade appear without page refresh (real-time via WebSocket)
- [ ] Stats cards update correctly
- [ ] Add Channel form creates a new channel doc and bot starts listening to it within 5 seconds
- [ ] API Key form saves encrypted keys to Cocobase
- [ ] Stripe checkout creates subscription and webhook updates user's plan in Cocobase
- [ ] Bot is deployed on Railway and stays running

---

# PHASE 5 — Testing, Hardening & Launch Readiness
**Duration:** Days 31–42 (Weeks 6–7)
**Goal:** Every edge case handled. Security audited. Real money tested with small amounts. Product is ready for public launch.

---

## Phase 5 Tasks

### Task 5.1 — Parser Stress Testing

Collect 50+ real signals from Telegram signal groups. Build a formal test suite.

**apps/bot/src/tests/parser.test.ts:**
```typescript
import { parseSignal } from '../parser/signalParser.js';

interface TestCase {
  raw: string;
  expect: {
    symbol?: string;
    side?: string;
    entryMin?: number;
    entryMax?: number;
    hasSL?: boolean;
    hasTP?: boolean;
    confidence?: string;
  };
}

const TEST_CASES: TestCase[] = [
  // Format 1 — basic
  {
    raw: 'BTC Long $97,200 TP $98,500 SL $96,800',
    expect: { symbol: 'BTCUSDT', side: 'Buy', entryMin: 97000, entryMax: 97500, hasSL: true, hasTP: true, confidence: 'high' }
  },
  // Format 2 — multi TP
  {
    raw: 'ETH SHORT\nEntry: 3,450 - 3,480\nTP1: 3,400\nTP2: 3,350\nSL: 3,520',
    expect: { symbol: 'ETHUSDT', side: 'Sell', hasSL: true, hasTP: true }
  },
  // Format 3 — with emoji noise
  {
    raw: '🚨🔥 SIGNAL 🔥🚨\n$SOLUSDT LONG x20\nEntry: 185\nTP: 195 | 200\nSL: 178',
    expect: { symbol: 'SOLUSDT', side: 'Buy', hasSL: true }
  },
  // Format 4 — should FAIL (too vague)
  {
    raw: 'BTC looking good, might go up soon',
    expect: { confidence: 'failed' }
  },
  // Add 46 more from real groups...
];

let passed = 0;
let failed = 0;

for (const tc of TEST_CASES) {
  const result = parseSignal(tc.raw);
  const checks = [
    !tc.expect.symbol || result.symbol === tc.expect.symbol,
    !tc.expect.side || result.side === tc.expect.side,
    !tc.expect.hasSL || result.stop_loss !== null,
    !tc.expect.hasTP || result.take_profits.length > 0,
    !tc.expect.confidence || result.confidence === tc.expect.confidence,
    !tc.expect.entryMin || (result.entry !== null && result.entry >= tc.expect.entryMin),
    !tc.expect.entryMax || (result.entry !== null && result.entry <= tc.expect.entryMax),
  ];
  const ok = checks.every(Boolean);
  if (ok) passed++;
  else { failed++; console.error(`FAIL: "${tc.raw.substring(0, 50)}"`); }
}

console.log(`\n✅ ${passed} passed | ❌ ${failed} failed | ${(passed/(passed+failed)*100).toFixed(0)}% accuracy`);
process.exit(failed > 0 ? 1 : 0);
```

**Target accuracy: 90%+** before launch.

---

### Task 5.2 — End-to-End Integration Test

Simulate a full flow from signal to trade log:

```typescript
// apps/bot/src/tests/integration.test.ts
import { handleSignal } from '../services/orchestrator.js';
import { db } from '../db/cocobase.js';

async function runIntegrationTest() {
  // Create a fake test channel doc
  const testChannel = await db.createDocument("channels", {
    user_id: 'test_user_id',
    channel_username: '@TestChannel',
    exchange: 'bybit',
    is_active: true,
    risk_percent: 0.5,   // 0.5% risk for testing
    max_trades_per_day: 10,
    created_at: new Date().toISOString()
  });

  const testSignal = 'BTC Long $30,000 TP $31,000 SL $29,500 x10';
  const testMsgId = `test_${Date.now()}`;

  await handleSignal(testSignal, testMsgId, testChannel);

  // Verify signal was saved
  const signals = await db.listDocuments("signals", {
    filters: { telegram_message_id: testMsgId }
  });
  console.assert(signals.length === 1, '❌ Signal was not saved');

  // Verify trade log was created
  const trades = await db.listDocuments("trade_logs", {
    filters: { signal_id: signals[0]?.id }
  });
  console.assert(trades.length === 1, '❌ Trade log was not created');

  // Verify deduplication works
  await handleSignal(testSignal, testMsgId, testChannel); // Same message ID
  const dupeSignals = await db.listDocuments("signals", {
    filters: { telegram_message_id: testMsgId }
  });
  console.assert(dupeSignals.length === 1, '❌ Duplicate was not blocked');

  console.log('✅ Integration test passed');

  // Cleanup
  await db.deleteDocument("channels", testChannel.id);
}

runIntegrationTest().catch(console.error);
```

---

### Task 5.3 — Security Audit Checklist

Go through every one of these manually:

**API Key Security:**
- [ ] Raw API keys NEVER appear in Cocobase documents (check your dashboard)
- [ ] `decrypt()` is ONLY called inside the executor, never in API routes or frontend
- [ ] `ENCRYPTION_KEY` is only in `.env` — never committed to Git
- [ ] `.env` and `.env.local` are in `.gitignore`

**Cocobase Data Security:**
- [ ] Users can only read their own documents (set up collection rules in Cocobase dashboard)
- [ ] `api_keys` collection is server-read-only from the frontend (use API routes, not direct client calls)
- [ ] `trade_logs` are filtered by `user_id` on every query

**Bot Safety:**
- [ ] Max trades per day limit is enforced before executing
- [ ] `isSafeToTrade()` is called on every trade
- [ ] Leverage is capped at 50x
- [ ] If account balance fetch fails, trade is ABORTED (not executed with wrong sizing)

**Frontend:**
- [ ] Auth-protected routes redirect to login if no session
- [ ] Stripe webhook validates the webhook signature before processing
- [ ] No sensitive data in browser console logs

---

### Task 5.4 — Live Money Test (Small Amount)

Before launching publicly, test with YOUR OWN account:

1. Create a fresh Bybit account with $100 USDT
2. Add your own API keys through your dashboard (this tests the full user flow)
3. Add a real Telegram signal channel you're a member of
4. Set risk to 0.5%
5. Wait for a real signal to come in
6. Verify: signal parsed → trade executed → trade appears in dashboard in real time → Telegram alert received

If this works end-to-end, you are ready to accept paying users.

---

### Task 5.5 — Performance & Reliability Checks

**Signal-to-execution latency test:**
Measure the time from message received to order placed. Target is under 3 seconds.

```typescript
// In orchestrator.ts, add timing:
const start = Date.now();
// ... execute trade ...
const latency = Date.now() - start;
console.log(`⚡ Signal-to-execution latency: ${latency}ms`);
```

**Connection resilience test:**
Kill your Telegram listener mid-session. Does it reconnect automatically? Add this to your `telegramListener.ts` if not already there:

```typescript
// In TelegramClient options:
{
  connectionRetries: 10,
  retryDelay: 2000,
  autoReconnect: true,
}
```

**Cocobase real-time reconnection:**
Make sure your dashboard's WebSocket subscription reconnects after a network hiccup. Use the resilient watcher pattern from the PRD.

---

### Task 5.6 — Pre-Launch Landing Page

Your landing page at `/` needs these sections:

1. **Hero** — One punchy headline: "Auto-execute crypto signals on Bybit & Binance. Instantly." + CTA button
2. **How It Works** — 3 steps: Connect channel → Set risk → Trades fire automatically
3. **Why It's Different** — Not vibe coded. Built by a real trader.
4. **Pricing** — Three tiers clearly displayed (Free, Starter $29, Pro $59)
5. **Early Access CTA** — "Join 7-day free trial" button
6. **Proof** — Once you have it: a 15-second screen recording of a live trade executing

---

### Task 5.7 — Monitoring Setup

Set up basic monitoring so you know when things break before users complain:

```typescript
// apps/bot/src/utils/logger.ts
import { db } from '../db/cocobase.js';

export async function logError(context: string, error: any, userId?: string) {
  console.error(`[ERROR] ${context}:`, error.message);

  // Store in Cocobase for review
  await db.createDocument("error_logs", {
    context,
    message: error.message,
    stack: error.stack?.substring(0, 500),
    user_id: userId || null,
    created_at: new Date().toISOString()
  }).catch(() => {}); // Never let logging crash the bot
}
```

Set up a UptimeRobot (free) to ping your web app every 5 minutes and email you if it goes down.

---

## ✅ Phase 5 Exit Criteria (Launch Checklist)

**Parser:**
- [ ] 90%+ accuracy on 50-signal test suite
- [ ] Failed and low-confidence signals never reach the executor

**Execution:**
- [ ] Bybit testnet ✅
- [ ] Binance testnet ✅
- [ ] Bybit live (small amount, your own account) ✅
- [ ] Latency under 3 seconds signal-to-execution

**Security:**
- [ ] All security audit items checked off
- [ ] No raw API keys in database
- [ ] `.env` files not in Git history

**Product:**
- [ ] End-to-end integration test passes
- [ ] Real-time dashboard updates without refresh
- [ ] Stripe subscription creates, updates, and cancels correctly
- [ ] Telegram trade alerts arrive after execution
- [ ] Bot auto-restarts on crash (PM2 or Railway)
- [ ] Landing page live with correct pricing

**When ALL boxes are checked — you are ready to announce.**

---

## 🚀 Launch Day Sequence

1. Post on X: "CopySignal Bot is live. Auto-execute Telegram signals on Bybit/Binance. 7-day free trial. [link]"
2. Post a screen recording demo video on TikTok
3. DM 10 Telegram signal callers with your partnership offer
4. Drop your link in 5 relevant Telegram groups (one post each, no spam)
5. Reply to every single person who engages. Every one.

---

## 📊 Phase Timeline Summary

| Phase | Focus | Duration | End State |
|---|---|---|---|
| **Phase 1** | Setup, auth, shell | Days 1–5 | App runs, auth works, Cocobase connected |
| **Phase 2** | Telegram + Parser | Days 6–12 | Bot reads channels, parser 80%+ accurate |
| **Phase 3** | Trade Execution | Days 13–19 | Testnet trades firing correctly |
| **Phase 4** | Full Integration + Dashboard | Days 20–30 | End-to-end flow working, dashboard live |
| **Phase 5** | Testing + Launch Prep | Days 31–42 | 90%+ accuracy, security cleared, live |

**Total: ~6 weeks to launch-ready product.**

---

*CopySignal Bot Build Roadmap v1.0*
*Build every phase. Check every exit criterion. Ship.*
