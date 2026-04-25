# 🚀 deployment.md
### CopySignal Bot — Full Vercel Deployment Guide
**From localhost → GitHub → Vercel → Production-Ready for 1,000+ Users**

---

## 📌 Table of Contents

1. [Architecture Split — What Goes Where](#1-architecture-split--what-goes-where)
2. [The Critical Vercel Limitation You Must Understand First](#2-the-critical-vercel-limitation-you-must-understand-first)
3. [Pre-Deployment Checklist — Before Touching GitHub](#3-pre-deployment-checklist--before-touching-github)
4. [Setting Up GitHub Repository](#4-setting-up-github-repository)
5. [Preparing Next.js for Production](#5-preparing-nextjs-for-production)
6. [Vercel Account Setup](#6-vercel-account-setup)
7. [Connecting GitHub to Vercel](#7-connecting-github-to-vercel)
8. [Environment Variables on Vercel](#8-environment-variables-on-vercel)
9. [Vercel Project Configuration](#9-vercel-project-configuration)
10. [Your Free .vercel.app URL — No Domain Needed](#10-your-free-vercelapp-url--no-domain-needed)
11. [How Vercel Handles Scale — 1,000+ Concurrent Users](#11-how-vercel-handles-scale--1000-concurrent-users)
12. [Multi-Region — Serving Users Globally](#12-multi-region--serving-users-globally)
13. [Real-Time Dashboard on Vercel — The Fix](#13-real-time-dashboard-on-vercel--the-fix)
14. [Preview Deployments — Test Before Going Live](#14-preview-deployments--test-before-going-live)
15. [Continuous Deployment — Push to Deploy](#15-continuous-deployment--push-to-deploy)
16. [Security on Vercel](#16-security-on-vercel)
17. [Vercel Free Tier Limits — Know Before You Hit Them](#17-vercel-free-tier-limits--know-before-you-hit-them)
18. [When to Upgrade to Vercel Pro](#18-when-to-upgrade-to-vercel-pro)
19. [Risks to Avoid — Most Common Mistakes](#19-risks-to-avoid--most-common-mistakes)
20. [Full Pre-Launch Checklist](#20-full-pre-launch-checklist)

---

## 1. Architecture Split — What Goes Where

Before deploying anything, be crystal clear on what lives where. Mixing these up is the number one cause of failed deployments.

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (This Document)                    │
│                                                             │
│  apps/web — Next.js 14 Frontend                             │
│  ├── Landing page (/)                                       │
│  ├── Auth pages (/login, /register)                         │
│  ├── Dashboard pages (/dashboard/*)                         │
│  ├── API routes (/api/channels, /api/apikeys, etc.)         │
│  └── Billing page (/dashboard/billing)                      │
│                                                             │
│  SERVES: UI, server-side rendering, API endpoints           │
│  DOES NOT: run the Telegram bot, execute trades             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      FLY.IO (Separate)                      │
│                                                             │
│  apps/bot — Node.js Bot Engine                              │
│  ├── Telegram signal listener (24/7 persistent)             │
│  ├── Signal parser                                          │
│  ├── Bybit / Binance trade executor                         │
│  ├── Solana + SUI payment watchers                          │
│  └── Daily subscription cron job                            │
│                                                             │
│  SERVES: All persistent background processes                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     COCOBASE (External)                      │
│  Database, Auth, Real-time WebSocket relay                  │
└─────────────────────────────────────────────────────────────┘
```

**Rule:** Vercel runs only the Next.js web app. Everything that must stay alive permanently — Telegram listener, trade executor, payment watcher — runs on Fly.io. These two never swap roles.

---

## 2. The Critical Vercel Limitation You Must Understand First

Vercel uses **serverless functions**. Every API route in your Next.js app is a function that:
- Spins up on demand when a request arrives
- Executes your code
- Shuts down after the response is sent
- Has a **maximum execution time of 10 seconds** (free tier) or 60 seconds (Pro)

**What works perfectly on Vercel:**
- Serving dashboard pages and UI
- API routes that read/write from Cocobase (fast, under 1 second)
- Auth: login, register, session checks
- Fetching trade history, channel list, user plan status

**Cannot run on Vercel — put these on Fly.io:**
- The Telegram listener (needs a persistent always-on connection)
- Trade executors (long-running per-user processes)
- SUI payment watcher (polls every 10 seconds indefinitely)
- Cron jobs for subscription expiry

**The real-time dashboard is solved without WebSockets on Vercel:**
Vercel does not support WebSocket servers in serverless functions. However, your trade feed connects directly from the user's browser to Cocobase's WebSocket — it never goes through Vercel at all. Vercel serves the initial page. The browser establishes the WebSocket to Cocobase. This works perfectly. See Section 13.

---

## 3. Pre-Deployment Checklist — Before Touching GitHub

### Code Readiness
- [ ] `npm run build` runs successfully in `apps/web` with zero errors
- [ ] `npm run lint` returns zero errors
- [ ] All `console.log()` statements printing sensitive data are removed
- [ ] No hardcoded API keys, secrets, or wallet addresses in source code
- [ ] All secrets are read via `process.env.VARIABLE_NAME` — never inline

### Create .env.example

This is the one env file you DO commit. It shows the structure with no real values:

```bash
# apps/web/.env.example

NEXT_PUBLIC_COCOBASE_API_KEY=
NEXT_PUBLIC_COCOBASE_PROJECT_ID=

NEXTAUTH_SECRET=
NEXTAUTH_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_SOLANA_WALLET_ADDRESS=
SOLANA_WALLET_ADDRESS=

NEXT_PUBLIC_SUI_WALLET_ADDRESS=
SUI_WALLET_ADDRESS=

BOT_API_URL=
NEXT_PUBLIC_URL=
```

### .gitignore — Absolute Requirements

Your `apps/web/.gitignore` must contain these:

```gitignore
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production

node_modules/
.next/
out/
.vercel

npm-debug.log*
.DS_Store
*.tsbuildinfo
next-env.d.ts
```

Verify your env files are ignored before proceeding:
```bash
cd apps/web
git check-ignore -v .env.local
# Output should show: .gitignore:1:.env.local
# If nothing prints, your file is NOT being ignored — fix now
```

---

## 4. Setting Up GitHub Repository

### Step 1 — Create the Repository

1. Go to **https://github.com/new**
2. Name: `copysignal-bot`
3. Visibility: **Private** — this is a revenue-generating product
4. Do NOT initialize with README (you have existing code)
5. Click **Create repository**

### Step 2 — Push Your Code

```bash
# From your project root: copysignal-bot/

git init
git remote add origin https://github.com/YOUR_USERNAME/copysignal-bot.git

# Stage all files
git add .

# CRITICAL: Verify no .env files are staged
git status
# Scan the output carefully. If you see any .env file listed, STOP.
# Fix .gitignore first, then: git rm --cached apps/web/.env.local

git commit -m "Initial commit — CopySignal Bot"
git push -u origin main
```

### Step 3 — Verify on GitHub

Open your repo on GitHub. Navigate to `apps/web/`. You must see:
- YES: `app/`, `components/`, `lib/`, `package.json`, `.env.example`
- NO: `.env.local`, `.env`, or any file with real secrets

If you see any real env file there, remove it immediately:
```bash
git rm --cached apps/web/.env.local
git commit -m "Remove accidentally committed env file"
git push
```

### Branch Strategy

Use exactly two branches:

| Branch | Purpose |
|---|---|
| `main` | Production — deploys to your live .vercel.app URL |
| `dev` | Development — every push gets a unique Vercel preview URL |

```bash
git checkout -b dev
git push -u origin dev
```

All coding happens on `dev`. Merge to `main` only when a feature is fully tested.

---

## 5. Preparing Next.js for Production

### next.config.js

```javascript
// apps/web/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // DO NOT set output: 'standalone' — that is Docker/Fly.io only
  // Vercel manages its own build output format automatically

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile pictures
      }
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

### Validate Build Locally First

Always run a production build on your machine before deploying. If it fails here, it will fail on Vercel:

```bash
cd apps/web
npm run build

# Look for:
# ✓ Compiled successfully — good
# ✗ Failed to compile — fix errors before pushing
# Check: pages/routes with no TypeScript errors
# Check: all import paths are correct
```

### Environment Variable Validation at Startup

Add this to catch missing env vars before they cause silent failures in production:

```typescript
// apps/web/lib/validateEnv.ts
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_COCOBASE_API_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

export function validateEnv() {
  if (typeof window !== 'undefined') return; // Server-side only
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[CopySignal] Missing required environment variables:\n${missing.join('\n')}\n` +
      `Add these to your Vercel project settings → Environment Variables.`
    );
  }
}
```

Call `validateEnv()` in your root `layout.tsx` server component.

---

## 6. Vercel Account Setup

### Create Account

1. Go to **https://vercel.com**
2. Click **Sign Up**
3. Use **Continue with GitHub** — this links your accounts automatically
4. Select **Hobby (Free)** plan for now

### Enable Spend Protection IMMEDIATELY

Before any deployment, protect yourself from surprise bills:

1. Go to **Account Settings → Billing**
2. Enable **Spend Management**
3. Set monthly cap: **$0** (blocks all overages — you get an email and can decide to increase)
4. This means if you accidentally go viral, you get an email instead of a $500 bill

### Install Vercel CLI (Useful for Managing Secrets)

```bash
npm install -g vercel
vercel login
# Opens browser for GitHub auth
```

Useful CLI commands:
```bash
vercel env add VARIABLE_NAME production   # Add env var
vercel env ls                              # List all env vars
vercel logs --follow                       # Stream live logs
vercel --prod                              # Deploy to production manually
vercel rollback                            # Instantly revert last deployment
```

---

## 7. Connecting GitHub to Vercel

### Import Project

1. Go to **https://vercel.com/new**
2. Click **Import Git Repository**
3. Select your `copysignal-bot` repository
4. Click **Import**

### Configure — This Step Is Critical

Vercel auto-detects Next.js, but you must change the root directory:

**Root Directory:** Click **Edit** → type `apps/web`

Without this, Vercel tries to build from the repo root and immediately fails because there is no `next.config.js` there.

**Build Command:** `next build` (leave default)
**Output Directory:** `.next` (leave default)
**Install Command:** `npm install` (leave default)

Do NOT click Deploy yet. Add environment variables first (Section 8).

---

## 8. Environment Variables on Vercel

Vercel has three environments. Set variables for both **Production** and **Preview**:

### Add via Dashboard

Vercel → Project → Settings → Environment Variables → Add New

### Every Variable Required

```
NEXT_PUBLIC_COCOBASE_API_KEY
  Value: your Cocobase public API key
  Environments: Production, Preview

NEXT_PUBLIC_COCOBASE_PROJECT_ID
  Value: your Cocobase project ID
  Environments: Production, Preview

NEXTAUTH_SECRET
  Value: run `openssl rand -base64 32` to generate
  Environments: Production, Preview

NEXTAUTH_URL
  Value: https://YOUR-APP-NAME.vercel.app
  Environments: Production
  Note: Set this AFTER first deploy when you know your URL. Use http://localhost:3000 for Development.

GOOGLE_CLIENT_ID
  Value: from Google Cloud Console OAuth credentials
  Environments: Production, Preview

GOOGLE_CLIENT_SECRET
  Value: from Google Cloud Console OAuth credentials
  Environments: Production, Preview

NEXT_PUBLIC_SOLANA_WALLET_ADDRESS
  Value: your Solana USDC receiving wallet address
  Environments: Production, Preview

SOLANA_WALLET_ADDRESS
  Value: same Solana wallet (server-side reference)
  Environments: Production, Preview

NEXT_PUBLIC_SUI_WALLET_ADDRESS
  Value: your SUI receiving wallet address
  Environments: Production, Preview

SUI_WALLET_ADDRESS
  Value: same SUI wallet (server-side reference)
  Environments: Production, Preview

NEXT_PUBLIC_URL
  Value: https://YOUR-APP-NAME.vercel.app
  Environments: Production, Preview

BOT_API_URL
  Value: https://your-bot-name.fly.dev
  Environments: Production, Preview
```

### The NEXT_PUBLIC_ Rule — Critical

Variables starting with `NEXT_PUBLIC_` are embedded in the browser JavaScript bundle. Anyone can see them in DevTools. This is intentional for public values.

**Safe for NEXT_PUBLIC_:**
- Cocobase public API key (designed to be public — it's read-only)
- Wallet addresses (these are public blockchain addresses anyway)
- Your app's URL

**Never put in NEXT_PUBLIC_:**
- NEXTAUTH_SECRET
- Google client secret
- Any private key or server-only token

---

## 9. Vercel Project Configuration

### vercel.json

Create this at `apps/web/vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

### Health Check Endpoint

```typescript
// apps/web/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'local'
  });
}
```

Visit `https://your-app.vercel.app/api/health` after deploy to confirm everything is running.

### Google OAuth — Update Authorized Redirect URIs

After getting your `.vercel.app` URL, go to Google Cloud Console:
1. APIs & Services → Credentials → Your OAuth Client
2. Add to **Authorized JavaScript Origins:**
   `https://your-app.vercel.app`
3. Add to **Authorized Redirect URIs:**
   `https://your-app.vercel.app/api/auth/callback/google`
4. Save

Without this, Google OAuth will reject login attempts on the live URL.

---

## 10. Your Free .vercel.app URL — No Domain Needed

The moment your first deploy succeeds, Vercel gives you a URL like:

```
https://copysignal-bot-abc123.vercel.app
```

This URL is:
- **Permanent** — never changes as long as the project exists
- **HTTPS automatic** — SSL certificate provisioned in seconds, no setup
- **Globally cached** — static assets served from 40+ edge locations
- **Free forever** — even after upgrading plans
- **Shareable immediately** — send to beta testers today

**You do not need a custom domain to start making money.** Users don't care that the URL ends in `.vercel.app` during beta. When you buy a domain later, you add it to Vercel settings and it goes live within 48 hours. Your `.vercel.app` URL continues working in parallel.

**After your first successful deploy — update NEXTAUTH_URL:**
Go to Vercel → Settings → Environment Variables and set `NEXTAUTH_URL` to your exact `.vercel.app` URL. Then push a small change to trigger a redeploy. Without this, NextAuth sessions won't work correctly.

---

## 11. How Vercel Handles Scale — 1,000+ Concurrent Users

### The Serverless Auto-Scaling Model

Traditional servers have a fixed number of workers. Under heavy load, requests queue. Eventually the server crashes.

Vercel's serverless model works differently:

```
1 user hits your dashboard     → 1 function instance spins up
500 users hit simultaneously   → 500 function instances spin up in parallel
1,000 users hit simultaneously → 1,000 function instances spin up in parallel
Traffic drops                  → instances shut down automatically
```

Each instance is isolated. No shared memory. No request queue. No bottleneck at Vercel. **This scaling is completely automatic — you configure nothing.**

### Where the Real Bottleneck Is

At 1,000 concurrent users, Vercel is not your problem. These are:

**Cocobase concurrent connections:**
1,000 users with open dashboards = 1,000 WebSocket connections to Cocobase. Check your Cocobase plan allows this. If it caps at 100, upgrade Cocobase first.

**Cocobase read throughput:**
1,000 users loading dashboards simultaneously = approximately 5,000 database reads in a burst. Verify your Cocobase plan's rate limits cover this.

**Your API route cold starts:**
On the free tier, if a function hasn't been called in a while, the first request takes ~100–300ms to start. Under constant load (1,000 users), functions stay warm and respond in ~20–50ms. This is a non-issue at real scale.

### Optimizations to Do Before Launch

**Cache the landing page:**
```typescript
// apps/web/app/page.tsx
export const revalidate = 3600; // Regenerate at most once per hour
```

**Use SWR for dashboard data with sensible intervals:**
```typescript
import useSWR from 'swr';

const { data: trades } = useSWR('/api/trades', fetcher, {
  refreshInterval: 30000,      // Poll every 30 seconds — not every second
  dedupingInterval: 5000,      // Ignore duplicate calls within 5 seconds
  revalidateOnFocus: false,    // Don't re-fetch when tab regains focus
});
```

**Add cache headers to trade history responses:**
```typescript
// apps/web/app/api/trades/route.ts
return NextResponse.json(trades, {
  headers: {
    'Cache-Control': 's-maxage=30, stale-while-revalidate=60'
  }
});
```

---

## 12. Multi-Region — Serving Users Globally

### How Vercel's Edge Network Works

Vercel runs **edge nodes in 40+ cities worldwide.** Static assets (HTML, CSS, JavaScript) are cached at every edge location. A user in Lagos, Nigeria gets your landing page from a nearby African edge node — not from a US server.

API functions run in a configurable region. Set this to wherever Cocobase is hosted to minimize DB latency.

### Setting Your Function Region

1. Vercel → Project → Settings → Functions
2. Set **Function Region** to closest to your Cocobase server
3. Default is `iad1` (Washington DC, US East) — fine as a starting point

### Middleware Runs at the Edge Globally

Route protection via middleware executes at the nearest edge location to every user:

```typescript
// apps/web/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname.startsWith('/login') && req.nextauth.token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token; // Must be logged in
        }
        return true;
      }
    }
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
};
```

A user in Singapore hitting `/dashboard` without auth is redirected from a Singapore edge node — response time under 10ms regardless of where your functions run.

---

## 13. Real-Time Dashboard on Vercel — The Fix

### The Perceived Problem

Vercel serverless functions cannot hold open WebSocket connections. This appears to break the real-time trade feed.

### Why It Does Not Actually Break Anything

Your real-time trade feed does not run through Vercel. The flow is:

```
[Vercel] serves the dashboard page HTML/JS
         ↓
[User's Browser] loads the page
         ↓
[Browser] runs the React component which calls db.watchCollection()
         ↓
[Browser] opens a WebSocket connection directly to [Cocobase Servers]
         ↓
New trade happens → Fly.io bot writes to Cocobase
                  → Cocobase pushes event over WebSocket
                  → Browser receives it instantly
                  → React state updates
                  → Trade appears in dashboard without refresh
```

Vercel is only involved in step 1. The persistent WebSocket connection is between the user's browser and Cocobase — Vercel is not in this path at all.

Your existing `TradeFeed.tsx` code works exactly as written:

```typescript
useEffect(() => {
  const connection = db.watchCollection("trade_logs", (event) => {
    if (event.type === 'create' && event.data.user_id === user.id) {
      setTrades(prev => [event.data, ...prev]);
    }
  });
  return () => connection.close();
}, [user]);
```

This executes entirely in the browser. Zero changes needed.

### Polling Fallback for Reliability

Add SWR polling alongside the WebSocket for users behind corporate firewalls that block WebSockets:

```typescript
// Runs even if WebSocket is blocked — data refreshes every 30 seconds as a fallback
const { data: polledTrades } = useSWR('/api/trades?limit=10', fetcher, {
  refreshInterval: 30000
});
```

---

## 14. Preview Deployments — Test Before Going Live

Every push to a branch other than `main` gets its own unique Vercel URL:

```
Push to: dev branch
→ Vercel deploys to: https://copysignal-bot-git-dev-yourusername.vercel.app
```

### Testing Workflow

```bash
# Develop on dev branch
git checkout dev

# Build your feature, test locally
# ...

# Push to get a preview deployment
git add .
git commit -m "Add subscription warning card"
git push origin dev

# Vercel deploys in ~90 seconds
# Check your Vercel dashboard for the preview URL
# Test extensively on the preview URL
# Share the preview URL with 1-2 beta testers for feedback

# When satisfied, merge to production
git checkout main
git merge dev
git push origin main
# Production deploys automatically
```

### Separate Preview Database

To avoid beta testers touching real user data, point preview deployments at a test Cocobase project:

1. Vercel → Settings → Environment Variables
2. Set `NEXT_PUBLIC_COCOBASE_API_KEY` to different values per environment:
   - Production: your real Cocobase project key
   - Preview: a separate test Cocobase project key

---

## 15. Continuous Deployment — Push to Deploy

Once GitHub is connected, the full workflow is:

```
You write code locally
       ↓
git add . && git commit -m "description" && git push origin main
       ↓
GitHub receives the push → triggers Vercel webhook
       ↓
Vercel pulls latest code from GitHub
       ↓
npm install → npm run build
       ↓
Build succeeds → atomic swap: new version goes live (zero downtime)
Build fails → previous version stays live, you get a build failure email
```

Your users never see a broken state during deployments. If the build fails, nothing changes for them.

### Instant Rollback

If a new deployment breaks something:

1. Vercel Dashboard → Deployments tab
2. Find the last working deployment
3. Click three dots → **Promote to Production**
4. Previous version is live again in under 10 seconds

No git revert needed. No code changes. Instant.

---

## 16. Security on Vercel

### Always Verify Session in Every API Route

Never trust a user ID from the request body. Always extract it from the verified server session:

```typescript
// apps/web/app/api/channels/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/cocobase';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.cocobaseId; // From verified session — not request body

  // Always filter by userId — never return all documents
  const channels = await db.listDocuments("channels", {
    filters: { user_id: userId }
  });

  return NextResponse.json(channels);
}
```

### Rate Limiting with Upstash

Prevent API abuse:

```bash
npm install @upstash/ratelimit @upstash/redis
```

Sign up at **upstash.com** — free tier is 10,000 requests/day, enough for early users.

```typescript
// apps/web/lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '60 s'), // 20 requests per minute per IP
});

// Usage at the top of any API route:
// const ip = req.headers.get('x-forwarded-for') || 'anonymous';
// const { success } = await rateLimiter.limit(ip);
// if (!success) return new Response('Too Many Requests', { status: 429 });
```

Add these Upstash env vars to Vercel:
```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Security Headers (Already in next.config.js)

Verify headers are working after deployment:
1. Open your live URL in Chrome
2. DevTools → Network → click any request → Response Headers
3. You should see `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, etc.

### Never Log Sensitive Data

```typescript
// Bad — this would print user's encrypted API key to Vercel logs
console.log('User data:', user);

// Good — log only what you need
console.log('Trade executed for user:', userId, 'symbol:', symbol);
```

Vercel logs are viewable by anyone with access to your Vercel project. Keep them clean.

---

## 17. Vercel Free Tier Limits — Know Before You Hit Them

| Resource | Free Limit | What Exceeds It |
|---|---|---|
| Bandwidth | 100 GB/month | ~50,000 active sessions/month |
| Function Invocations | 1,000,000/month | ~33,000 API calls/day |
| Concurrent Executions | 1,000 | 1,000 simultaneous API hits |
| Build Minutes | 6,000/month | ~100 deployments/month |
| Function Max Duration | 10 seconds | Any API call taking over 10s |
| Custom Domains | Unlimited on Pro | N/A on Hobby (use .vercel.app) |
| Team Members | 1 (you) | Adding collaborators |

### Reality Check: When You Actually Hit These

**At 50 paying users:** You're nowhere near any limit. Bandwidth under 5GB, invocations under 100k/month.

**At 200 paying users:** Bandwidth approaches 20-30GB. Still fine. Invocations still under limit.

**At 500 paying users:** Time to upgrade to Pro ($20/month). You're generating $14,500-$39,500/month. The $20 Vercel bill is irrelevant.

### Commercial Use Policy

Vercel Hobby (free) plan technically restricts commercial use. For legal compliance:
- Pre-revenue testing: Hobby is fine
- First paying customer: upgrade to Pro ($20/month)

---

## 18. When to Upgrade to Vercel Pro

Upgrade when any one of these is true:

- [ ] You have your first paying subscriber
- [ ] Any API route consistently runs close to 10 seconds
- [ ] Monthly bandwidth exceeds 80 GB
- [ ] You need a team member added to the project
- [ ] You want password-protected preview deployments for private beta
- [ ] You need function timeouts up to 60 seconds

Pro is $20/month. Your Starter plan ($29/month) covers it with the first subscriber's payment. The math is simple.

---

## 19. Risks to Avoid — Most Common Mistakes

### RISK 1 — Secrets Committed to GitHub
**What happens:** You push `.env.local` to GitHub. Bots scan public and private repos constantly. Your Cocobase key, Google OAuth secret, or NextAuth secret is stolen within hours. Accounts compromised.

**Prevention:** Triple-check `.gitignore` before every push. Run `git status` and read every line before `git commit`. If you ever accidentally push secrets, rotate them immediately — do not just delete the file and push again. The secret is still in git history.

---

### RISK 2 — Root Directory Not Set to apps/web
**What happens:** Vercel tries to build from repo root. No `next.config.js` found. Build fails immediately. Nothing deploys.

**Prevention:** In Vercel project settings, Root Directory = `apps/web`. This is set once during project setup. Verify it before clicking Deploy for the first time.

---

### RISK 3 — NEXTAUTH_URL Not Updated After First Deploy
**What happens:** NextAuth generates session cookies tied to `http://localhost:3000`. Users on the live site can't log in. Google OAuth redirects to wrong callback URL. Auth is completely broken.

**Prevention:** After first deploy, immediately update `NEXTAUTH_URL` in Vercel env vars to `https://your-actual-app.vercel.app`. Trigger a redeploy by pushing any small change.

---

### RISK 4 — Google OAuth Redirect URIs Not Updated
**What happens:** User clicks "Continue with Google". Google redirects to the callback URL. Google rejects it because `https://your-app.vercel.app/api/auth/callback/google` is not in the authorized redirect URIs list. Error: `redirect_uri_mismatch`.

**Prevention:** After getting your `.vercel.app` URL, go to Google Cloud Console → OAuth credentials → add the full callback URL to Authorized Redirect URIs.

---

### RISK 5 — Bot Engine Attempted on Vercel
**What happens:** Developer puts the Telegram listener in a Vercel API route. It connects to Telegram successfully. After 10 seconds, Vercel's function timeout kills it. The connection drops. Signals are missed indefinitely.

**Prevention:** The bot (apps/bot) goes only on Fly.io. Never on Vercel. This is not a workaround — it is the correct architecture for persistent processes.

---

### RISK 6 — NEXT_PUBLIC_ Variables Containing Secrets
**What happens:** Developer writes `NEXT_PUBLIC_NEXTAUTH_SECRET=xxx`. Next.js embeds it in the browser JavaScript bundle. Anyone opens DevTools → Sources and reads your secret. All sessions can be forged.

**Prevention:** Only public, non-sensitive values go in `NEXT_PUBLIC_` variables. See Section 8 for the full list of what is and is not safe.

---

### RISK 7 — No Spend Protection Set
**What happens:** Your bot goes viral. 5,000 users in one day. Vercel free tier exceeded. You have no cap set. $800 bill arrives at the end of the month.

**Prevention:** Enable Spend Management in Vercel billing settings within the first 5 minutes of creating your account. Set a hard cap of $0 initially. You will receive an email if you approach the limit and can decide to increase it.

---

### RISK 8 — Missing Env Variables in Production
**What happens:** New feature uses `process.env.NEW_API_KEY`. Works locally. Pushed to production. `process.env.NEW_API_KEY` is `undefined` on Vercel because you forgot to add it. Feature silently fails or throws a 500 error.

**Prevention:** Before every merge to `main`, compare your `.env.example` against your Vercel env vars list. They should always match. The env validator in Section 5 will also catch this at startup.

---

### RISK 9 — Deploying Untested Code to Main
**What happens:** You push directly to main without testing on the `dev` preview first. Production is broken. Real users can't log in. Signals stop.

**Prevention:** All development on `dev` branch. All testing on preview URLs. Main receives only code that has been verified working on a preview deployment.

---

### RISK 10 — Cocobase WebSocket Limit Exceeded
**What happens:** 200 users are logged into the dashboard simultaneously. Each holds a WebSocket connection to Cocobase. Cocobase's free tier has a concurrent connection limit. Connections start getting rejected. Real-time updates stop for some users.

**Prevention:** Check Cocobase's concurrent connection limit for your plan before launch. Implement the SWR polling fallback (Section 13) so data still refreshes even if the WebSocket can't connect.

---

## 20. Full Pre-Launch Checklist

Complete every item before sharing the URL with anyone.

### GitHub
- [ ] Repository is Private
- [ ] `.env.local` and all `.env.*` files are absent from GitHub
- [ ] `.env.example` is present with correct key names and empty values
- [ ] `dev` branch created for development work
- [ ] Production code only on `main`

### Vercel Project
- [ ] Root Directory set to `apps/web`
- [ ] Spend Management enabled with monthly cap
- [ ] All environment variables added (verify against `.env.example`)
- [ ] First build succeeded — green checkmark in Deployments tab
- [ ] `NEXTAUTH_URL` updated to actual `.vercel.app` URL
- [ ] Google OAuth redirect URIs updated in Google Cloud Console

### Next.js Code
- [ ] `npm run build` succeeds locally with zero errors
- [ ] `npm run lint` returns zero errors
- [ ] No secrets hardcoded anywhere
- [ ] `next.config.js` has security headers
- [ ] `output: 'standalone'` is NOT present in next.config.js

### Auth System
- [ ] Google OAuth login works on live URL
- [ ] Email/password registration creates user in Cocobase
- [ ] New accounts automatically receive 5-day Pro trial
- [ ] Returning to `/dashboard` without login redirects to `/login`
- [ ] Session persists correctly across page refreshes

### Dashboard
- [ ] Real-time trade feed updates without page refresh
- [ ] Add Channel form works and creates Cocobase document
- [ ] API Key form saves encrypted keys
- [ ] Billing page displays correct plan and payment instructions
- [ ] Subscription warning card appears with 3 or fewer days remaining

### Security Verification
- [ ] API routes return 401 when called without a session
- [ ] Security headers visible in browser DevTools → Network → Response Headers
- [ ] `/api/health` returns 200 and correct version
- [ ] No sensitive data visible in Vercel logs

### Bot Integration (Fly.io)
- [ ] `fly status` shows bot machine as running
- [ ] Test signal in watched Telegram channel triggers a trade log in Cocobase
- [ ] New trade log appears in dashboard in real time
- [ ] Telegram alert arrives after test execution

---

## Quick Reference URLs

| What | URL |
|---|---|
| Vercel Dashboard | https://vercel.com/dashboard |
| Your Live App | https://your-project.vercel.app |
| Vercel Logs | https://vercel.com/[team]/[project]/logs |
| Vercel Deployments | https://vercel.com/[team]/[project]/deployments |
| Environment Variables | https://vercel.com/[team]/[project]/settings/environment-variables |
| Vercel Billing | https://vercel.com/account/billing |
| Google OAuth Setup | https://console.cloud.google.com/apis/credentials |
| Upstash (Rate Limiting) | https://upstash.com |
| GitHub Repository | https://github.com/YOUR_USERNAME/copysignal-bot |

---

*deployment.md — CopySignal Bot*
*Vercel · GitHub · Production-Ready for 1,000+ Users*
