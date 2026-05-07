# 📋 CopySignal Bot — Full Improvement Notes
### Everything You Need To Fix, Patch, Add, and Know Before This Ships

---

> These are honest notes. Some of this will sting slightly. That is the point.
> Everything here is based on how the current market works, how real traders behave,
> what competitors do right, and what will make or break this product.

---

## SECTION 1 — ONBOARDING
### The First 5 Minutes Will Make or Break Everything

---

### 1.1 — You Have No Onboarding Flow Right Now

The current plan sends a user to `/register`, they create an account, and they land on a dashboard. That is where you lose most people.

74% of potential customers switch to other solutions if the onboarding process gets complicated. Your onboarding is not complicated — it is just absent. There is nothing guiding the user from "I just made an account" to "my bot is running and my first channel is connected." That gap is where people give up.

**What you need — a 4-step setup wizard:**

After registration, do not dump them on the dashboard. Take them through a guided flow:

```
Step 1 of 4 — Connect Your Exchange
"Connect your Bybit or Binance account using a read-trade API key.
We never touch withdrawals. Here is exactly how to create a safe key."
→ [Bybit Guide] [Binance Guide] [Paste API Key] [Paste Secret]

Step 2 of 4 — Add Your First Signal Channel
"Paste the Telegram channel username or invite link you want to follow."
→ [Channel Username Input]
→ "What trigger keyword does this channel use?" (with tooltip explaining why)

Step 3 of 4 — Set Your Risk Per Trade
"How much of your account do you want to risk on each signal?"
→ Slider: 0.5% — 3%
→ Explanation: "At 1%, a $1,000 account risks $10 per trade. Here is how that works:"
→ [Simple visual example]

Step 4 of 4 — Connect Telegram for Alerts
"Get instant notifications when your bot places a trade."
→ [Open Our Telegram Bot] → Bot sends a code → Paste the code here

Done ✅ — "Your bot is now live. We will alert you the moment your first signal fires."
```

Without this wizard, most users will create an account, look at an empty dashboard, not know what to do, and leave within 10 minutes. You never get them back.

---

### 1.2 — Your Landing Page Is Missing Key Things

The current plan describes a landing page with hero, how it works, pricing, and CTA. What is missing:

**A live demo or screen recording.** Not a screenshot. A 15-30 second video showing a signal coming in and a trade executing on screen, in real time. This is your single most powerful conversion tool. When placing trades, users need immediate feedback on the success or failure of their orders. Delayed or vague responses lead to confusion and lost trust. Show them it works before they even sign up.

**Social proof section.** Even with 5 beta users, get one quote. "Bot caught 3 signals while I was asleep. Woke up to $240 profit." — One real quote from a real user outperforms 10 feature bullet points.

**A risk disclaimer — visible, not buried.** You are a trading tool. Users will lose money sometimes. If you do not address this upfront, the first user who loses on a bad signal will blame your platform publicly. Put a clear line near the pricing: "Auto-execution does not guarantee profits. All trading involves risk. You control your risk percentage per trade." This protects you legally and builds trust simultaneously.

**FAQ section — critical for conversion.** The questions every potential user asks before paying:
- "Are my API keys safe?" (most important question)
- "Can the bot withdraw my funds?" (the fear that blocks signups)
- "What happens if the signal is wrong?"
- "Can I pause the bot instantly?"
- "Which exchanges are supported?"

Answer these on the landing page. A user who has to email you to get answers to these questions will not sign up.

---

### 1.3 — The Empty State Problem

When a new user logs in with no channels, no trades, no anything — they see an empty dashboard. This is the most underrated UX failure in SaaS tools.

**What they should see instead:**

```
┌────────────────────────────────────────────────┐
│                                                │
│    🤖 Your bot is ready. Let's set it up.     │
│                                                │
│    You have 5 days of Pro access free.         │
│    Set up takes about 3 minutes.               │
│                                                │
│         [Start Setup →]                        │
│                                                │
│    Already have everything set up?             │
│    → Add a channel manually                    │
│                                                │
└────────────────────────────────────────────────┘
```

Never show an empty table, an empty chart, or a blank page to a new user. Show them the next step to take.

---

## SECTION 2 — UX AND DASHBOARD DESIGN
### What the Product Looks Like When Someone Is Actually Using It

---

### 2.1 — The Dashboard Must Communicate One Thing Instantly

A trader who opens the dashboard should know within 2 seconds: **"Is my bot running or not?"**

Right now the plan has stats cards and a trade feed. That is fine. But the most important element is missing — a **bot status indicator**, prominent, at the top:

```
┌─────────────────────────────────────────────────────┐
│  🟢 Bot Active — Listening to 3 channels             │
│  Last signal: 14 minutes ago (BTCUSDT Long)          │
│                                         [Pause All]  │
└─────────────────────────────────────────────────────┘
```

vs

```
┌─────────────────────────────────────────────────────┐
│  🔴 Bot Paused — No channels connected               │
│  Add a channel to start receiving signals            │
│                                      [Add Channel]   │
└─────────────────────────────────────────────────────┘
```

This is the first thing every user looks for when they open the app. Build it first.

---

### 2.2 — The Trade Feed Needs More Information

Currently the trade feed shows: symbol, side, entry, qty, status.

What traders actually want to see at a glance:

```
🟢 BTCUSDT  Long  │  Entry: $97,210  │  TP: $98,500  │  SL: $96,800
   Qty: 0.012     │  P&L: +$31.40 🟢 │  Status: Open │  2h 14m ago
   Channel: CryptoAlphaCalls          │  [Manage]  [Close]
```

Key additions:
- **Live P&L on open trades** — this is what traders check constantly. Not just filled/error
- **Which channel the signal came from** — users need to know which caller is performing
- **Time since entry** — tells them how long the trade has been running
- **Quick action buttons** — Manage (moves SL/TP) and Close (emergency exit)
- **Color-coded P&L** — green for profit, red for loss, no color for flat

---

### 2.3 — Channel Performance Page Is Missing

This is a major gap. Users are following multiple signal channels. They need to know which channels are profitable and which are not. Without this data, they have no reason to stay on the platform.

You need a **Channel Performance** page that shows, per channel:

```
Channel: CryptoAlphaCalls @cryptoalpha
──────────────────────────────────────
Signals received:      47
Signals executed:      31
Win Rate:              68%
Average R:R:           1.8
Total P&L from channel: +$1,240.50
Best trade:            SOLUSDT Long +$312
Worst trade:           ETHUSDT Short -$89
Last signal:           2 hours ago
Bot status:            🟢 Active
```

This is the data that makes users stay. If channel A has a 70% win rate and channel B has 30%, they stop following channel B. Your platform gives them that clarity. That is your moat.

---

### 2.4 — Mobile Responsiveness Is Non-Negotiable

Crypto traders check their portfolios on their phones constantly. If your dashboard does not work well on mobile, you will lose half your users regardless of how good the bot is.

Specific mobile requirements:
- The stats cards must stack vertically on screens under 640px
- The trade feed rows must be scrollable horizontally or stack cleanly
- The Add Channel button must be large enough to tap with a thumb
- The bot status indicator must be visible without scrolling on any phone screen
- The subscription warning card (bottom-left) must not cover core content on small screens — move it to a top banner on mobile

Test every page on an iPhone SE (smallest common screen) and a mid-range Android.

---

### 2.5 — Dark Mode Only Is Fine, But Needs Contrast

Dark UI is correct for a trading product — traders stare at screens for hours. But many dark UIs have insufficient contrast between text colors, making them hard to read in different lighting.

Rules to follow:
- Primary text (white): minimum `#FFFFFF` or `#F4F4F5`
- Secondary text (descriptions, labels): `#A1A1AA` minimum — not darker
- Disabled/muted text: `#71717A` — nothing darker than this should carry information
- Green for positive P&L: `#4ADE80` — bright enough to pop on dark background
- Red for negative P&L / danger: `#F87171`
- Orange for warnings (expiry card): `#FB923C`
- Blue for interactive elements: `#3B82F6` — with `#60A5FA` on hover

Never use light gray text on dark gray background. It fails accessibility standards and looks bad.

---

### 2.6 — Loading States and Feedback

Imagine placing a trade, only to be met with a spinning wheel for several seconds and no confirmation of whether your order went through — many users would panic, refresh the page, and possibly place the same order twice.

Every action a user takes must have immediate visual feedback:

- Clicking "Add Channel" → button shows spinner instantly → then success state
- Clicking "Save API Key" → show "Saving..." → then "✅ Keys saved and encrypted" or "❌ Invalid key format"
- Payment waiting screen → animated pulse on the address → live countdown timer → status updates in real time
- When a trade fires → a brief toast notification appears in the corner: "🟢 BTCUSDT Long executed — $97,210"

Never leave a user clicking a button with nothing happening. They will click it again and again.

---

## SECTION 3 — SECURITY GAPS YOU HAVE NOT ADDRESSED
### Things Not Covered in the Previous Security Documents

---

### 3.1 — Two-Factor Authentication (2FA) Is Missing

Right now login is email/password or Google OAuth. That is not enough for a platform that holds encrypted exchange API keys.

A user's account being compromised means an attacker can:
- Add a new channel pointing to a malicious signal source
- Change the risk percentage to 100% and wipe the account on next signal
- View the user's entire trade history
- Trigger trades manually through your API routes

**You need 2FA.** Implement TOTP (Time-based One-Time Password) — the same standard Google Authenticator and Authy use.

```bash
npm install otplib qrcode
```

```typescript
// Generate a TOTP secret for the user on first setup
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export async function setup2FA(userId: string) {
  const secret = authenticator.generateSecret();
  const appName = 'CopySignal Bot';
  const userEmail = 'user@email.com';

  const otpAuthUrl = authenticator.keyuri(userEmail, appName, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

  // Store the secret (encrypted) in Cocobase
  // User scans the QR code with Google Authenticator
  // Then verifies with their first 6-digit code
  // After verification, 2FA is active on their account

  return { secret, qrCodeDataUrl };
}

export function verify2FACode(secret: string, token: string): boolean {
  return authenticator.verify({ token, secret });
}
```

Make 2FA strongly encouraged but not forced. Show a persistent banner: "⚠️ Your account holds exchange API keys. Enable 2FA to protect it." With a one-click enable button. Most serious users will turn it on.

---

### 3.2 — Login Activity Log Is Missing

Users need to be able to see where their account has been accessed from. If someone logs into their account from Nigeria when they live in Germany, they need to know.

Add a `login_events` collection in Cocobase:

```javascript
{
  user_id: string,
  ip_address: string,
  country: string,            // From IP geolocation
  city: string,
  device: string,             // "Chrome on Windows", "Safari on iPhone"
  timestamp: ISO string,
  status: 'success' | 'failed'
}
```

Show the last 10 logins on the Settings page. Send an email alert for any login from a new country.

---

### 3.3 — API Key Validation Before Storage Is Weak

The current plan validates API key format (length, alphanumeric). But you can have a correctly formatted key that belongs to a different exchange or is already revoked.

**Before saving any API key, test it:**

```typescript
// For Bybit — test the key is valid and has trading permissions
export async function validateBybitKey(apiKey: string, apiSecret: string): Promise<{
  valid: boolean;
  hasTrading: boolean;
  hasWithdrawal: boolean;
  balance: number;
  error?: string;
}> {
  try {
    const client = new RestClientV5({ key: apiKey, secret: apiSecret });
    const result = await client.getWalletBalance({ accountType: 'UNIFIED', coin: 'USDT' });

    if (result.retCode !== 0) {
      return { valid: false, hasTrading: false, hasWithdrawal: false, balance: 0, error: result.retMsg };
    }

    const balance = parseFloat(
      result.result.list[0]?.coin?.find((c: any) => c.coin === 'USDT')?.availableToWithdraw || '0'
    );

    // Check API key permissions — Bybit returns permission list
    const apiInfo = await client.getAPIKeyInfo();
    const permissions = apiInfo.result.permissions;
    const hasWithdrawal = permissions?.Wallet?.includes('AccountTransferOut') || false;

    // WARN if withdrawal permission is enabled
    return {
      valid: true,
      hasTrading: true,
      hasWithdrawal,
      balance
    };
  } catch (err: any) {
    return { valid: false, hasTrading: false, hasWithdrawal: false, balance: 0, error: err.message };
  }
}
```

Show the user after validation:
- ✅ Key is valid
- ✅ Trading permissions confirmed
- ✅ Account balance: $1,240 USDT
- ⚠️ Warning: Withdrawal permission is enabled. We strongly recommend creating a new key with trading-only permissions. [Guide]

If withdrawal is enabled, do not block them — but warn loudly. A user who ignores this and gets hacked will blame you.

---

### 3.4 — No Session Timeout

Right now a user who logs in on a public computer or shared device stays logged in indefinitely. If they forget to log out, anyone who opens that browser has full access to their trading bot.

Add session timeout:

```typescript
// In NextAuth configuration
export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days for normal sessions
  },
  // ...
};
```

And a "Remember me" toggle on login:
- Checked (default): session lasts 7 days
- Unchecked: session expires when browser closes

Also add a "Sign out all devices" button on the Settings page that invalidates all existing sessions. This is critical for users who suspect their account was accessed.

---

### 3.5 — Bot Emergency Stop Is Buried

If a user notices something wrong — signals are firing incorrectly, a bad channel, they just want everything to stop — they need to be able to kill all active bot processes **in one click, from any page.**

Right now the "pause" button is mentioned but not designed. Here is what it should be:

- In the sidebar, next to the bot status: a red **[⏸ Pause All]** button, always visible
- Clicking it shows a confirmation: "Pause all bots? Your open trades will remain open but no new signals will be executed."
- Confirmation → immediately sets all user channels to `is_active: false` in Cocobase
- The bot's real-time watcher picks this up and stops listening within seconds
- The status indicator changes to: 🔴 Bot Paused — [Resume]

This is not optional. It is a safety feature. Any trading tool without an emergency stop is a liability.

---

## SECTION 4 — BACKEND PROBLEMS
### Things That Will Break in Production That Are Not Obvious Now

---

### 4.1 — No Retry Logic on Trade Execution

Currently if the Bybit or Binance API returns a temporary error (rate limit, network timeout, server hiccup), the trade fails silently and is logged as an error. The signal is gone. The trade is missed.

You need retry logic with exponential backoff:

```typescript
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;

      // Do not retry on these errors — they will not resolve with a retry
      const permanentErrors = ['insufficient balance', 'invalid symbol', 'invalid api key'];
      if (permanentErrors.some(e => err.message?.toLowerCase().includes(e))) {
        throw err;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.log(`Retry ${attempt + 1}/${maxRetries} in ${delay}ms — ${err.message}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw lastError;
}

// Usage in executor:
const result = await executeWithRetry(() =>
  bybitClient.submitOrder({ ... })
);
```

---

### 4.2 — No Handling for Exchange Maintenance Windows

Both Bybit and Binance do scheduled maintenance where their APIs return errors for 15-60 minutes. During this time, every signal will fail to execute and be logged as an error. Users will see errors in their feed and panic.

**Detection and handling:**

```typescript
// Detect maintenance mode from API response
const MAINTENANCE_ERROR_CODES = [10004, 10005]; // Bybit maintenance codes
const MAINTENANCE_MESSAGES = ['system maintenance', 'server busy'];

function isMaintenanceError(err: any): boolean {
  return (
    MAINTENANCE_ERROR_CODES.includes(err.retCode) ||
    MAINTENANCE_MESSAGES.some(m => err.message?.toLowerCase().includes(m))
  );
}

// If maintenance detected:
// 1. Set a maintenance flag in Cocobase for this exchange
// 2. Stop retrying for 15 minutes
// 3. Alert the user: "Bybit is under maintenance. Signals will resume automatically."
// 4. Queue missed signals for manual review
```

---

### 4.3 — Signal Deduplication Is Not Bulletproof

The current approach deduplicates by `telegram_message_id`. The problem: Telegram sometimes delivers the same message twice with the same ID under high server load. Your dedup check queries Cocobase, which has ~50-200ms latency. If two webhook calls arrive simultaneously (within 50ms of each other), both will query Cocobase before either has written the record, and both will pass the dedup check. You get a duplicate trade.

**Fix — use a fast in-memory lock:**

```typescript
// In-memory set of message IDs currently being processed
// This is faster than a DB query and prevents race conditions
const processingLock = new Set<string>();

export async function handleSignal(rawMessage: string, messageId: string, channelDoc: any) {
  const lockKey = `${channelDoc.id}:${messageId}`;

  // Check in-memory lock first (fast — no DB call)
  if (processingLock.has(lockKey)) {
    console.log(`Lock hit — duplicate processing blocked: ${messageId}`);
    return;
  }

  // Acquire lock
  processingLock.add(lockKey);

  try {
    // Then check DB for permanent deduplication
    const existing = await db.listDocuments("signals", {
      filters: { telegram_message_id: messageId, channel_id: channelDoc.id }
    });
    if (existing.length > 0) return;

    // ... process signal ...

  } finally {
    // Always release lock after processing
    // Remove after 60 seconds to prevent memory leaks
    setTimeout(() => processingLock.delete(lockKey), 60_000);
  }
}
```

---

### 4.4 — No Logging Dashboard for You (The Operator)

The current plan gives users a trade feed to see their own trades. But as the operator, you need to see what is happening across the entire system:

- How many signals were processed in the last hour?
- Which users are hitting errors repeatedly?
- Is the Telegram listener connected or did it drop?
- Are any payment sessions stuck in pending for over 3 hours?

Build a simple `/admin` page that is only accessible with a secret admin token. Not a full admin panel — just a health dashboard:

```
System Status
────────────────────────────────
Telegram Client:     🟢 Connected (uptime: 14h 22m)
Helius Webhook:      🟢 Active
SUI Watcher:         🟢 Running (last check: 8s ago)
Cocobase:            🟢 Connected

Last 24 Hours
────────────────────────────────
Signals received:    142
Signals executed:    89
Signals skipped:     41 (low confidence)
Execution errors:    12
Payments confirmed:  3

Users
────────────────────────────────
Total registered:    47
On trial:            18
Paid (starter):      21
Paid (pro):          8
Expired today:       2

Pending sessions (over 1hr):  1 — [View]
Unmatched payments:           0
```

This takes a few hours to build and saves you enormous time debugging production issues.

---

## SECTION 5 — CRYPTO PAYMENTS — REMAINING GAPS

---

### 5.1 — What Happens to USDC That Cannot Be Swept

When a user's derived Solana address receives USDC, the sweep function moves it to your master wallet. But Solana requires a small amount of SOL (about 0.000005 SOL) to pay the transaction fee for the sweep. If the derived wallet has zero SOL, the sweep fails and the USDC sits there.

**Fix — fund derived wallets with a small SOL amount before showing them to users:**

```typescript
// When creating a payment session, send a tiny amount of SOL to cover fees
import { SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function fundDerivedWalletForFees(
  derivedPublicKey: PublicKey,
  masterKeypair: Keypair,
  connection: Connection
) {
  const balance = await connection.getBalance(derivedPublicKey);
  if (balance > 5000) return; // Already has enough SOL for fees

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: masterKeypair.publicKey,
      toPubkey: derivedPublicKey,
      lamports: 10_000, // 0.00001 SOL — enough for fees, costs you essentially nothing
    })
  );

  await sendAndConfirmTransaction(connection, transaction, [masterKeypair]);
}
```

Cost to you: ~$0.0007 per payment session created. Negligible.

---

### 5.2 — Renewal UX Is Unclear

The current plan shows a payment address when the user visits the billing page. But what happens when they want to renew at the end of 30 days?

Do they go back to billing and get a new address? Is it the same address? What if they send to the old address after it expired?

**Make renewal explicit:**

```
Your Pro Plan expires in 3 days.

To renew for another 30 days, send $79 USDC to:
[New unique address — generates fresh session on click]

This address is valid for 2 hours.
Need more time? [Generate new address]

Previous renewal addresses no longer accept payments.
```

The key rule: generate a fresh payment session every time they want to renew. Do not reuse old addresses. This prevents confusion and makes the accounting clean in your database.

---

### 5.3 — No Receipt or Payment History Page

After a user pays, they should be able to see a record of every payment they have ever made. Right now there is no such page.

Add a payment history section on the billing page:

```
Payment History
─────────────────────────────────────────────────
Date             Plan      Amount    Chain     Status
─────────────────────────────────────────────────
Apr 28, 2025    Pro        $79.00   Solana   ✅ Confirmed
Mar 29, 2025    Pro        $79.00   Solana   ✅ Confirmed
Mar 1, 2025     Starter    $29.00   SUI      ✅ Confirmed
─────────────────────────────────────────────────
[View transaction] links to the blockchain explorer for each payment
```

This builds trust and gives users proof of their payments. It also lets you resolve disputes easily — "here is your payment record."

---

## SECTION 6 — THINGS THE CURRENT MARKET DEMANDS
### What Your Competitors Do That You Do Not Have

---

### 6.1 — Mobile App or PWA

eToro's mobile app offers the same functionality as the desktop version, allowing users to manage allocations, track performance, and receive timely portfolio alerts.

Your web app on mobile is usable but not great. Traders check their P&L on their phones 20 times a day. The minimum viable solution without building a native app is a **Progressive Web App (PWA)** — this makes your Next.js site installable on any phone's home screen and works offline for cached pages.

```javascript
// apps/web/next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  // ... rest of config
});
```

```bash
npm install next-pwa
```

Add a `manifest.json` in `/public`:
```json
{
  "name": "CopySignal Bot",
  "short_name": "CopySignal",
  "description": "Auto-execute crypto signals on Bybit & Binance",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#09090b",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

With this, users on iOS and Android can tap "Add to Home Screen" and it behaves like a native app.

---

### 6.2 — Signal Caller Leaderboard or Discovery

Right now users have to know which Telegram channel to follow before using your app. They bring their own channel. This is fine for the first version.

But the bigger opportunity is building a **channel directory** — a list of Telegram signal channels ranked by win rate, based on the trades your platform has executed from them.

```
Signal Channel Rankings (Based on CopySignal Bot Users)
────────────────────────────────────────────────────────
#1  CryptoAlphaCalls     68% win rate   +$12,400 avg P&L   📊 1,240 signals
#2  SolanaDegenCalls     62% win rate   +$8,200 avg P&L    📊 890 signals
#3  BTCFuturesKing       55% win rate   +$4,100 avg P&L    📊 2,100 signals
```

This is built entirely from data you already have — the trade logs from all your users. This becomes a network effect. The more users you have, the better the rankings. The better the rankings, the more users you attract. Social copy trading platforms that function like social networks — offering leaderboards, chat rooms, and one-click copying — prioritize user experience in ways that make them sticky.

Start collecting this data from day one even if you do not display it yet. The collection costs you nothing.

---

### 6.3 — Risk Score Per Channel

Before a user connects a channel, show them a risk score if you have data on it. Even a basic one:

```
Channel: CryptoAlphaCalls
────────────────────────
Win Rate:     68%
Avg R:R:      1.6
Max Drawdown: 12%
Risk Score:   🟢 Low Risk (based on 1,240 signals)
Avg Leverage: 8x
```

Users want this information. They are trusting this channel with their money. Give them the data to make an informed decision.

---

### 6.4 — Stop Loss Is Required — Not Optional

Right now the parser treats stop loss as a "strongly recommended" field but still executes trades with medium confidence even when SL is missing.

**Change this.** Make SL mandatory for trade execution. A signal without a stop loss is not a complete signal. Trading with no stop loss on perpetual futures is how accounts get wiped.

Update the confidence engine: if `stop_loss === null`, do not execute regardless of confidence score. Alert the user: "Signal received but no stop loss found. Trade skipped to protect your account."

This is a product safety decision that will save users from disaster and build trust in your platform.

---

## SECTION 7 — WHAT TO BUILD FIRST VS LATER
### Honest Prioritization

---

### Must Have Before First Paying User

These are blockers. Do not charge money without them:

1. The 4-step setup wizard — users cannot use the product without guidance
2. API key validation that tests the key before saving
3. Emergency pause button — visible from every page
4. Bot status indicator at the top of dashboard
5. Subscription warning card at 3 days (already planned — just confirming priority)
6. Legal: Terms of Service and Risk Disclaimer on the landing page and during signup
7. 2FA — at minimum the option to enable it
8. Channel performance page — per-channel win rate, P&L
9. Login activity log — show users their login history
10. PWA manifest — make it installable on mobile
11. Admin health dashboard — for you to monitor system health
12. Payment history page on billing
13. Retry logic on trade execution
14. In-app toast notifications for trade events
15. Signal channel leaderboard / discovery
16. Risk score per channel
17. Multi-TP partial close (close 50% at TP1, rest at TP2)
18. Profit sharing — let signal callers embed your referral in their channel

### Good to Have Later (Month 2-3)

5. Trade journal export (CSV/PDF) — traders need this for tax purposes
6. Performance analytics — Sharpe ratio, max drawdown, monthly P&L chart

---

## SECTION 8 — THINGS THAT WILL LOSE YOU USERS
### Common Mistakes at This Stage

---

**Mistake 1 — No support channel.** When something breaks (and it will), where do users go? You need a Telegram group for your users from day one. Not email support — that is too slow for trading issues. A Telegram group where you personally answer within the hour. This is your retention tool.

**Mistake 2 — Not posting daily on X/TikTok during build.** You planned this. Do it. Every day you skip is an audience you are not building. The people who follow you during the build are your first 50 customers.

**Mistake 3 — Launching publicly before testing privately.** Before any public announcement, get 5 people to use the product with real money for 7 days. Watch what confuses them. Watch what breaks. Fix it. Then announce.

**Mistake 4 — Building features instead of fixing retention.** If users sign up and leave within 3 days, adding a new feature does not fix that. Talk to every user who signs up. Ask them what is confusing. Fix the confusion first.

**Mistake 5 — Ignoring Telegram as a product feature.** Your target users live on Telegram. Your bot alerts go to Telegram. Your support is on Telegram. Consider building a full Telegram bot interface where users can pause/resume the bot, check their P&L, and get signal alerts — all without opening the web app. This is a major UX improvement for mobile users.

**Mistake 6 — Not having a clear story for what you are.** "A bot that copies Telegram signals to Bybit/Binance" is accurate but not exciting. Your story should be: "I'm a trader and developer who built the tool I wish existed. It catches signals I would have missed while sleeping and executes them in 2 seconds. I'm making it available to other traders." That story sells. A feature list does not.

**Mistake 7 — Pricing yourself into the tool tier instead of the results tier.** Your pricing should not be positioned as "software" — it should be positioned as "this bot can make you $200-$500 a month in caught signals if you follow a decent caller." At that framing, $79/month is obviously worth it. Position on results, not features.

---

## SECTION 9 — LEGAL NOTES
### Things That Can Shut You Down If Ignored

---

**You are not a licensed financial advisor.** Never say "our signals make money" or "guaranteed returns." Every piece of copy that implies trading outcomes should include a risk disclaimer. Standard language: "Trading cryptocurrencies involves substantial risk of loss and is not suitable for every investor."

**Your Terms of Service must include:**
- You are not responsible for trading losses caused by executed signals
- Users accept that automated trading carries inherent risks
- Users confirm they created their API keys with trading-only permissions
- You reserve the right to terminate accounts that abuse the platform
- Dispute resolution clause

**Your Privacy Policy must include:**
- What data you collect (email, trade logs, encrypted API keys)
- How you store it (Cocobase, encrypted at rest)
- That you never sell data
- How users can delete their account and all associated data

Use a free Terms of Service generator (termly.io or freeprivacypolicy.com) and customize it. Do not operate without these. Do not charge money without these.

**Do not operate in the US without legal advice.** The US has strict regulations around financial automation tools. For now, geo-restrict US users with a simple IP check if you are not prepared to deal with SEC/CFTC scrutiny. Add this to your landing page: "Currently available outside the United States."

---

## SECTION 10 — THE SINGLE MOST IMPORTANT THING

You have an excellent technical plan. The architecture is solid. The patches address real problems. The security is thorough.

**The one thing that will actually determine whether this makes $3,000 in 3 months is distribution, not the product.**

The product is good enough to sell today. What you need now is 10 paying users, not 10 more features. Those 10 users will tell you exactly what to build next. They will also tell their Telegram groups about you if the product works.

Every hour you spend building before you have those 10 users is an hour that could have been spent finding them.

Build the minimum. Ship it. Find 10 users. Then build what they ask for.

---

*CopySignal Bot — Full Improvement Notes*
*Written based on current market standards, 2025–2026*
