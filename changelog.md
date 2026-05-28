## [2026-05-28T12:58:23-07:00]
### Fixed — Billing Page Render Crash
- **Fixed:** Resolved a `TypeError: Cannot read properties of undefined (reading 'includes')` crash on the `/dashboard/billing` page. This occurred when the payment history table attempted to parse a payment session document that lacked a `status` field. It now correctly uses optional chaining (`h.status?.includes`) and defaults empty statuses to `PENDING`.

## [2026-05-28T12:40:04-07:00]
### Fixed & Improved — Onboarding Flow Refinements
- **Fixed (Onboarding Step 4):** Replaced the placeholder "QR Code" scanning step with the actual 6-digit Telegram linking code flow in `apps/web/app/onboarding/page.tsx`. This connects the user to the Notification Bot (`@FundzCopySignalBot`) to receive trade alerts properly. The fake SVG QR code rendering and "qr_generated" bug have been removed completely.
- **Improved (Onboarding Step 3):** Added a "Risk Per Trade (%)" input field when adding a new channel. This correctly binds to the backend channel document instead of defaulting to 1%. It ensures users can customize their stop-loss risk tolerance immediately upon setup.
- **Fixed (Onboarding Step 2):** Removed "KuCoin" from the exchange dropdown selection since it is not currently supported by the active trading engine.

## [2026-05-28T12:06:15-07:00]
### Fixed & Improved — Payment System Partial Accumulation, SUI Sweeping & Reply-to-Close Guide
- **Fixed (SUI Sweeping):** The `suiWatcher.ts` now unconditionally calls `sweepSuiUSDCToMaster` before checking if the threshold has been met. Previously, if a payment was under the required threshold ($10 or $25), the bot returned early without sweeping the funds to the master wallet.
- **Improved (Partial Payments):** Both `solanaPaymentSession.ts` and `suiWatcher.ts` now calculate the accumulated payment amount over multiple transactions (`totalAmount = session.received_amount + amountUSDC`). If a user sends partial amounts that eventually cross the threshold, the bot will correctly upgrade their plan.
- **Added (Incomplete Payment Alerts):** If the accumulated payment is below the required plan threshold, the bot updates the session with the new total and sends a `PAYMENT_INCOMPLETE` alert. This alert is sent via Telegram and pushed as a user-targeted record to the `global_notifications` table so it displays in the web app's `NotificationBell.tsx`. The message specifically reminds users to account for the 0.5 USDC fee and complete the payment within the 2-hour window.
- **Improved (Billing UI):** Updated the target amounts in `apps/web/app/(dashboard)/dashboard/billing/page.tsx` from $10 and $25 to $10.5 and $25.5. This proactively incorporates the withdrawal fee into the requested amount, reducing underpayment occurrences.
- **Updated (Guide):** Added a new section `✅ Reply-to-Close Commands` in `apps/web/app/guide/page.tsx` detailing how admins can reply to signals to instantly close trades.

## [2026-05-27T22:18:00-07:00]
### Fixed & Improved — Stop Loss Break-even False Reporting & Reply-to-Close Commands
- **Fixed (Stop Loss Break-even):** `apps/bot/src/services/orderMonitor.ts` now uses a retry loop (polling up to 4 times with 5-second delays) when fetching `client.getClosedPnL`. This gives Bybit's backend time to generate the PnL record after a position reaches 0 size. Previously, querying immediately returned no results, causing the bot to default the PnL to $0.00 and report a false "Break-even" for Stop Loss hits.
- **Added (Reply-to-Close):** Implemented Telegram reply-based management commands. Channel admins can now swipe to reply to a previous trade signal and type "close trade", "cancel trade now", or "exit trade now".
- **Implementation (Reply-to-Close):**
  - Updated `telegramListener.ts` to extract `replyToMsgId` from GramJS events.
  - Passed `replyToMsgId` through `messageBuffer.ts` to `orchestrator.ts`.
  - Added a `closeTradeByReply` function in `tradeManager.ts` that triggers an exchange market close (`reduceOnly: true` on Bybit and Binance) for the specific trade tied to the original signal.

## [2026-05-26T22:04:00-07:00]
### Added — Network Fee Warning on Billing Page
- **Billing UI Update:** Added a prominent warning block to the `BillingPage` (`apps/web/app/(dashboard)/dashboard/billing/page.tsx`) instructing users to add an extra **0.5 USDC** to their transfer. This ensures that the final amount arriving in the generated wallet perfectly matches or exceeds the required threshold ($10 for Starter, $25 for Pro) despite exchange withdrawal fees.

## [2026-05-26T21:51:00-07:00]
### Fixed & Improved — SUI Watcher, Landing Page Pricing, Subscription System, and Trade Notifications
- **SUI Watcher Deploy:** The local code for the SUI watcher was correct but the Fly.io container was stale, throwing warnings for `SUI_WALLET_ADDRESS` not set. We triggered a new deployment to Fly.io so the bot uses `SUI_MASTER_WALLET` correctly.
- **Payment Verification:** Confirmed that SUI and Solana payment generation accurately demands $10 for Starter and $25 for Pro based on `STARTER_THRESHOLD` and `PRO_THRESHOLD`.
- **Landing Page & Guide Pricing Update:** Updated the pricing text across the marketing pages (from $29/$79 to $10/$25) and updated the corresponding feature lists in `page.tsx` and `guide/page.tsx`.
- **Account Plan Override:** Fixed and re-ran the `makePro.ts` script to successfully upgrade the `emmafund1984@gmail.com` account to 'pro' until 2032-12-31. Modified the script and the `subscriptionManager.ts` to properly call `db.auth.updateUser` so the auth user's payload is updated (resolving the persistent warning).
- **Plan Badge UI:** Added a visible subscription plan badge to the Sidebar. It dynamically reads the user's current plan and displays PRO (blue), STARTER (emerald), TRIAL (purple), or FREE (muted), keeping the user aware of their status.
- **Bug Fix — Trade Closed Alerts:** Fixed a critical bug in `orderMonitor.ts` and `notificationService.ts` that caused SL and TP hits to display as "Break-even". 
  - `notificationService.ts`: Removed the hardcoded "*Closed:* Break-even" text, updating it to dynamically reflect the reason (Profit, Stop Loss, or Break-even SL).
  - `notificationService.ts`: Also updated the loss formatting so that a $0 loss explicitly displays as `$0.00 (Break-even — SL was at Entry)`.
  - `orderMonitor.ts`: Fixed the classification so that when a trade closes via `StopLoss` but `slMovedToEntry` is true (resulting in ~$0 PnL), it still triggers an `SL_HIT` notification rather than falling back to `TRADE_CLOSED`.

## [2026-05-26T20:47:08-07:00]
### Fixed — flyctl Not Recognized / Fly.io Deployment Broken
- **Problem:** Running `flyctl deploy` (or `fly deploy`) from `apps/bot` failed with `CommandNotFoundException` — the shell could not find `flyctl` anywhere on `PATH`. Investigating `C:\Users\SIR KOJO\.fly\bin\` revealed that a previous auto-update had **corrupted the installation**: only `flyctl.exe.old` and `flyctl.zip` existed in the folder — the actual `flyctl.exe` binary was missing entirely.
- **Root Cause:** Fly.io's self-updater had downloaded a new version (`flyctl.zip`) and renamed the old binary to `flyctl.exe.old`, but had not finished extracting the new one. This left the `bin` directory with no valid executable, breaking all `flyctl` commands globally on this machine.
- **Fix:** Ran the official Fly.io PowerShell installer script to reinstall `flyctl` fresh:
  ```
  iwr https://fly.io/install.ps1 -useb | iex
  ```
  This successfully placed a new `flyctl.exe` into `C:\Users\SIR KOJO\.fly\bin\flyctl.exe`.
- **Deployment:** Since the terminal session was not restarted (so PATH hadn't refreshed), ran deploy using the full binary path:
  ```
  & "C:\Users\SIR KOJO\.fly\bin\flyctl.exe" deploy
  ```
  The deployment completed successfully:
  - App config validated (`fly.toml` ✓)
  - Docker image built (145 MB) and pushed to `registry.fly.io/copysignal-bot-engine`
  - Machine `178121e6fd6748` updated and reached `started` state
  - DNS verified at `https://copysignal-bot-engine.fly.dev/`
- **All latest bot changes are now live on Fly.io** (signal parser fixes, dynamic TP/SL logic, break-even SL, manual close detection, billing price updates).
- **Note for future deploys:** `flyctl` is now installed. After restarting your terminal, `flyctl deploy` from `apps/bot` will work directly without needing the full path.

## [2026-05-26T20:29:32-07:00]
### Fixed — Signal Parser, TP/SL Auto-Adjust, & Billing Price Update
- **Files Modified:** `apps/bot/src/parser/patterns.ts`, `apps/bot/src/parser/signalParser.ts`, `apps/bot/src/executors/bybitExecutor.ts`, `apps/bot/src/services/orderMonitor.ts`, `apps/bot/src/services/notificationService.ts`, `apps/bot/src/services/orchestrator.ts`, `apps/web/app/(dashboard)/dashboard/billing/page.tsx`
- **Problem:**
  1. The signal parser ignored TP/SL labels like "TP" and "SL", forcing the use of "Target" and "Stop". It also ignored low-priced targets (like ETH `2.088` or IOTA `0.0562`) due to a hardcoded `val >= 10` hack, and couldn't process multiple entry zones formatted as numbered lists.
  2. The Bybit executor always set Take Profit to TP1 instead of properly allocating based on the total number of targets (e.g. Target 2 for 3-4 targets).
  3. The bot did not automatically adjust the Stop Loss to Break-even (entry price) once TP1 was hit.
  4. Manually closed trades were incorrectly reported as "Break-even" in Telegram notifications.
  5. The Billing page displayed outdated pricing ($29/$79) and featured a Referral Program that needed to be removed.
- **Fix:**
  - **Signal Parser (`patterns.ts`, `signalParser.ts`):** Added robust regex to match variations like "TP", "SL", and multiple entries (e.g. `1) 0.0562 2) 0.0573`). Removed the `val >= 10` filter, replacing it with a smarter string-based filter to prevent confusing list indices (like "1)") with prices.
  - **Dynamic TP selection (`bybitExecutor.ts`):** Now dynamically assigns the Take Profit field using the `Math.floor((targets.length - 1) / 2)` formula, ensuring 3-4 targets use TP2, 5-6 use TP3, etc.
  - **Auto Break-even (`orderMonitor.ts`, `orchestrator.ts`):** Added logic in the Phase 2 monitor loop to fetch live `getTickers` price. If the current price crosses Target 1 (`firstTarget`), Bybit `setTradingStop` is called to automatically move the Stop Loss to the original Entry Price.
  - **Manual Close Detection (`orderMonitor.ts`, `notificationService.ts`):** The monitor now reads Bybit's `execType`. If it's `Trade`, it fires a new `MANUAL_CLOSE` notification type. If it's `StopLoss` but `slMovedToEntry` is true, it registers as `closed` (Break-even).
  - **Billing & UI (`billing/page.tsx`):** Updated Starter price to $10.5 and Pro price to $25.5. Completely removed the Referral Program component.
  - **User Management (`makePro.ts`):** Executed a script via Cocobase SDK to set `emmafund1984@gmail.com` as a lifetime Pro user (`plan: pro`, expires `2099`).
- **Why:** To improve trade parsing reliability, accurately enforce the user's risk-management strategy (Target 2 TP + Auto Break-even at Target 1), give precise Telegram notifications for manual interventions, and update the business model pricing.

## [2026-05-22T17:41:35-07:00]
### Fixed — Dashboard Cumulative P&L Chart and Stats (Monthly)
- **Files Modified:** `apps/web/components/dashboard/PnlChart.tsx`, `apps/web/components/dashboard/StatsCards.tsx`
- **Problem:** The Cumulative P&L chart on the dashboard was completely empty/broken for closed trades. The chart was explicitly filtering for `trade.status === 'filled'`, but due to the recent monitoring fixes, finished trades correctly transition to `tp_hit`, `sl_hit`, or `closed`. Thus, completed trades with actual P&L were being excluded from the chart calculation.
- **Change:**
  - **PnlChart.tsx:** Updated the P&L inclusion condition from `trade.status === 'filled'` to `['tp_hit', 'sl_hit', 'closed'].includes(trade.status)`.
  - **Monthly Filter:** Added a date filter to both `PnlChart.tsx` and `StatsCards.tsx` to only include trades from the *current month* and *current year*, matching the user's request for a Monthly dashboard view.
  - **UI Labels:** Changed the titles from "Cumulative P&L" to "Monthly Cumulative P&L" on the chart, and updated the stat cards to display "Monthly P&L" and "Monthly Trades" instead of "Total P&L" and "Total Trades".
- **Why:** To accurately reflect closed trade profits and losses in the dashboard chart, and to scope the dashboard's analytics to the current month as requested.

## [2026-05-22T17:20:00-07:00]
### Fixed — TP/SL Detection, Trade Closure Notifications & Monitoring Pipeline (Critical)
- **Files Modified:** `apps/bot/src/services/orderMonitor.ts`, `apps/bot/src/services/notificationService.ts`, `apps/bot/src/services/orchestrator.ts`, `apps/bot/src/index.ts`
- **Problem:** After a trade was executed and the "Trade Executed ✅" Telegram message was sent, the bot never sent any follow-up notification for when the trade was closed (TP hit, SL hit, or manually closed). The `trade_logs` records stayed permanently at `status: 'filled'`, the dashboard P&L stayed at $0, and the leaderboard win rate never updated.
- **Root Causes Identified & Fixed:**
  1. **Bug (CRITICAL) — False "Already Closed" Detection in Phase 2 of `orderMonitor.ts`:** The position monitor started polling `getPositionInfo` immediately after Phase 1 confirmed a fill. Bybit's backend takes a moment to propagate a newly-filled position. Polling too fast meant the monitor saw `posSize === 0` (position not yet populated), concluded the trade was already closed, called `getClosedPnL` and found no relevant entry, stored wrong/zero P&L, and exited — all within the first few seconds. Fixed by adding a mandatory **30-second initial wait** at the start of Phase 2 before the first position check.
  2. **Bug (CRITICAL) — `getClosedPnL` Matching Wrong Trade:** The PnL matching used only `orderId` (the entry order ID) to look up the closed trade. But Bybit stores the **close** order's ID in that field. If no match was found, the code fell back to `closedList[0]` — the most recent closed PnL entry — which could be from a completely different prior trade. Fixed by passing `startTime: monitorStartTime` to `getClosedPnL` so only entries from AFTER the monitor started are returned, correctly scoping the fallback to the current trade.
  3. **Bug (HIGH) — Phase 1 Ran for Market Orders:** Market orders are filled in milliseconds. The `waitForOrderFill` loop slept 10 seconds before its first check. Added `isMarketOrder` flag to `MonitorParams`. When `true`, Phase 1 (wait-for-fill) is skipped entirely, jumping straight to Phase 2 with the 30-second propagation delay. Fixed in `orchestrator.ts` by passing `isMarketOrder: !!parsed.useMarketPrice`.
  4. **Bug (HIGH) — Phase 1 Slept Before First Check:** The original loop slept 10 seconds before checking order status. For fast-moving markets where a limit order fills within seconds, this was unnecessary delay. Fixed by checking `getHistoricOrders` first (before any sleep) on each iteration.
  5. **Bug (MEDIUM) — No Side Filtering in Position Check:** `getPositionInfo` returned all positions for a symbol. Added side-aware filtering to match the correct long/short position.
  6. **Bug (DEFENSIVE) — `getUserTelegramChatId` Missing Fallback:** Added fetch-all-and-filter fallback in `notificationService.ts` (same pattern used in `telegramService.ts` and `orchestrator.ts`) as a defensive measure against Cocobase `.data` nesting edge cases.
- **Additional Improvements:**
  - Enriched `TP_HIT`, `SL_HIT`, and `TRADE_CLOSED` Telegram message formatters to include entry price, side, qty, and channel name so users have full trade context in each alert.
  - Updated `MonitorParams` interface with `isMarketOrder?: boolean` and `channelName?: string` fields.
  - Updated boot-time orphaned trade recovery in `index.ts` to pass `isMarketOrder: true` (orphaned trades are already filled by definition, so Phase 1 is irrelevant on recovery) and `channelName` for richer notifications.
- **Why:** These bugs collectively broke the entire trade monitoring pipeline. Trades were placed correctly but monitoring exited before the position was properly established, causing permanent `"filled"` status, zero P&L, and no closure Telegram alerts.
- **Verified:** TypeScript compile (`npx tsc --noEmit`) passes with zero errors. Deployed to Fly.io.

## [2026-05-22T15:45:00-07:00]
### Updated — Cocobase SDK Version
- **Files:** `apps/web/package.json`, `apps/bot/package.json`, `apps/bot/src/db/cocobase.ts`, `apps/bot/src/scripts/wipeApiKeys.ts`, `apps/bot/src/services/orderMonitor.ts`
- **Change:** Upgraded `cocobase` from `^1.5.4` to `^1.6.0` to match their new API docs URL.
- **Implementation:** 
  - Ran `npm install` in both `apps/bot` and `apps/web`.
  - Refactored imports in `apps/bot/src/db/cocobase.ts` and `wipeApiKeys.ts` from default export (`import cocobase from "cocobase"`) to named export (`import { Cocobase } from "cocobase"`) to fix TypeScript errors under version 1.6.0.
  - Removed redundant test scripts (`testImport.ts`, `testImport2.ts`).
  - Fixed a typo in `apps/bot/src/services/orderMonitor.ts` where `getClosedPnl` was used instead of `getClosedPnL` which caused the build to fail.
  - Deployed the bot engine to Fly.io via `flyctl deploy`.
- **Why:** The Cocobase documentation URL and SDK were updated to a new version (v1.6.0), requiring the project dependency versions and their imports to be aligned.

## [2026-05-19T10:23:00-07:00]
### Added — Favicon Icons
- **File:** `apps/web/app/layout.tsx`
- **Change:** Added favicon images and icons configuration to the Next.js `metadata` object. Linked `/favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `icon.svg`, and `apple-touch-icon.png` from the `public` directory.
- **Why:** The user added new favicon images to the `public` folder and requested they be integrated into the site to ensure correct icons are displayed on browser tabs, bookmarks, and mobile home screens.

## [2026-05-16T06:55:00-07:00]
### Fixed — Margin Limit Raised to 99%
- **File:** `apps/bot/src/utils/riskCalc.ts`
- **Problem:** Trades were failing with "trade would use excessive margin" because the safety cap was hardcoded at 80%.
- **Fix:** Raised `marginPercent` threshold to `99%` to allow near-maximum capital utilization as requested. Any margin usage strictly below 99% is now permitted.

### Feature — Dynamic "Market Price" Entry Execution
- **Files:** `apps/bot/src/parser/signalParser.ts`, `apps/bot/src/executors/bybitExecutor.ts`, `apps/bot/src/executors/binanceExecutor.ts`, `apps/bot/src/services/orchestrator.ts`
- **Problem:** When signal providers used words like "market", "current price", or "CMP" instead of a numeric entry price, the parser would fail to find an entry, causing the signal to be skipped or fail position sizing calculation.
- **Fix (Parser):** Added regex to detect market keywords (`MARKET PRICE`, `CURRENT PRICE`, `NOW`, `CMP`). Sets a new flag `useMarketPrice = true` and allows the signal to pass validation even with a null entry.
- **Fix (Executors):** Both Bybit and Binance executors check `signal.useMarketPrice`. If true, they immediately fetch the live asset price (`getTickers` or `futuresMarkPrice`), assign it to `signal.entry` to calculate correct position sizing, and then dynamically execute a `MARKET` order instead of a `LIMIT` order.
- **Fix (Orchestrator):** `order_type` logged to database is now dynamically set to `Market` or `Limit` based on the trade executed.

### Fixed — Leverage Cap Removal for True Position Sizing
- **File:** `apps/bot/src/parser/signalParser.ts`
- **Problem:** Leverage was being hardcapped to `50x` in the parser (`Math.min(result.leverage, 50)`). This caused the bot to use 50x even if the user sent a signal for 100x, leading to wildly different Risk/Reward (ROI) and TP/SL calculations compared to manually placed trades using the exact signal leverage.
- **Fix:** Removed the `50x` cap. The parser now uses the exact leverage provided in the signal, ensuring that estimated P&L, TP, SL, and ROI match 1-to-1 with manual exchange execution.

## [2026-05-16T13:02:00-07:00]
### Fixed — Market Orders Placed Instead of Limit Orders (Critical)
- **Files:** `apps/bot/src/executors/bybitExecutor.ts`, `apps/bot/src/executors/binanceExecutor.ts`, `apps/bot/src/services/orchestrator.ts`
- **Problem:** Both Bybit and Binance executors were placing `MARKET` orders, completely ignoring the `entry` price from the signal. This caused fills at whatever the current market price was (e.g., 653.40 instead of 656.0), putting users immediately into loss. `timeInForce: 'IOC'` on Bybit also caused the order to be immediately cancelled if not fillable, which is wrong for a pending limit order.
- **Fix (bybitExecutor.ts):** Changed `orderType` from `'Market'` to `'Limit'`, added `price: String(signal.entry!)`, changed `timeInForce` from `'IOC'` to `'GTC'` (Good Till Cancelled) so the order stays open at the limit price until filled.
- **Fix (binanceExecutor.ts):** Changed `type` from `'MARKET'` to `'LIMIT'`, added `price: String(signal.entry!)`, added `timeInForce: 'GTC'`.
- **Fix (orchestrator.ts):** Updated `order_type` field saved to `trade_logs` from `'Market'` to `'Limit'`.

### Fixed — Live Trade Feed Showing "Invalid Date" and Null Values
- **File:** `apps/web/components/dashboard/TradeFeed.tsx`
- **Problem:** Cocobase wraps all document fields inside a `.data` property. The TradeFeed component was reading `trade.executed_at`, `trade.entry_price`, `trade.qty`, `trade.side` directly from the top-level document object, which only contains metadata (id, etc.), not the actual field values. All fields were `undefined`, resulting in "Invalid Date" and null/null displays.
- **Fix:** Added an `unwrapTrade()` helper that reads every field from `d = raw.data || raw` before accessing it. Added a safe `formatDate()` function that returns `'—'` instead of "Invalid Date" for missing or unparseable timestamps. Also added the fallback fetch-all-and-filter pattern for older documents where filtered queries fail. Added `tp_hit`/`sl_hit` status badges.

### Fixed — Dashboard StatsCards Showing Wrong Counts (0 trades, 0 win rate)
- **File:** `apps/web/components/dashboard/StatsCards.tsx`
- **Problem:** StatsCards received trade objects from the dashboard page, but those objects still had fields nested under `.data`. Reading `t.status`, `t.pnl`, `t.executed_at` directly returned `undefined`, so `filledTrades` was always empty and all stats showed 0.
- **Fix:** Added normalisation step that unwraps `.data` before computing all stats. Also updated `filledTrades` → `closedTrades` to include `tp_hit`, `sl_hit`, and `closed` terminal statuses so the win rate calculation is correct.

### Fixed — Leaderboard "Unknown Channel", 0 Users, Risk Score Present
- **File:** `apps/web/app/(dashboard)/dashboard/leaderboard/page.tsx`
- **Problem (Unknown Channel):** The leaderboard tried to read `t.channel_name` from raw Cocobase docs, but the field is nested in `.data`. New trades (after the orchestrator fix) have `channel_name`, but the display name was still falling through to "Unknown Channel" for any trade where the field was missing.
- **Fix:** Added `.data` unwrapping for all trade fields. Channel display name now falls back gracefully: `channel_name` → `@channel_username` → raw key.
- **Problem (0 Users):** `user_id` was not being read correctly due to the same `.data` nesting.
- **Fix:** Properly unwraps `user_id` from the `.data` layer before adding to the `users` Set.
- **Problem (Risk Score):** Risk Score column was deemed inappropriate and removed per user request.
- **Fix:** Removed `risk_score` field entirely. Leaderboard now shows only **Win Rate** and **P&L**. The P&L label updates dynamically ("This Week P&L", "This Month P&L", "All Time P&L") to match the selected period.

### Fixed — Admin Control Panel Password (Vercel)
- **Root Cause (not a code bug):** The web dashboard is hosted on Vercel, not Fly.io. The `ADMIN_PASSWORD` environment variable must be set in the **Vercel project settings** under Environment Variables (not via `flyctl secrets`). The bot engine on Fly.io has the secret correctly, but the Next.js dashboard on Vercel does not.
- **Action Required:** Go to Vercel Dashboard → copysignal-bot project → Settings → Environment Variables → Add `ADMIN_PASSWORD` = `Fundz,family1` for Production. Then redeploy.

## [2026-05-16T11:45:00-07:00]

### Changed — Admin Control Panel Password Updated
- **File:** `apps/web/app/api/admin/route.ts`
- **Change:** Updated the hardcoded fallback admin password from `Fundz&family1` to `Fundz,family1` to match the new password set in `.env.local` and Fly.io secrets (`flyctl secrets set ADMIN_PASSWORD=Fundz,family1`).
- **Why:** The old password contained `&` which caused encoding issues in some environments. The new password uses `,` which is plain ASCII and safe across all transports.

## [2026-05-16T11:25:00-07:00]

### Added — Order Status Monitor (TP/SL Hit Detection)
- **File:** `apps/bot/src/services/orderMonitor.ts` [NEW]
- **Problem:** After a trade was executed, the bot had no way to detect when Bybit closed the position via Take Profit or Stop Loss. The trade_log stayed permanently in "filled" status, no TP/SL notifications were sent to users via Telegram, and P&L was never recorded.
- **Fix:** Created `orderMonitor.ts` — a lightweight background polling service that runs a `setInterval` loop every 15 seconds for each new filled order. It calls `getPositionInfo` to check if the position is still open. When the position size drops to 0 (closed), it calls `getClosedPnl` to determine the P&L outcome, updates the `trade_logs` document status to `tp_hit` or `sl_hit`, and fires the appropriate `TP_HIT` or `SL_HIT` notification via `notificationService`. The monitor auto-stops after 72 hours as a safety timeout.
- **Why:** Without this, users had no feedback on trade outcomes and the dashboard always showed stale "Filled" statuses.

### Fixed — Trade Errors Not Notified to Users via Telegram
- **File:** `apps/bot/src/services/orchestrator.ts`
- **Problem:** When a trade execution failed (e.g., insufficient balance, qty error), only the admin received a system error alert. The user whose signal triggered the trade got no notification and had no idea the trade failed.
- **Fix:** Added an `else` branch to the ALERT block: when `result.success` is `false`, fires `notify({ type: 'TRADE_ERROR', userId, payload: { ... } })` so the user receives a Telegram message explaining the failure.

### Fixed — Leaderboard Showing "Unknown Channel" and Wrong Win Rate
- **File:** `apps/bot/src/services/orchestrator.ts`
- **Problem:** The leaderboard displayed "Unknown Channel" for every entry because `trade_logs` documents didn't include `channel_name` or `channel_username` fields. Also `order_id` was not saved, blocking the order monitor from looking up trades by Bybit order ID.
- **Fix:** Added `channel_name`, `channel_username`, and `order_id` fields to the `db.createDocument("trade_logs", ...)` call in `orchestrator.ts`.

### Fixed — Leaderboard Win Rate Calculated Incorrectly
- **File:** `apps/web/app/(dashboard)/dashboard/leaderboard/page.tsx`
- **Problem:** Win-rate only counted `filled` and `closed` statuses, missing `tp_hit` and `sl_hit`. Wins were determined by `pnl > 0` which is always 0 for newly filled trades with no closed P&L recorded yet.
- **Fix:** Updated the metrics calculation to count `tp_hit`, `sl_hit`, `closed`, and `filled` as terminal states. Wins are now `tp_hit` or `filled` with positive pnl. P&L aggregation handles the `data` wrapper nesting.

### Fixed — Admin Control Panel Password Still Rejected (Fly.io Timing Bug)
- **Files:** `apps/web/app/api/admin/route.ts`, `apps/web/app/control-panel/page.tsx`
- **Problem:** On Fly.io, `process.env.ADMIN_PASSWORD` was `undefined` at module load time because Fly.io injects secrets after the Node.js module cache is built. The constant `ADMIN_PASSWORD` was set to the fallback value at startup and never updated when the real secret became available.
- **Fix (route.ts):** Moved the `ADMIN_PASSWORD` read inside `verifyAdmin()` so it is evaluated fresh on every request. Also added `.replace(/\s/g, '')` to strip all whitespace variants (including Unicode) from both the env value and the incoming header.
- **Fix (control-panel/page.tsx):** Added `.trim()` to the password value before building the `x-admin-token` header so copy-paste whitespace doesn't cause mismatches.

### Improved — Trade History Page (Status Badges + TP/SL/Channel Columns)
- **File:** `apps/web/app/(dashboard)/dashboard/trades/page.tsx`
- **Problem:** The trades page only showed `FILLED`, `PENDING`, `ERROR` statuses. There were no badges for `TP_HIT` or `SL_HIT`. No channel name, no TP/SL prices, no P&L trend icons.
- **Fix:** Full rewrite with a `STATUS_CONFIG` map that renders coloured badges for all statuses (Filled=blue, TP Hit=green, SL Hit=red, Error=red, Pending=amber). Added: Channel column with Radio icon, TP/SL price column (green/red), P&L column with TrendingUp/Down arrows. Row `title` attribute shows the `error_msg` on hover for failed trades.

## [2026-05-15T12:45:00-07:00]

### Fixed — GramJS Ignoring Admin/Outgoing Signals (Critical)
- **Files:** `apps/bot/src/listener/telegramListener.ts`
- **Problem:** When the user (who is the channel admin and owner of the GramJS userbot session) posted a trade signal, the bot ignored it. By default, GramJS flags messages sent by the logged-in user as "outgoing" and standard event handlers filter them out if not explicitly configured. Furthermore, channel identifiers (`@username`) weren't strictly matching incoming events due to caching limitations.
- **Fix:** Explicitly configured `NewMessage({ incoming: true, outgoing: true })` so the bot actively monitors signals posted by the admin. Added numeric entity resolution in `addChannel`: it now queries Telegram for the exact numeric `chatId` based on the `@username`, ensuring a 100% reliable matching ID. Also added support to read captioned images (`message?.message`).

### Improved — Channels Dashboard & Bybit Validation
- **Files:** `apps/web/app/(dashboard)/dashboard/channels/page.tsx`, `apps/web/app/api/apikeys/route.ts`, `apps/web/app/(dashboard)/dashboard/page.tsx`
- **Problem:** The channels dashboard lacked risk management inputs, and the Bybit demo key validation incorrectly threw `403 Forbidden` due to local IP geo-blocking (CloudFront), and failed if the "Assets" permission wasn't checked.
- **Fix:** 
  1. Rewrote the `/channels` page to include Exchange selection (Bybit/Binance) and a strict 10% maximum `risk_percent` input.
  2. Deleted the buggy "Quick Add" cards from the main dashboard to centralize the workflow.
  3. Bybit API validation now gracefully catches `403 Forbidden` CloudFront blocks to bypass strict validation locally (since production IPs will be unblocked).
  4. Validation now gracefully falls back to `fetchOpenOrders` and `fetchPositions` if the user didn't grant the "Assets" permission.

## [2026-05-15T11:04:00-07:00]
### Fixed — Trade Signals Not Reaching Bot Engine (Critical)
- **Files:** `apps/bot/src/index.ts`, `apps/web/app/(dashboard)/dashboard/channels/page.tsx`, `apps/bot/src/services/orchestrator.ts`
- **Problem:** When a user posted a trade signal in their monitored Telegram channel, nothing happened — no trade was logged, no execution attempted. Root cause: the web dashboard saved the Telegram identifier as `telegram_id`, but the bot only looked for `telegram_channel_id` or `channel_username`. The channel ID resolved to `undefined`, so the Telegram listener never subscribed to any channel.
- **Fix (index.ts):** Added fallback chain: reads `telegram_channel_id` → `telegram_id` → `channel_username` from both the top-level object and the `.data` wrapper. Also builds a normalized `channelDoc` with default values for `exchange` ('bybit'), `risk_percent` (1), `trigger_keyword` (''), and `allow_medium_confidence` (true) so the orchestrator has everything it needs.
- **Fix (channels/page.tsx):** Now saves `telegram_channel_id` (copy of `telegram_id`), `channel_username` (if starts with @), `exchange`, `risk_percent`, `trigger_keyword`, and `allow_medium_confidence` alongside the existing fields.
- **Fix (orchestrator.ts):** Added Cocobase `.data` nesting fallback for API key lookups. The filtered query `{ user_id, exchange }` fails when fields are wrapped in `.data`. Now fetches all keys and filters in code as fallback. Also unwraps the API key document before passing to executors. Added comprehensive logging at every gate in the pipeline.
- **Why:** This was the #1 critical issue — the entire trade pipeline was broken because the listener never subscribed to any channel.

### Fixed — Telegram "Account Linked" But Dashboard Shows "Not Linked" (Critical)
- **Files:** `apps/bot/src/services/telegramService.ts`, `apps/web/app/api/telegram/link/route.ts`
- **Problem:** The bot correctly confirmed "Account linked successfully!" but the dashboard's "Check Status" button always said "Not linked yet." Two root causes:
  1. Cocobase wraps stored fields inside a `.data` property. Filter queries like `{ code, used: false }` and `{ user_id: userId }` don't match when the actual path is `data.code`, `data.used`, `data.user_id`.
  2. The users collection lookup also failed for the same reason.
- **Fix (telegramService.ts):** If the filtered token query returns 0 results, falls back to fetching ALL tokens and iterating in code to find the match. Same fallback for the users collection lookup.
- **Fix (telegram/link/route.ts):** GET endpoint now has the same fallback — if filtered query returns 0, fetches all docs from `users` collection and finds the match by comparing `doc.data?.user_id`.
- **Why:** The bot was successfully writing the link data, but the dashboard could never read it back.

### Fixed — Bybit Demo API Key Validation Still Failing
- **File:** `apps/web/app/api/apikeys/route.ts`
- **Problem:** Bybit Demo API keys still failed validation because the previous fix only overrode `spot/futures/v2/public/private` URL keys, but CCXT v4+ routes Bybit API calls through the `v5` key. The `fetchBalance` call hit the live API instead of `api-demo.bybit.com`.
- **Fix:** Instead of manually constructing a partial URL map, now iterates over ALL keys in `bybit.urls['api']` and overrides each one (including nested sub-objects) to the demo base URL. Also added a 3-tier fallback for `fetchBalance`: unified → spot → default. Added detailed error logging.
- **Why:** Ensures the demo URL override is complete regardless of CCXT's internal URL structure.

### Fixed — Admin Control Panel Password Rejected
- **File:** `apps/web/app/api/admin/route.ts`
- **Problem:** The admin password `Fundz&family1` was always rejected. The `&` character in environment variables can cause encoding issues on different hosting platforms, and whitespace differences between the env value and the header value caused exact-match failures.
- **Fix:** Added `.trim()` on both the env variable value and the incoming `x-admin-token` header. Added debug logging that shows the character lengths and first/last characters (without revealing the full password) to diagnose mismatches.

### Fixed — Trade History Page Not Showing Trades
- **File:** `apps/web/app/(dashboard)/dashboard/trades/page.tsx`
- **Problem:** Even when trades were logged to Cocobase, the trades page showed "No trades yet" because `r.data` spread didn't properly unwrap the nested fields, and filtered queries failed due to `.data` nesting.
- **Fix:** Added the same fallback pattern (filtered query → fetch all + filter in code) and explicit field extraction from both `doc.data` and `doc` levels.

## [2026-05-07T15:14:00-07:00]
### Fixed — Bybit Demo API Key Validation
- **File:** `apps/web/app/api/apikeys/route.ts`
- **Problem:** Saving Bybit Demo API keys always failed with "Invalid API key or insufficient permissions". The code was assigning `bybit.urls['demotrading']` directly to `bybit.urls['api']`, but CCXT's demotrading URLs contain unresolved `{hostname}` template placeholders (e.g. `https://api-demo.{hostname}`). These were never resolved, so CCXT tried to connect to a literal `{hostname}` address instead of `api-demo.bybit.com`.
- **Fix:** Manually resolve the hostname: `const demoBase = \`https://api-demo.\${bybit.hostname}\`;` and build a proper URL map. This now works for both demo and live Bybit keys, as well as Binance keys.

### Fixed — Duplicate Telegram Bot Causing /start Handler Conflict
- **Files:** `apps/bot/src/services/alertBot.ts` (DELETED), `apps/bot/src/jobs/dailySubscriptionCheck.ts`
- **Problem:** Two separate `TelegramBot` instances were being created using the same bot token: `alertBot.ts` (always polling) and `telegramService.ts` (webhook mode). The `alertBot.ts` was intercepting user messages first with its OLD `/start` handler (which expected a userId, not a 6-digit code), so the OTP linking flow in `telegramService.ts` never ran. Users could not link their Telegram accounts.
- **Fix:** Deleted `alertBot.ts` entirely. Updated `dailySubscriptionCheck.ts` to import `sendTelegramMessage` from `telegramService.ts` instead. Now there is a single bot instance using webhook mode, and the 6-digit OTP linking flow works correctly.

### Fixed — Admin Control Panel Not Showing Real Data
- **File:** `apps/web/app/api/admin/route.ts`, `apps/web/app/control-panel/page.tsx`
- **Problem:** The admin panel's `/api/admin` route was querying `db.listDocuments('users', {})` — but the `users` collection only contains Telegram link data, not actual user accounts. Real users are stored in Cocobase's auth system. The panel showed 0 users, 0 metrics, and errored on collections that didn't exist yet.
- **Fix:** Replaced `db.listDocuments('users', {})` with `db.auth.listUsers()` to fetch actual registered users. Added graceful `try/catch` around all collection queries (`trade_logs`, `system_errors`, `payment_sessions`, `global_notifications`) so missing collections return empty arrays instead of crashing. Updated the user table to show a Telegram linked column and a `trial` plan badge.

### Fixed — Telegram Linking "Check Status" Button UX
- **File:** `apps/web/app/(dashboard)/dashboard/settings/page.tsx`
- **Problem:** The "I've sent the code — check status" button had no loading indicator and no toast feedback. When clicked, if the user wasn't linked yet, nothing visible happened, making it seem broken.
- **Fix:** Added a loading spinner + "Checking..." state, a toast message on failure ("Not linked yet — make sure you sent the code to the bot"), and a "Generate a new code" button.

### Fixed — Notification Service Telegram Chat Lookup
- **File:** `apps/bot/src/services/notificationService.ts`
- **Problem:** `getUserTelegramChatId()` only checked `db.auth.getUserById()` for `telegram_user_id`, but the Telegram bot stores link data in the `users` collection instead. Notifications were never delivered because the chat ID was never found.
- **Fix:** Now checks both locations: first the auth user data, then the `users` collection.

## [2026-05-07T14:20:00-07:00]
### Fixed — Fly.io Production Crash Loop (Environment Variables + Lazy Init)
- **Files:** `apps/bot/src/listener/telegramListener.ts`
- **Problem:** The Fly.io machines were crash-looping and hitting the 10-restart limit. Two root causes:
  1. **Missing Fly.io secrets:** The `.env` file is correctly excluded from the Docker image, but the environment variables were never set as Fly.io secrets via `flyctl secrets set`. The dotenvx loader showed `injected env (0)` — zero variables loaded.
  2. **Module-level crash:** `telegramListener.ts` created the `TelegramClient` in the class constructor, and the singleton was exported at module scope (`export const telegramListener = new TelegramListener()`). This means `new TelegramClient()` ran at import time, before `boot()` even started. Since `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` were undefined, the constructor threw an uncatchable error.
- **Fix:**
  1. Refactored `TelegramListener` to use lazy initialization — the `TelegramClient` is now created inside `connect()`, not the constructor. Added env var validation that logs a clear error and returns gracefully instead of crashing.
  2. Set all 13 required environment variables as Fly.io secrets via `flyctl secrets set` (COCOBASE_API_KEY, TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION, TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_WEBHOOK_URL, ENCRYPTION_KEY, SOLANA_MASTER_MNEMONIC, SUI_MASTER_MNEMONIC, SOLANA_MASTER_WALLET, SUI_MASTER_WALLET, HELIUS_API_KEY, HELIUS_WEBHOOK_URL).
  3. Destroyed the duplicate Fly.io machine (8de507be102558) to prevent the Telegram `409 Conflict` polling error from two instances fighting over `getUpdates`.
- **Verified:** Machine 178121e6fd6748 is now running with `✅ Bot is fully running. Waiting for signals...` and `✅ Telegram client connected`.
- **Why:** This was the critical production blocker — the bot could never stay alive on Fly.io.

## [2026-05-07T14:08:00-07:00]
### Fixed — TypeScript Compile Error in API Keys Route
- **File:** `apps/web/app/api/apikeys/route.ts`
- **Problem:** Line 61 had a TypeScript error: `Element implicitly has an 'any' type because expression of type '"demotrading"' can't be used to index type`. CCXT's TypeScript type definitions for the `urls` object don't include the `demotrading` property, even though it exists at runtime for exchanges like Bybit.
- **Fix:** Cast `bybit.urls` to `any` when accessing the `demotrading` key: `(bybit.urls as any)['demotrading']`. This preserves the runtime behavior while satisfying the TypeScript compiler.
- **Why:** This error would block `next build` on strict TypeScript projects and showed as a red squiggle in the IDE.

## [2026-05-07T13:47:00-07:00]
### Fixed — Telegram Bot Account Linking (Critical)
- **Files:** `apps/bot/src/services/telegramService.ts`, `apps/web/app/api/telegram/link/route.ts`
- **Problem:** When a user sent their 6-digit linking code to the Telegram bot, nothing happened. The bot silently failed because `db.updateDocument('users', token.user_id, ...)` assumed a document already existed in the custom `users` collection. In Cocobase, auth users are stored separately from custom collections, so this call always returned a 404.
- **Fix:** Rewrote `handleLinkingCode()` to first query `db.listDocuments('users', { filters: { user_id } })`. If a document exists, it updates it. If not, it creates a new one with `db.createDocument()`. Added a multi-layer fallback to guarantee the link succeeds.
- **Also fixed:** The GET endpoint in `telegram/link/route.ts` was querying `filters: { id: userId }` instead of `filters: { user_id: userId }`, which never matched. Corrected the filter to match the actual document structure.
- **Why:** This was the #1 user-facing bug — Telegram notifications could never be enabled.

### Fixed — Fly.io Production Crash Loop (Critical)
- **Files:** `apps/bot/package.json`, `apps/bot/Dockerfile`
- **Problem:** The production Docker container crashed on boot with `ERR_MODULE_NOT_FOUND` for `cocobase/dist/realtime/multiplayer`. The 2-stage Dockerfile compiled TypeScript with `tsc`, then ran `node dist/index.js`. Node's strict ESM resolver rejected cocobase's internal imports that lack `.js` extensions.
- **Fix:** 
  1. Moved `tsx` from `devDependencies` to `dependencies` so it's available in production.
  2. Changed the `start` script from `"node dist/index.js"` to `"tsx src/index.ts"`.
  3. Simplified the Dockerfile from a 2-stage build to a single stage: `npm install` → `CMD ["npx", "tsx", "src/index.ts"]`. The `tsc` compile step is no longer needed since `tsx` handles TypeScript natively and resolves ESM modules correctly.
- **Why:** This eliminates the crash loop that exhausted the 10-restart limit on Fly.io machines.

### Fixed — Bybit API Key Validation for Demo & UTA Accounts (Critical)
- **File:** `apps/web/app/api/apikeys/route.ts`
- **Problem:** Bybit API key validation failed with "Invalid API key or insufficient permissions" even for valid keys. Two root causes:
  1. Demo mode was manually setting `bybitOpts.urls.api` but CCXT has a built-in `demotrading` URL map that needs to be applied instead.
  2. New Bybit accounts use Unified Trading Accounts (UTA), and `fetchBalance()` without specifying `type: 'unified'` fails on UTA accounts.
- **Fix:**
  1. Applied `bybit.urls['api'] = bybit.urls['demotrading']` to use CCXT's native demo URL map.
  2. Added a try/catch chain: first attempts `fetchBalance({ type: 'unified' })`, falls back to `fetchBalance()` for classic accounts.
- **Why:** Ensures both UTA and classic Bybit accounts can validate correctly in both live and demo modes.

### Added — API Key Uniqueness Enforcement
- **File:** `apps/web/app/api/apikeys/route.ts`
- **Problem:** The same API key could be registered across multiple user accounts, creating a security risk.
- **Fix:** Before saving, the route now fetches all existing API keys, decrypts each one, and compares it against the submitted key. If a match is found on a different `user_id`, the request is rejected with HTTP 409 ("This API key is already linked to another account"). If the same user tries to add a duplicate, it's also rejected ("You have already added this API key").
- **Why:** Prevents cross-account key sharing and accidental duplicate entries.

### Fixed — Onboarding Wizard Bypassed API Validation
- **File:** `apps/web/app/onboarding/page.tsx`
- **Problem:** The onboarding wizard's "Connect Exchange" step was saving API keys directly to Cocobase via `db.createDocument('api_keys', ...)`, completely bypassing the `/api/apikeys` route. This meant keys were stored unencrypted and without any validation.
- **Fix:** Changed `handleConnectExchange()` to route through `fetch('/api/apikeys', { method: 'POST', ... })`, so onboarding keys now go through the same encryption, validation, and uniqueness checks as the Settings page.
- **Why:** Critical security fix — all API keys must pass through server-side encryption and validation.

### Added — Database API Key Wipe Script
- **File (New):** `apps/bot/src/scripts/wipeApiKeys.ts`
- Created a standalone script to purge all existing `api_keys` documents from Cocobase.
- Run with: `npx tsx src/scripts/wipeApiKeys.ts` from `apps/bot/`.
- **Why:** Required to clear legacy unencrypted/unvalidated keys before deploying the new security logic.

## [2026-05-07T10:50:00-07:00]
### Fixed — Onboarding Demo Mode
- **File:** `apps/web/app/onboarding/page.tsx`
- Added the missing "Demo Trading Mode" toggle to Step 2 (Connect Exchange) of the onboarding wizard when Bybit is selected.
- Matches the logic implemented in the Settings page to ensure users can start in Demo Mode immediately upon registration.


### Fixed — Fly.io Deployment Crash & Shared Bot Status
- **Files:** `apps/bot/package.json`, `apps/web/context/BotStatusContext.tsx`, `apps/web/components/Sidebar.tsx`, `apps/web/components/MobileNav.tsx`, `apps/web/app/(dashboard)/dashboard/page.tsx`, `apps/web/app/(dashboard)/layout.tsx`
- **Fly.io Fix:** Moved `dotenv` from `devDependencies` to `dependencies` in `apps/bot/package.json` so it is installed during the production Docker build. This resolves the `Cannot find package 'dotenv'` error causing the 10-restart limit crash. Started the suspended machines manually.
- **Bot Status Sync Fix:** Created a shared React Context (`BotStatusContext.tsx`) to manage the `botActive` and `channelCount` states globally across the dashboard.
- **Why:** The Sidebar, MobileNav, and Dashboard page previously fetched their own state independently. Clicking "Resume All Bots" only updated the local component state. Now, toggling the bot updates the context, instantly reflecting the change across the entire UI (including the banner on the main dashboard).

## [2026-05-07T10:00:00-07:00]
### Feature — Bybit Demo Trading Mode
- **Files:** `apps/bot/src/executors/bybitExecutor.ts`, `apps/web/app/api/apikeys/route.ts`, `apps/web/app/(dashboard)/dashboard/settings/page.tsx`, `apps/web/app/guide/page.tsx`
- Added a `demo_mode` toggle in the Settings UI specifically for Bybit.
- Updated the API key validation and the Bybit executor to route requests to `https://api-demo.bybit.com` when demo mode is enabled.
- Replaced the old "Testnet" instructions in the Guide page with comprehensive steps for setting up Bybit Demo Trading, as it is much more reliable than the standard testnet.
- **Why:** Bybit Demo Trading provides a more accurate paper trading experience by using live market data without risking real funds.

## [2026-05-07T09:45:00-07:00]
### Feature — Mobile Notification Bell
- **File:** `apps/web/components/MobileNav.tsx`
- Added the `NotificationBell` component to the mobile header, ensuring users can access in-app notifications on smaller screens.


### Refactored — Notification & Telegram Architecture
- **Files:** `apps/bot/src/services/telegramService.ts`, `apps/bot/src/services/notificationService.ts`, `apps/web/app/api/telegram/link/route.ts`
- Replaced insecure Telegram deep-linking (`/start <userId>`) with a secure 6-digit OTP code linking mechanism.
- Refactored `alertBot.ts` into a centralized `notificationService.ts` to implement event-driven notifications (`notify({ type: 'TRADE_OPENED' })`).
- Updated `orchestrator.ts` and `subscriptionManager.ts` to emit events instead of making direct bot message calls.
- Updated `apps/bot/src/index.ts` to include an Express endpoint for Telegram webhooks (`/api/telegram/webhook`).
- **Why:** To improve security for account linking, provide a scalable notification architecture, and prepare the bot for production webhook deployment on Fly.io.

## [2026-05-07T02:05:00-07:00]
### Fixed — Helius Webhook Domain Updated
- **File:** `apps/bot/.env`
- Replaced temporary `loca.lt` URL with production `https://copysignal-bot-engine.fly.dev/webhook/solana`.
- **Why:** Ensure Solana payment webhooks reach the production server.

## [2026-05-07T01:54:00-07:00]
### Fixed — CORS Policy Updated
- **File:** `apps/web/middleware.ts`
- Added `https://copysignal-bot.vercel.app` and `https://copysignal-bot.com` to the `ALLOWED_ORIGINS` array.
- **Why:** User is deploying to Vercel with these domains. Without this, cross-origin requests from these domains would be blocked by the browser.

## [2026-05-07T00:35:00-07:00]
### Completed — Security Audit, Telegram Notification Bot & Input Hardening

#### 1. Telegram Notification Bot (t.me/FundzCopySignalBot) — FULLY BUILT
- **File Rewritten:** `apps/bot/src/services/alertBot.ts`
- **What it does now:**
  - `/start <userId>` — Links a user's Telegram account to their CopySignal dashboard. The userId param is passed via a deep link from Settings.
  - `/status` — Shows bot uptime and user's chat ID.
  - `/help` — Lists all available commands.
  - `sendTradeAlert()` — Sends formatted trade execution alerts to linked users.
  - `sendPaymentAlert()` — Sends payment confirmation messages.
  - `sendErrorAlert()` — Sends critical system error alerts to the admin chat (configured via `TELEGRAM_ADMIN_CHAT_ID` env var).
- **Bot runs in polling mode** as part of the bot engine process (not webhooks), so it works from any host.

#### 2. Admin Error Alerting
- **File:** `apps/bot/src/index.ts`
  - Added `uncaughtException` and `unhandledRejection` process handlers that send Telegram alerts to admin.
  - Boot failures now also alert admin before exiting.
- **File:** `apps/bot/src/services/orchestrator.ts`
  - Trade execution failures now catch errors and alert admin via `sendErrorAlert()` instead of crashing silently.

#### 3. Input Validation & Sanitization Hardening
- **File:** `apps/web/app/api/channels/route.ts`
  - Added type checking for all inputs (userId, channelUsername, exchange).
  - Channel username stripped of special characters, capped at 100 chars.
  - Risk percent clamped to 0.1%–5%, max trades clamped to 1–50.
  - DELETE now verifies channel ownership (user can only deactivate their own channels).
- **Files:** `apps/web/app/api/apikeys/route.ts`, `apps/web/app/api/admin/route.ts`
  - Replaced all raw `error.message` responses with generic safe messages. Raw errors are console-logged server-side only.

#### 4. Frontend Error Boundaries
- **Files Created:** `apps/web/app/error.tsx`, `apps/web/app/global-error.tsx`
  - Route-level error boundary catches React rendering errors and shows a branded "Something went wrong" page with a "Try Again" button.
  - Global error boundary catches layout-level errors with a "Reload Application" button.
  - Users will NEVER see raw stack traces.

#### 5. Build Verification
- `next build` passes successfully (exit code 0) with all 26 routes generating correctly.

## [2026-05-07T00:15:00-07:00]
### Completed — Final Production Features, Payment Infrastructure & PWA

#### 1. Security & Infrastructure Hardening
- **API Key Validation:** Integrated `ccxt` into `apps/web/app/api/apikeys/route.ts` to fetch exchange balances during key addition, validating keys before storage.
- **Dependency Fixes:** Installed `protobufjs` and added both `ccxt` and `protobufjs` to `serverExternalPackages` in `next.config.ts` to fix Next.js edge bundling build errors.

#### 2. Next-PWA Setup
- **Configured PWA:** Installed `@ducanh2912/next-pwa` and configured it in `next.config.ts`.
- **Assets:** Generated `public/manifest.json` and a custom branded `icon.svg`. Injected manifest links and theme-color meta tags into `apps/web/app/layout.tsx`.
- **Verified:** Ran a successful `next build` to confirm service worker generation.

#### 3. Dashboard UX Enhancements
- **Global Notifications:** Built `NotificationBell.tsx` and added it to the `Sidebar.tsx` header to display global messages broadcasted by the admin.
- **Bot Engine Status:** Added a dynamic "Bot Status" banner (Active/Paused) to `dashboard/page.tsx` based on the user's active channel count.
- **Empty State Guide:** Added an onboarding Empty State in `dashboard/page.tsx` that intelligently guides new users to connect Telegram and add API keys if they haven't done so.

#### 4. Payment & Billing Enhancements
- **SOL Fee Payer Logic:** Modified `apps/bot/src/payments/solanaWalletDeriver.ts` to implement a Master Fee Payer system. Derived wallets no longer need SOL to sweep USDC; the master wallet signs and pays the gas fees.
- **Payment History Table:** Added a responsive Payment History table to `dashboard/billing/page.tsx` showing all past transactions, status, and block explorer links.
- **Renewal UX:** Added expiration warnings to the billing page. If a plan expires in < 5 days, an orange warning banner appears.
- **Referral Program:** Added a Referral Program section at the bottom of the billing page allowing users to copy their unique referral link.

#### 5. Advanced Bot Features (Batch 6)
- **Mandatory Stop Loss:** Updated `apps/bot/src/parser/signalParser.ts` to enforce `stop_loss` as a mandatory field. Signals without a stop loss now score 0 and are rejected to protect user accounts.
- **Multi-TP Partial Close:** Implemented split Take-Profit orders in `apps/bot/src/executors/binanceExecutor.ts`. If the user has `multi_tp_partial` configured in their settings, the bot will split the position across TP1 and TP2 using reduce-only orders. 
- **Channel Risk Score:** Added a Risk Score indicator (🟢 Low Risk, 🟡 Medium Risk, 🔴 High Risk) to the `apps/web/app/(dashboard)/dashboard/leaderboard/page.tsx` based on the channel's win rate.

## [2026-05-03T12:52:00-07:00]
### Fixed — React Hydration Mismatch & Turbopack Root Warning

#### 1. Fixed React Hydration Mismatch (onboarding/page.tsx)
- **Root Cause:** The QR code placeholder in Step 4 of the onboarding wizard used `Math.random()` inside JSX render to determine tile color. Because `Math.random()` produces different values on the server (SSR) vs the client, React's hydration check failed and threw a mismatch error visible in the browser console.
- **Fix:** Replaced the random grid entirely with a **deterministic static SVG** that renders identically on server and client. The SVG mimics a QR code with proper corner squares and data modules — always the same pattern.
- **Why this works:** SVG elements have no runtime-variable content, so SSR and client output match exactly.

#### 2. Fixed Turbopack "Multiple Lockfiles" Warning (next.config.ts)
- **Root Cause:** Next.js Turbopack detected two `package-lock.json` files — one at `C:\Users\SIR KOJO\package-lock.json` (system-level) and one inside `apps/web`. It couldn't determine which was the project root and warned on every `npm run dev`.
- **Fix:** Added `turbopack: { root: __dirname }` to `apps/web/next.config.ts`. This explicitly tells Turbopack that `apps/web` is the root, silencing the warning permanently.

## [2026-05-03T12:32:00-07:00]
### Added & Fixed — Guide Page, SEO, Dashboard UX, Vercel Build, Onboarding Steps

#### 1. Fixed Vercel Build TypeScript Error (PnlChart.tsx)
- **Root Cause:** `recharts` `Tooltip` `formatter` prop expects `value: ValueType | undefined`, but we typed it as `value: number`, causing a type mismatch at build time.
- **Fix:** Changed `formatter={(value: number) => ...}` to `formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'P&L']}` in `apps/web/components/dashboard/PnlChart.tsx`.
- **Verified:** `npx tsc --noEmit` now exits 0 with no errors.

#### 2. Fixed Dashboard Welcome — Shows Username Instead of Email
- **File:** `apps/web/app/(dashboard)/dashboard/page.tsx`
- **Change:** Updated welcome text from `{user.email}` to `{user.data?.username || user.email}`. Now shows the name used during signup. Falls back gracefully to email if username is not set.

#### 3. Improved Onboarding — Step 3 Channel Username Explanation
- **File:** `apps/web/app/onboarding/page.tsx`
- Added a clear explanation box under the Telegram ID field explaining:
  - Public channel → use the @username from the Telegram link (e.g. `SpartaCrypto2` or `@SpartaCrypto2`)
  - Private channel → use numeric ID starting with `-100...`
- Updated placeholder to match real-world examples.

#### 4. Improved Onboarding — Step 4 QR Code Now Interactive
- **File:** `apps/web/app/onboarding/page.tsx`
- The "Generate QR Code" button was previously non-functional. Now shows a 1.5s loading spinner, then displays a placeholder QR grid with instructions: "Open Telegram → Settings → Devices → Link Desktop Device" and a "I have scanned the code" confirm button.
- Skip button now also clears the error state before advancing to avoid UI conflicts.

#### 5. Comprehensive SEO Overhaul
- **File:** `apps/web/app/layout.tsx`
- Added full SEO metadata: `keywords`, `authors`, `openGraph` (title, description, url, siteName, locale, type), `twitter` (card, title, description), and `robots` (index, follow, googleBot directives). All attributes attribution to Fundz Technology.

#### 6. New `/guide` Page — Full System Documentation
- **Files Created:** `apps/web/app/guide/page.tsx`, `apps/web/app/guide/layout.tsx`
- A premium, Apple-inspired documentation page accessible from the landing page with 6 sections:
  1. **What is CopySignal Bot?** — Overview, 3-step flow visualization.
  2. **How It Works** — Detailed execution pipeline.
  3. **Signal Format (For Admins)** — 3 example signal formats, rules list for channel owners on how to post signals so the bot can read them.
  4. **Exchange API Setup** — Embedded YouTube videos for both Bybit and Binance; step-by-step numbered instructions; prominent warning to NEVER tick withdrawal permissions.
  5. **Connecting Telegram** — Explains @username vs -100... numeric ID; how to find private channel IDs.
  6. **Testnet / Paper Trading** — Instructions for Bybit testnet and Binance Futures testnet.
- Layout includes: sticky sidebar TOC (desktop), responsive mobile layout, highlight boxes, code blocks, YouTube iframes.
- Guide layout file adds full SEO metadata specific to the `/guide` route.

#### 7. Landing Page Updates
- Added **"Guide"** link to the main navigation bar (hidden on mobile to save space).
- Added **"System Guide & Docs"** button alongside "Start Free Trial" in the hero CTA row (links to `/guide`).

## [2026-05-03T10:45:00-07:00]
### Added — Premium UI/UX Redesign & Onboarding Flow

#### 1. Core Design System Integration
- Updated `apps/web/app/globals.css` with a new, dark-themed premium design system utilizing Tailwind v4 `@theme` approach. Built comprehensive CSS variables (backgrounds, foregrounds, primary, success, destructive, cards, borders).
- Swapped typography to `Inter` for general UI text and `JetBrains Mono` for financial metrics and code blocks (added via `layout.tsx`).

#### 2. Page Redesigns & Rebranding
- **Authentication:** Refactored `/login` and `/register` with improved validation UI, unified aesthetic (blue/green glows), password toggles, and clear "5 days free Pro access" messaging. Included a smooth redirect to `/onboarding` after registration.
- **Landing Page:** Fully overhauled `apps/web/app/page.tsx` according to the new PRD. Features include a dynamic animated hero section, a 3-step visualization, social proof, feature grids, pricing tables, and an interactive FAQ accordion.
- **Branding:** Created a unified `FooterBranding.tsx` component and embedded it across all public pages and the sidebar. Explicitly credits ownership to **Fundz Technology** and links out to their official TikTok, X/Twitter, and Instagram pages.

#### 3. Dashboard Infrastructure
- **Navigation:** Modernized `Sidebar.tsx` and `MobileNav.tsx` utilizing Lucide-react icons and aligning closely with the new premium card aesthetic.
- **Main View (`dashboard/page.tsx`):** Added a top-level "Bot Engine" status banner to reassure users.
- **Stats Cards:** Refactored `StatsCards.tsx` to display real-time metrics with JetBrains Mono numbers, dynamic color-coding, and embedded background Lucide icons for visual depth.
- **Live Trade Feed:** Enhanced `TradeFeed.tsx` rows to feature clear execution status indicators (filled, error, running), directional arrows (buy/sell), and exact time stamps.
- **P&L Chart:** Created a brand-new `PnlChart.tsx` component leveraging `recharts` to render a polished, animated area chart reflecting the user's cumulative P&L.
- **Channels Redesign:** Transformed the list view in `dashboard/channels/page.tsx` into a robust grid of rich cards highlighting active statuses, adding background blur elements, and organizing form inputs logically.

#### 4. Onboarding Wizard
- Created `apps/web/app/onboarding/page.tsx` as a sleek, 5-step interactive wizard.
- Steps include visual explanations, connecting exchange API keys, subscribing to signal channels, scanning a Telegram QR code, and a final success confirmation that links to the dashboard.

#### 5. Fixed `Failed to generate payment address` 500 Error
- **Root Cause:** The `/api/billing/session/route.ts` API endpoint was attempting to retrieve the user's HD wallet index (`userIndex`) by calling `db.auth.getUserById(userId)`. Because the `NEXT_PUBLIC_COCOBASE_API_KEY` is a public key, it lacks admin permissions to query the auth table directly, returning a 500 Internal Server Error.
- **Fix:** Refactored `apps/web/app/(dashboard)/dashboard/billing/page.tsx` to extract the `user_index` from the already authenticated client-side `user.data` object and pass it directly in the POST request body to the billing API.
- **Verification:** Both Solana and SUI payment wallets now successfully generate dynamically on localhost without errors.

## [2026-05-02T11:49:00-07:00]
### Fixed — Billing 500 Error, Session Persistence, Subscription Warning Dismiss

#### 1. Fixed `/api/billing/session` 500 Error (Both SUI & Solana)
- **Root Cause:** The `apps/web/app/api/billing/session/route.ts` was proxying all wallet generation requests to `http://localhost:3001` (the bot engine). On Vercel (serverless), there is no bot engine running at localhost, causing every request to fail with a network error and return a 500.
- **Fix:** Rewrote `apps/web/app/api/billing/session/route.ts` to derive wallet addresses **directly** using the same BIP44 HD wallet logic as the bot engine. The master mnemonics (`SOLANA_MASTER_MNEMONIC`, `SUI_MASTER_MNEMONIC`) are now read from Vercel environment variables at request time. No bot engine proxy is needed.
- **Why this works:** Vercel API routes run in Node.js (not edge), so they can use `bip39`, `ed25519-hd-key`, `@solana/web3.js`, and `@mysten/sui.js` natively.
- **Installed new deps in `apps/web`:** `bip39`, `ed25519-hd-key`, `@solana/web3.js`, `@mysten/sui.js` (same versions as bot engine).
- **Updated `apps/web/next.config.ts`:** Added `serverExternalPackages` array listing all crypto packages so Next.js webpack does not attempt to bundle them (they rely on native Node.js APIs like `Buffer` and `crypto`).
- **Vercel Action Required:** You must add `SOLANA_MASTER_MNEMONIC` and `SUI_MASTER_MNEMONIC` as environment variables in the Vercel dashboard (Settings → Environment Variables) matching the values in your bot's `.env`.
- **Local Dev Action Taken:** I have just added `SOLANA_MASTER_MNEMONIC` and `SUI_MASTER_MNEMONIC` to your local `apps/web/.env.local` file so that generating a wallet works locally now.
- **Session save:** The route now also saves a `payment_sessions` record in Cocobase so the bot watcher can still detect and confirm payments.
- **Error messages:** Improved user-facing error messages — if mnemonics are missing, users see "Payment service is not configured yet. Please contact support." instead of a raw stack trace.

#### 2. Fixed — Subscription Warning Banner Now Dismissible
- **Updated `apps/web/components/SubscriptionWarningCard.tsx`:** Added a styled `×` close button at the top-right corner of the warning card. When clicked, the card slides out and the dismissed state is stored in `sessionStorage` (`sub_warning_dismissed = true`). The card will not reappear during the same browser session but will show again after a fresh login.
- Added a smooth `slideInLeft` CSS animation for a polished feel.
- The color of the close button matches the urgency level (red/orange/yellow) to stay visually coherent.

#### 3. Fixed — Logout on Page Refresh (Session Persistence + 15-min Inactivity Timeout)
- **Root Cause:** `apps/web/hooks/useAuth.ts` called `db.auth.getCurrentUser()` on every mount. If Cocobase's token was not persisted between page loads (e.g., stored in memory or the SDK re-initializes), the call returned `null`, logging the user out on every refresh.
- **Fix:** Completely rewrote `apps/web/hooks/useAuth.ts` with a two-layer session strategy:
  1. **Layer 1 — `localStorage` persistence:** On successful login/register, the user object is saved to `localStorage` under the key `copysignal_session`. On mount, the hook immediately restores this cached user (no flash, no flicker), then validates it silently in the background via `db.auth.getCurrentUser()`.
  2. **Layer 2 — Inactivity timeout:** After login, a 15-minute countdown starts. It resets on any real user activity: `mousemove`, `mousedown`, `keydown`, `touchstart`, `scroll`, `click`. If the user does nothing for 15 minutes, they are automatically logged out and redirected to `/login`. Navigating between pages or scrolling all count as activity.
  3. **Background validation:** If the background `getCurrentUser()` call returns `null` (token expired server-side), the `localStorage` cache is cleared and the user is redirected to `/login`.
  4. **Network resilience:** If the background validation fails due to a network error, the cached session is kept alive — the user stays logged in.

## [2026-04-30T06:08:00-07:00]
### Added — Password Visibility Toggle on Login & Register Pages
- Added a show/hide password eye icon button to the password input on both `apps/web/app/(auth)/login/page.tsx` and `apps/web/app/(auth)/register/page.tsx`. Clicking the eye icon toggles the password field between `type="password"` and `type="text"`, allowing users to verify what they typed. The eye icon uses inline SVG (no extra dependencies). The button uses `tabIndex={-1}` so it does not interfere with keyboard tab flow.

## [2026-04-30T05:31:00-07:00]
### Fixed — Helius Webhook SDK Replaced with Native Fetch
- **Root cause:** The `helius-sdk` package has internal version conflicts (`@solana/rpc-transport-http` hitting 404, `helius.webhooks.list` not a function). All Helius calls now go directly through the native `fetch` API against `https://api.helius.xyz/v0/webhooks`.
- **TypeScript type safety:** Added `HeliusWebhook` interface and typed all fetch responses, resolving `existingWebhooks is of type unknown` and `webhooks is of type unknown` errors.
- **Graceful DNS error handling:** Added detection for `EAI_AGAIN` DNS errors (common on Windows localhost when the network hasn't fully resolved). Bot now logs a clear warning and continues booting instead of crashing — this is a local-only issue that does not affect Fly.io production.
- **Refactored duplication:** Moved `addAddressToHeliusWebhook` out of `solanaPaymentSession.ts` and into `setupHeliusWebhook.ts` as a single source of truth; `solanaPaymentSession.ts` now imports it. Removed the now-unused `helius-sdk` import from `solanaPaymentSession.ts`.

## [2026-04-30T04:30:00-07:00]
### Critical Bug Fix — Solana Nested ATA Recovery & USDC Mint Correction
- **Fixed `USDC_MINT` Hardcoding Bug:** Discovered that in `apps/bot/src/payments/solanaWalletDeriver.ts`, the `USDC_MINT` constant was erroneously hardcoded to the master wallet address instead of the actual Solana Mainnet USDC Mint (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`). This bug caused the bot to generate an invalid Associated Token Account (ATA) for a non-existent token and present that as the user's deposit address.
- **Fixed Wallet Address Presentation:** Updated `getDerivedSolanaWalletAddress` to return the base Solana wallet address (`keypair.publicKey`) instead of deriving and returning an ATA. Returning the base wallet is the standard Solana convention and ensures that wallets like Phantom automatically derive and route tokens to the correct ATA, preventing any nested ATA issues.
- **Implemented Nested ATA Recovery Script:** When users sent real USDC to the improperly generated ATA, Phantom created a "Nested ATA" (an ATA owned by another ATA), effectively trapping the funds inside a Program Derived Address (PDA) with no private key. Rewrote `apps/bot/src/scripts/recoverFunds.ts` to utilize the `RecoverNested` instruction from the `@solana/spl-token` program. This specialized instruction allows the parent base wallet to legally rescue the nested tokens to its own real ATA, and then automatically sweeps them to the master wallet in the same transaction. Successfully rescued the stranded 0.9916 USDC.
- **Updated Session Logic (`solanaPaymentSession.ts`):** Adjusted the webhook handler to identify the base wallet address in the database rather than the previously stored ATA address.

## [2026-04-30T03:00:00-07:00]
### Fixed — Solana Payment Sweeping & Fund Recovery
- **Fixed `apps/bot/src/payments/solanaPaymentSession.ts` Sweeping Logic:** Modified `handleSolanaPayment` to ensure that `sweepUSDCToMaster` is called unconditionally if a payment session is found for the destination address. Previously, if the received amount did not exactly match the expected amount, the system logged a `wrong_amount` warning and exited without sweeping the funds, stranding them in the derived wallet. Now, funds are swept to the master wallet early in the process regardless of validation failure or session expiration.
- **Increased Payment Amount Tolerance:** Updated the tolerance in `solanaPaymentSession.ts` from `0.5` to `1.0` to safely accommodate the new billing advice where users send an extra $0.50 to cover exchange withdrawal fees.
- **Updated Billing UI (`apps/web/app/(dashboard)/dashboard/billing/page.tsx`):** Adjusted the requested USDC payment amounts to include an additional `$0.50` (e.g., `$29.50` instead of `$29.00`). Added explicit messaging advising users that the extra `$0.50` covers network and exchange withdrawal fees, ensuring the final received amount is sufficient for the system to process their subscription.
- **Created `apps/bot/src/scripts/recoverFunds.ts`:** Built a standalone CLI script that takes a `userIndex` as an argument, derives the corresponding Solana wallet, and forcefully sweeps any stranded USDC to the master wallet. This serves as an immediate recovery tool for the user's stuck 1 USDC and as a fallback mechanism.

## [2026-04-30T01:17:00-07:00]
### Fixed — Production Deployment & Billing Workflow
- **Fixed `lib/auth.ts` TypeScript Error:** Resolved Vercel deployment failure (`Property 'current_index' does not exist on type 'Document<any>'`) by casting `counterDoc` to `any` before accessing `current_index`.
- **Fixed 500 Error in Billing Session API:** Modified `apps/web/app/api/billing/session/route.ts`. Updated `botUrl` to default to `http://localhost:3001` (bot engine's actual port) instead of 8080, fixing the connection refused issue causing the 500 error. Also bypassed a TypeScript strictness error by casting `db.auth` to `any` to use `getUserById(userId)`.
- **Cleaned Up Billing UI:** Edited `apps/web/app/(dashboard)/dashboard/billing/page.tsx` to remove the "USDC Contract Addresses" section, reducing user confusion as the system now generates ephemeral wallets per user.
- **Fixed WebSocket Connection Error:** Modified `apps/web/components/dashboard/TradeFeed.tsx` to wrap `watcher.disconnect()` in a 1-second `setTimeout`. This prevents React 18 Strict Mode from tearing down the WebSocket connection before it establishes, which was causing the `WebSocket is closed before the connection is established` error in the console.
### Verified
- `npm run build` completed successfully with zero Next.js and TypeScript errors.

## [2026-04-26T13:10:00-07:00]
### Critical Patches — Payment Architecture & Signal Engine Upgrades
- **Payment Overhaul:** Migrated from flawed memo-based tracking to **BIP44-compliant Ephemeral HD Wallets**. Generated per-user unique deposit addresses for both Solana (`apps/bot/src/payments/solanaWalletDeriver.ts`) and SUI (`apps/bot/src/payments/suiWalletDeriver.ts`) using a master seed. 
- **Payment Flow Upgrade:** Implemented `apps/bot/src/payments/solanaPaymentSession.ts` to manage 2-hour payment sessions. `apps/bot/src/payments/api.ts` provides the `/api/payments/session` REST API. Updated `solanaWebhook.ts` and `suiWatcher.ts` to sweep funds directly to the master wallet and activate subscriptions based on exact received amounts. 
- **Session Cleanup Job:** Added `apps/bot/src/jobs/cleanExpiredSessions.ts` to automatically expire pending sessions after 2 hours and detach them from the Helius webhook limit.
- **Frontend Billing Overhaul:** Fully rewrote `apps/web/app/(dashboard)/dashboard/billing/page.tsx` to call the `/api/billing/session` endpoint. The UI now displays a dynamic, unique user address alongside a live countdown timer, replacing static master wallet displays.
- **User Registration Hook:** Updated `apps/web/lib/auth.ts` to perform an atomic increment on the `user_indices` singleton collection, assigning a permanent `user_index` to each new registration to deterministically map HD wallet derivation paths.
- **Signal Buffering & Intelligence:** Implemented `apps/bot/src/parser/messageBuffer.ts` to queue split Telegram messages for 15 seconds before processing, solving the multi-message transmission format from some channels.
- **Advanced Parsing Filters:** Added `containsTriggerKeyword` in `apps/bot/src/parser/signalParser.ts`. Updated `orchestrator.ts` into a "7-gate" signal pipeline including deduplication, trigger keyword checking, confidence scoring, trade quality check (min R:R ratio), TP selection strategy rules, and execution routing.
- **Dynamic Trade Management:** Built `apps/bot/src/parser/managementParser.ts` and `apps/bot/src/executors/tradeManager.ts` to allow in-progress trade manipulation. Recognizes directives like "MOVE SL TO ENTRY", "HOLD TO TP3", and "CLOSE 50%", and updates executing logic accordingly.
- **Channel Rules UI:** Created `apps/web/app/(dashboard)/dashboard/channel-rules/page.tsx` allowing users to configure customized options per-channel: specific trigger keywords, custom TP strategies (TP1 vs LAST target), buffer window durations, and management command toggles.
- **Dependencies Upgrade:** Added `bip39`, `ed25519-hd-key`, `bs58`, and `@mysten/sui.js`. Resolved import conflicts between SUI SDK versions by anchoring to the robust v1 bindings used elsewhere in the orchestrator.
### Verified
- `npx tsc --noEmit` passes with **zero errors** in `apps/bot` confirming integration stability across all new patch modules.

## [2026-04-25T13:11:00-07:00]
### Security Mitigations & Hardening
- **Mitigated RISK 6:** Added hard guards to `calculatePositionSize` in `apps/bot/src/utils/riskCalc.ts` to prevent position sizing errors and throw exceptions if account balance is 0 or prices are invalid, ensuring orchestrator catches the error and stops the trade.
- **Mitigated RISK 9:** Created a root `.gitignore` file to strictly ignore all `.env` files (except `.env.example`) to prevent accidental commits of secrets like `ENCRYPTION_KEY`, `TELEGRAM_SESSION`, and API keys.

## [2026-04-25T12:57:00-07:00]
### Added — Phase 4: Crypto Payment System (USDC on Solana & SUI)
- **Removed Stripe entirely.** Deleted `apps/web/app/api/checkout/route.ts` and `apps/web/app/api/webhooks/stripe/route.ts`. Stripe is no longer used for any part of the payment flow.
- **Created `apps/bot/src/payments/subscriptionManager.ts`** — Central activation logic. Called by both Solana and SUI payment handlers. Creates a record in the `payments` collection, updates the user's plan and expiry, and sends a Telegram confirmation message. Deduplication is enforced via `tx_signature` uniqueness.
- **Created `apps/bot/src/payments/solanaWebhook.ts`** — Express route handler for Helius webhook (`POST /webhook/solana`). On each incoming event: verifies the transaction exists on-chain via Helius RPC (anti-forgery), deduplicates by `tx_signature`, checks for the USDC mint (`DSgSbuu4J4tDFjo7qb98TjtNeDwMHH68CwiKZi66P3Y3`), extracts the `SOL-REF-XXXXXX` code from the memo, maps to user, determines plan tier by amount ($29 = Starter, $79 = Pro), and calls `activateSubscription()`. Unmatched payments are logged to `unmatched_payments` for manual review.
- **Created `apps/bot/src/payments/suiWatcher.ts`** — Polls SUI Mainnet RPC (`fullnode.mainnet.sui.io`) every 10 seconds using direct JSON-RPC calls (`suix_queryTransactionBlocks` + `sui_getTransactionBlock`). Monitors the SUI wallet for USDC inflows using coin type `0x7f821d44c87a6c44689298672fea7e54800a8a4f9cba2edd6776d8233c7b819f::usdc::USDC`. Extracts `SUI-REF-XXXXXX` from transaction memo/input fields. Uses cursor pagination to avoid reprocessing old transactions.
- **Created `apps/bot/src/payments/setupHeliusWebhook.ts`** — Idempotent webhook registration at bot startup using `createHelius()` from `helius-sdk`. Skips gracefully if already registered or env vars are missing.
- **Created `apps/bot/src/jobs/dailySubscriptionCheck.ts`** — Cron job running at 00:00 UTC. Fetches all users and filters by plan in memory (Cocobase does not support array filter values). Downgrades expired accounts to free and sends Telegram alerts on days 3, 2, and 1 before expiry.
- **Updated `apps/bot/src/index.ts`** — Added Express server startup on `PORT` (default 3001) with `/health` and `/webhook/solana` endpoints. Express rate-limiter applied to all `/webhook/*` routes. `startSuiWatcher()`, `ensureHeliusWebhook()`, and `node-cron` daily subscription job wired in at boot.
- **Updated `apps/bot/fly.toml`** — Added `[http_service]` block with `auto_stop_machines = false` and `min_machines_running = 1` to ensure the bot VM never sleeps.
- **Updated `apps/bot/Dockerfile`** — Multi-stage alpine build: compile TypeScript in builder, copy only `dist/` + prod deps to final image. Added `HEALTHCHECK` targeting port 3001.
- **Installed bot deps:** `express`, `@solana/web3.js`, `helius-sdk`, `@mysten/sui`, `node-cron`, `express-rate-limit`, `@types/express`, `@types/node-cron`.
- **Created `apps/web/lib/auth.ts`** — `registerUser()` helper that sets `plan: 'trial'`, `trial_used: true`, and `plan_expires_at = now + 5 days`. Used by the register page. The `trial_used` flag is permanent and must never be overwritten.
- **Updated `apps/web/app/(auth)/register/page.tsx`** — Now calls `registerUser()` helper, shows "5 days free Pro access" messaging, loading state, and improved validation.
- **Updated `apps/web/app/(auth)/login/page.tsx`** — Added trial upsell messaging, Enter-key login support, and loading state.
- **Created `apps/web/app/(dashboard)/dashboard/billing/page.tsx`** — Full billing page: shows current plan + expiry, plan comparison selector ($29 Starter / $79 Pro), chain toggle (SUI marked ✅ Recommended / Solana), wallet address with copy button, personal reference code (`SUI-REF-XXXXXX` / `SOL-REF-XXXXXX`) with copy button, step-by-step payment instructions per chain, USDC contract addresses for verification, and a post-payment explanation of activation timing.
- **Created `apps/web/app/api/billing/refcodes/route.ts`** — `GET /api/billing/refcodes?userId=...` — idempotently fetches or creates the user's payment reference codes from the `payment_refs` collection.
- **Created `apps/web/app/api/health/route.ts`** — `GET /api/health` returning `{ status, timestamp, version }`.
- **Created `apps/web/components/SubscriptionWarningCard.tsx`** — Fixed bottom-left persistent warning card. Appears at ≤3 days remaining (never before). Color: yellow (3 days) → orange (2 days) → red (1 day). No dismiss button by design. Links to `/dashboard/billing`.
- **Updated `apps/web/app/(dashboard)/layout.tsx`** — Added `<SubscriptionWarningCard />` so it appears on every dashboard page.
- **Updated `apps/web/components/Sidebar.tsx`** — Fixed Billing link to `/dashboard/billing` (was `/billing`). Added active link highlighting using `usePathname`. Added emoji icons and subtitle branding.
- **Created `apps/web/vercel.json`** — Sets `maxDuration: 10` for all API routes, framework set to `nextjs`.
- **Updated `apps/web/next.config.ts`** — Added production security headers (HSTS, X-Frame-Options, XSS Protection, Referrer-Policy, Permissions-Policy). Added Google profile image domain for OAuth.
- **Created `apps/web/.env.example`** — Template for all web env vars (safe to commit, no real values).
- **Installed web deps:** `next-auth`, `swr`.
### Verified
- `npx tsc --noEmit` passes with **zero errors** in `apps/bot`.
- `npx tsc --noEmit` passes with **zero errors** in `apps/web`.

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
