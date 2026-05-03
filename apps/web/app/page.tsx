import Link from "next/link";
import { ArrowRight, Bot, Zap, Shield, TrendingUp, CheckCircle2, Activity, Clock } from "lucide-react";
import { FooterBranding } from "@/components/FooterBranding";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden selection:bg-primary/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground tracking-tight text-lg">CopySignal Bot</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-24">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-32 px-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
          
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                V2 Engine Now Live
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1]">
                Automate Your Crypto Trades.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                  Zero Delay. Zero Emotion.
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Instantly copy trades from premium Telegram signal channels directly to your Bybit or Binance account. Never miss a setup while you sleep.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/90 transition-all shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95">
                  Start 5-Day Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a href="#demo" className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-secondary/80 transition-all border border-border">
                  View Live Demo
                </a>
              </div>
            </div>

            {/* HERO ANIMATION / MOCKUP */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none [perspective:1000px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl rounded-full" />
              <div className="relative bg-card border border-border rounded-2xl p-6 shadow-2xl transform md:[transform:rotateY(-10deg)_rotateX(5deg)] hover:[transform:rotateY(0deg)_rotateX(0deg)] transition-transform duration-700 ease-out">
                {/* Simulated Telegram Message */}
                <div className="bg-[#18222d] rounded-xl p-4 mb-6 shadow-inner animate-pulse border border-[#2b3a4a] [animation-duration:3s]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-400">Premium Signals Alpha</div>
                      <div className="text-xs text-slate-400">Just now</div>
                    </div>
                  </div>
                  <div className="font-mono text-sm text-slate-200 leading-relaxed">
                    <span className="text-success font-bold">LONG</span> BTC/USDT<br/>
                    Entry: 64,500<br/>
                    Leverage: 20x<br/>
                    TP1: 65,000<br/>
                    SL: 63,800
                  </div>
                </div>

                {/* Animated Bot Execution Pipeline */}
                <div className="relative pb-8 pl-6 border-l-2 border-border space-y-8">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full bg-primary animate-ping" />
                    <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full bg-primary" />
                    <div className="bg-background border border-border rounded-lg p-3 text-sm flex justify-between items-center opacity-0 animate-[slide-in-right_0.5s_ease-out_0.5s_forwards]">
                      <span className="text-muted-foreground flex items-center gap-2"><Activity className="h-4 w-4"/> Signal Parsed</span>
                      <span className="font-mono text-xs text-primary">12ms</span>
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                    <div className="bg-background border border-border rounded-lg p-3 text-sm flex justify-between items-center opacity-0 animate-[slide-in-right_0.5s_ease-out_1.2s_forwards]">
                      <span className="text-muted-foreground flex items-center gap-2"><Shield className="h-4 w-4"/> Risk Calculated</span>
                      <span className="font-mono text-xs text-foreground">5% (0.15 BTC)</span>
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full border-2 border-success bg-background shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm flex justify-between items-center opacity-0 animate-[slide-in-right_0.5s_ease-out_2.0s_forwards]">
                      <span className="text-success font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> Order Executed</span>
                      <span className="font-mono text-xs text-success">Bybit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="border-y border-border/50 bg-secondary/30 py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-muted-foreground font-medium text-sm md:text-base">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-background z-30" />
                <div className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-background z-20" />
                <div className="w-8 h-8 rounded-full bg-zinc-500 border-2 border-background z-10" />
              </div>
              Trusted by 500+ Traders
            </div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              $2M+ Volume Executed
            </div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              99.9% Uptime
            </div>
          </div>
        </section>

        {/* EMPATHY / PROBLEM SECTION */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">Stop losing money to slow execution.</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Missing trades while sleeping? Fat-fingering position sizes during volatile spikes? Waking up to see a trade hit TP3 but you never entered? <strong className="text-foreground">Human reaction time is your biggest liability.</strong>
            </p>
          </div>
        </section>

        {/* 3-STEP GUIDE */}
        <section id="demo" className="py-32 px-6 bg-secondary/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Set up once. Profit 24/7.</h2>
              <p className="text-lg text-muted-foreground">It takes less than 5 minutes to fully automate your trading.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Connect API", desc: "Securely link your Binance or Bybit account. We use AES-256 encryption and never have withdrawal access." },
                { step: "02", title: "Add Channels", desc: "Forward any Telegram signal channel to your unique bot address. We'll parse the messages instantly." },
                { step: "03", title: "Auto-Profit", desc: "Set your risk per trade (e.g., 2%). The bot calculates position sizing and executes orders automatically." }
              ].map((item, i) => (
                <div key={i} className="relative p-8 rounded-3xl bg-card border border-border shadow-lg hover:shadow-xl transition-all">
                  <div className="text-6xl font-black text-primary/10 absolute top-4 right-6">{item.step}</div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 relative z-10">{item.title}</h3>
                  <p className="text-muted-foreground relative z-10 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Engineered for absolute precision.</h2>
                <div className="space-y-6">
                  {[
                    { title: "Sub-second Execution", desc: "Signals are parsed and executed on the exchange within milliseconds of the Telegram message arriving." },
                    { title: "Smart Position Sizing", desc: "Input your risk % and Stop Loss. The bot calculates the exact contract quantity so you never risk more than intended." },
                    { title: "Advanced Trade Management", desc: "Automatically moves Stop Loss to entry after TP1. Supports multiple Take Profit targets natively." }
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground mb-1">{feature.title}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border p-8 rounded-3xl shadow-2xl relative">
                 <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/30 to-transparent rounded-[1.6rem] -z-10 blur-xl opacity-50" />
                 {/* Decorative mock UI snippet */}
                 <div className="space-y-4 font-mono text-sm">
                   <div className="flex justify-between items-center border-b border-border pb-2">
                     <span className="text-muted-foreground">Status</span>
                     <span className="text-success flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success animate-[pulse_2s_ease-in-out_infinite]" /> Active</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-border pb-2">
                     <span className="text-muted-foreground">Latency</span>
                     <span className="text-foreground">24ms</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-border pb-2">
                     <span className="text-muted-foreground">Avg. Risk</span>
                     <span className="text-foreground">2.0%</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-32 px-6 bg-secondary/10 border-t border-border/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Simple, transparent pricing.</h2>
              <p className="text-lg text-muted-foreground">Pay with USDC on Solana or SUI. Cancel anytime.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Starter */}
              <div className="bg-card border border-border rounded-3xl p-8 shadow-lg relative">
                <h3 className="text-2xl font-bold text-foreground mb-2">Starter</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">$29</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="h-5 w-5 text-primary" /> Up to 3 Telegram Channels</li>
                  <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="h-5 w-5 text-primary" /> Standard Execution Speed</li>
                  <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="h-5 w-5 text-primary" /> Binance & Bybit Support</li>
                </ul>
                <Link href="/register" className="block w-full text-center bg-secondary hover:bg-secondary/80 text-foreground border border-border font-semibold py-3 rounded-xl transition-colors">
                  Start Free Trial
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-card border-2 border-primary rounded-3xl p-8 shadow-2xl relative transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">$79</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="h-5 w-5 text-primary" /> Unlimited Telegram Channels</li>
                  <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="h-5 w-5 text-primary" /> Priority API Execution Queue</li>
                  <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="h-5 w-5 text-primary" /> Advanced Trade Management</li>
                  <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="h-5 w-5 text-primary" /> Personal Alert Bot DMs</li>
                </ul>
                <Link href="/register" className="block w-full text-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-primary/25">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* FAQ SECTION */}
        <section className="py-32 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { q: "Is it safe to connect my exchange API?", a: "Yes. We require API keys with ONLY trading permissions. Our system outright rejects any API key that has withdrawal permissions enabled. Your keys are encrypted at rest using AES-256." },
                { q: "How fast are trades executed?", a: "Trades are executed within milliseconds of the Telegram signal arriving. Our global infrastructure is hosted near major exchange servers to minimize network latency." },
                { q: "Do I need to leave my computer on?", a: "No. CopySignal Bot is 100% cloud-based. Once you set it up, it runs 24/7 on our enterprise-grade servers." },
                { q: "How do I pay?", a: "We accept USDC on the Solana and SUI networks. The payment process is fully automated—your subscription activates seconds after the blockchain confirms the transfer." },
              ].map((faq, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-foreground mb-2">{faq.q}</h4>
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <FooterBranding />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
