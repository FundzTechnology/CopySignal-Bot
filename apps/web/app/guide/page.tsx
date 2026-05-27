'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Bot, KeyRound, Rss, Zap, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { FooterBranding } from '@/components/FooterBranding';

const sections = [
  { id: 'overview', label: 'What is CopySignal Bot?' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'signal-format', label: 'Signal Format (For Admins)' },
  { id: 'api-setup', label: 'Exchange API Setup' },
  { id: 'telegram-setup', label: 'Telegram Channels (Sources)' },
  { id: 'bot-alerts', label: 'Telegram Notification Bot' },
  { id: 'advanced-features', label: 'Advanced Features (Multi-TP)' },
  { id: 'testnet', label: 'Demo & Paper Trading' },
];

function Section({ id, title, icon, children }: { id: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-4 text-zinc-300 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function VideoEmbed({ url, title }: { url: string; title: string }) {
  const videoId = url.includes('youtu.be/')
    ? url.split('youtu.be/')[1].split('?')[0]
    : url.split('v=')[1]?.split('&')[0];
  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">
      <div className="bg-zinc-900 px-4 py-2 text-sm text-zinc-400 font-medium">{title}</div>
      <div className="relative w-full aspect-video bg-zinc-950">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
      {children}
    </pre>
  );
}

function InfoBox({ type, children }: { type: 'warning' | 'success' | 'tip'; children: React.ReactNode }) {
  const styles = {
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    tip: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  };
  const icons = {
    warning: <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />,
    tip: <Zap className="h-5 w-5 shrink-0 mt-0.5" />,
  };
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${styles[type]}`}>
      {icons[type]}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="min-h-screen bg-[#080A0F] text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#080A0F]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-400" />
            <span className="font-bold tracking-tight text-lg">CopySignal Bot</span>
          </Link>
          <Link href="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full transition-colors">
            Start Free Trial <ArrowRight className="inline h-4 w-4 ml-1" />
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24 flex gap-12">

        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Table of Contents</p>
            <nav className="space-y-1">
              {sections.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  className={`block text-sm px-3 py-2 rounded-lg transition-colors ${activeSection === s.id ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                >
                  {s.label}
                </a>
              ))}
            </nav>

            <div className="mt-8 p-4 bg-blue-950/40 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-blue-300 font-semibold mb-2">Ready to start?</p>
              <Link href="/register" className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-lg transition-colors">
                Get 5 Days Free
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 space-y-20">

          {/* Hero */}
          <div className="text-center space-y-4 py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-2">
              <Zap className="h-4 w-4" /> Complete System Guide
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Everything You Need to Know
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              From first setup to live trading — a complete guide to CopySignal Bot by Fundz Technology.
            </p>
          </div>

          {/* SECTION 1: Overview */}
          <Section id="overview" title="What is CopySignal Bot?" icon={<Bot className="h-5 w-5" />}>
            <p>
              CopySignal Bot is an automated crypto trading system built by <strong className="text-white">Fundz Technology</strong>. It monitors Telegram channels for trade signals and instantly executes them on your <strong className="text-white">Bybit</strong> or <strong className="text-white">Binance</strong> account — without any manual intervention.
            </p>
            <p>
              The bot parses signal messages, calculates position size based on your risk settings, places market orders with Take Profit and Stop Loss, and logs every trade to your dashboard in real-time.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              {[
                { n: '1', color: 'blue', label: 'Signal arrives in Telegram' },
                { n: '2', color: 'purple', label: 'Bot parses & validates signal' },
                { n: '3', color: 'emerald', label: 'Trade executed on exchange' },
              ].map(item => (
                <div key={item.n} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
                  <div className={`h-10 w-10 rounded-full bg-${item.color}-500/20 text-${item.color}-400 font-bold text-lg flex items-center justify-center mx-auto mb-3`}>{item.n}</div>
                  <p className="text-sm text-zinc-300">{item.label}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* SECTION 2: How It Works */}
          <Section id="how-it-works" title="How It Works" icon={<Zap className="h-5 w-5" />}>
            <p>Once set up, you connect your exchange API keys and add the Telegram channel usernames you subscribe to. The bot runs 24/7 in the cloud, listening for signals.</p>
            <p>When a signal is detected, the bot:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Extracts the <strong className="text-white">symbol, direction, entry, TP, SL, and leverage</strong></li>
              <li>Calculates position size based on your configured risk %</li>
              <li>Places a <strong className="text-white">market order</strong> with TP and SL on your exchange</li>
              <li>Logs the trade to your dashboard</li>
              <li>Sends you a <strong className="text-white">Telegram confirmation alert</strong> via the Notification Bot</li>
            </ol>
            <InfoBox type="tip">
              The bot needs your Telegram account linked to read messages from <strong>private</strong> channels. Public channels can be accessed by username alone.
            </InfoBox>
          </Section>

          {/* SECTION 3: Signal Format */}
          <Section id="signal-format" title="Signal Format (For Admins & Channel Owners)" icon={<Rss className="h-5 w-5" />}>
            <p>
              If you run a signal channel and want CopySignal Bot to read and execute your signals, format your messages in one of these recognized structures:
            </p>
            <InfoBox type="warning">
              <strong>Very Important:</strong> The bot reads the text of your message and extracts the values using smart pattern matching. Use clear, consistent formatting in every signal.
            </InfoBox>

            <h3 className="text-white font-semibold text-lg mt-4">✅ Recommended Format</h3>
            <CodeBlock>{`LONG BTC/USDT
Entry: 64,500
Leverage: 20x
TP1: 65,000
TP2: 65,500
TP3: 66,000
SL: 63,800`}</CodeBlock>

            <h3 className="text-white font-semibold text-lg mt-4">✅ Also Recognized</h3>
            <CodeBlock>{`🟢 BUY ETH/USDT
📌 Entry: 3200 - 3250
🎯 Target 1: 3350
🎯 Target 2: 3450
🛑 Stop: 3100
⚡ Leverage: 10x`}</CodeBlock>

            <h3 className="text-white font-semibold text-lg mt-4">✅ Shorthand Format</h3>
            <CodeBlock>{`SHORT SOL USDT PERP
Entry 150
TP 145 / 140 / 135
SL 158
Lev 15x`}</CodeBlock>

            <h3 className="text-white font-semibold text-lg mt-6">Key Rules for Admins</h3>
            <ul className="space-y-2">
              {[
                'Always include BUY/LONG or SELL/SHORT clearly in your message.',
                'Always include at least one TP (Take Profit) and one SL (Stop Loss).',
                'Entry can be a single value OR a range (e.g., 150 - 155). The bot uses the midpoint.',
                'Leverage is optional. If omitted, the bot uses the user default.',
                'TP and SL values must be realistic prices — not shorthand like "TBD".',
                'The bot ignores messages that don\'t match any signal pattern (updates, analysis, news).',
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>

            <InfoBox type="success">
              Signals with at least 80% confidence (symbol + direction + entry + TP + SL all detected) are auto-executed. Lower confidence signals are logged but not traded.
            </InfoBox>
          </Section>

          {/* SECTION 4: Exchange API Setup */}
          <Section id="api-setup" title="Exchange API Setup" icon={<KeyRound className="h-5 w-5" />}>
            <InfoBox type="warning">
              <strong>NEVER enable withdrawal permissions on your API key.</strong> Enable only: Perpetual Trading, Futures Trading, Spot Trading, or Unified Account. This protects your funds even if your key is ever compromised.
            </InfoBox>

            <h3 className="text-white font-semibold text-lg mt-4">Bybit API Setup</h3>
            <p>Watch this video to create your Bybit API key step-by-step:</p>
            <VideoEmbed url="https://youtu.be/0BOXzvvScQE?si=eR2Z8Jsi3KGJQ6hb" title="How to Get Your Bybit API Key" />

            <ul className="space-y-2 mt-4">
              {[
                'Log in to Bybit → Profile → API Management',
                'Click "Create New Key" → System-generated key',
                'Name it "CopySignal Bot"',
                'Enable: Unified Trading / Perpetual / Spot — NEVER enable Withdrawal',
                'Save your API Key and API Secret immediately (secret is shown only once)',
                'Add your server IP or use no-IP restriction for cloud deployment',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ul>

            <h3 className="text-white font-semibold text-lg mt-8">Binance API Setup</h3>
            <p>Watch this video to create your Binance API key step-by-step:</p>
            <VideoEmbed url="https://youtu.be/jplFvqHwsXg?si=zrsMDrs4KQq9RKBc" title="How to Get Your Binance API Key" />

            <ul className="space-y-2 mt-4">
              {[
                'Log in to Binance → Profile → API Management',
                'Click "Create API" → System Generated',
                'Name it "CopySignal Bot" and verify with 2FA',
                'Enable: Spot & Margin Trading, Futures — NEVER enable Withdraw',
                'Restrict access by IP if possible (recommended for security)',
                'Copy and securely save your API Key and Secret Key',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="h-5 w-5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </Section>

          {/* SECTION 5: Telegram Setup */}
          <Section id="telegram-setup" title="Connecting Signal Channels" icon={<Rss className="h-5 w-5" />}>
            <p>CopySignal Bot listens to Telegram channels on your behalf. To do this, it needs to identify which channels to monitor.</p>

            <h3 className="text-white font-semibold text-lg mt-4">Finding Your Channel Username</h3>
            <p>Every public Telegram channel has a link like:</p>
            <CodeBlock>{`https://t.me/SpartaCrypto2`}</CodeBlock>
            <p>In this case, the username is <code className="bg-zinc-800 px-2 py-0.5 rounded text-emerald-400 text-sm">SpartaCrypto2</code>. That is what you enter in the bot.</p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mt-4 space-y-3">
              <p className="font-semibold text-white">When adding a channel:</p>
              <div className="space-y-2 text-sm">
                <div className="flex gap-3 items-start">
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-bold shrink-0">Channel Name</span>
                  <span>Use the visible display name in Telegram (e.g. <em>"Sparta Crypto"</em>)</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs font-bold shrink-0">Username / ID</span>
                  <span>
                    <strong>Public channel</strong>: use the @username from the link (e.g. <code className="bg-zinc-800 px-1 rounded text-emerald-400">SpartaCrypto2</code> or <code className="bg-zinc-800 px-1 rounded text-emerald-400">@SpartaCrypto2</code>)<br />
                    <strong>Private channel</strong>: use the numeric ID (starts with <code className="bg-zinc-800 px-1 rounded text-emerald-400">-100...</code>)
                  </span>
                </div>
              </div>
            </div>

            <InfoBox type="tip">
              To find a private channel's numeric ID, forward any message from it to <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="underline text-blue-400">@userinfobot</a> or use <a href="https://t.me/JsonDumpBot" target="_blank" rel="noopener noreferrer" className="underline text-blue-400">@JsonDumpBot</a>.
            </InfoBox>

            <h3 className="text-white font-semibold text-lg mt-6">Connecting Your Account (Step 4 in Onboarding)</h3>
            <p>For private channels, the bot needs your Telegram account linked via QR code or phone number. During onboarding, Step 4 guides you through this. Your session is encrypted and stored securely — the bot never has access to your chats, only the specific channels you authorize.</p>
          </Section>

          {/* NEW SECTION: Notification Bot */}
          <Section id="bot-alerts" title="Setting up the Notification Bot" icon={<Bot className="h-5 w-5" />}>
            <p>While the step above tells the system <em>where</em> to listen for trades, the <strong>Notification Bot</strong> is how the system talks to <em>you</em>. It sends you instant alerts when trades open, hit take-profits, or close.</p>

            <h3 className="text-white font-semibold text-lg mt-4">How to Connect</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
              <li>Log in to your CopySignal Dashboard and go to <strong>Settings</strong>.</li>
              <li>Under the <strong>Telegram Notifications</strong> section, click <strong>Generate Linking Code</strong>.</li>
              <li>You will receive a secure, 6-digit one-time code (e.g., <code className="bg-zinc-800 px-1 rounded text-blue-400">482915</code>).</li>
              <li>Open <a href="https://t.me/FundzCopySignalBot" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">@FundzCopySignalBot</a> on Telegram.</li>
              <li>Send the command <code className="bg-zinc-800 px-1 rounded text-emerald-400">/start</code>.</li>
              <li>Reply with your 6-digit code. The bot will instantly link your account!</li>
            </ol>
            
            <InfoBox type="success">
              Once linked, you will receive real-time alerts for every trade execution, take-profit hit, stop-loss trigger, and important admin announcements.
            </InfoBox>
          </Section>

          {/* NEW SECTION: Advanced Features */}
          <Section id="advanced-features" title="Advanced Features (Multi-TP)" icon={<Zap className="h-5 w-5" />}>
            <p>CopySignal supports advanced trade management directly from your dashboard settings.</p>

            <h3 className="text-white font-semibold text-lg mt-4">Multi-TP Partial Close</h3>
            <p>If a signal admin posts multiple Take Profit (TP) levels, you can configure the bot to take partial profits.</p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-2 mt-2">
              <li>Enable <strong>Multi-TP Partial Close</strong> in Settings.</li>
              <li>Set a percentage (e.g., <strong>50%</strong>).</li>
              <li>When TP1 is hit, the bot closes 50% of your position and secures that profit.</li>
              <li>Crucially, the bot <strong>automatically moves your Stop Loss to the Entry Price</strong>, making the rest of the trade risk-free!</li>
              <li>The remaining 50% rides to TP2 and beyond.</li>
            </ul>
          </Section>

          {/* SECTION 6: Demo / Paper Trading */}
          <Section id="testnet" title="Demo & Paper Trading" icon={<Zap className="h-5 w-5" />}>
            <p>Want to test the bot without risking real money? We strongly recommend using <strong className="text-white">Bybit Demo Trading</strong> — it runs on the same mainnet infrastructure with live price action, but uses virtual funds.</p>

            <InfoBox type="tip">
              Bybit's old "Testnet" is notoriously laggy and unreliable. Demo Trading is far superior — same speeds, same liquidity, zero risk.
            </InfoBox>

            <h3 className="text-white font-semibold text-lg mt-6">Bybit Demo Trading (Recommended)</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
              <li>Log in to <a href="https://www.bybit.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">bybit.com</a> with your regular account.</li>
              <li>Hover over your profile icon (top-right) → click <strong className="text-white">Demo Trading</strong>.</li>
              <li>You'll see a <strong className="text-amber-400">"Demo Trading"</strong> label at the top of the page — this confirms you're in demo mode.</li>
              <li>Navigate to <strong className="text-white">API Management</strong> while still in Demo mode.</li>
              <li>Create a new API key. These keys are <strong className="text-white">unique to your Demo UID</strong> and won't affect your real funds.</li>
              <li>Enable <strong className="text-white">Contract</strong> or <strong className="text-white">Unified Trading</strong> permissions — never enable Withdrawal.</li>
              <li>Copy both the <strong className="text-white">API Key</strong> and <strong className="text-white">API Secret</strong>.</li>
            </ol>

            <div className="bg-zinc-900 border border-amber-500/20 rounded-2xl p-5 mt-4 space-y-3">
              <p className="font-semibold text-amber-300">Adding Demo Keys to CopySignal</p>
              <div className="space-y-2 text-sm text-zinc-300">
                <div className="flex gap-3 items-start">
                  <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs font-bold shrink-0">Step 1</span>
                  <span>Go to <strong className="text-white">Dashboard → Settings</strong></span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs font-bold shrink-0">Step 2</span>
                  <span>Select <strong className="text-white">Bybit</strong> as the exchange</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs font-bold shrink-0">Step 3</span>
                  <span>Toggle <strong className="text-amber-400">Demo Trading Mode</strong> ON (the amber switch)</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs font-bold shrink-0">Step 4</span>
                  <span>Paste your <strong className="text-white">Demo API Key</strong> and <strong className="text-white">Demo Secret</strong></span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs font-bold shrink-0">Step 5</span>
                  <span>Click Save. The bot will connect to <code className="bg-zinc-800 px-1 rounded text-amber-400">api-demo.bybit.com</code> automatically.</span>
                </div>
              </div>
            </div>

            <InfoBox type="warning">
              <strong>Critical:</strong> Demo API keys and Live API keys are NOT interchangeable. If Demo Mode is ON, you <strong>must</strong> use keys generated while in Bybit's Demo Trading interface. Live keys will fail with an "Invalid API Key" error.
            </InfoBox>

            <h3 className="text-white font-semibold text-lg mt-8">Bybit Demo Funding</h3>
            <p className="text-sm">If you run out of demo funds, go to the <strong className="text-white">Demo Assets</strong> page on Bybit and click <strong className="text-white">"Request Demo Funds"</strong> to top up your virtual balance.</p>

            <h3 className="text-white font-semibold text-lg mt-8">Binance Testnet (Alternative)</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
              <li>Go to <a href="https://testnet.binancefuture.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">testnet.binancefuture.com</a></li>
              <li>Log in with GitHub and generate API keys from the dashboard</li>
              <li>Test funds are credited automatically</li>
              <li>Use these keys in the bot for paper trading</li>
            </ol>

            <InfoBox type="success">
              We strongly recommend testing with Demo/Testnet keys for at least 48 hours before switching to live keys. This verifies your signal channels and risk settings are configured correctly.
            </InfoBox>
          </Section>

          {/* CTA */}
          <div className="bg-gradient-to-br from-blue-950/60 to-purple-950/40 border border-blue-500/20 rounded-3xl p-10 text-center space-y-5">
            <h2 className="text-3xl font-bold">Ready to Start?</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Create your free account and get 5 days of Pro access — no payment required. Starter plan from <strong className="text-white">$10/mo</strong>, Pro from <strong className="text-white">$25/mo</strong>. Pay with USDC on Solana or SUI.</p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-full text-lg transition-all shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] hover:scale-105">
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

        </main>
      </div>

      <FooterBranding />
    </div>
  );
}
