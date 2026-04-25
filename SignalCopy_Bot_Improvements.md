# ⚙️ SignalCopy Bot — Improvements Document
### Crypto Payments · Fly.io Deployment · Security Hardening

---

## 📌 Table of Contents

1. [Why No Stripe — Full Reasoning](#1-why-no-stripe--full-reasoning)
2. [Payment System Architecture Overview](#2-payment-system-architecture-overview)
3. [Accepted Chains — Solana & SUI Only](#3-accepted-chains--solana--sui-only)
4. [Subscription Plans & Pricing](#4-subscription-plans--pricing)
5. [Free Trial System (5 Days, Email + Gmail)](#5-free-trial-system-5-days-email--gmail)
6. [How Payment Detection Works — Confirmed Only](#6-how-payment-detection-works--confirmed-only)
7. [Solana Payment Integration — Helius Webhooks](#7-solana-payment-integration--helius-webhooks)
8. [SUI Payment Integration — SUI Payment Kit](#8-sui-payment-integration--sui-payment-kit)
9. [Subscription Logic — 30 Days, Reminders, Auto-Lock](#9-subscription-logic--30-days-reminders-auto-lock)
10. [In-App Reminder Card (Bottom-Left UI)](#10-in-app-reminder-card-bottom-left-ui)
11. [Telegram Expiry Alert System](#11-telegram-expiry-alert-system)
12. [Cocobase Schema for Payments](#12-cocobase-schema-for-payments)
13. [Deploying on Fly.io Instead of Railway](#13-deploying-on-flyio-instead-of-railway)
14. [Security Risks & Full Mitigations](#14-security-risks--full-mitigations)

---

## 1. Why No Stripe — Full Reasoning

Stripe is not used for this product for these concrete reasons:

**Geo-restriction problems.** Stripe is unavailable or heavily restricted in most of Africa, parts of Asia, and many countries where your users live. They would be blocked from subscribing at the checkout step with no recourse.

**Tax complexity.** Stripe now auto-collects sales tax and VAT in many regions. This means you need to register as a tax entity in jurisdictions you never intended to operate in, and you will be hit with compliance requirements you cannot handle as a solo developer at launch.

**Chargeback risk.** Stripe's chargeback system heavily favors buyers. A user can dispute a charge, Stripe will side with them in most cases, and you lose both the subscription revenue and pay a $15 chargeback fee. Crypto payments are irreversible by design.

**Currency mismatch.** Your customers are crypto traders. They hold USDC and SOL natively. Asking them to pull out a credit card to pay for a crypto trading tool creates unnecessary friction and kills conversion.

**Your audience already has a crypto wallet.** A degen paying $29–$79/month for a signal bot already has a Phantom or Sui Wallet installed. Paying in crypto is faster and more natural for them than a credit card form.

**Crypto payments are the right product-market fit signal.** If someone is willing to send you crypto, they are a serious user. Credit card trial-abusers are filtered out naturally.

---

## 2. Payment System Architecture Overview

```
USER FLOW:

[User clicks Subscribe on Billing Page]
         ↓
[App generates unique Reference Code for user]
e.g.  SOL-REF-A3F9B2  or  SUI-REF-C7D4E1
         ↓
[App displays:]
  - Your Solana wallet address (USDC on SOL)
  - Your SUI wallet address (USDC on SUI)
  - Exact amount to send ($29 or $79)
  - Their personal reference code
  - "Include reference code in memo/note field"
         ↓
[User sends payment from their wallet]
         ↓
[Payment lands on-chain — FULLY CONFIRMED]
         ↓
[Helius (Solana) or SUI RPC listener detects it]
         ↓
[Backend reads memo field, extracts reference code]
         ↓
[Reference code matched to user in Cocobase]
         ↓
[Plan activated for 30 days in Cocobase]
         ↓
[Telegram alert sent: "✅ Payment confirmed. Pro plan active until [date]"]
[Dashboard updates: plan badge changes from Free → Pro]
```

This entire flow requires **zero third-party payment processor**. No Stripe, no LemonSqueezy, no fees except on-chain transaction costs (which the user pays, not you).

---

## 3. Accepted Chains — Solana & SUI Only

### Why These Two

| Chain | Avg Fee | Finality | USDC Support | Wallet Availability |
|---|---|---|---|---|
| **Solana** | ~$0.00025 | 1–2 seconds | Native (Circle) | Phantom, Backpack, Solflare |
| **SUI** | ~$0.001 | ~2–3 seconds | Native (Circle) | Sui Wallet, Suiet, Nightly |
| ~~BTC~~ | $1–5+ | 10–60 min | Via wrapping only | Complex |
| ~~Ethereum~~ | $5–50+ | 12+ sec | Native but expensive | Overcomplicated |

**BTC is excluded** — the fee and wait time create a genuinely bad user experience for a $29/month subscription product. A user would pay $3 in fees to send you $29. That's a 10% premium they didn't ask for. Solana and SUI have negligible fees.

### What Token Is Accepted

Accept **USDC on both chains.** Not native SOL or SUI.

Reason: USDC is a stablecoin pegged 1:1 to USD. If you accept native SOL and the price drops 15% overnight, a subscriber who paid for a $79 Pro plan might have actually sent you $67. With USDC, the amount is always exact and predictable.

USDC contract addresses:
- **Solana:** `DSgSbuu4J4tDFjo7qb98TjtNeDwMHH68CwiKZi66P3Y3`
- **SUI (Mainnet):** `0x7f821d44c87a6c44689298672fea7e54800a8a4f9cba2edd6776d8233c7b819f::usdc::USDC`

---

## 4. Subscription Plans & Pricing

### Plan Structure

| Plan | Price | Channels | Exchanges | Trades/Day | Features |
|---|---|---|---|---|---|
| **Free** | $0 | 0 | — | 0 | View signals only, no auto-execute |
| **Starter** | $29/mo | 1 channel | 1 exchange (Bybit OR Binance) | 5 trades/day | Telegram alerts, basic dashboard |
| **Pro** | $79/mo | Unlimited | Both (Bybit + Binance) | Unlimited | Full dashboard, P&L analytics, priority support |

### Why This Pricing Works

**$29 Starter** — low enough that a new user who has never heard of you will take the risk. If their first 30 days are profitable, upgrading to Pro costs less than one good trade.

**$79 Pro** — the sweet spot for serious traders. High enough to be taken seriously, low enough that it's not a budget conversation. If the bot catches even 3 extra trades a month they would have missed manually, it pays for itself.

**Never discount below these prices.** Discounting signals to the market that your product isn't worth full price. Run a "launch week" deal once at launch ($49 Pro for first 30 days), then hold the price permanently.

**To make sure we are clear my USDC address**

**Solana Network** ` DSgSbuu4J4tDFjo7qb98TjtNeDwMHH68CwiKZi66P3Y3 `
**SUI Network**  ` 0x7f821d44c87a6c44689298672fea7e54800a8a4f9cba2edd6776d8233c7b819f `

**IMPORTANT NOTE** Remember to indicate in the dashboard that SUI is recommended. 

---

## 5. Free Trial System (5 Days, Email + Gmail)

### What the Trial Gives

Every new account gets exactly **5 days of Pro access** from the moment they register. No credit card. No payment. No crypto needed. Full access to everything in the Pro plan.

After 5 days, the account automatically downgrades to Free (signal viewing only, no auto-execution) unless a payment is received.

### One Trial Per Account — No Abuse

The trial is tied to the account at registration time. No account ever gets a second trial. This is enforced at the database level, not just the UI level.

```typescript
// apps/web/lib/auth.ts

export async function registerUser(email: string, password: string, username: string) {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 5); // 5 days from now

  const user = await db.auth.register({
    email,
    password,
    data: {
      username,
      plan: 'trial',               // Starts on trial
      trial_used: true,            // PERMANENT — never reset this
      trial_ends_at: trialEndsAt.toISOString(),
      plan_expires_at: trialEndsAt.toISOString(),
      telegram_user_id: null,
      created_at: new Date().toISOString()
    }
  });

  return user;
}
```

> **Critical rule:** `trial_used: true` is set **at registration** and is **never overwritten**. Even if someone deletes and recreates an account with the same email, the database record shows trial already consumed.

### Gmail (Google OAuth) Registration

To allow Google login alongside email/password, use Cocobase's OAuth support. If Cocobase supports OAuth providers natively, enable Google OAuth from your Cocobase project settings. The user's Google account email becomes their user identifier.

If Cocobase does not support OAuth directly, implement it client-side with NextAuth.js:

```bash
npm install next-auth
```

**apps/web/app/api/auth/[...nextauth]/route.ts:**
```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Check if user already exists in Cocobase
      const existing = await findUserByEmail(user.email!);

      if (!existing) {
        // New Google user — create account with trial
        await registerUser(user.email!, generateRandomPassword(), user.name || 'User');
      }

      return true;
    },
    async session({ session, token }) {
      // Attach Cocobase user ID to session
      session.user.cocobaseId = token.sub;
      return session;
    }
  }
});

export { handler as GET, handler as POST };
```

**Login page — show both options:**
```tsx
// apps/web/app/(auth)/login/page.tsx
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-white text-2xl font-bold mb-2">Sign In</h1>
        <p className="text-zinc-500 text-sm mb-6">
          New accounts get 5 days free Pro access.
        </p>

        {/* Google OAuth */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 rounded-lg mb-4 hover:bg-zinc-100 transition"
        >
          <img src="/google-icon.svg" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-600 text-xs">OR</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Email/Password */}
        <input placeholder="Email" type="email"
          className="w-full bg-zinc-800 text-white rounded-lg p-3 mb-3 outline-none" />
        <input placeholder="Password" type="password"
          className="w-full bg-zinc-800 text-white rounded-lg p-3 mb-4 outline-none" />

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
          Sign In with Email
        </button>

        <p className="text-zinc-500 text-sm text-center mt-4">
          No account? <a href="/register" className="text-blue-400">Create one — 5 days free</a>
        </p>
      </div>
    </div>
  );
}
```

---

## 6. How Payment Detection Works — Confirmed Only

### The Critical Rule: Never Act on Pending Transactions

A "pending" transaction is one that has been broadcast to the network but not yet finalized. It can be cancelled, reversed, or dropped. **Never activate a subscription based on a pending transaction.**

You must only activate subscriptions when a transaction reaches **"confirmed" or "finalized" status** on the respective chain.

### Confirmation Levels Explained

**Solana:**
- `processed` — transaction received by a validator. NOT safe. Can be dropped.
- `confirmed` — transaction confirmed by 2/3+ of validators. **Safe to use.**
- `finalized` — transaction is permanent, cannot be reversed. Maximum safety.

For payments, use `confirmed` commitment level. It balances speed (sub-2 seconds) with safety. `finalized` adds ~30 more seconds of delay with no practical benefit for your use case.

**SUI:**
- SUI uses a Byzantine Fault Tolerant consensus. A transaction with `status: success` in the response from the SUI RPC is final. There is no "pending" state that resolves to success — SUI either succeeds or fails atomically.
- When you query `suix_queryTransactionBlocks` and a transaction has `status: success`, it is confirmed and irreversible.

### Tools Used for Detection

| Chain | Detection Method | Service |
|---|---|---|
| Solana | Webhook pushed to your server | **Helius** (helius.dev) |
| SUI | RPC polling + event subscription | **SUI Full Node RPC** or **BlockVision API** |

---

## 7. Solana Payment Integration — Helius Webhooks

### Step 1: Create a Helius Account

1. Go to **https://dashboard.helius.dev**
2. Create a free account — the free tier supports up to 100k requests/month which is enough for hundreds of users
3. Generate an API key
4. Go to **Webhooks** in the dashboard
5. Create a new webhook:
   - **Webhook URL:** `https://your-bot-domain.fly.dev/webhook/solana`
   - **Addresses:** Add your Solana USDC receiving wallet address
   - **Transaction Types:** Select `TRANSFER`
   - **Commitment:** `confirmed`

Helius will now POST to your server every time a confirmed transaction involving your wallet occurs.

### Step 2: Install Dependencies

```bash
# In apps/bot:
npm install @solana/web3.js
npm install helius-sdk
```

### Step 3: Build the Solana Payment Webhook Handler

```typescript
// apps/bot/src/payments/solanaWebhook.ts
import express, { Request, Response } from 'express';
import { db } from '../db/cocobase.js';
import { activateSubscription } from './subscriptionManager.js';

const router = express.Router();

// Your Solana wallet address (where USDC is received)
const YOUR_SOLANA_WALLET = process.env.SOLANA_WALLET_ADDRESS!;

// USDC mint address on Solana mainnet
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Helius sends an array of enhanced transaction objects
router.post('/webhook/solana', async (req: Request, res: Response) => {
  // Always respond 200 first — Helius will retry if you don't
  res.status(200).json({ received: true });

  const transactions: any[] = req.body;
  if (!Array.isArray(transactions)) return;

  for (const tx of transactions) {
    try {
      await processSolanaTransaction(tx);
    } catch (err) {
      console.error('Error processing Solana tx:', err);
    }
  }
});

async function processSolanaTransaction(tx: any) {
  const signature = tx.signature;
  const commitment = tx.meta?.commitment || 'confirmed';

  // ── Guard 1: Only process confirmed/finalized ──
  if (!['confirmed', 'finalized'].includes(commitment)) {
    console.log(`⏳ Skipping unconfirmed tx: ${signature}`);
    return;
  }

  // ── Guard 2: Check transaction did not fail ──
  if (tx.meta?.err !== null && tx.meta?.err !== undefined) {
    console.log(`❌ Failed tx ignored: ${signature}`);
    return;
  }

  // ── Guard 3: Deduplication — never process same tx twice ──
  const existing = await db.listDocuments("payments", {
    filters: { tx_signature: signature }
  });
  if (existing.length > 0) {
    console.log(`🔁 Duplicate tx ignored: ${signature}`);
    return;
  }

  // ── Find USDC transfer to our wallet ──
  const tokenTransfers: any[] = tx.tokenTransfers || [];
  const usdcTransfer = tokenTransfers.find((t: any) =>
    t.mint === USDC_MINT &&
    t.toUserAccount?.toLowerCase() === YOUR_SOLANA_WALLET.toLowerCase()
  );

  if (!usdcTransfer) return; // Not a payment to us

  const amountUSDC = usdcTransfer.tokenAmount; // Already in human-readable units

  // ── Extract reference code from memo ──
  const memo: string = tx.memo || '';
  const refMatch = memo.toUpperCase().match(/SOL-REF-([A-Z0-9]+)/);
  if (!refMatch) {
    console.log(`⚠️ Payment received with no/invalid reference code: ${signature}. Amount: $${amountUSDC}`);
    // Log it for manual review — you still received the money
    await db.createDocument("unmatched_payments", {
      chain: 'solana',
      tx_signature: signature,
      amount_usdc: amountUSDC,
      memo,
      received_at: new Date().toISOString()
    });
    return;
  }

  const refCode = refMatch[0]; // e.g. "SOL-REF-A3F9B2"

  // ── Find user by reference code ──
  const users = await db.listDocuments("payment_refs", {
    filters: { ref_code: refCode }
  });
  if (!users.length) {
    console.log(`⚠️ Unknown ref code: ${refCode}`);
    return;
  }

  const userId = users[0].user_id;

  // ── Determine plan from amount ──
  let plan: string | null = null;
  if (amountUSDC >= 29 && amountUSDC < 79) plan = 'starter';
  if (amountUSDC >= 79) plan = 'pro';

  if (!plan) {
    console.log(`⚠️ Unrecognized amount: $${amountUSDC} from ref ${refCode}`);
    return;
  }

  // ── Activate subscription ──
  await activateSubscription({
    userId,
    plan,
    amountUSDC,
    txSignature: signature,
    chain: 'solana'
  });

  console.log(`✅ Solana payment confirmed — ${plan} activated for user ${userId}`);
}

export default router;
```

### Step 4: Helius SDK Alternative (Programmatic Webhook Creation)

Instead of creating the webhook manually in the Helius dashboard, you can create it programmatically at bot startup:

```typescript
// apps/bot/src/payments/setupHeliusWebhook.ts
import { Helius } from 'helius-sdk';

export async function ensureHeliusWebhook() {
  const helius = new Helius(process.env.HELIUS_API_KEY!);

  const existingWebhooks = await helius.getAllWebhooks();
  const alreadyExists = existingWebhooks.some(
    (w: any) => w.webhookURL === process.env.HELIUS_WEBHOOK_URL
  );

  if (alreadyExists) {
    console.log('✅ Helius webhook already registered');
    return;
  }

  await helius.createWebhook({
    accountAddresses: [process.env.SOLANA_WALLET_ADDRESS!],
    webhookURL: process.env.HELIUS_WEBHOOK_URL!, // e.g. https://yourbot.fly.dev/webhook/solana
    transactionTypes: ['TRANSFER'],
    webhookType: 'enhanced',
  });

  console.log('✅ Helius webhook created');
}
```

Call `ensureHeliusWebhook()` in your bot's `index.ts` boot sequence.

---

## 8. SUI Payment Integration — SUI Payment Kit

### Why SUI Payment Kit

SUI has an official, open-source payment processing toolkit called the **SUI Payment Kit** (`github.com/MystenLabs/sui-payment-kit`). It is a Move smart contract framework with:

- **Built-in duplicate prevention** using composite payment keys (nonce + amount + coin type + receiver address)
- **Payment receipts** emitted as on-chain events — your backend listens to these events
- **Event-driven architecture** — every confirmed payment emits an event you can subscribe to
- **Multi-coin support** — works with USDC on SUI natively

This means SUI payments are verifiable on-chain with built-in anti-double-payment logic, which is far more secure than manually deduplicating by transaction hash.

### Step 1: Install SUI TypeScript SDK

```bash
npm install @mysten/sui
```

### Step 2: Listen for SUI Payment Events (Polling Method)

Since SUI RPC supports event queries by sender/recipient, you poll for new transactions to your wallet address on a short interval. Confirmed transactions on SUI are **atomic and final** — there is no mempool uncertainty.

```typescript
// apps/bot/src/payments/suiWatcher.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { db } from '../db/cocobase.js';
import { activateSubscription } from './subscriptionManager.js';

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

// SUI USDC coin type (Circle's native USDC on SUI mainnet)
const SUI_USDC_TYPE = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';

const YOUR_SUI_WALLET = process.env.SUI_WALLET_ADDRESS!;

// Track the last cursor so we don't re-process old transactions
let lastCursor: string | null = null;

export async function startSuiWatcher() {
  console.log('👁 SUI payment watcher started');

  // Run every 10 seconds
  setInterval(async () => {
    try {
      await checkSuiTransactions();
    } catch (err) {
      console.error('SUI watcher error:', err);
    }
  }, 10_000);
}

async function checkSuiTransactions() {
  // Query all COIN transactions TO our wallet address
  const result = await client.queryTransactionBlocks({
    filter: {
      ToAddress: YOUR_SUI_WALLET
    },
    options: {
      showInput: true,
      showEffects: true,
      showBalanceChanges: true,
    },
    cursor: lastCursor,
    order: 'ascending'
  });

  if (result.data.length === 0) return;

  // Update cursor for next poll
  if (result.nextCursor) {
    lastCursor = result.nextCursor;
  }

  for (const txBlock of result.data) {
    await processSuiTransaction(txBlock);
  }
}

async function processSuiTransaction(txBlock: any) {
  const digest = txBlock.digest; // SUI's transaction hash equivalent

  // ── Guard 1: Must be successful ──
  const status = txBlock.effects?.status?.status;
  if (status !== 'success') {
    console.log(`❌ Failed SUI tx ignored: ${digest}`);
    return;
  }

  // ── Guard 2: Deduplication ──
  const existing = await db.listDocuments("payments", {
    filters: { tx_signature: digest }
  });
  if (existing.length > 0) return;

  // ── Find USDC balance change to our address ──
  const balanceChanges: any[] = txBlock.balanceChanges || [];
  const usdcReceived = balanceChanges.find((bc: any) =>
    bc.owner?.AddressOwner?.toLowerCase() === YOUR_SUI_WALLET.toLowerCase() &&
    bc.coinType === SUI_USDC_TYPE &&
    parseInt(bc.amount) > 0
  );

  if (!usdcReceived) return;

  // USDC on SUI uses 6 decimal places
  const amountUSDC = parseInt(usdcReceived.amount) / 1_000_000;

  // ── Extract memo/reference code ──
  // On SUI, the "memo" is passed as a MoveCall argument or transaction memo
  // Users include it in the transaction's optional memo field
  const txInputs = txBlock.transaction?.data?.transaction?.inputs || [];
  const memoInput = txInputs.find((inp: any) =>
    inp.type === 'pure' && inp.valueType === '0x1::string::String'
  );

  const memo: string = memoInput ? Buffer.from(memoInput.value, 'base64').toString('utf8') : '';
  const refMatch = memo.toUpperCase().match(/SUI-REF-([A-Z0-9]+)/);

  if (!refMatch) {
    await db.createDocument("unmatched_payments", {
      chain: 'sui',
      tx_signature: digest,
      amount_usdc: amountUSDC,
      memo,
      received_at: new Date().toISOString()
    });
    return;
  }

  const refCode = refMatch[0];
  const users = await db.listDocuments("payment_refs", {
    filters: { ref_code: refCode }
  });
  if (!users.length) return;

  const userId = users[0].user_id;
  let plan: string | null = null;
  if (amountUSDC >= 29 && amountUSDC < 79) plan = 'starter';
  if (amountUSDC >= 79) plan = 'pro';
  if (!plan) return;

  await activateSubscription({ userId, plan, amountUSDC, txSignature: digest, chain: 'sui' });
  console.log(`✅ SUI payment confirmed — ${plan} activated for user ${userId}`);
}
```

### Step 3: Using BlockVision for Enhanced SUI Monitoring (Optional Upgrade)

BlockVision (blockvision.space) provides a SUI-specific API with webhook support similar to Helius but for SUI. If you want push notifications instead of polling:

```typescript
// Register a BlockVision webhook for your SUI wallet
// POST https://api.blockvision.org/v2/sui/webhooks
// Headers: { 'x-api-key': YOUR_BLOCKVISION_KEY }
// Body: { address: YOUR_SUI_WALLET, eventTypes: ['CoinBalanceChange'], callbackUrl: 'https://yourbot.fly.dev/webhook/sui' }
```

For launch, the 10-second polling interval is sufficient and requires no third-party webhook service beyond the SUI RPC node.

---

## 9. Subscription Logic — 30 Days, Reminders, Auto-Lock

### Subscription Manager — Central Logic

```typescript
// apps/bot/src/payments/subscriptionManager.ts
import { db } from '../db/cocobase.js';
import { sendTradeAlert } from '../services/alertBot.js';

interface ActivateParams {
  userId: string;
  plan: 'starter' | 'pro';
  amountUSDC: number;
  txSignature: string;
  chain: 'solana' | 'sui';
}

export async function activateSubscription(params: ActivateParams) {
  const { userId, plan, amountUSDC, txSignature, chain } = params;

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30); // Always 30 days from payment date

  // Save payment record
  await db.createDocument("payments", {
    user_id: userId,
    plan,
    amount_usdc: amountUSDC,
    tx_signature: txSignature,
    chain,
    paid_at: now.toISOString(),
    expires_at: expiresAt.toISOString()
  });

  // Update user's live plan state
  await db.auth.updateUserData(userId, {
    plan,
    plan_expires_at: expiresAt.toISOString(),
    trial_used: true   // Ensure this is always set
  });

  // Send confirmation alert
  const user = await db.auth.getUser(userId);
  if (user?.data?.telegram_user_id) {
    const formattedDate = expiresAt.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
    await sendTradeAlert(user.data.telegram_user_id, {
      type: 'payment_confirmed',
      message: `✅ *Payment Confirmed*\n\nPlan: *${plan.toUpperCase()}*\nAmount: $${amountUSDC} USDC\nExpires: *${formattedDate}*\n\nYour bot is now fully active. Happy trading.`
    } as any);
  }
}
```

### Daily Expiry Check — Cron Job

This runs once per day. It handles:
- Sending 3-day countdown reminders
- Hard-locking accounts that have expired

```typescript
// apps/bot/src/jobs/dailySubscriptionCheck.ts
import { db } from '../db/cocobase.js';
import { sendTradeAlert } from '../services/alertBot.js';

export async function runDailySubscriptionCheck() {
  console.log('🔄 Running daily subscription check...');

  const now = new Date();

  // Fetch all users on paid plans
  // NOTE: Adjust this to however Cocobase supports querying user data collections
  const activeUsers = await db.listDocuments("user_plan_states", {
    filters: { plan: ['starter', 'pro', 'trial'] }
  });

  for (const user of activeUsers) {
    const expiresAt = new Date(user.plan_expires_at);
    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // ── CASE 1: Expired ──────────────────────────────────────
    if (daysRemaining <= 0) {
      await db.auth.updateUserData(user.id, {
        plan: 'free',
        plan_expires_at: null
      });

      // Send expiry alert
      if (user.telegram_user_id) {
        await sendTradeAlert(user.telegram_user_id, {
          type: 'expiry',
          message: `⛔ *Subscription Expired*\n\nYour bot has been paused. Send USDC to renew and reactivate.\n\nGo to your dashboard billing page for payment details.`
        } as any);
      }

      console.log(`⛔ ${user.id} expired — downgraded to free`);
    }

    // ── CASE 2: 3 days remaining — start daily reminders ────
    else if (daysRemaining <= 3) {
      // The reminder card in the UI is driven by `daysRemaining` on the user object
      // Update the user record so the frontend can display the correct countdown
      await db.auth.updateUserData(user.id, {
        subscription_warning: true,
        days_remaining: daysRemaining
      });

      // Also send Telegram reminder
      if (user.telegram_user_id) {
        await sendTradeAlert(user.telegram_user_id, {
          type: 'renewal_reminder',
          message: `⏳ *Subscription Reminder*\n\n${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining on your *${user.plan?.toUpperCase()}* plan.\n\nRenew now to keep your bot running without interruption. Go to your dashboard → Billing.`
        } as any);
      }

      console.log(`⏳ Reminder sent to ${user.id} — ${daysRemaining} days left`);
    }

    // ── CASE 3: More than 3 days — clear any stale warnings ─
    else {
      if (user.subscription_warning) {
        await db.auth.updateUserData(user.id, {
          subscription_warning: false,
          days_remaining: daysRemaining
        });
      }
    }
  }

  console.log(`✅ Subscription check complete — processed ${activeUsers.length} users`);
}
```

Schedule this to run at midnight UTC every day:

```typescript
// In apps/bot/src/index.ts
import cron from 'node-cron'; // npm install node-cron @types/node-cron

// Run at 00:00 UTC every day
cron.schedule('0 0 * * *', () => {
  runDailySubscriptionCheck();
});
```

---

## 10. In-App Reminder Card (Bottom-Left UI)

When a user has 3 or fewer days remaining, a card appears fixed to the bottom-left of every dashboard page. It shows a daily countdown and a renew button. It does not disappear until they renew or the account expires.

```tsx
// apps/web/components/SubscriptionWarningCard.tsx
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function SubscriptionWarningCard() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Calculate days remaining from plan_expires_at
    if (user.data?.plan_expires_at) {
      const expiresAt = new Date(user.data.plan_expires_at);
      const now = new Date();
      const diff = Math.ceil(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff <= 3 && diff > 0 && user.data.plan !== 'free') {
        setDaysLeft(diff);
        setVisible(true);
      }
    }
  }, [user]);

  if (!visible) return null;

  const urgency = daysLeft === 1 ? 'red' : daysLeft === 2 ? 'orange' : 'yellow';
  const colorMap = {
    red: 'border-red-500 bg-red-950/60',
    orange: 'border-orange-500 bg-orange-950/60',
    yellow: 'border-yellow-500 bg-yellow-950/60'
  };
  const textColorMap = {
    red: 'text-red-400',
    orange: 'text-orange-400',
    yellow: 'text-yellow-400'
  };

  return (
    <div className={`fixed bottom-5 left-5 z-50 w-72 rounded-xl border backdrop-blur-sm p-4 shadow-2xl ${colorMap[urgency]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏳</span>
          <span className={`font-bold text-sm ${textColorMap[urgency]}`}>
            Subscription Expiring
          </span>
        </div>
        {/* Do NOT add a close/dismiss button — this stays visible by design */}
      </div>

      <p className="text-white text-sm mb-1">
        <span className={`font-mono font-bold text-xl ${textColorMap[urgency]}`}>
          {daysLeft}
        </span>
        {' '}day{daysLeft !== 1 ? 's' : ''} remaining
      </p>

      <p className="text-zinc-400 text-xs mb-3">
        Your bot will pause when this expires. Renew now to stay active.
      </p>

      <a
        href="/dashboard/billing"
        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition"
      >
        Renew Now →
      </a>
    </div>
  );
}
```

Add this to your dashboard layout so it appears on every dashboard page:

```tsx
// apps/web/app/(dashboard)/layout.tsx
import SubscriptionWarningCard from '@/components/SubscriptionWarningCard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
      {/* Appears on all dashboard pages when expiring */}
      <SubscriptionWarningCard />
    </div>
  );
}
```

### Behavior Rules

- Card appears at **exactly 3 days remaining**, not before
- It shows for days 3, 2, and 1
- On day 0 (expired), the account is locked to Free and the card disappears (replaced by a full-page paywall prompt on the dashboard)
- There is no dismiss/close button — the reminder is intentionally persistent
- The color changes each day: yellow (3 days) → orange (2 days) → red (1 day)

---

## 11. Telegram Expiry Alert System

The Telegram alert bot sends messages on this schedule:

| Day | Event | Message |
|---|---|---|
| Day 27 (3 days before) | First reminder | "⏳ 3 days left on your Pro plan. Renew to keep bot running." |
| Day 28 (2 days before) | Second reminder | "⏳ 2 days left. Don't let your bot go silent." |
| Day 29 (1 day before) | Final warning | "🔴 Last day. Your bot pauses tomorrow if you don't renew." |
| Day 30 (expired) | Lock notification | "⛔ Subscription expired. Bot paused. Send USDC to reactivate." |
| Upon payment | Confirmation | "✅ Payment confirmed. [Plan] active until [date]." |

The messages are sent from the `dailySubscriptionCheck` cron job as shown above. The `sendTradeAlert` function handles the delivery via Telegram Bot API.

---

## 12. Cocobase Schema for Payments

Add these collections to your Cocobase project. These replace the `subscriptions` collection from the original PRD.

### `payments` collection
```javascript
{
  user_id: string,           // Links to auth user
  plan: 'starter' | 'pro',
  amount_usdc: number,       // e.g. 29 or 79
  tx_signature: string,      // Solana sig or SUI digest — used for dedup
  chain: 'solana' | 'sui',
  paid_at: ISO string,
  expires_at: ISO string     // paid_at + 30 days
}
```

### `payment_refs` collection
Reference codes are generated once per user and stored here. Used to match an incoming payment to a user.
```javascript
{
  user_id: string,
  sol_ref_code: string,      // e.g. "SOL-REF-A3F9B2"
  sui_ref_code: string,      // e.g. "SUI-REF-C7D4E1"
  created_at: ISO string
}
```

Generate on first visit to billing page:
```typescript
export async function getOrCreateRefCodes(userId: string) {
  const existing = await db.listDocuments("payment_refs", {
    filters: { user_id: userId }
  });
  if (existing.length > 0) return existing[0];

  const newRef = await db.createDocument("payment_refs", {
    user_id: userId,
    sol_ref_code: `SOL-REF-${userId.substring(0, 6).toUpperCase()}`,
    sui_ref_code: `SUI-REF-${userId.substring(0, 6).toUpperCase()}`,
    created_at: new Date().toISOString()
  });
  return newRef;
}
```

### `unmatched_payments` collection
For payments received without a valid reference code. You review these manually and credit manually if needed.
```javascript
{
  chain: 'solana' | 'sui',
  tx_signature: string,
  amount_usdc: number,
  memo: string,              // Raw memo field from transaction
  received_at: ISO string,
  resolved: boolean          // You mark true after manually handling
}
```

### `error_logs` collection
For tracking bot errors in production.
```javascript
{
  context: string,           // e.g. "solanaWebhook", "suiWatcher"
  message: string,
  stack: string,
  user_id: string | null,
  created_at: ISO string
}
```

---

## 13. Deploying on Fly.io Instead of Railway

### Why Fly.io Over Railway

| Feature | Fly.io | Railway |
|---|---|---|
| Persistent machines | ✅ True VMs, always-on | Partial — can sleep |
| Global regions | 35+ regions | Limited |
| Free tier | ~$5/mo of credits | Limited free hours |
| Docker control | Full — you own the Dockerfile | Abstracted |
| WebSocket support | Native | Basic |
| Custom health checks | ✅ Full control | Limited |
| Long-running processes | ✅ Designed for this | Sometimes problematic |
| Secret management | `fly secrets set` — encrypted | Environment tab |

Your bot is a **long-running persistent process**. It maintains a live Telegram client connection 24/7, watches SUI every 10 seconds, and listens for Helius webhook calls. Fly.io machines are actual VMs that stay alive. They are the correct choice for this workload.

### Installing flyctl

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

Log in:
```bash
fly auth login
```

### Project Structure for Fly.io Deployment

You deploy two separate Fly.io apps — one for the web frontend, one for the bot engine.

```
copysignal-bot/
├── apps/
│   ├── web/
│   │   ├── Dockerfile          ← Web app container
│   │   ├── fly.toml            ← Web app Fly config
│   │   └── ...
│   └── bot/
│       ├── Dockerfile          ← Bot engine container
│       ├── fly.toml            ← Bot Fly config
│       └── ...
```

### Dockerfile — Bot Engine

```dockerfile
# apps/bot/Dockerfile

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript
RUN npx tsc

# ─────────────────────────────────────────────
# Production stage — leaner image
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JS from build stage
COPY --from=builder /app/dist ./dist

# Health check — makes sure the process is alive
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3001

# Start the bot
CMD ["node", "dist/index.js"]
```

Add a health endpoint to your bot's Express server:
```typescript
// In your payment webhook server
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
```

### Dockerfile — Web Frontend

```dockerfile
# apps/web/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
```

Add to `apps/web/next.config.js`:
```javascript
module.exports = {
  output: 'standalone',  // Required for Docker deployment
};
```

### fly.toml — Bot Engine

```toml
# apps/bot/fly.toml

app = "copysignal-bot-engine"
primary_region = "iad"          # Choose closest region to you

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "3001"
  NODE_ENV = "production"

[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = false    # CRITICAL — never let the bot machine stop
  auto_start_machines = true
  min_machines_running = 1      # Always keep at least 1 machine alive

[[vm]]
  memory = "512mb"              # Enough for the Telegram client + executors
  cpu_kind = "shared"
  cpus = 1
```

### fly.toml — Web Frontend

```toml
# apps/web/fly.toml

app = "copysignal-bot-web"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "3000"
  NODE_ENV = "production"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  memory = "256mb"
  cpu_kind = "shared"
  cpus = 1
```

### Deploying — Step by Step

**Deploy the bot engine:**
```bash
cd apps/bot

# Initialize the app on Fly (first time only)
fly launch --name copysignal-bot-engine --no-deploy

# Set all secrets (environment variables) — encrypted at rest on Fly
fly secrets set \
  COCOBASE_API_KEY="your_key" \
  TELEGRAM_API_ID="12345678" \
  TELEGRAM_API_HASH="your_hash" \
  TELEGRAM_SESSION="your_session_string" \
  TELEGRAM_BOT_TOKEN="your_bot_token" \
  ENCRYPTION_KEY="your_64_char_hex" \
  HELIUS_API_KEY="your_helius_key" \
  HELIUS_WEBHOOK_URL="https://copysignal-bot-engine.fly.dev/webhook/solana" \
  SOLANA_WALLET_ADDRESS="your_solana_wallet" \
  SUI_WALLET_ADDRESS="your_sui_wallet" \
  REDIS_URL="redis://..."

# Deploy
fly deploy

# Check it's running
fly status
fly logs   # Watch live logs
```

**Deploy the web frontend:**
```bash
cd apps/web

fly launch --name copysignal-bot-web --no-deploy

fly secrets set \
  NEXT_PUBLIC_COCOBASE_API_KEY="your_key" \
  NEXT_PUBLIC_COCOBASE_PROJECT_ID="your_project_id" \
  GOOGLE_CLIENT_ID="your_google_oauth_id" \
  GOOGLE_CLIENT_SECRET="your_google_oauth_secret" \
  NEXTAUTH_SECRET="random_secret_string" \
  NEXTAUTH_URL="https://copysignal-bot-web.fly.dev" \
  NEXT_PUBLIC_URL="https://copysignal-bot-web.fly.dev" \
  NEXT_PUBLIC_SOLANA_WALLET="your_solana_wallet" \
  NEXT_PUBLIC_SUI_WALLET="your_sui_wallet"

fly deploy
```

### CRITICAL: `auto_stop_machines = false`

This setting in `fly.toml` is the single most important configuration for your bot. By default, Fly.io will stop your machine after a period of inactivity to save resources. For a web server that waits for requests, this is fine. For a persistent Telegram listener, this is catastrophic — it would disconnect your bot and miss signals.

`auto_stop_machines = false` combined with `min_machines_running = 1` guarantees your machine never stops.

### Redeploy After Code Changes

```bash
# Just run this from the app directory
fly deploy

# Fly builds a new Docker image, deploys it, and zero-downtime swaps
```

### Monitoring on Fly.io

```bash
fly logs                          # Real-time log stream
fly status                        # Machine health
fly ssh console                   # SSH into the machine for debugging
fly metrics                       # CPU, memory, network usage
```

---

## 14. Security Risks & Full Mitigations

This section covers every meaningful security risk in the system — from user API keys to payment detection. Each risk is listed with its severity, what can go wrong, and exactly how to close it.

---

### RISK 1: Exchange API Keys Stored in Database
**Severity: CRITICAL**

**What goes wrong:** If Cocobase is misconfigured, breached, or accessed by someone with your API credentials, every user's Bybit and Binance API key would be exposed. An attacker with a user's exchange API key can drain their trading account completely.

**Mitigation — AES-256 Encryption Before Storage:**
All API keys must be encrypted using AES-256-CBC before they are ever written to Cocobase. The encryption key lives only in your server environment (Fly.io secrets) and is never in the database. Even if someone dumps your entire Cocobase database, they get useless ciphertext.

```typescript
// utils/crypto.ts — already in the PRD but repeating for emphasis
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 64-char hex = 32 bytes

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(ciphertext: string): string {
  const [ivHex, encryptedHex] = ciphertext.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  );
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]).toString('utf8');
}
```

**Additional hardening:**
- Instruct users to create **IP-restricted API keys** on Bybit/Binance. They whitelist only your Fly.io IP. Even if the key leaks, it can only be used from your server.
- Instruct users to create API keys with **only trading permissions** — no withdrawals, no transfers. This limits blast radius to open/close positions only.
- Add this guidance explicitly to your onboarding flow.

---

### RISK 2: Fake or Manipulated Payments
**Severity: HIGH**

**What goes wrong:** A bad actor finds your webhook URL, crafts a fake HTTP POST that looks like a Helius or SUI transaction notification, and gets a free subscription activated.

**Mitigation — Verify Every Transaction On-Chain:**

Never trust the webhook payload alone. After receiving a webhook notification, always verify the transaction directly against the blockchain before activating anything.

```typescript
// For Solana — verify the tx signature exists on-chain with correct status
import { Connection, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
);

async function verifyConfirmedOnChain(signature: string): Promise<boolean> {
  const tx = await connection.getTransaction(signature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0
  });

  if (!tx) return false;                     // Doesn't exist
  if (tx.meta?.err !== null) return false;   // Failed on-chain

  return true;
}
```

```typescript
// In your webhook handler — ALWAYS verify before activating
router.post('/webhook/solana', async (req, res) => {
  res.status(200).json({ received: true }); // Respond first

  for (const tx of req.body) {
    // Step 1: Verify on-chain (not just trusting the webhook body)
    const isReal = await verifyConfirmedOnChain(tx.signature);
    if (!isReal) {
      console.warn(`🚨 Unverifiable tx in webhook: ${tx.signature}`);
      continue;
    }
    // Step 2: Process normally
    await processSolanaTransaction(tx);
  }
});
```

---

### RISK 3: Duplicate Payment Processing
**Severity: HIGH**

**What goes wrong:** Helius retries webhook deliveries if your server doesn't respond in time. You could process the same payment event twice and give a user 60 days for one payment.

**Mitigation — Idempotency via tx_signature Deduplication:**

The `tx_signature` (Solana) or `digest` (SUI) is globally unique and immutable. Before processing any payment, check if that signature already exists in your `payments` collection. If it does, skip silently.

```typescript
// At the very start of processSolanaTransaction():
const existing = await db.listDocuments("payments", {
  filters: { tx_signature: signature }
});
if (existing.length > 0) {
  console.log(`🔁 Duplicate — already processed: ${signature}`);
  return; // Silent skip
}
```

This is already shown in the payment handlers above. **Never remove this check.**

---

### RISK 4: Telegram Session String Exposure
**Severity: HIGH**

**What goes wrong:** Your Telegram MTProto session string is essentially a login to your personal Telegram account. If it leaks (via a log, an error, a git commit), someone can log in as you, read your DMs, and impersonate you.

**Mitigation:**
- The session string is ONLY stored in Fly.io secrets (`fly secrets set TELEGRAM_SESSION=...`) and in your local `.env` file which is in `.gitignore`
- Never log the session string. Add this explicitly to your logger:
```typescript
// Never let session string appear in logs
if (msg.includes(process.env.TELEGRAM_SESSION || '')) {
  throw new Error('SECURITY: Attempted to log session string');
}
```
- Rotate the session string immediately if you suspect exposure: delete the session file, run `generateSession.ts` again, update the Fly.io secret, and redeploy

---

### RISK 5: Cocobase Collection Access Rules Not Set
**Severity: HIGH**

**What goes wrong:** By default, Cocobase collections might be readable by any authenticated user. User A could query the `api_keys` collection and read User B's (encrypted) API keys.

**Mitigation — Collection-Level Rules:**
In your Cocobase project dashboard, set collection-level access rules so:
- A user can only read/write their OWN documents (where `user_id === auth.uid`)
- The `api_keys` and `payments` collections are **server-read-only from the client** — the frontend never directly queries them. Only your bot's server-side code (using your master API key) reads them

```
Collection: api_keys
  Read: server only (no client access)
  Write: server only

Collection: payments
  Read: server only (no client access)
  Write: server only

Collection: trade_logs
  Read: user_id === auth.uid
  Write: server only

Collection: channels
  Read: user_id === auth.uid
  Write: user_id === auth.uid (own records only)
```

---

### RISK 6: Bot Executes Trades With Incorrect Position Sizing
**Severity: HIGH**

**What goes wrong:** The account balance fetch from Bybit/Binance fails silently or returns 0. The risk calculator receives `balance = 0`, calculates `qty = 0`, and the order either fails silently or executes with a default qty that may be wildly too large.

**Mitigation — Hard Guards Before Execution:**

```typescript
// In riskCalc.ts — add explicit guards
export function calculatePositionSize(params: RiskParams): PositionSizing {
  if (!params.accountBalance || params.accountBalance <= 0) {
    throw new Error(`Invalid account balance: ${params.accountBalance}`);
  }
  if (!params.entryPrice || params.entryPrice <= 0) {
    throw new Error(`Invalid entry price: ${params.entryPrice}`);
  }
  if (!params.stopLossPrice || params.stopLossPrice <= 0) {
    throw new Error(`Invalid stop loss: ${params.stopLossPrice}`);
  }
  if (params.entryPrice === params.stopLossPrice) {
    throw new Error('Entry and stop loss cannot be the same price');
  }
  // ... rest of calculation
}
```

If `calculatePositionSize` throws, the `orchestrator.ts` catches it, logs the error to Cocobase `error_logs`, and does NOT execute the trade.

---

### RISK 7: No Rate Limiting on Webhook Endpoint
**Severity: MEDIUM**

**What goes wrong:** Someone discovers your `/webhook/solana` URL and hammers it with thousands of requests, either to crash your server or to slow down real payment processing.

**Mitigation — Rate Limiting:**

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

// Max 60 requests per minute per IP — generous for Helius, restrictive for attackers
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/webhook', webhookLimiter);
```

Additionally, optionally verify that the request comes from Helius's known IP ranges. Helius documents their source IPs in their dashboard.

---

### RISK 8: User Provides Malicious API Key Attempting SSRF
**Severity: MEDIUM**

**What goes wrong:** A sophisticated attacker provides a fake "API key" that is actually crafted to exploit server-side request forgery (SSRF) when your server makes calls to initialize the exchange client.

**Mitigation:**
- Use only the official Bybit (`bybit-api`) and Binance (`binance-api-node`) SDK packages — these only make requests to the official exchange domains
- Never construct arbitrary HTTP requests based on user-provided data
- Validate exchange API key format before saving (Bybit keys are always alphanumeric, 36 characters; Binance keys are alphanumeric, 64 characters):

```typescript
function validateApiKey(key: string, exchange: 'bybit' | 'binance'): boolean {
  if (exchange === 'bybit') return /^[a-zA-Z0-9]{36}$/.test(key);
  if (exchange === 'binance') return /^[a-zA-Z0-9]{64}$/.test(key);
  return false;
}
```

---

### RISK 9: `.env` Files Committed to Git
**Severity: CRITICAL (if it happens)**

**What goes wrong:** Developer accidentally runs `git add .` and commits `.env` or `.env.local`. All secrets (encryption key, Telegram session, API keys) are now in git history forever — even if you delete the file later.

**Mitigation — Enforce .gitignore:**

```gitignore
# .gitignore — at repo root
.env
.env.local
.env.production
.env.*
!.env.example    # Only the example file (no real values) is committed
```

Add a pre-commit hook that refuses commits containing likely secrets:

```bash
# Install git-secrets
brew install git-secrets   # macOS

git secrets --install
git secrets --register-aws   # Catches AWS keys
git secrets --add 'ENCRYPTION_KEY\s*=\s*[a-f0-9]{64}'  # Catches your custom key
```

If you ever accidentally commit secrets: immediately rotate ALL compromised credentials (Telegram session, encryption key, any API keys), then use `git filter-repo` to remove the commit from history.

---

### RISK 10: No Input Sanitization on Reference Codes
**Severity: LOW-MEDIUM**

**What goes wrong:** The reference code is extracted from an on-chain memo field using regex. If the regex is too permissive, a malformed memo could match an unintended user.

**Mitigation — Strict Reference Code Format:**

Your reference codes follow a fixed format: `SOL-REF-XXXXXX` or `SUI-REF-XXXXXX` where `XXXXXX` is exactly 6 alphanumeric uppercase characters.

```typescript
// Strict regex — nothing else will match
const solRefRegex = /SOL-REF-([A-Z0-9]{6})/;
const suiRefRegex = /SUI-REF-([A-Z0-9]{6})/;

const solMatch = memo.toUpperCase().match(solRefRegex);
const suiMatch = memo.toUpperCase().match(suiRefRegex);
```

This makes it impossible for an attacker to craft a memo that matches a real code by accident — they would need to know the exact 6-character code.

---

### Security Checklist — Run Before Launch

```
API Key Storage
  [ ] encrypt() is called before EVERY api_key write to Cocobase
  [ ] decrypt() is ONLY called inside bybitExecutor.ts and binanceExecutor.ts
  [ ] No raw key ever appears in logs
  [ ] Users are shown instructions to create withdrawal-disabled, IP-restricted keys

Payments
  [ ] Every webhook payment is verified on-chain before activation
  [ ] tx_signature deduplication check is in place
  [ ] Fake/unmatched payments go to unmatched_payments collection for manual review
  [ ] Rate limiting is active on /webhook routes

Cocobase
  [ ] api_keys collection is server-read-only
  [ ] payments collection is server-read-only
  [ ] trade_logs are user-scoped (user_id === auth.uid)

Infrastructure
  [ ] All secrets are in Fly.io secrets, never in fly.toml or Dockerfile
  [ ] .env and .env.local are in .gitignore
  [ ] git-secrets or equivalent pre-commit hook is installed
  [ ] TELEGRAM_SESSION is never logged anywhere

Bot Safety
  [ ] calculatePositionSize() throws on invalid inputs — trade aborted
  [ ] isSafeToTrade() blocks excessive margin usage
  [ ] max_trades_per_day is enforced per channel document
  [ ] Leverage is capped at 50x in the parser
```

---

*SignalCopy Bot Improvements v1.0*
*Crypto Payments · Fly.io · Security*
