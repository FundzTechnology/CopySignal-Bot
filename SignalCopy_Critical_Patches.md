# 🔧 SignalCopy Bot — Critical System Patches
### Payment Identification · Signal Intelligence Engine · Trade Management

---

## 📌 Table of Contents

1. [Problem 1 — Crypto Payment Identification (The Memo Problem)](#1-problem-1--crypto-payment-identification-the-memo-problem)
2. [Solution — Unique Per-User Ephemeral Wallets](#2-solution--unique-per-user-ephemeral-wallets)
3. [HD Wallet Generation — Solana](#3-hd-wallet-generation--solana)
4. [HD Wallet Generation — SUI](#4-hd-wallet-generation--sui)
5. [Payment Session Flow — Full Architecture](#5-payment-session-flow--full-architecture)
6. [Handling Pending, Failed, and Fraudulent Payments](#6-handling-pending-failed-and-fraudulent-payments)
7. [Problem 2 — Signal Parsing Failure Scenarios](#7-problem-2--signal-parsing-failure-scenarios)
8. [Solution — Signal Rules Dashboard](#8-solution--signal-rules-dashboard)
9. [The Trigger Keyword System](#9-the-trigger-keyword-system)
10. [Multi-TP Logic — Which TP to Use](#10-multi-tp-logic--which-tp-to-use)
11. [Split Message Buffering](#11-split-message-buffering)
12. [False Signal Prevention — Confidence Engine](#12-false-signal-prevention--confidence-engine)
13. [Dynamic Trade Management — Hold to TP2, Break-Even](#13-dynamic-trade-management--hold-to-tp2-break-even)
14. [Signal Rules Dashboard — Frontend Page](#14-signal-rules-dashboard--frontend-page)
15. [Cocobase Schema Updates](#15-cocobase-schema-updates)
16. [Updated Orchestrator With All Patches](#16-updated-orchestrator-with-all-patches)

---

## 1. Problem 1 — Crypto Payment Identification (The Memo Problem)

### What Was Proposed (And Why It Fails)

The previous approach generated a unique reference code like `SOL-REF-A3F9B2` and asked users to paste it into a "memo" field when sending USDC.

**This does not work in practice.** Here is exactly why:

When a user opens any of these wallets and tries to send USDC:
- **Phantom Wallet** — shows Address field and Amount field only. No memo input visible by default. The memo field is buried in advanced settings that 95% of users never find.
- **Bybit Withdrawal** — shows Address and Amount. No memo for USDC on Solana.
- **Binance Withdrawal** — shows Network, Address, Amount. No memo for Solana USDC transfers.
- **SUI Wallet (Suiet, Nightly)** — shows Address and Amount only. No note/memo field exposed.
- **Backpack Wallet** — no visible memo field for token transfers.

Even if some wallets technically support memos at the protocol level, **users will not find it, will not use it, and you will receive hundreds of payments with no way to identify the sender.** The entire payment system breaks.

### Why Per-User Wallets Are the Correct Solution

Instead of asking the user to attach metadata to their payment, **the wallet address itself becomes the identifier.** Every user gets a unique destination address. When USDC arrives at that address, you know exactly which user sent it — no memo, no reference code, no user action beyond copy-paste-send.

```
User A clicks Pay → receives address: 7xKq...A3F9
User B clicks Pay → receives address: 9mRt...C7D2
User C clicks Pay → receives address: 3pWs...E1B8

USDC arrives at 7xKq...A3F9 → system knows: this is User A's payment
USDC arrives at 9mRt...C7D2 → system knows: this is User B's payment
```

Zero ambiguity. Zero user error. Zero memo required.

---

## 2. Solution — Unique Per-User Ephemeral Wallets

### How It Works

You have one **master seed phrase** stored securely in your Fly.io environment. From this single seed, you can mathematically derive an unlimited number of child wallet addresses using HD (Hierarchical Deterministic) wallet derivation — the same standard used by every hardware wallet in the world (BIP44).

Each child wallet is derived from a unique path tied to the user's ID and a session counter. The derived address is deterministic — meaning you can always re-derive it from the same path without storing the private key in your database.

```
Master Seed (stored only in Fly.io secrets, never in DB)
       ↓
HD Derivation Path: m/44'/501'/USER_INDEX'/0'
       ↓
Child Keypair → Public Address (stored in Cocobase as the payment address)
              → Private Key (re-derived on demand to sweep funds — never stored)
```

### Payment Session Lifecycle

```
1. User clicks "Subscribe" on billing page
2. System derives a unique wallet address for this user + plan
3. System stores the public address in Cocobase payment_sessions collection
4. User sees: "Send exactly $29 USDC to this address: [address]"
5. Address expires in 2 hours if no payment received
6. User sends USDC from any wallet — no memo needed
7. System detects USDC arriving at that specific address
8. Confirmed → activate subscription → sweep USDC to master wallet
9. Payment session marked as complete
```

---

## 3. HD Wallet Generation — Solana

### Install Dependencies

```bash
# In apps/bot
npm install @solana/web3.js
npm install bip39 ed25519-hd-key
npm install bs58
```

### Master Seed Setup (One Time Only)

```typescript
// apps/bot/src/scripts/generateMasterSeed.ts
// Run this ONCE. Save the output to Fly.io secrets. Never run again.
import * as bip39 from 'bip39';

const mnemonic = bip39.generateMnemonic(256); // 24-word seed phrase
console.log('\n=== SOLANA MASTER SEED ===');
console.log('Mnemonic (24 words):', mnemonic);
console.log('\nStore this in Fly.io secrets as SOLANA_MASTER_MNEMONIC');
console.log('NEVER commit this. NEVER share this. NEVER lose this.');
console.log('All user payment wallets are derived from this seed.');
```

Run once: `npx ts-node src/scripts/generateMasterSeed.ts`

Store the output in Fly.io: `fly secrets set SOLANA_MASTER_MNEMONIC="word1 word2 ... word24"`

### HD Wallet Derivation for Solana

```typescript
// apps/bot/src/payments/solanaWalletDeriver.ts
import { Keypair, Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const MASTER_MNEMONIC = process.env.SOLANA_MASTER_MNEMONIC!;
const MASTER_WALLET = new PublicKey(process.env.SOLANA_MASTER_WALLET!);

// Derive a unique keypair for a given user index
// userIndex is a stable integer assigned to each user (e.g., sequential DB ID)
export function deriveSolanaKeypair(userIndex: number): Keypair {
  const seed = bip39.mnemonicToSeedSync(MASTER_MNEMONIC);

  // BIP44 derivation path for Solana (coin type 501)
  // Each user gets their own account index
  const path = `m/44'/501'/${userIndex}'/0'`;
  const derived = derivePath(path, seed.toString('hex'));

  return Keypair.fromSeed(derived.key);
}

// Get the USDC token account address for a derived keypair
export async function getDerivedUSDCAddress(
  userIndex: number,
  connection: Connection
): Promise<string> {
  const keypair = deriveSolanaKeypair(userIndex);

  // Get the Associated Token Account for USDC at this keypair's address
  const ata = await getAssociatedTokenAddress(
    USDC_MINT,
    keypair.publicKey
  );

  return ata.toString();
}

// Sweep USDC from a user's derived wallet to your master wallet
// Called after confirming a successful payment
export async function sweepUSDCToMaster(
  userIndex: number,
  connection: Connection
): Promise<string | null> {
  const userKeypair = deriveSolanaKeypair(userIndex);
  const userATA = await getAssociatedTokenAddress(USDC_MINT, userKeypair.publicKey);
  const masterATA = await getAssociatedTokenAddress(USDC_MINT, MASTER_WALLET);

  // Check balance
  try {
    const balance = await connection.getTokenAccountBalance(userATA);
    const amount = balance.value.amount; // Raw amount in smallest units (6 decimals for USDC)
    if (parseInt(amount) === 0) return null;

    // Build transfer transaction
    const transaction = new Transaction().add(
      createTransferInstruction(
        userATA,        // From: user's derived USDC account
        masterATA,      // To: your master USDC account
        userKeypair.publicKey,
        parseInt(amount),
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const signature = await connection.sendTransaction(
      transaction,
      [userKeypair],
      { skipPreflight: false, preflightCommitment: 'confirmed' }
    );

    await connection.confirmTransaction(signature, 'confirmed');
    console.log(`✅ Swept ${parseInt(amount) / 1_000_000} USDC from user ${userIndex} to master`);
    return signature;
  } catch (err) {
    console.error(`Sweep failed for user ${userIndex}:`, err);
    return null;
  }
}
```

### Monitoring Derived Wallets — Helius Multi-Address Webhook

```typescript
// apps/bot/src/payments/solanaPaymentSession.ts
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { Helius } from 'helius-sdk';
import { db } from '../db/cocobase.js';
import { deriveSolanaKeypair, getDerivedUSDCAddress, sweepUSDCToMaster } from './solanaWalletDeriver.js';

const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
);
const helius = new Helius(process.env.HELIUS_API_KEY!);

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const SESSION_EXPIRY_HOURS = 2;

// Called when user clicks "Pay" on billing page
export async function createPaymentSession(
  userId: string,
  userIndex: number,  // Stable integer — store in user record
  plan: 'starter' | 'pro'
): Promise<{ address: string; expiresAt: string; sessionId: string }> {

  const usdcAddress = await getDerivedUSDCAddress(userIndex, connection);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

  // Save session to Cocobase
  const session = await db.createDocument("payment_sessions", {
    user_id: userId,
    user_index: userIndex,
    plan,
    solana_usdc_address: usdcAddress,
    amount_expected: plan === 'starter' ? 29 : 79,
    status: 'pending',          // 'pending' | 'confirmed' | 'expired' | 'failed'
    chain: 'solana',
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString()
  });

  // Register this address with Helius webhook
  // Helius allows dynamically adding addresses to an existing webhook
  await addAddressToHeliusWebhook(usdcAddress);

  return {
    address: usdcAddress,
    expiresAt: expiresAt.toISOString(),
    sessionId: session.id
  };
}

// Helius dynamically supports adding addresses to an existing webhook
async function addAddressToHeliusWebhook(address: string) {
  const webhooks = await helius.getAllWebhooks();
  const webhook = webhooks.find(
    (w: any) => w.webhookURL === process.env.HELIUS_WEBHOOK_URL
  );
  if (!webhook) return;

  // Add the new address to the existing webhook's address list
  const currentAddresses: string[] = webhook.accountAddresses || [];
  if (!currentAddresses.includes(address)) {
    await helius.editWebhook(webhook.webhookID, {
      accountAddresses: [...currentAddresses, address],
      webhookURL: process.env.HELIUS_WEBHOOK_URL!,
      transactionTypes: ['TRANSFER'],
      webhookType: 'enhanced'
    });
  }
}

// Called by Helius webhook when USDC lands on any monitored address
export async function handleSolanaPayment(
  toAddress: string,
  amountUSDC: number,
  txSignature: string
) {
  // ── Deduplication ──
  const existing = await db.listDocuments("payments", {
    filters: { tx_signature: txSignature }
  });
  if (existing.length > 0) return; // Already processed

  // ── Find matching payment session ──
  const sessions = await db.listDocuments("payment_sessions", {
    filters: {
      solana_usdc_address: toAddress,
      status: 'pending'
    }
  });

  if (!sessions.length) {
    // Payment to an address we don't recognize — log for manual review
    await db.createDocument("unmatched_payments", {
      chain: 'solana',
      to_address: toAddress,
      amount_usdc: amountUSDC,
      tx_signature: txSignature,
      received_at: new Date().toISOString()
    });
    return;
  }

  const session = sessions[0];

  // ── Verify amount is close enough (allow ±$0.50 for rounding) ──
  const expectedAmount = session.amount_expected;
  const diff = Math.abs(amountUSDC - expectedAmount);
  if (diff > 0.5) {
    await db.updateDocument("payment_sessions", session.id, {
      status: 'wrong_amount',
      received_amount: amountUSDC,
      tx_signature: txSignature
    });
    // Alert user via Telegram
    console.log(`⚠️ Wrong amount: expected $${expectedAmount}, got $${amountUSDC} for session ${session.id}`);
    return;
  }

  // ── Check session not expired ──
  if (new Date(session.expires_at) < new Date()) {
    await db.updateDocument("payment_sessions", session.id, {
      status: 'expired'
    });
    return;
  }

  // ── Mark session as confirmed ──
  await db.updateDocument("payment_sessions", session.id, {
    status: 'confirmed',
    received_amount: amountUSDC,
    tx_signature: txSignature,
    confirmed_at: new Date().toISOString()
  });

  // ── Activate subscription ──
  const { activateSubscription } = await import('./subscriptionManager.js');
  await activateSubscription({
    userId: session.user_id,
    plan: session.plan,
    amountUSDC,
    txSignature,
    chain: 'solana'
  });

  // ── Sweep funds to master wallet ──
  await sweepUSDCToMaster(session.user_index, connection);

  console.log(`✅ Payment confirmed for user ${session.user_id} — ${session.plan} activated`);
}
```

---

## 4. HD Wallet Generation — SUI

```bash
npm install @mysten/sui
```

```typescript
// apps/bot/src/payments/suiWalletDeriver.ts
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { TransactionBlock } from '@mysten/sui/transactions';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

const SUI_USDC_TYPE = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';
const MASTER_MNEMONIC = process.env.SUI_MASTER_MNEMONIC!;
const MASTER_SUI_ADDRESS = process.env.SUI_MASTER_WALLET!;

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

// Derive unique SUI keypair per user
export function deriveSuiKeypair(userIndex: number): Ed25519Keypair {
  const seed = bip39.mnemonicToSeedSync(MASTER_MNEMONIC);

  // SUI uses coin type 784 in BIP44
  const path = `m/44'/784'/${userIndex}'/0'/0'`;
  const derived = derivePath(path, seed.toString('hex'));

  return Ed25519Keypair.fromSecretKey(derived.key);
}

export function getDerivedSuiAddress(userIndex: number): string {
  const keypair = deriveSuiKeypair(userIndex);
  return keypair.getPublicKey().toSuiAddress();
}

// Create a payment session for SUI USDC
export async function createSuiPaymentSession(
  userId: string,
  userIndex: number,
  plan: 'starter' | 'pro'
): Promise<{ address: string; expiresAt: string; sessionId: string }> {

  const suiAddress = getDerivedSuiAddress(userIndex);
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  const session = await db.createDocument("payment_sessions", {
    user_id: userId,
    user_index: userIndex,
    plan,
    sui_address: suiAddress,
    amount_expected: plan === 'starter' ? 29 : 79,
    status: 'pending',
    chain: 'sui',
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString()
  });

  return { address: suiAddress, expiresAt: expiresAt.toISOString(), sessionId: session.id };
}

// Sweep USDC from derived SUI address to master
export async function sweepSuiUSDCToMaster(userIndex: number): Promise<string | null> {
  const keypair = deriveSuiKeypair(userIndex);
  const userAddress = keypair.getPublicKey().toSuiAddress();

  try {
    // Get all USDC coins owned by this derived address
    const coins = await client.getCoins({
      owner: userAddress,
      coinType: SUI_USDC_TYPE
    });

    if (!coins.data.length) return null;

    const tx = new TransactionBlock();
    const totalCoinIds = coins.data.map(c => c.coinObjectId);

    // Merge all USDC coins if multiple, then transfer
    if (totalCoinIds.length > 1) {
      tx.mergeCoins(tx.object(totalCoinIds[0]), totalCoinIds.slice(1).map(id => tx.object(id)));
    }

    tx.transferObjects([tx.object(totalCoinIds[0])], tx.pure(MASTER_SUI_ADDRESS));

    const result = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
    });

    console.log(`✅ Swept SUI USDC from user ${userIndex} to master. Digest: ${result.digest}`);
    return result.digest;
  } catch (err) {
    console.error(`SUI sweep failed for user ${userIndex}:`, err);
    return null;
  }
}
```

---

## 5. Payment Session Flow — Full Architecture

### User Index Assignment

Every user needs a stable integer index for HD derivation. Assign this at registration and never change it:

```typescript
// In your registration logic
export async function registerUser(email: string, password: string, username: string) {
  // Get next available user index (simple sequential counter)
  const allUsers = await db.listDocuments("user_indices", {});
  const nextIndex = allUsers.length; // 0, 1, 2, 3...

  const user = await db.auth.register({
    email,
    password,
    data: {
      username,
      user_index: nextIndex,    // PERMANENT — never changes
      plan: 'trial',
      trial_used: true,
      trial_ends_at: new Date(Date.now() + 5 * 86400000).toISOString(),
      plan_expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
      telegram_user_id: null,
      created_at: new Date().toISOString()
    }
  });

  // Record the index assignment
  await db.createDocument("user_indices", {
    user_id: user.id,
    user_index: nextIndex,
    created_at: new Date().toISOString()
  });

  return user;
}
```

### Billing Page — What the User Sees

When a user opens the billing page and clicks "Subscribe":

```typescript
// apps/web/app/api/payment/create-session/route.ts
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const { plan, chain } = await req.json(); // 'starter'|'pro', 'solana'|'sui'

  const user = await db.auth.getUser(session.user.cocobaseId);
  const userIndex = user.data.user_index;

  let paymentSession;

  if (chain === 'solana') {
    paymentSession = await createPaymentSession(
      session.user.cocobaseId,
      userIndex,
      plan
    );
  } else {
    paymentSession = await createSuiPaymentSession(
      session.user.cocobaseId,
      userIndex,
      plan
    );
  }

  return NextResponse.json(paymentSession);
}
```

The billing page UI shows:

```
┌─────────────────────────────────────────────────────┐
│                 Complete Your Payment               │
│                                                     │
│  Plan: Pro — $79/month                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Send exactly $79.00 USDC to:                │   │
│  │                                             │   │
│  │  [SOLANA]                                   │   │
│  │  7xKqRm...A3F9B2  [Copy Address]            │   │
│  │                                             │   │
│  │  [SUI]                                      │   │
│  │  0x9aB4...C7D2E1  [Copy Address]            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ⚠️  Send from any wallet — Phantom, Binance,       │
│     Bybit, Coinbase, etc.                           │
│  ⚠️  Do NOT include a memo or note                  │
│  ⚠️  This address is unique to you and expires in   │
│     1h 47m                                          │
│                                                     │
│  [Countdown Timer: 1:47:23 remaining]               │
│                                                     │
│  Status: Waiting for payment... ⏳                   │
│  [This updates automatically when payment arrives]  │
└─────────────────────────────────────────────────────┘
```

The status line updates in real time via Cocobase WebSocket watching the `payment_sessions` collection.

### Address Expiry and Reuse

```typescript
// apps/bot/src/jobs/cleanExpiredSessions.ts
// Run every 30 minutes
export async function cleanExpiredPaymentSessions() {
  const expiredSessions = await db.listDocuments("payment_sessions", {
    filters: { status: 'pending' }
  });

  const now = new Date();
  for (const session of expiredSessions) {
    if (new Date(session.expires_at) < now) {
      await db.updateDocument("payment_sessions", session.id, {
        status: 'expired'
      });
      // Remove expired address from Helius webhook monitoring
      // to keep the watched address list clean
      await removeAddressFromHeliusWebhook(
        session.solana_usdc_address || session.sui_address
      );
    }
  }
}
```

---

## 6. Handling Pending, Failed, and Fraudulent Payments

### Scenario A — Payment Pending Over 8-9 Hours

A blockchain transaction can get stuck if the network fee is too low or if there's congestion. On Solana and SUI this is extremely rare (finality in seconds), but it can happen.

**Detection:**
```typescript
// In your Helius webhook handler, check transaction status
const txStatus = await connection.getSignatureStatus(signature);

if (txStatus.value?.confirmationStatus === 'processed') {
  // Transaction is in a validator — wait for 'confirmed'
  // Do NOT activate subscription yet
  console.log('Transaction processed but not confirmed — waiting');
  return;
}

if (txStatus.value?.confirmationStatus === 'confirmed') {
  // Safe to activate
  await handleSolanaPayment(toAddress, amount, signature);
}

if (txStatus.value?.err !== null) {
  // Transaction failed on-chain — mark session as failed
  await db.updateDocument("payment_sessions", session.id, { status: 'failed' });
}
```

**Handling long-pending sessions:**
```typescript
// In your daily cron job — check for sessions pending over 3 hours
const staleSessions = await db.listDocuments("payment_sessions", {
  filters: { status: 'pending' }
});

for (const session of staleSessions) {
  const ageHours = (Date.now() - new Date(session.created_at).getTime()) / 3600000;
  if (ageHours > 3) {
    // Alert user via Telegram: payment not detected, they may need to retry
    await sendAlert(session.user_id,
      '⚠️ Your payment has not been detected after 3 hours. ' +
      'Please check your wallet and contact support if funds were deducted.'
    );
    // Generate a new session for them automatically
    await db.updateDocument("payment_sessions", session.id, { status: 'expired' });
  }
}
```

### Scenario B — Wrong Amount Sent

User sends $25 instead of $29. System detects it:

```typescript
// If amount is under expected by more than $0.50
if (amountUSDC < expectedAmount - 0.5) {
  await db.updateDocument("payment_sessions", session.id, {
    status: 'underpaid',
    received_amount: amountUSDC,
    tx_signature: txSignature,
    shortfall: expectedAmount - amountUSDC
  });

  // Alert user: "We received $25 USDC but $29 is required.
  // Please send the remaining $4 to the same address within 2 hours."
  // This is a manual resolution — you handle it via Telegram support
}
```

### Scenario C — Someone Tries to Replay a Transaction

Bad actor copies a confirmed transaction signature and POSTs it to your webhook multiple times:

```typescript
// This is blocked by the deduplication check that runs first
const existing = await db.listDocuments("payments", {
  filters: { tx_signature: txSignature }
});
if (existing.length > 0) {
  console.log('Replay attempt blocked:', txSignature);
  return; // Silent ignore
}
```

### Scenario D — Someone Sends to Someone Else's Derived Address

The HD derivation ensures each address maps to exactly one user index. The only way to know another user's payment address is to view it in their browser session. Even if someone did this, the payment would activate that user's subscription — which is their loss, not a security breach.

### Scenario E — Session Expires Before Payment Arrives

Payment arrives 2 hours and 5 minutes after session creation. Session is marked expired.

```typescript
// In handleSolanaPayment()
if (new Date(session.expires_at) < new Date()) {
  // Still credit the payment — we received the money
  // But alert the user manually that their session expired
  // Give them the subscription anyway (fair resolution)
  await db.updateDocument("payment_sessions", session.id, {
    status: 'confirmed_late',
    tx_signature: txSignature
  });

  // Activate anyway — user paid, you received money
  await activateSubscription({ userId: session.user_id, ... });

  // Alert: "Late payment received — subscription activated manually"
}
```

---

## 7. Problem 2 — Signal Parsing Failure Scenarios

Here are every failure scenario that must be handled, plus the solution for each.

### Failure Scenario 1 — Random Conversation Picked Up as a Signal

**Problem:** Channel members are chatting. Someone says "BTC looking bullish, might go long around 97k, stop 96k." The parser sees BTCUSDT, Long, 97000, 96000 and fires a real trade.

**Solution:** Require a **trigger keyword** that must appear before any message is treated as a signal. See Section 9.

### Failure Scenario 2 — Multiple TPs — Which One Executes?

**Problem:** Signal has TP1: 98000, TP2: 99500, TP3: 101000. Bot places order with TP1 at 98000 and closes the trade. But TP3 at 101000 would have made 3x the profit.

**Solution:** Defined multi-TP hierarchy with dynamic management. See Section 10.

### Failure Scenario 3 — Signal Split Across Multiple Messages

**Problem:** Caller sends:
- Message 1: "BTCUSDT LONG"
- Message 2 (2 seconds later): "Entry: 97200"
- Message 3 (3 seconds later): "TP: 98500 | SL: 96800"

Parser sees each message independently. None of them individually scores high enough to trigger a trade.

**Solution:** Message buffering window. See Section 11.

### Failure Scenario 4 — Different Signal Formats From Different Callers

**Problem:** Each channel has its own format. Caller A uses `TP1/TP2/TP3`. Caller B uses `Target 1, Target 2`. Caller C uses `Exit: 98500`.

**Solution:** Per-channel format rules configurable in the Signal Rules Dashboard. See Section 14.

### Failure Scenario 5 — Signal Update or Cancel Message

**Problem:** Caller sends a signal, then sends "Cancel the BTC trade" or "Update SL to 96500." Bot has already placed the order. Now what?

**Solution:** Management commands parsed from the same channel. See Section 13.

---

## 8. Solution — Signal Rules Dashboard

Instead of a single global parser that tries to understand every possible signal format, give each user the ability to configure rules for each specific channel they follow.

The rules are:
1. **Trigger keyword** — what word/phrase must appear for the message to be treated as a signal
2. **Signal format hints** — which keywords to look for (entry, TP, SL labels)
3. **TP selection rule** — which TP to use when multiple exist
4. **Management keyword rules** — words that trigger trade modifications

These rules are stored in the `channels` collection in Cocobase and fed to the parser at runtime.

---

## 9. The Trigger Keyword System

### How It Works

Every channel configuration has a required trigger keyword. The parser completely ignores any message that does not start with or contain this keyword.

Examples of trigger keywords channel owners can use:
- `🚨SIGNAL` — emoji-prefixed for visibility
- `#TRADE` — hashtag style
- `[ENTRY]` — bracket style
- `!!LIVE` — double exclamation
- `EXEC:` — short prefix

**Only the channel owner sets this keyword.** You tell them: "Choose any trigger word. Tell your channel to prefix all real signals with it. The bot ignores everything else."

```typescript
// apps/bot/src/parser/signalParser.ts

export function containsTriggerKeyword(
  rawText: string,
  triggerKeyword: string
): boolean {
  if (!triggerKeyword || triggerKeyword.trim() === '') return true; // No trigger = accept all (not recommended)
  return rawText.toUpperCase().includes(triggerKeyword.toUpperCase());
}

// In the orchestrator — check trigger BEFORE parsing
export async function handleSignal(
  rawMessage: string,
  messageId: string,
  channelDoc: any
) {
  // ── GATE 1: Trigger keyword check ────────────────────────
  const hasTrigger = containsTriggerKeyword(
    rawMessage,
    channelDoc.trigger_keyword || ''
  );

  if (!hasTrigger) {
    // Silent ignore — this is normal conversation, not a signal
    return;
  }

  // ── GATE 2: Parse the signal ──────────────────────────────
  const parsed = parseSignal(rawMessage, channelDoc.signal_rules);
  // ... rest of flow
}
```

### Trigger Keyword in Practice

Signal caller posts in their Telegram channel:
```
Just chatting with the community about market structure...

🚨SIGNAL
BTCUSDT LONG
Entry: 97,200
TP1: 98,500 | TP2: 100,000
SL: 96,800
x10 leverage
```

Bot sees two messages. The first has no trigger keyword — ignored. The second starts with `🚨SIGNAL` — parsed and executed.

---

## 10. Multi-TP Logic — Which TP to Use

### The Ruleset

```typescript
// apps/bot/src/parser/tpSelector.ts

export type TPRule = 'TP1' | 'TP2' | 'TP3' | 'LAST' | 'MIDDLE';

export interface TPSelection {
  initialTP: number;          // The TP placed on the exchange for the opening order
  allTPs: number[];           // All TPs for reference / dynamic management
  activeTPIndex: number;      // Which index is currently active (0-based)
}

export function selectTP(
  takeProfits: number[],
  rule: TPRule,
  side: 'Buy' | 'Sell'
): TPSelection {

  if (takeProfits.length === 0) {
    throw new Error('No take profits found in signal');
  }

  // Sort TPs correctly by trade direction
  const sorted = [...takeProfits].sort((a, b) =>
    side === 'Buy' ? a - b : b - a
  );
  // After sort: sorted[0] = nearest TP, sorted[last] = furthest TP

  let selectedIndex: number;

  switch (rule) {
    case 'TP1':
      // Always use the nearest take profit
      // Safest: locks in profit quickly
      selectedIndex = 0;
      break;

    case 'TP2':
      // Use second TP if it exists, otherwise fall back to TP1
      selectedIndex = sorted.length >= 2 ? 1 : 0;
      break;

    case 'TP3':
      selectedIndex = sorted.length >= 3 ? 2 : sorted.length - 1;
      break;

    case 'LAST':
      // Always use the furthest TP
      // Maximum profit potential, least conservative
      selectedIndex = sorted.length - 1;
      break;

    case 'MIDDLE':
      // Use the middle TP (good balance of profit and safety)
      selectedIndex = Math.floor(sorted.length / 2);
      break;

    default:
      selectedIndex = 0;
  }

  return {
    initialTP: sorted[selectedIndex],
    allTPs: sorted,
    activeTPIndex: selectedIndex
  };
}
```

### Default TP Rules by Number of TPs

```typescript
// When channel has NO explicit TP rule set, use these defaults:
export function getDefaultTPSelection(
  takeProfits: number[],
  side: 'Buy' | 'Sell'
): TPSelection {

  if (takeProfits.length === 1) {
    // Only one TP — use it
    return selectTP(takeProfits, 'TP1', side);
  }

  if (takeProfits.length === 2) {
    // TP1 and TP2 — use TP1 as the initial target
    // System will watch for "hold to TP2" management command
    return selectTP(takeProfits, 'TP1', side);
  }

  if (takeProfits.length >= 3) {
    // Multiple TPs — use TP1 as initial target
    // User can send "hold to TP2" or "hold to TP3" to extend
    return selectTP(takeProfits, 'TP1', side);
  }

  return selectTP(takeProfits, 'TP1', side);
}
```

**Summary of default behaviour:**
- 1 TP → use that TP
- 2 TPs → open with TP1
- 3+ TPs → open with TP1

The user can then extend to TP2 or TP3 using management commands (Section 13).

---

## 11. Split Message Buffering

### The Problem

```
[14:32:01] "BTCUSDT LONG 🚨SIGNAL"
[14:32:04] "Entry: 97,200"
[14:32:07] "TP1: 98,500 | TP2: 100,000"
[14:32:09] "SL: 96,800"
```

These are four separate Telegram messages, all from the same sender within 8 seconds. No single message contains enough information to parse a complete signal. The buffer combines them.

### Message Buffer Implementation

```typescript
// apps/bot/src/parser/messageBuffer.ts

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

// Buffer window: messages within this time are combined
const BUFFER_WINDOW_MS = 15000; // 15 seconds

// One buffer per channel per sender
const buffers = new Map<string, ChannelBuffer>();

export function bufferMessage(
  channelId: string,
  senderId: string,
  text: string,
  messageId: string,
  onComplete: (combinedText: string, messageIds: string[]) => void
) {
  const bufferKey = `${channelId}:${senderId}`;
  const now = Date.now();

  // Get or create buffer for this channel+sender combo
  let buffer = buffers.get(bufferKey);

  if (!buffer) {
    buffer = { messages: [], timer: null, senderId };
    buffers.set(bufferKey, buffer);
  }

  // Add new message to buffer
  buffer.messages.push({ text, timestamp: now, messageId });

  // Clear existing timer and set a new one
  // Every new message resets the 15-second window
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

  }, BUFFER_WINDOW_MS);
}
```

### Integration in Telegram Listener

```typescript
// In telegramListener.ts — replace the direct onSignal call with buffering

client.addEventHandler(async (event: NewMessageEvent) => {
  const message = event.message;
  if (!message?.text) return;

  const chat = await event.getChat();
  const sender = await event.getSender();
  const senderId = String(sender?.id || 'unknown');
  const chatId = String(chat?.id);
  const messageId = String(message.id);

  // Check if this channel is being watched
  for (const [channelKey, callback] of activeChannels.entries()) {
    if (chatId === channelKey || ...) {

      // Buffer the message instead of handling immediately
      bufferMessage(
        channelKey,
        senderId,
        message.text,
        messageId,
        (combinedText, messageIds) => {
          // This fires 15 seconds after the LAST message from this sender
          // combinedText contains all messages joined together
          callback(combinedText, messageIds[0]); // Use first messageId as dedup key
        }
      );
      break;
    }
  }
}, new NewMessage({}));
```

### Buffering Logic Explained

```
[14:32:01] Message 1 arrives → buffer starts 15s timer
[14:32:04] Message 2 arrives → timer resets to 15s
[14:32:07] Message 3 arrives → timer resets to 15s
[14:32:09] Message 4 arrives → timer resets to 15s
[14:32:24] 15 seconds of silence → timer fires
             All 4 messages combined and sent to parser as one block:
             "BTCUSDT LONG 🚨SIGNAL
              Entry: 97,200
              TP1: 98,500 | TP2: 100,000
              SL: 96,800"
             Parser sees complete signal → high confidence → trade executes
```

**Buffer window is configurable per channel** (stored in channel rules). Fast callers may need 10 seconds. Callers who post market context before the signal may need 30 seconds.

---

## 12. False Signal Prevention — Confidence Engine

### Enhanced Confidence Scoring

The existing confidence scoring from the PRD is extended with signal-specific rules:

```typescript
// apps/bot/src/parser/signalParser.ts — updated confidence scoring

export function scoreSignal(parsed: ParsedSignal, channelRules: ChannelRules): number {
  let score = 0;
  const reasons: string[] = [];

  // ── Mandatory fields (signal cannot fire without these) ──
  if (!parsed.symbol) return 0;     // No symbol = definitely not a signal
  if (!parsed.side) return 0;       // No direction = cannot trade
  if (!parsed.entry) return 0;      // No entry = cannot size position

  score += 3; // Base score for having all mandatory fields

  // ── Strongly recommended fields ──
  if (parsed.stop_loss) {
    score += 3; // SL is critical for risk management
    reasons.push('SL present');
  } else {
    // No SL in a signal is a major red flag
    // Either incomplete message or informal chat
    reasons.push('WARNING: No SL');
  }

  if (parsed.take_profits.length > 0) {
    score += 2;
    reasons.push(`${parsed.take_profits.length} TP(s) present`);
  }

  // ── Quality indicators ──
  if (parsed.leverage && parsed.leverage !== 10) {
    score += 1; // Explicit leverage mentioned = likely intentional signal
  }

  // ── Sanity checks — these detect false signals ──

  // Check: entry price is reasonable for the symbol
  // BTC should not have entry of 185 (that's SOL's range)
  if (parsed.symbol === 'BTCUSDT' && parsed.entry) {
    if (parsed.entry < 1000 || parsed.entry > 10_000_000) {
      return 0; // Clearly wrong price for BTC
    }
  }

  // Check: SL is on the correct side of entry
  if (parsed.stop_loss && parsed.entry) {
    const slOnWrongSide = (
      (parsed.side === 'Buy' && parsed.stop_loss >= parsed.entry) ||
      (parsed.side === 'Sell' && parsed.stop_loss <= parsed.entry)
    );
    if (slOnWrongSide) {
      score -= 3; // Strong penalty — SL above entry for a long is wrong
      reasons.push('ERROR: SL on wrong side of entry');
    }
  }

  // Check: TP is on the correct side of entry
  if (parsed.take_profits.length > 0 && parsed.entry) {
    const primaryTP = parsed.take_profits[0];
    const tpOnWrongSide = (
      (parsed.side === 'Buy' && primaryTP <= parsed.entry) ||
      (parsed.side === 'Sell' && primaryTP >= parsed.entry)
    );
    if (tpOnWrongSide) {
      score -= 2;
      reasons.push('ERROR: TP on wrong side of entry');
    }
  }

  // Check: Risk/reward ratio is reasonable (at least 1:1)
  if (parsed.entry && parsed.stop_loss && parsed.take_profits.length > 0) {
    const risk = Math.abs(parsed.entry - parsed.stop_loss);
    const reward = Math.abs(parsed.take_profits[0] - parsed.entry);
    const rrRatio = reward / risk;

    if (rrRatio < 0.5) {
      score -= 2; // Terrible R:R is suspicious
      reasons.push(`Poor R:R ratio: ${rrRatio.toFixed(2)}`);
    } else if (rrRatio >= 1.5) {
      score += 1; // Good R:R confirms intent
    }
  }

  return Math.max(0, score);
}

// Final confidence classification
export function classifyConfidence(score: number): 'high' | 'medium' | 'low' | 'failed' {
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  if (score >= 3) return 'low';
  return 'failed';
}

// Execution rules per confidence level:
// high → auto-execute
// medium → auto-execute only if channel has 'allow_medium' flag set
// low → never auto-execute, save signal, alert user for manual review
// failed → discard silently
```

---

## 13. Dynamic Trade Management — Hold to TP2, Break-Even

### The Concept

After a trade is opened, the signal caller may post follow-up messages in the same channel:

```
"🔄 BTCUSDT — hold to TP2, set break-even"
"🔄 BTCUSDT — hold to TP3"
"❌ BTCUSDT — close now"
"🔄 BTCUSDT — update SL to 96900"
```

The bot must read these management messages and modify the open trade accordingly.

### Management Command Parser

```typescript
// apps/bot/src/parser/managementParser.ts

export type ManagementAction =
  | { type: 'HOLD_TO_TP'; tpIndex: number }        // Move TP to TP2/TP3
  | { type: 'SET_BREAKEVEN' }                       // Move SL to entry price
  | { type: 'HOLD_AND_BREAKEVEN'; tpIndex: number } // Both at once
  | { type: 'CLOSE_NOW' }                           // Close immediately
  | { type: 'UPDATE_SL'; newSL: number }            // Move SL to new price
  | { type: 'UPDATE_TP'; newTP: number }            // Move TP to new price
  | null;

export function parseManagementCommand(
  text: string,
  channelTriggerKeyword: string
): { symbol: string | null; action: ManagementAction } {

  const upper = text.toUpperCase();

  // Management commands need the trigger keyword too
  if (!upper.includes(channelTriggerKeyword.toUpperCase())) {
    return { symbol: null, action: null };
  }

  // Extract symbol
  const symbolMatch = upper.match(/\b([A-Z]{2,8})USDT\b/);
  const symbol = symbolMatch ? symbolMatch[0] : null;

  // ── Pattern: "hold to TP2, set break-even" ──
  const holdBreakevenMatch = upper.match(/HOLD\s+TO\s+TP(\d)/);
  const breakevenMentioned = /BREAK[\s-]?EVEN/.test(upper);

  if (holdBreakevenMatch && breakevenMentioned) {
    return {
      symbol,
      action: {
        type: 'HOLD_AND_BREAKEVEN',
        tpIndex: parseInt(holdBreakevenMatch[1]) - 1  // Convert to 0-based index
      }
    };
  }

  // ── Pattern: "hold to TP3" ──
  if (holdBreakevenMatch) {
    return {
      symbol,
      action: {
        type: 'HOLD_TO_TP',
        tpIndex: parseInt(holdBreakevenMatch[1]) - 1
      }
    };
  }

  // ── Pattern: "set break-even" ──
  if (breakevenMentioned && !holdBreakevenMatch) {
    return { symbol, action: { type: 'SET_BREAKEVEN' } };
  }

  // ── Pattern: "close now" / "exit" / "close trade" ──
  if (/\b(CLOSE|EXIT|STOP|CANCEL)\b/.test(upper)) {
    return { symbol, action: { type: 'CLOSE_NOW' } };
  }

  // ── Pattern: "update SL to 96900" ──
  const updateSLMatch = upper.match(/UPDATE\s+SL\s+TO\s+\$?([\d,]+)/);
  if (updateSLMatch) {
    return {
      symbol,
      action: {
        type: 'UPDATE_SL',
        newSL: parseFloat(updateSLMatch[1].replace(/,/g, ''))
      }
    };
  }

  // ── Pattern: "update TP to 99000" ──
  const updateTPMatch = upper.match(/UPDATE\s+TP\s+TO\s+\$?([\d,]+)/);
  if (updateTPMatch) {
    return {
      symbol,
      action: {
        type: 'UPDATE_TP',
        newTP: parseFloat(updateTPMatch[1].replace(/,/g, ''))
      }
    };
  }

  return { symbol, action: null };
}
```

### Executing Management Commands

```typescript
// apps/bot/src/services/tradeManager.ts
import { RestClientV5 } from 'bybit-api';
import { db } from '../db/cocobase.js';
import { parseManagementCommand } from '../parser/managementParser.js';

export async function applyManagementCommand(
  rawMessage: string,
  channelDoc: any
) {
  const { symbol, action } = parseManagementCommand(
    rawMessage,
    channelDoc.trigger_keyword || ''
  );

  if (!action || !symbol) return;

  // Find the user's open trade for this symbol from this channel
  const openTrades = await db.listDocuments("trade_logs", {
    filters: {
      user_id: channelDoc.user_id,
      symbol,
      status: 'filled',
      closed_at: null   // Trade is still open
    }
  });

  if (!openTrades.length) return; // No open trade to manage

  const trade = openTrades[0];

  // Get user's API keys
  const apiKeys = await db.listDocuments("api_keys", {
    filters: { user_id: channelDoc.user_id, exchange: trade.exchange }
  });
  if (!apiKeys.length) return;

  const { decrypt } = await import('../utils/crypto.js');
  const bybitClient = new RestClientV5({
    key: decrypt(apiKeys[0].api_key),
    secret: decrypt(apiKeys[0].api_secret),
    testnet: apiKeys[0].testnet
  });

  switch (action.type) {

    case 'SET_BREAKEVEN': {
      // Move stop loss to entry price
      await bybitClient.setTradingStop({
        category: 'linear',
        symbol,
        stopLoss: String(trade.entry_price),
        positionIdx: 0
      });

      await db.updateDocument("trade_logs", trade.id, {
        stop_loss: trade.entry_price,
        management_actions: [
          ...(trade.management_actions || []),
          { type: 'SET_BREAKEVEN', at: new Date().toISOString() }
        ]
      });

      await sendUserAlert(channelDoc.user_id,
        `🔄 *Break-even set*\n${symbol}: SL moved to entry $${trade.entry_price}`
      );
      break;
    }

    case 'HOLD_TO_TP': {
      // Move the TP to a higher level
      const tpList = trade.all_take_profits || [trade.take_profit];
      const newTP = tpList[action.tpIndex];
      if (!newTP) break;

      await bybitClient.setTradingStop({
        category: 'linear',
        symbol,
        takeProfit: String(newTP),
        positionIdx: 0
      });

      await db.updateDocument("trade_logs", trade.id, {
        take_profit: newTP,
        active_tp_index: action.tpIndex,
        management_actions: [
          ...(trade.management_actions || []),
          { type: 'HOLD_TO_TP', tpIndex: action.tpIndex, newTP, at: new Date().toISOString() }
        ]
      });

      await sendUserAlert(channelDoc.user_id,
        `🔄 *TP updated*\n${symbol}: TP moved to $${newTP} (TP${action.tpIndex + 1})`
      );
      break;
    }

    case 'HOLD_AND_BREAKEVEN': {
      // Move SL to break-even AND extend TP simultaneously
      const tpList = trade.all_take_profits || [trade.take_profit];
      const newTP = tpList[action.tpIndex];
      if (!newTP) break;

      await bybitClient.setTradingStop({
        category: 'linear',
        symbol,
        stopLoss: String(trade.entry_price),  // Break-even
        takeProfit: String(newTP),             // Extended TP
        positionIdx: 0
      });

      await db.updateDocument("trade_logs", trade.id, {
        stop_loss: trade.entry_price,
        take_profit: newTP,
        active_tp_index: action.tpIndex,
        management_actions: [
          ...(trade.management_actions || []),
          {
            type: 'HOLD_AND_BREAKEVEN',
            tpIndex: action.tpIndex,
            newTP,
            newSL: trade.entry_price,
            at: new Date().toISOString()
          }
        ]
      });

      await sendUserAlert(channelDoc.user_id,
        `🔄 *Trade updated*\n${symbol}:\n` +
        `• TP extended to $${newTP} (TP${action.tpIndex + 1})\n` +
        `• SL moved to break-even $${trade.entry_price}`
      );
      break;
    }

    case 'CLOSE_NOW': {
      // Market close the position immediately
      const side = trade.side === 'Buy' ? 'Sell' : 'Buy'; // Opposite side to close
      await bybitClient.submitOrder({
        category: 'linear',
        symbol,
        side,
        orderType: 'Market',
        qty: String(trade.qty),
        reduceOnly: true,
        positionIdx: 0
      });

      await db.updateDocument("trade_logs", trade.id, {
        status: 'closed',
        closed_at: new Date().toISOString(),
        close_reason: 'management_command'
      });

      await sendUserAlert(channelDoc.user_id,
        `🔴 *Position closed*\n${symbol}: Closed by channel management signal`
      );
      break;
    }

    case 'UPDATE_SL': {
      await bybitClient.setTradingStop({
        category: 'linear',
        symbol,
        stopLoss: String(action.newSL),
        positionIdx: 0
      });

      await db.updateDocument("trade_logs", trade.id, {
        stop_loss: action.newSL
      });

      await sendUserAlert(channelDoc.user_id,
        `🔄 *SL updated*\n${symbol}: SL moved to $${action.newSL}`
      );
      break;
    }
  }
}
```

### Where Management Commands Are Detected

In the orchestrator, before the normal signal parser runs, check if the message is a management command:

```typescript
// In orchestrator.ts handleSignal() — insert at the top after trigger keyword check

// ── Check if this is a management command ────────────────
const { symbol: mgmtSymbol, action } = parseManagementCommand(
  rawMessage,
  channelDoc.trigger_keyword || ''
);

if (action !== null) {
  // This is a management message, not a new signal
  await applyManagementCommand(rawMessage, channelDoc);
  return; // Stop here — do not parse as a new trade signal
}

// ── Otherwise: parse as a new signal ─────────────────────
const parsed = parseSignal(rawMessage, channelDoc.signal_rules);
// ... rest of existing flow
```

---

## 14. Signal Rules Dashboard — Frontend Page

### New Page: `/dashboard/channel-rules`

This page lets each user configure how the bot interprets signals from each of their channels.

```tsx
// apps/web/app/(dashboard)/channel-rules/page.tsx

'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/cocobase';
import { useAuth } from '@/hooks/useAuth';

interface ChannelRules {
  trigger_keyword: string;
  buffer_window_seconds: number;
  tp_rule: 'TP1' | 'TP2' | 'TP3' | 'LAST' | 'MIDDLE';
  allow_medium_confidence: boolean;
  management_commands_enabled: boolean;
}

export default function ChannelRulesPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<any[]>([]);
  const [editingChannel, setEditingChannel] = useState<string | null>(null);
  const [rules, setRules] = useState<Record<string, ChannelRules>>({});

  useEffect(() => {
    if (!user) return;
    db.listDocuments("channels", {
      filters: { user_id: user.id }
    }).then(setChannels);
  }, [user]);

  const saveRules = async (channelId: string, channelRules: ChannelRules) => {
    await fetch(`/api/channels/${channelId}/rules`, {
      method: 'PATCH',
      body: JSON.stringify(channelRules),
      headers: { 'Content-Type': 'application/json' }
    });
    setEditingChannel(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-white text-2xl font-bold mb-2">Signal Rules</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Configure how the bot reads signals from each channel.
        These rules prevent false trades and ensure correct execution.
      </p>

      {channels.map(channel => (
        <div key={channel.id}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4">

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold">{channel.channel_name}</h2>
              <p className="text-zinc-500 text-xs">{channel.channel_username}</p>
            </div>
            <button
              onClick={() => setEditingChannel(
                editingChannel === channel.id ? null : channel.id
              )}
              className="text-blue-400 text-sm hover:text-blue-300"
            >
              {editingChannel === channel.id ? 'Close' : 'Configure Rules'}
            </button>
          </div>

          {editingChannel === channel.id && (
            <ChannelRulesForm
              channel={channel}
              onSave={(r) => saveRules(channel.id, r)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ChannelRulesForm({ channel, onSave }: { channel: any; onSave: (r: ChannelRules) => void }) {
  const [form, setForm] = useState<ChannelRules>({
    trigger_keyword: channel.trigger_keyword || '',
    buffer_window_seconds: channel.buffer_window_seconds || 15,
    tp_rule: channel.tp_rule || 'TP1',
    allow_medium_confidence: channel.allow_medium_confidence || false,
    management_commands_enabled: channel.management_commands_enabled !== false
  });

  return (
    <div className="border-t border-zinc-800 pt-4 space-y-5">

      {/* Trigger Keyword */}
      <div>
        <label className="text-white text-sm font-semibold block mb-1">
          Trigger Keyword
          <span className="text-zinc-500 font-normal ml-2">
            — Bot ignores all messages without this word
          </span>
        </label>
        <input
          placeholder="e.g.  🚨SIGNAL  or  #TRADE  or  EXEC:"
          className="w-full bg-zinc-800 text-white rounded-lg p-3 outline-none font-mono"
          value={form.trigger_keyword}
          onChange={e => setForm({...form, trigger_keyword: e.target.value})}
        />
        <p className="text-zinc-500 text-xs mt-1">
          Tell your channel owner to prefix every real signal with this exact word.
          Leave blank to attempt parsing all messages (not recommended).
        </p>
      </div>

      {/* Message Buffer Window */}
      <div>
        <label className="text-white text-sm font-semibold block mb-1">
          Message Buffer Window: {form.buffer_window_seconds}s
          <span className="text-zinc-500 font-normal ml-2">
            — Wait this long after the last message before parsing
          </span>
        </label>
        <input
          type="range" min="5" max="60" step="5"
          className="w-full"
          value={form.buffer_window_seconds}
          onChange={e => setForm({...form, buffer_window_seconds: parseInt(e.target.value)})}
        />
        <div className="flex justify-between text-zinc-600 text-xs mt-1">
          <span>5s (fast callers)</span>
          <span>30s (recommended)</span>
          <span>60s (slow callers)</span>
        </div>
      </div>

      {/* TP Selection Rule */}
      <div>
        <label className="text-white text-sm font-semibold block mb-2">
          Take Profit Rule
          <span className="text-zinc-500 font-normal ml-2">
            — Which TP to use when the signal has multiple
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'TP1', label: 'TP1 — Nearest (safest, fastest profit)' },
            { value: 'TP2', label: 'TP2 — Second target (balanced)' },
            { value: 'MIDDLE', label: 'Middle — Auto-select middle TP' },
            { value: 'LAST', label: 'Last — Furthest (maximum profit, riskier)' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setForm({...form, tp_rule: opt.value as any})}
              className={`p-3 rounded-lg text-left text-sm border transition ${
                form.tp_rule === opt.value
                  ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-zinc-500 text-xs mt-2">
          If the signal has only 1 TP, that TP is always used regardless of this setting.
          You can always extend to TP2/TP3 later using a management command.
        </p>
      </div>

      {/* Medium Confidence Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-semibold">
            Allow Medium Confidence Signals
          </p>
          <p className="text-zinc-500 text-xs">
            Execute signals that are parsed but missing some fields (e.g., no SL).
            Higher risk of false trades.
          </p>
        </div>
        <input
          type="checkbox"
          checked={form.allow_medium_confidence}
          onChange={e => setForm({...form, allow_medium_confidence: e.target.checked})}
          className="w-5 h-5"
        />
      </div>

      {/* Management Commands Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-semibold">
            Enable Management Commands
          </p>
          <p className="text-zinc-500 text-xs">
            Allow the channel to send follow-up commands like "hold to TP2, set break-even"
            that automatically modify open trades.
          </p>
        </div>
        <input
          type="checkbox"
          checked={form.management_commands_enabled}
          onChange={e => setForm({...form, management_commands_enabled: e.target.checked})}
          className="w-5 h-5"
        />
      </div>

      <button
        onClick={() => onSave(form)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
      >
        Save Rules
      </button>
    </div>
  );
}
```

---

## 15. Cocobase Schema Updates

### New and Updated Collections

**`payment_sessions`** — replaces the old `payment_refs` approach:
```javascript
{
  user_id: string,
  user_index: number,               // HD derivation index — permanent
  plan: 'starter' | 'pro',
  solana_usdc_address: string,      // Derived wallet address for Solana
  sui_address: string,              // Derived wallet address for SUI
  chain: 'solana' | 'sui',
  amount_expected: number,          // 29 or 79
  status: 'pending' | 'confirmed' | 'expired' | 'wrong_amount' | 'confirmed_late' | 'failed',
  received_amount: number | null,
  tx_signature: string | null,
  created_at: ISO string,
  expires_at: ISO string,           // created_at + 2 hours
  confirmed_at: ISO string | null
}
```

**`user_indices`** — maps user IDs to their HD derivation index:
```javascript
{
  user_id: string,
  user_index: number,     // Assigned once at registration, never changes
  created_at: ISO string
}
```

**`trade_logs`** — updated with multi-TP and management fields:
```javascript
{
  // ... existing fields ...
  all_take_profits: number[],        // All TPs from the signal, sorted by direction
  active_tp_index: number,           // Which TP is currently set on the exchange (0-based)
  management_actions: [              // Audit trail of management commands applied
    {
      type: string,
      tpIndex?: number,
      newTP?: number,
      newSL?: number,
      at: ISO string
    }
  ],
  close_reason: string | null        // 'tp_hit' | 'sl_hit' | 'management_command' | 'manual'
}
```

**`channels`** — updated with signal rules:
```javascript
{
  // ... existing fields ...
  trigger_keyword: string,           // e.g. "🚨SIGNAL"
  buffer_window_seconds: number,     // Default 15
  tp_rule: 'TP1' | 'TP2' | 'TP3' | 'LAST' | 'MIDDLE',
  allow_medium_confidence: boolean,  // Default false
  management_commands_enabled: boolean  // Default true
}
```

---

## 16. Updated Orchestrator With All Patches

```typescript
// apps/bot/src/services/orchestrator.ts — full updated version

import { db } from '../db/cocobase.js';
import { parseSignal } from '../parser/signalParser.js';
import { classifyConfidence } from '../parser/signalParser.js';
import { containsTriggerKeyword } from '../parser/signalParser.js';
import { getDefaultTPSelection } from '../parser/tpSelector.js';
import { parseManagementCommand } from '../parser/managementParser.js';
import { applyManagementCommand } from './tradeManager.js';
import { executeBybit } from '../executors/bybitExecutor.js';
import { executeBinance } from '../executors/binanceExecutor.js';
import { sendTradeAlert } from './alertBot.js';

export async function handleSignal(
  rawMessage: string,
  messageId: string,
  channelDoc: any
) {
  const userId = channelDoc.user_id;

  // ── GATE 1: Trigger keyword ───────────────────────────────
  if (!containsTriggerKeyword(rawMessage, channelDoc.trigger_keyword || '')) {
    return; // Normal conversation — ignore silently
  }

  // ── GATE 2: Management command check ─────────────────────
  if (channelDoc.management_commands_enabled !== false) {
    const { action } = parseManagementCommand(
      rawMessage,
      channelDoc.trigger_keyword || ''
    );
    if (action !== null) {
      await applyManagementCommand(rawMessage, channelDoc);
      return; // Management command handled — not a new signal
    }
  }

  // ── GATE 3: Deduplication ─────────────────────────────────
  const existing = await db.listDocuments("signals", {
    filters: { channel_id: channelDoc.id, telegram_message_id: messageId }
  });
  if (existing.length > 0) return;

  // ── STEP 1: Parse signal ──────────────────────────────────
  const parsed = parseSignal(rawMessage);
  const score = scoreSignal(parsed, channelDoc);
  const confidence = classifyConfidence(score);

  // ── STEP 2: Determine TP selection ───────────────────────
  let tpSelection = null;
  if (parsed.take_profits.length > 0 && parsed.side) {
    const rule = channelDoc.tp_rule || 'TP1';
    tpSelection = selectTP(parsed.take_profits, rule, parsed.side);
    parsed.take_profits = [tpSelection.initialTP]; // Use selected TP for order
  }

  // ── STEP 3: Save signal to Cocobase ──────────────────────
  const signalDoc = await db.createDocument("signals", {
    channel_id: channelDoc.id,
    user_id: userId,
    telegram_message_id: messageId,
    raw_message: rawMessage,
    parsed,
    confidence,
    confidence_score: score,
    status: 'parsed',
    received_at: new Date().toISOString()
  });

  // ── GATE 4: Confidence threshold ─────────────────────────
  const minRequired = channelDoc.allow_medium_confidence ? 'medium' : 'high';
  if (
    confidence === 'failed' ||
    confidence === 'low' ||
    (confidence === 'medium' && minRequired === 'high')
  ) {
    await db.updateDocument("signals", signalDoc.id, { status: 'skipped' });
    console.log(`⚠️ Skipped: ${confidence} confidence (score ${score})`);
    return;
  }

  // ── GATE 5: User plan check ───────────────────────────────
  const user = await db.auth.getUser(userId);
  if (!user?.data?.plan || user.data.plan === 'free') return;

  // ── GATE 6: Daily trade limit check ──────────────────────
  if (channelDoc.max_trades_per_day) {
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = await db.listDocuments("trade_logs", {
      filters: {
        user_id: userId,
        executed_at: { $gte: `${today}T00:00:00.000Z` }
      }
    });
    if (todayTrades.length >= channelDoc.max_trades_per_day) {
      await db.updateDocument("signals", signalDoc.id, { status: 'daily_limit_reached' });
      return;
    }
  }

  // ── STEP 4: Get API keys ──────────────────────────────────
  const apiKeys = await db.listDocuments("api_keys", {
    filters: { user_id: userId, exchange: channelDoc.exchange }
  });
  if (!apiKeys.length) return;

  // ── STEP 5: Execute trade ─────────────────────────────────
  let result;
  try {
    if (channelDoc.exchange === 'bybit') {
      result = await executeBybit(apiKeys[0], parsed, channelDoc.risk_percent);
    } else {
      result = await executeBinance(apiKeys[0], parsed, channelDoc.risk_percent);
    }
  } catch (err: any) {
    await db.updateDocument("signals", signalDoc.id, { status: 'execution_error' });
    await db.createDocument("error_logs", {
      context: 'orchestrator.executeTrade',
      message: err.message,
      user_id: userId,
      created_at: new Date().toISOString()
    });
    return;
  }

  // ── STEP 6: Log trade ─────────────────────────────────────
  await db.createDocument("trade_logs", {
    user_id: userId,
    signal_id: signalDoc.id,
    channel_id: channelDoc.id,
    exchange: channelDoc.exchange,
    symbol: parsed.symbol,
    side: parsed.side,
    qty: result.qty,
    entry_price: result.entryPrice,
    take_profit: tpSelection?.initialTP || parsed.take_profits[0] || null,
    all_take_profits: tpSelection?.allTPs || parsed.take_profits,
    active_tp_index: tpSelection?.activeTPIndex || 0,
    stop_loss: parsed.stop_loss,
    status: result.success ? 'filled' : 'error',
    error_msg: result.error || null,
    management_actions: [],
    executed_at: new Date().toISOString(),
    closed_at: null,
    pnl: null
  });

  await db.updateDocument("signals", signalDoc.id, {
    status: result.success ? 'executed' : 'failed'
  });

  // ── STEP 7: Alert user ────────────────────────────────────
  if (user.data.telegram_user_id && result.success) {
    await sendTradeAlert(user.data.telegram_user_id, {
      symbol: parsed.symbol!,
      side: parsed.side!,
      qty: result.qty,
      entry_price: result.entryPrice,
      take_profit: tpSelection?.initialTP,
      all_tps: tpSelection?.allTPs,
      stop_loss: parsed.stop_loss,
      status: 'filled',
      exchange: channelDoc.exchange
    });
  }
}
```

---

*SignalCopy Bot — Critical System Patches v1.0*
*Payment Identity · Signal Intelligence · Trade Management*
