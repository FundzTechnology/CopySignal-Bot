# 🎨 need-work-on.md
### CopySignal Bot — Full UI/UX Redesign Specification
#### Every Page. Every Screen. Every State. Built to Convert.

---

## WHY THIS FILE EXISTS

A CEO looked at the product for 10 seconds and left.
He could not tell what it does. He confused login with signup.
The dashboard gave him no confidence that this was a serious product.

That is a design failure. Not a product failure.
The product works. The presentation is killing it.

This document fixes every single thing he experienced and everything beyond that.
Follow this exactly and the product will look and feel like a premium trading tool
that people trust with their exchange API keys and their money.

---

## THE DESIGN SYSTEM — READ THIS FIRST

Before touching any page, establish these rules. Every component uses them.

### Colours

```
Background (deepest):    #09090B   ← Almost black. Not pure black.
Background (cards):      #111113   ← Slightly lighter. Cards sit on this.
Background (elevated):   #18181B   ← Hover states, modals, dropdowns.
Border (subtle):         #27272A   ← Dividers, card borders.
Border (visible):        #3F3F46   ← Input borders, active states.

Text (primary):          #FAFAFA   ← White. Main headings and data.
Text (secondary):        #A1A1AA   ← Labels, descriptions, timestamps.
Text (muted):            #71717A   ← Disabled, placeholder text only.

Green (profit/success):  #22C55E   ← P&L positive, success states.
Green (glow):            #16A34A   ← Background tint behind green values.
Red (loss/danger):       #EF4444   ← P&L negative, errors, warnings.
Red (glow):              #DC2626   ← Background tint behind red values.

Blue (primary action):   #3B82F6   ← Main CTA buttons.
Blue (hover):            #2563EB   ← Button hover state.
Blue (subtle):           #1D4ED8/20 ← Badge backgrounds, active nav.

Orange (warning):        #F97316   ← Subscription expiry, caution states.
Yellow (mild warning):   #EAB308   ← 3-day expiry reminder.

Bot Active:              #22C55E   ← The green dot. Most important colour.
Bot Paused:              #EF4444   ← The red dot.
```

### Typography

```
Font family:    Inter (Google Fonts — free)
                import in globals.css:
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

Numbers/data:   font-family: 'JetBrains Mono', monospace — for P&L, prices, amounts
                import: @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');

Sizes:
  Page title:        28px, weight 700
  Section heading:   20px, weight 600
  Card label:        13px, weight 500, uppercase, letter-spacing 0.05em
  Body text:         15px, weight 400
  Small/caption:     13px, weight 400
  Micro/timestamp:   12px, weight 400, text-muted colour

Line heights:   1.5 for body, 1.2 for headings
```

### Spacing System

```
Use multiples of 4px only:
  xs:   4px
  sm:   8px
  md:   16px
  lg:   24px
  xl:   32px
  2xl:  48px
  3xl:  64px

Card padding:           24px all sides
Section gap:            32px between major sections
Sidebar width:          240px (collapsed: 64px on mobile)
Top navbar height:      64px
Content area max-width: 1280px, centered
```

### Border Radius

```
Buttons:    8px
Cards:      16px
Inputs:     10px
Badges:     6px
Modal:      20px
Large card: 20px
```

### Shadows

```
Card shadow:     0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)
Elevated shadow: 0 4px 24px rgba(0,0,0,0.5)
Glow (green):    0 0 20px rgba(34,197,94,0.15)
Glow (blue):     0 0 20px rgba(59,130,246,0.15)
```

---

## PAGE 1 — LANDING PAGE (/)

### The Problem Right Now
The landing page does not immediately communicate what the product does.
Someone lands on it and does not know if this is a trading platform, a signal service,
or a copy trading app. They leave within 8 seconds.

### The Fix — Every Section, In Order

---

#### SECTION 1 — HERO (Above the fold — most important 600px)

This is the ONLY thing a new visitor sees before scrolling.
It must answer: What is this? Why do I need it? How do I start?
All three answers in 5 seconds.

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] CopySignal                    [Login]  [Start Free →]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│   ⚡ Auto-execute crypto signals                                │
│   on Bybit & Binance in 2 seconds.                             │
│                                                                 │
│   Your signal channels post. Your bot trades.                  │
│   While you sleep, work, or live your life.                    │
│                                                                 │
│   [Start 5-Day Free Trial →]    [Watch Demo ▶]                 │
│                                                                 │
│   No credit card · 5 days free · Cancel anytime               │
│                                                                 │
│   ─────────────────────────────────────────────                │
│                                                                 │
│   [Live mockup/video of dashboard with a trade firing]         │
│   Animated: Signal → Bot reads → Trade executes in 1.8s        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Rules for the hero:**
- Headline is 48px bold. Never more than 8 words on the main line.
- Subheadline explains the mechanism in one sentence.
- TWO CTAs: primary (Start Free Trial) and secondary (Watch Demo).
- The "no credit card · 5 days free · cancel anytime" line under the button reduces anxiety.
- The dashboard mockup or short video loop is THE most powerful element. If you cannot do video yet, use a high-quality static screenshot of the dashboard showing green P&L.

---

#### SECTION 2 — SOCIAL PROOF BAR

Immediately after the hero. Thin horizontal bar. Builds credibility fast.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Trusted by traders on          🔵 Bybit    🟡 Binance         │
│                                                                 │
│   [Number] signals executed   [Number] active users            │
│   Average execution: 1.8 seconds                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Keep the numbers real. Even "43 signals executed" and "12 active users" is credible
if it is real. Fake numbers will be found out and kill trust permanently.

---

#### SECTION 3 — THE PROBLEM (Empathy section)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   "You're losing money on signals you already have."           │
│                                                                 │
│   Not because the signals are bad.                             │
│   Because by the time you see the notification,                │
│   open the app, check the chart, and place the order —         │
│   the entry has moved. The R:R is ruined. You're late.         │
│                                                                 │
│   The average manual entry is 6-8 minutes after the signal.    │
│   On 10x leverage, 6 minutes moves the market against you.     │
│                                                                 │
│   ❌ Manual: Enter at $97,480 — 6 minutes late                  │
│   ✅ Bot:    Enter at $97,210 — 1.8 seconds after signal        │
│                                                                 │
│   That difference is the difference between                     │
│   a profitable trade and a stopped-out trade.                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

#### SECTION 4 — HOW IT WORKS (3 steps, visual)

```
┌─────────────────────────────────────────────────────────────────┐
│                   How CopySignal Works                          │
│                                                                 │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│   │                │  │                │  │                │  │
│   │   📡  Step 1   │  │   🔗  Step 2   │  │   ⚡  Step 3   │  │
│   │                │  │                │  │                │  │
│   │ Add your       │  │ Connect your   │  │ Signals fire.  │  │
│   │ Telegram       │  │ Bybit or       │  │ Bot trades.    │  │
│   │ signal channel │  │ Binance API    │  │ You profit.    │  │
│   │                │  │ key securely   │  │                │  │
│   │ Paste the      │  │ We encrypt it. │  │ Every signal.  │  │
│   │ username.      │  │ We never touch │  │ Every time.    │  │
│   │ Done.          │  │ withdrawals.   │  │ In <2 seconds. │  │
│   │                │  │                │  │                │  │
│   └────────────────┘  └────────────────┘  └────────────────┘  │
│                                                                 │
│                  [Start Free Trial →]                           │
└─────────────────────────────────────────────────────────────────┘
```

---

#### SECTION 5 — FEATURES (What makes it different)

Two-column grid. Icon on left, text on right. 6 features max.

```
⚡ 2-Second Execution          🔒 Military-Grade Encryption
Bot executes the moment the   Your API keys are AES-256
signal posts. Not when you    encrypted. We never store
see it. When it posts.        raw keys. Ever.

📊 Risk Management Built In   📡 Any Telegram Channel
Set your risk % per trade.    Works with any channel you
Bot calculates position size  already follow. No special
automatically. Never          format required.
overexpose your account.

🔔 Instant Telegram Alerts    ⏸ Full Control, Always
Get a message the moment      Pause the bot in one click.
any trade fires. Entry,       Emergency stop visible from
TP, SL — all in one alert.    every page. You are always
                              in control.
```

---

#### SECTION 6 — PRICING (Clear, no confusion)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Pricing                                 │
│                                                                 │
│   ┌──────────────────────┐    ┌──────────────────────┐         │
│   │      STARTER         │    │         PRO           │         │
│   │      $29/mo          │    │        $79/mo          │         │
│   │                      │    │  ✦ Most Popular ✦     │         │
│   │  ✓ 1 signal channel  │    │  ✓ Unlimited channels │         │
│   │  ✓ Bybit OR Binance  │    │  ✓ Bybit AND Binance  │         │
│   │  ✓ 5 trades/day      │    │  ✓ Unlimited trades   │         │
│   │  ✓ Telegram alerts   │    │  ✓ Telegram alerts    │         │
│   │  ✓ Full dashboard    │    │  ✓ P&L analytics      │         │
│   │                      │    │  ✓ Channel performance │         │
│   │  [Start Free Trial]  │    │  [Start Free Trial]   │         │
│   └──────────────────────┘    └──────────────────────┘         │
│                                                                 │
│         Both plans include a 5-day free trial.                 │
│         Pay with USDC on Solana or SUI.                        │
│         No credit card ever required.                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

#### SECTION 7 — FAQ

6 questions. Accordion style (click to expand).

```
1. Are my API keys safe?
   → Yes. They are encrypted with AES-256 before they ever touch our database.
     We never see your raw keys. We only use trading permission — never withdrawal.

2. Can the bot withdraw my funds?
   → No. We only request trading permissions. The bot cannot move funds out of your account.
     We recommend you verify this when creating your API key on Bybit or Binance.

3. What happens if a signal is wrong or unclear?
   → The bot uses a confidence scoring system. Signals that are unclear or missing a
     stop loss are automatically skipped. You see them in your dashboard marked as "skipped."

4. Which Telegram channels does it work with?
   → Any channel you are already a member of on Telegram. Paste the channel username
     and the bot starts listening immediately.

5. Can I pause the bot anytime?
   → Yes. There is a Pause All button visible on every page of the dashboard.
     Your open trades stay open but no new signals will execute.

6. What exchanges are supported?
   → Bybit and Binance futures/perpetuals. More exchanges coming in 2025.
```

---

#### SECTION 8 — FOOTER

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] CopySignal                                              │
│                                                                 │
│  Product          Legal              Connect                    │
│  Dashboard        Terms of Service   Twitter/X                 │
│  Pricing          Privacy Policy     Telegram                  │
│  FAQ              Risk Disclaimer    TikTok                    │
│                                                                 │
│  ⚠️ Risk Disclaimer: Automated trading involves substantial     │
│  risk. Past performance does not guarantee future results.      │
│  Only trade with funds you can afford to lose.                  │
│                                                                 │
│  © 2025 CopySignal. Not available in the United States.        │
└─────────────────────────────────────────────────────────────────┘
```

---

## PAGE 2 — REGISTER PAGE (/register)

### The Problem Right Now
It looks identical to the login page. Users cannot tell which page they are on.
The CEO made this exact mistake — thought he was signing up when logging in.

### The Fix — Make It Unmistakably Different

**Visual distinction rules:**
- Register page: Blue left accent bar or illustration. Green "Create Account" button.
- Login page: No left bar. Blue "Sign In" button.
- Page titles are large, clear, different colour from each other.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ╔══════╗                                                 │ │
│  │  ║      ║   Create your account                          │ │
│  │  ║  NEW ║   ──────────────────────────────────           │ │
│  │  ║      ║   5 days of Pro access, completely free.       │ │
│  │  ╚══════╝   No credit card. No crypto. Just sign up.    │ │
│  │                                                           │ │
│  │  [G] Continue with Google                                 │ │
│  │                                                           │ │
│  │  ──────────── or ────────────                            │ │
│  │                                                           │ │
│  │  Full Name                                                │ │
│  │  [                              ]                         │ │
│  │                                                           │ │
│  │  Email Address                                            │ │
│  │  [                              ]                         │ │
│  │                                                           │ │
│  │  Password (min 8 characters)                              │ │
│  │  [                              ] [👁]                    │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  🎁 You will get 5 days of Pro access free          │ │ │
│  │  │     immediately after creating your account.        │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  [      Create Free Account      ]  ← GREEN BUTTON       │ │
│  │                                                           │ │
│  │  By signing up you agree to our Terms and Privacy Policy  │ │
│  │                                                           │ │
│  │  Already have an account?  [Sign in here →]              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key differences from Login page:**
1. Title says "Create your account" in large text — Login says "Welcome back"
2. The 5-day trial callout box only appears on Register
3. Register button is GREEN. Login button is BLUE.
4. "Already have an account?" link at bottom of Register — "Don't have one?" on Login
5. Register has a Name field. Login does not.

---

## PAGE 3 — LOGIN PAGE (/login)

### The Fix — Unmistakably "Return" Not "New"

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │   Welcome back                                            │ │
│  │   ──────────────────────────────────                     │ │
│  │   Sign in to your CopySignal account.                    │ │
│  │                                                           │ │
│  │  [G] Continue with Google                                 │ │
│  │                                                           │ │
│  │  ──────────── or ────────────                            │ │
│  │                                                           │ │
│  │  Email Address                                            │ │
│  │  [                              ]                         │ │
│  │                                                           │ │
│  │  Password                                                 │ │
│  │  [                              ] [👁]                    │ │
│  │                                                           │ │
│  │                              [Forgot password?]          │ │
│  │                                                           │ │
│  │  [          Sign In          ]  ← BLUE BUTTON             │ │
│  │                                                           │ │
│  │  New to CopySignal?  [Create a free account →]           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**The rule:** Login and Register must look distinctly different at a glance.
Different headline. Different button colour. Different supporting text.
A user should know within 1 second which page they are on.

---

## PAGE 4 — ONBOARDING WIZARD (/onboarding)

### The Problem Right Now
There is no onboarding. Users land on an empty dashboard and leave.

### The Fix — 4-Step Wizard After First Registration

This appears ONCE. After it is completed, it never shows again.
Progress bar at the top shows which step they are on.

```
[━━━━━━━━░░░░░░░░░░░░] Step 1 of 4
```

---

### ONBOARDING STEP 1 — What is CopySignal?

This page explains the product in under 30 seconds with visuals.
People who just signed up may still not fully understand what they joined.

```
┌─────────────────────────────────────────────────────────────────┐
│  [━━━━━░░░░░░░░░░░░░] Step 1 of 4                               │
│                                                                 │
│   👋 Welcome to CopySignal, [Name].                             │
│                                                                 │
│   Here is what happens when everything is set up:              │
│                                                                 │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│  │Telegram  │ ──► │CopySignal│ ──► │ Bybit /  │               │
│  │Channel   │     │Bot reads │     │Binance   │               │
│  │posts     │     │signal in │     │Trade     │               │
│  │signal    │     │real time │     │executes  │               │
│  └──────────┘     └──────────┘     └──────────┘               │
│                                                                 │
│   1. Someone posts a signal in a Telegram channel.             │
│   2. Our bot reads it instantly (no delay).                    │
│   3. The trade fires on your Bybit or Binance account.         │
│   4. You get a Telegram notification: "✅ Trade executed."      │
│                                                                 │
│   You do not need to be at your screen.                        │
│   You do not need to place any trade manually.                 │
│   The bot handles everything.                                  │
│                                                                 │
│                    [Got it. Let's set it up →]                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### ONBOARDING STEP 2 — Connect Your Exchange

```
┌─────────────────────────────────────────────────────────────────┐
│  [━━━━━━━━━━░░░░░░░░] Step 2 of 4 — Connect Exchange            │
│                                                                 │
│   Connect your Bybit or Binance account.                       │
│                                                                 │
│   Your API key lets the bot place trades on your behalf.       │
│   We NEVER have withdrawal access. Read-only + Trade only.     │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Which exchange do you want to start with?              │  │
│   │                                                         │  │
│   │   [🔵 Bybit]        [🟡 Binance]                        │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   How to create your API key on Bybit:                         │
│                                                                 │
│   Step 1: Log into Bybit → Account → API Management            │
│   Step 2: Click "Create New Key"                               │
│   Step 3: Select "System-generated API keys"                   │
│   Step 4: Permissions: ✅ Read   ✅ Trade   ❌ Withdraw (OFF)  │
│   Step 5: Copy the API Key and Secret Key below               │
│                                                                 │
│   [📖 Full guide with screenshots →] (opens in new tab)        │
│                                                                 │
│   API Key:     [                                          ]     │
│   Secret Key:  [                                          ]     │
│                                                                 │
│   🔒 Your keys are encrypted with AES-256 before storage.      │
│      We cannot read them. Not even our team.                   │
│                                                                 │
│   [Validate & Continue →]              [Skip for now]          │
└─────────────────────────────────────────────────────────────────┘
```

After clicking Validate, show a live validation result:
```
Checking your API key...
✅ Key is valid
✅ Trading permission: Enabled
✅ Withdrawal permission: Disabled (good)
✅ Account balance: $1,240 USDT

Your Bybit account is connected.
```

---

### ONBOARDING STEP 3 — Add Your First Signal Channel

```
┌─────────────────────────────────────────────────────────────────┐
│  [━━━━━━━━━━━━━━━░░░] Step 3 of 4 — Add a Signal Channel        │
│                                                                 │
│   Add the Telegram channel you want the bot to follow.         │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Telegram channel username or invite link               │  │
│   │  [@channelname or https://t.me/channelname]             │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Risk per trade: 1.5%  [━━━━━●─────────] 0.5% ──────── 5%   │
│                                                                 │
│   💡 At 1.5% risk with a $1,000 account: each trade risks $15. │
│      If the stop loss hits, you lose $15. Not your whole account.│
│                                                                 │
│   Trade on:  [🔵 Bybit ▾]   (the account you just connected)  │
│                                                                 │
│   Trigger keyword (optional):                                   │
│   [🚨SIGNAL                               ]                     │
│   The bot only reads messages containing this word.            │
│   Ask your channel owner what they use. Leave blank to         │
│   attempt to read all messages.                                 │
│                                                                 │
│   [Add Channel & Continue →]            [Skip for now]         │
└─────────────────────────────────────────────────────────────────┘
```

---

### ONBOARDING STEP 4 — Connect Telegram for Alerts

```
┌─────────────────────────────────────────────────────────────────┐
│  [━━━━━━━━━━━━━━━━━━] Step 4 of 4 — Get Trade Alerts            │
│                                                                 │
│   Get instant Telegram messages every time a trade executes.   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Example alert you will receive:                        │  │
│   │                                                         │  │
│   │  ⚡ CopySignalBot                                        │  │
│   │  🟢 Trade Executed                                      │  │
│   │  Symbol: BTCUSDT  │  Side: LONG                        │  │
│   │  Entry: $97,210   │  TP: $98,500                       │  │
│   │  SL: $96,800      │  Qty: 0.012                        │  │
│   │  Executed in 1.8s ✅                                    │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   To connect:                                                   │
│   1. Open Telegram                                              │
│   2. Search: @CopySignalAlertBot                                │
│   3. Send /start to the bot                                     │
│   4. The bot will send you a 6-digit code                       │
│   5. Paste it here:                                             │
│                                                                 │
│   Your code:  [      ]                                          │
│                                                                 │
│   [Open Telegram Bot →]   (opens t.me/CopySignalAlertBot)      │
│                                                                 │
│   [Verify & Finish Setup →]           [Skip for now]           │
└─────────────────────────────────────────────────────────────────┘
```

---

### ONBOARDING COMPLETE — Success Screen

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         🎉                                      │
│                                                                 │
│              Your bot is live.                                  │
│                                                                 │
│   ✅  Exchange connected: Bybit                                 │
│   ✅  Channel added: @CryptoAlphaCalls                          │
│   ✅  Telegram alerts: Active                                   │
│   ✅  Risk per trade: 1.5%                                      │
│                                                                 │
│   The bot is now listening to your channel.                    │
│   The next signal that posts will execute automatically.       │
│                                                                 │
│   You have 4 days and 22 hours remaining on your free trial.   │
│                                                                 │
│              [Go to Dashboard →]                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PAGE 5 — MAIN DASHBOARD (/dashboard)

### The Problem Right Now
Empty states, no bot status indicator, no clear hierarchy.
User does not know if their bot is running.

### The Fix — Full Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px)              │  MAIN CONTENT AREA                      │
│                               │                                          │
│  [Logo] CopySignal            │  ┌─────────────────────────────────┐   │
│                               │  │ 🟢 Bot Active                   │   │
│  ● Dashboard                  │  │ Listening to 2 channels         │   │
│  ○ Channels                   │  │ Last signal: 14 min ago         │   │
│  ○ Trades                     │  │ (BTCUSDT Long)      [⏸ Pause]  │   │
│  ○ Channel Rules              │  └─────────────────────────────────┘   │
│  ○ Settings                   │                                          │
│  ○ Billing                    │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│                               │  │ P&L    │ │Trades  │ │Win     │ │Open    │
│  ──────────────────           │  │Today   │ │Today   │ │Rate    │ │Trades  │
│                               │  │+$142   │ │  7     │ │  71%   │ │  2     │
│  Trial: 4 days left           │  │🟢      │ │        │ │        │ │        │
│  [Upgrade →]                  │  └────────┘ └────────┘ └────────┘ └────────┘
│                               │                                          │
│  ──────────────────           │  ┌─────────────────────────────────────┐│
│                               │  │ ⚡ LIVE TRADE FEED                  ││
│  [Sign Out]                   │  │                              [●live] ││
│                               │  │ 🟢 BTCUSDT  Long  $97,210           ││
│                               │  │    TP: $98,500 · SL: $96,800        ││
│                               │  │    P&L: +$31.40 · Qty: 0.012        ││
│                               │  │    Channel: CryptoAlpha · 2h ago    ││
│                               │  │    [Manage]  [Close]                ││
│                               │  ├─────────────────────────────────────┤│
│                               │  │ 🔴 ETHUSDT  Short $3,450            ││
│                               │  │    TP: $3,380 · SL: $3,520          ││
│                               │  │    P&L: -$8.20 · Qty: 0.8          ││
│                               │  │    Channel: AltcoinCalls · 5h ago   ││
│                               │  │    [Manage]  [Close]                ││
│                               │  └─────────────────────────────────────┘│
│                               │                                          │
│                               │  ┌─────────────────────────────────────┐│
│                               │  │ 📈 P&L This Month                   ││
│                               │  │ [Line chart — 30 days]              ││
│                               │  │ Total: +$842.50                     ││
│                               │  └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Bot Status Banner — The Most Important Element

This banner is at the TOP of every dashboard page. Always visible.

**When bot is running:**
```
┌──────────────────────────────────────────────────────────────────┐
│  🟢  Bot Active — Listening to 2 channels                        │
│      Last signal detected: 14 minutes ago (BTCUSDT Long)        │
│                                              [⏸ Pause All Bots] │
└──────────────────────────────────────────────────────────────────┘
```
Background: very subtle dark green tint `rgba(34,197,94,0.05)`
Left border: 3px solid `#22C55E`

**When bot is paused:**
```
┌──────────────────────────────────────────────────────────────────┐
│  🔴  Bot Paused — No signals will execute                        │
│      Your open trades are unaffected.                            │
│                                              [▶ Resume Bot]      │
└──────────────────────────────────────────────────────────────────┘
```
Background: very subtle dark red tint `rgba(239,68,68,0.05)`
Left border: 3px solid `#EF4444`

**When no channels connected:**
```
┌──────────────────────────────────────────────────────────────────┐
│  ⚠️  No channels connected — Add a signal channel to start      │
│                                              [+ Add Channel]     │
└──────────────────────────────────────────────────────────────────┘
```
Background: very subtle amber tint `rgba(245,158,11,0.05)`
Left border: 3px solid `#F59E0B`

---

### Stats Cards — 4 Cards in a Row

Each card is identical in size and structure. Never let numbers overflow.

```
┌─────────────────────┐
│  P&L TODAY          │  ← Label: 12px, uppercase, #71717A
│                     │
│  +$142.50           │  ← Value: 28px, JetBrains Mono, #22C55E (green if +)
│                     │
│  ↑ 12% from yesterday│  ← Sub-label: 13px, secondary
└─────────────────────┘
```

The four cards:
1. P&L Today (green if positive, red if negative)
2. Trades Today (neutral white)
3. Win Rate (colour based on value: green >60%, orange 40-60%, red <40%)
4. Open Trades (blue with count)

---

### Live Trade Feed — Each Row

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  🟢        BTCUSDT           LONG                                │
│  (dot)     (symbol)          (direction)                         │
│                                                                  │
│  Entry: $97,210   TP: $98,500   SL: $96,800   Qty: 0.012        │
│                                                                  │
│  P&L: +$31.40  ●  Status: Open  ●  Channel: @CryptoAlpha        │
│       (green)                                                    │
│                                                                  │
│  Executed 2 hours ago via Bybit         [Manage]  [✕ Close]     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Colour rules:
- Green dot = Buy/Long
- Red dot = Sell/Short
- P&L value: green if positive, red if negative
- If status is "error": entire row has a red left border
- If status is "skipped": grey, no dot, shows reason

---

## PAGE 6 — CHANNELS PAGE (/dashboard/channels)

```
┌─────────────────────────────────────────────────────────────────┐
│  Signal Channels                            [+ Add Channel]     │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🟢 CryptoAlphaCalls                    [@cryptoalpha]   │  │
│  │                                                           │  │
│  │  Exchange: Bybit  ·  Risk: 1.5%  ·  Trigger: 🚨SIGNAL   │  │
│  │                                                           │  │
│  │  Signals received: 47  ·  Executed: 31  ·  Win: 68%     │  │
│  │  Total P&L from channel: +$1,240                         │  │
│  │                                                           │  │
│  │  [Configure Rules]  [Pause Channel]  [Remove]            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🔴 AltcoinCalls (paused)              [@altcoincalls]   │  │
│  │                                                           │  │
│  │  Exchange: Binance  ·  Risk: 1%  ·  Trigger: #TRADE      │  │
│  │                                                           │  │
│  │  Signals received: 23  ·  Executed: 0 (paused)           │  │
│  │                                                           │  │
│  │  [Configure Rules]  [Resume Channel]  [Remove]           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Add Channel Modal (when + Add Channel is clicked)

```
┌──────────────────────────────────────────────────────────┐
│  Add a Signal Channel                              [✕]   │
│  ────────────────────────────────────────────────────    │
│                                                          │
│  Telegram channel username                               │
│  [@channelname or invite link]                           │
│                                                          │
│  Trade on which exchange?                                │
│  [🔵 Bybit ▾]                                           │
│                                                          │
│  Risk per trade                                          │
│  [━━━━━●─────────] 1.5%                                 │
│  At this risk: $1,000 account risks $15 per trade.      │
│                                                          │
│  Trigger keyword (optional)                              │
│  [🚨SIGNAL              ]                               │
│  ℹ️  Bot only reads messages containing this word.      │
│      Leave blank to read all messages.                   │
│                                                          │
│  Max trades per day                                      │
│  [5                    ]                                 │
│                                                          │
│  [Cancel]           [Add Channel →]                     │
└──────────────────────────────────────────────────────────┘
```

---

## PAGE 7 — SETTINGS PAGE (/dashboard/settings)

This page has two main sections: Exchange API Keys and Account Security.

### Section 1: Exchange API Keys

```
┌─────────────────────────────────────────────────────────────────┐
│  Exchange Connections                                           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🔵 Bybit                                   ✅ Connected   │  │
│  │                                                           │  │
│  │  API Key: rg7Kx9...••••••••••  (last 6 chars only shown) │  │
│  │  Balance: $1,240.50 USDT                                  │  │
│  │  Trading permission: ✅ Enabled                           │  │
│  │  Withdrawal permission: ✅ Disabled (safe)                │  │
│  │                                                           │  │
│  │  [Update Key]  [Remove Key]                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🟡 Binance                                 ○ Not connected│  │
│  │                                                           │  │
│  │  Connect your Binance Futures account to                  │  │
│  │  trade signals on Binance.                                │  │
│  │                                                           │  │
│  │  [Connect Binance →]                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ⚠️  API Key Safety Reminder                                    │
│  When creating your key, only enable Read and Trade.           │
│  Never enable Withdraw. Your funds cannot be moved out.        │
│  [How to create a safe API key →]                              │
└─────────────────────────────────────────────────────────────────┘
```

### Section 2: Account Security

```
┌─────────────────────────────────────────────────────────────────┐
│  Account Security                                               │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Two-Factor Authentication (2FA)           ○ Not enabled        │
│  Protect your account with a TOTP app.                         │
│  Use Google Authenticator or Authy.                            │
│  [Enable 2FA →]                                                │
│                                                                 │
│  ──────────────────────────────────────────────────────────    │
│                                                                 │
│  Telegram Alerts Connection               ✅ Connected          │
│  Alerts go to: @yourhandle                                      │
│  [Disconnect]                                                  │
│                                                                 │
│  ──────────────────────────────────────────────────────────    │
│                                                                 │
│  Login History                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✅  Today 09:42    Lagos, Nigeria    Chrome / Windows   │   │
│  │  ✅  Yesterday      Lagos, Nigeria    Chrome / Windows   │   │
│  │  ✅  Apr 26         Lagos, Nigeria    Safari / iPhone    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  [Sign out all devices]                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## PAGE 8 — BILLING PAGE (/dashboard/billing)

```
┌─────────────────────────────────────────────────────────────────┐
│  Billing & Subscription                                         │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Current Plan:  🎁 FREE TRIAL                                   │
│  Trial expires: May 6, 2025 (4 days remaining)                 │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │  STARTER             │    │  PRO                ✨ Popular│  │
│  │  $29 / month         │    │  $79 / month                 │  │
│  │                      │    │                              │  │
│  │  ✓ 1 channel         │    │  ✓ Unlimited channels        │  │
│  │  ✓ Bybit OR Binance  │    │  ✓ Both exchanges            │  │
│  │  ✓ 5 trades/day      │    │  ✓ Unlimited trades          │  │
│  │  ✓ Alerts            │    │  ✓ Full analytics            │  │
│  │                      │    │                              │  │
│  │  [Subscribe - $29]   │    │  [Subscribe - $79]           │  │
│  └──────────────────────┘    └──────────────────────────────┘  │
│                                                                 │
│  ──────────────────────────────────────────────────────────    │
│                                                                 │
│  Payment — Select your plan above, then:                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Send $29 USDC to your unique address:                   │  │
│  │                                                          │  │
│  │  SOLANA:                                                 │  │
│  │  7xKqRm3pHnT...A3F9B2  [📋 Copy]  [Show QR]            │  │
│  │                                                          │  │
│  │  SUI:                                                    │  │
│  │  0x9aB4c7...E1D2F3  [📋 Copy]  [Show QR]               │  │
│  │                                                          │  │
│  │  ⚠️  This address is unique to you.                      │  │
│  │  ⚠️  Do NOT include a memo or note field.                │  │
│  │  ⚠️  Expires in: [1:47:23] — Generate new if expired.   │  │
│  │                                                          │  │
│  │  Status: Waiting for payment... ⏳                        │  │
│  │  (Updates automatically when payment arrives)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Payment History                                                │
│  ──────────────────────────────────────────────────────────    │
│  Apr 28  Pro  $79 USDC  Solana  ✅ Confirmed  [View on chain]  │
│  Mar 29  Pro  $79 USDC  Solana  ✅ Confirmed  [View on chain]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## PAGE 9 — TRADES HISTORY (/dashboard/trades)

```
┌─────────────────────────────────────────────────────────────────┐
│  Trade History                                                  │
│                                                                 │
│  [All] [Open] [Closed] [Skipped] [Errors]    [Export CSV]      │
│  ──────────────────────────────────────────────────────────    │
│                                                                 │
│  Filter: [All channels ▾] [All pairs ▾] [Last 30 days ▾]       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Date       Symbol      Side   Entry     TP      P&L     │  │
│  │  ──────────────────────────────────────────────────────  │  │
│  │  May 2      BTCUSDT    Long   $97,210  $98,500  +$31.40  │  │
│  │  May 2      ETHUSDT    Short  $3,450   $3,380   -$8.20   │  │
│  │  May 1      SOLUSDT    Long   $185     $195     +$24.00  │  │
│  │  Apr 30     BTCUSDT    Long   $95,100  $96,500  +$62.00  │  │
│  │  ──────────────────────────────────────────────────────  │  │
│  │  Skipped: Low confidence signal from @channel · May 1   │  │
│  │  Error: Insufficient balance · Binance · Apr 29          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Total P&L (30 days): +$842.50                                 │
│  Win rate: 71% (22 wins / 9 losses)                            │
└─────────────────────────────────────────────────────────────────┘
```

**Important:** Skipped and Error trades are shown in a muted style with an explanation.
This is critical — users need to understand WHY a signal did not fire.
Never hide skipped or failed signals.

---

## THE SUBSCRIPTION WARNING CARD

This appears bottom-left on ALL dashboard pages when 3 days or fewer remain.
It cannot be dismissed. It is intentionally persistent.

**3 days remaining — yellow:**
```
┌──────────────────────────────────────┐
│  ⏳ Subscription Expiring            │
│  ─────────────────────────────────── │
│  3 days remaining on your Pro plan.  │
│  Bot pauses when this expires.       │
│                                      │
│  [Renew Now →]                       │
└──────────────────────────────────────┘
```
Border: `#EAB308` (yellow). Background: `rgba(234,179,8,0.08)`

**2 days — orange:**
Border: `#F97316`. Background: `rgba(249,115,22,0.08)`

**1 day — red:**
Border: `#EF4444`. Background: `rgba(239,68,68,0.08)`

---

## COMPONENT RULES

### Buttons

```
Primary (action):     bg-blue-600   hover:bg-blue-700   text-white   rounded-lg   px-5 py-3   font-semibold
Success (register):   bg-green-600  hover:bg-green-700  text-white   rounded-lg   px-5 py-3   font-semibold
Danger (stop/remove): bg-red-600    hover:bg-red-700    text-white   rounded-lg   px-4 py-2   font-medium
Ghost (secondary):    border border-zinc-700  text-zinc-300  hover:bg-zinc-800  rounded-lg
```

Never use disabled-looking buttons that are actually clickable.
Never use full-width buttons in tables or rows — only in forms and modals.

### Inputs

```
Background:   #18181B
Border:       #3F3F46 (default)   #3B82F6 (focused)   #EF4444 (error)
Text:         #FAFAFA
Placeholder:  #71717A
Height:       44px minimum (large enough to tap on mobile)
Padding:      12px horizontal, 10px vertical
Border-radius: 10px
```

Every input must have:
- A visible label above it (never placeholder-only labels)
- A helper text below if the field has specific requirements
- An error state that shows below the field, not as an alert popup

### Tables

```
Header row:    bg-zinc-900, text-zinc-400, 13px uppercase, font-semibold
Data rows:     bg-transparent, border-bottom #27272A, text-zinc-200
Hover row:     bg-zinc-800/50
Alternating:   Do NOT use alternating row colours — it looks dated
Empty state:   Centered icon + message + CTA, never an empty table
```

### Cards

```
Background:     #111113
Border:         1px solid #27272A
Border-radius:  16px
Padding:        24px
Shadow:         0 1px 3px rgba(0,0,0,0.4)
Hover (if clickable): border-color #3F3F46, shadow increased
```

Never put cards inside cards. Maximum one level of nesting.

---

## WHAT TO FIX FIRST — PRIORITY ORDER

Do these in order. Do not skip ahead.

**Priority 1 — Do today:**
1. Login page and Register page must look visually different. Different headlines, different button colours, different supporting text. This fixes the CEO's exact complaint.
2. Add the bot status banner to the top of the dashboard. Green or red based on whether the bot is running. This answers the most important question users have.
3. Fix all input labels — every field must have a label above it, not just a placeholder inside.

**Priority 2 — This week:**
4. Build the 4-step onboarding wizard. This is the single biggest conversion improvement.
5. Add empty state messages everywhere there is a blank table or blank section.
6. Make the trade feed rows show P&L, channel name, and quick action buttons.
7. Redesign the billing page with the USDC payment address display and countdown timer.

**Priority 3 — Before public launch:**
8. Add the subscription warning card for 3-day expiry.
9. Build the settings page with API key validation feedback.
10. Make the channels page show per-channel win rate and P&L.
11. Full mobile responsiveness audit on every page.
12. Add the loading/saving states to every button and form.

---

## THE TEST BEFORE LAUNCH

Before showing this to anyone else, do this test:

Give the URL to someone who has never seen the product. Do not explain anything.
Watch them use it. Do not help them. Just observe.

Ask these questions after:
1. What do you think this product does? (Can they describe it correctly?)
2. Can you create an account? (Did they find the right button?)
3. Can you tell me if the bot is running? (Did they find the status indicator?)
4. Where would you go to add an exchange? (Can they find Settings?)
5. How would you pay for the product? (Can they find Billing?)

If they cannot answer all 5 confidently within 5 minutes, the UI needs more work.
Run this test. Fix the failures. Run it again.

---

*need-work-on.md — CopySignal Bot Full UI/UX Specification*
*Design system · Every page · Every state · Priority order*
