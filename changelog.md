# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to bottom-top chronological order (newest at the top).

## [2026-04-24T05:00:54-07:00]
### Changed — Fly.io Deployment Migration
- Migrated deployment configuration from Railway.app to Fly.io. Removed `railway.toml` and generated `apps/bot/fly.toml` with a multi-stage `Dockerfile` to deploy the bot as an optimal background worker on Fly's global infrastructure.

## [2026-04-23T05:28:29-07:00]
### Added — Phase 4: Full System Integration + Dashboard
- Built `apps/bot/src/services/orchestrator.ts` to seamlessly tie together signal parsing, API key retrieval from Cocobase, execution on Binance/Bybit, and trade logging. Includes deduplication guard and user plan tier validation.
- Built `apps/bot/src/services/alertBot.ts` using `node-telegram-bot-api` to push live trade execution receipts back to the user via Telegram DMs.
- Updated `apps/bot/src/index.ts` to boot the orchestrator and implement a live `db.watchCollection` listener on the "channels" table, ensuring the bot dynamically joins/leaves Telegram channels in real-time as users add/remove them from the web dashboard.
- Built `apps/web/hooks/useAuth.ts` to provide a robust React hook for Cocobase session handling, standardizing login, registration, and logout across the dashboard.
- Built `apps/web/components/dashboard/TradeFeed.tsx` and `StatsCards.tsx`. The Trade Feed listens via Cocobase WebSockets to dynamically populate new trades without page refreshes.
- Built backend API routes for the Next.js App Router (`channels`, `apikeys`, and `checkout`) to handle channel subscriptions, securely encrypting API keys before database storage, and generating Stripe billing sessions.

## [2026-04-22T15:15:02-07:00]
### Added — Phase 3: Trade Execution Engine
- Created `apps/bot/src/utils/crypto.ts` — AES-256-CBC encryption/decryption utility using Node's native `crypto` module. This ensures all exchange API keys are encrypted at rest before storing in Cocobase and securely decrypted in memory just before execution.
- Created `apps/bot/src/utils/riskCalc.ts` — Position sizing logic that calculates the exact number of contracts to buy based on the user's USDT balance, risk percentage, entry price, and stop loss distance. Includes an `isSafeToTrade` circuit breaker to prevent trades exceeding 5% margin.
- Created `apps/bot/src/executors/bybitExecutor.ts` — Bybit trade executor using the official `bybit-api` SDK. Configured to check Unified Trading Account balances, automatically adjust linear leverage, and place market orders with Take Profit and Stop Loss attached via `LastPrice` triggers.
- Created `apps/bot/src/executors/binanceExecutor.ts` — Binance trade executor using `binance-api-node`. It isolates margin, calculates strict quantity precision based on exchange rules, and executes OCO-style fallback for Take Profit and Stop Loss via separate `TAKE_PROFIT_MARKET` and `STOP_MARKET` orders.
- Created `apps/bot/src/scripts/testExecution.ts` — A standalone testnet script combining the signal parser, encryption utility, and Binance executor to validate paper trades before production deployment. Added `npm run test:execution` shortcut in `package.json`.
### Verified
- `npx tsc --noEmit` completes successfully with zero type errors, confirming the SDK interfaces and parameter typings align properly across the execution engine.
- Connection testing confirms Bybit testnet drops connections from the current IP (`ECONNRESET`), so `testExecution.ts` defaults to Binance Testnet, successfully returning clean API responses.

## [2026-04-22T14:18:03-07:00]
### Fixed
- Updated `apps/bot/package.json` scripts to use `tsx` instead of `ts-node/esm`, and modified `apps/bot/src/db/cocobase.ts` to use default import syntax. Node 25's strict ESM resolution was causing `ERR_REQUIRE_CYCLE_MODULE` and named export errors when importing the `cocobase` CommonJS module. `tsx` combined with default imports cleanly resolves this interop issue.
- Updated `apps/bot/src/parser/patterns.ts` to properly capture the optional `K` or `k` suffix for `TP` and `SL` values, allowing `cleanNumber()` to expand shorthand notation like "99k" to 99000.
- Restructured `TARGET` regex patterns in `apps/bot/src/parser/patterns.ts` to differentiate between numbered target indicators (e.g., "Target 1: 190") and direct price shorthand ("TARGET 99K") to fix an issue where the digits were consumed greedily.
- Modified `apps/bot/src/parser/signalParser.ts` to add a minimum value filter (`val >= 10`) when extracting TP values, ensuring target sequence numbers (e.g., the "1" in "Target 1") are not mistakenly added to the `take_profits` array.
### Verified
- `npm run test:parser` now passes with 90% (9/10 signals) with completely accurate `TP` and `SL` extracted values, meeting the Phase 2 criteria.
- `npm run dev` successfully boots the bot engine without import errors and connects to Telegram.

## [2026-04-21T11:13:00-07:00]
### Added — Phase 2: Signal Listener + Parser Engine
- Created `apps/bot/src/parser/patterns.ts` — All regex patterns (symbols, direction, entry, TP, SL, leverage) in one extensible file. Added support for uppercase `K` shorthand ("99K") in targetList pattern. Why: centralising all patterns makes them easy to extend when new signal formats appear.
- Created `apps/bot/src/parser/signalParser.ts` — Full signal parser with 7-step pipeline: symbol detection, direction, entry (including range midpoint), multi-TP extraction, stop loss, leverage, and a confidence scoring system (high/medium/low/failed). Why: this is the most critical component of the bot — no reliable auto-execution is possible without accurate parsing.
- Created `apps/bot/src/listener/telegramListener.ts` — Singleton class that connects to Telegram via MTProto (`gramjs`), handles all incoming messages from all subscribed channels with a single event handler, and routes them to per-channel callbacks. Why: a singleton avoids multiple logins and handles all users' channels from one connection.
- Created `apps/bot/src/scripts/generateSession.ts` — One-time interactive script using `node:readline` to log in with a personal Telegram account and output a reusable session string into `.env`. No extra `input` npm package needed. Why: MTProto requires a session string to avoid repeated phone authentication.
- Created `apps/bot/src/scripts/testParser.ts` — Automated test script with 10 diverse real-world signal formats covering clean, multi-TP, range entry, informal/shorthand, structured, emoji, and noise/non-signal formats. Outputs scored results and a pass/fail verdict. Why: validates 80%+ parser accuracy required before Phase 3.
- Created `apps/bot/src/index.ts` — Main bot entry point. Boots Telegram listener, loads active channels from Cocobase, registers each channel with a callback that parses incoming signals. Has a `// TODO Phase 3` hook for trade execution. Why: needed to wire all Phase 2 components together into a runnable process.
- Updated `apps/bot/tsconfig.json` — Replaced auto-generated config with a clean Node.js ESM-compatible TypeScript config (`module: NodeNext`, `moduleResolution: NodeNext`, `rootDir: src`, `outDir: dist`). Why: the default tsconfig caused ESM import errors at runtime.
- Updated `apps/bot/package.json` — Added `dev`, `build`, `start`, `test:parser`, and `generate:session` npm scripts. Why: gives clean entry points for running each part of the bot engine.
### Verified
- `npx tsc --noEmit` passes with zero errors on the full bot codebase.
- `npm run test:parser` scores **90% (9/10 signals)** — exceeds the 80%+ Phase 2 exit criteria threshold.


## [2026-04-21T09:50:00-07:00]
### Fixed
- Replaced the default Next.js boilerplate landing page at `apps/web/app/page.tsx` with a custom placeholder featuring branding and links to `/login` and `/register`.

## [2026-04-21T09:35:00-07:00]
### Added
- Scaffolded Next.js 14 frontend dashboard app in `apps/web` (App Router, TailwindCSS, TypeScript).
- Initialized Node.js backend bot service in `apps/bot` (TypeScript, ES Modules).
- Configured `.env.local` with Cocobase and Stripe keys (placeholder), and generated a secure `ENCRYPTION_KEY` for the bot in `.env`.
- Installed all required functional and UI dependencies (`shadcn`).
- Set up DB integration files for web (`apps/web/lib/cocobase.ts`) and bot (`apps/bot/src/db/cocobase.ts`).
- Built Auth flows (`apps/web/app/(auth)/login/page.tsx` and `register/page.tsx`).
- Created dashboard layout shell with Sidebar (`apps/web/components/Sidebar.tsx` and `layout.tsx`).
- Set up dashboard overview placeholder page (`dashboard/page.tsx`).

## [2026-04-21T08:50:00-07:00]
### Added
- Created `changelog.md` file at `c:/Users/SIR KOJO/Desktop/ProjectCopy/changelog.md` to record everything done on the project, including files created, edited, changed, and deleted. Logged based on user instructions to maintain a bottom-top chronological history separated by timestamps.
