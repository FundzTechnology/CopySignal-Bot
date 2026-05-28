'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Link, KeyRound, CheckCircle2, ChevronRight, ArrowRight, Rss, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/cocobase';
import { useAuth } from '@/hooks/useAuth';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  // Form State
  const [exchangeType, setExchangeType] = useState('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  
  const [channelName, setChannelName] = useState('');
  const [channelId, setChannelId] = useState('');
  const [riskPercent, setRiskPercent] = useState(1);
  
  // Telegram State
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleConnectExchange = async () => {
    if (!apiKey || !apiSecret) {
      setError('Please fill out all API fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          exchange: exchangeType,
          apiKey,
          apiSecret,
          demoMode: exchangeType === 'bybit' ? demoMode : false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to connect exchange.');
      nextStep();
    } catch (err: any) {
      setError(err.message || 'Failed to connect exchange.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = async () => {
    if (!channelName || !channelId) {
      setError('Please fill out all channel fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await db.createDocument('channels', {
        user_id: user?.id,
        name: channelName,
        telegram_id: channelId,
        telegram_channel_id: channelId,
        channel_username: channelId.startsWith('@') ? channelId : undefined,
        exchange: exchangeType,
        risk_percent: Math.min(Math.max(riskPercent, 0.1), 10),
        trigger_keyword: '',
        allow_medium_confidence: true,
        is_active: true,
        created_at: new Date().toISOString()
      });
      nextStep();
    } catch (err: any) {
      setError(err.message || 'Failed to add channel.');
    } finally {
      setLoading(false);
    }
  };

  const generateLinkCode = async () => {
    if (!user) return;
    try {
      setCodeLoading(true);
      setError(null);
      const res = await fetch('/api/telegram/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (data.code) {
        setLinkCode(data.code);
      }
    } catch (err: any) {
      setError('Failed to generate code');
    } finally {
      setCodeLoading(false);
    }
  };

  const fetchTelegramStatus = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/telegram/link?userId=${user.id}`);
      const data = await res.json();
      setTelegramLinked(data.linked);
      if (data.linked) {
        nextStep();
      } else {
        setError('Not linked yet — make sure you sent the code to the bot');
      }
    } catch {
      // non-critical
    }
  };

  const completeOnboarding = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Progress Bar */}
      <div className="h-1 bg-secondary w-full relative">
        <div 
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Background glow based on step */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] pointer-events-none opacity-20 transition-colors duration-1000 ${
          step === 1 ? 'bg-primary' : 
          step === 2 ? 'bg-blue-500' : 
          step === 3 ? 'bg-purple-500' : 
          step === 4 ? 'bg-indigo-500' : 
          'bg-success'
        }`} />

        <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-2xl relative z-10 overflow-hidden min-h-[500px] flex flex-col">
          
          {/* Step indicator */}
          <div className="mb-8 flex items-center justify-between">
             <div className="text-muted-foreground text-sm font-medium">Step {step} of 5</div>
             {step > 1 && step < 5 && (
               <button onClick={prevStep} className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors">
                 <ArrowLeft className="h-4 w-4" /> Back
               </button>
             )}
          </div>

          {error && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex-1 flex flex-col">
            {/* Step 1: Welcome & Visual Explanation */}
            {step === 1 && (
              <div className="flex flex-col items-center justify-center text-center h-full animate-in fade-in zoom-in duration-500">
                <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-20" />
                  <Bot className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">Welcome to CopySignal Bot</h1>
                <p className="text-muted-foreground text-lg mb-10 max-w-lg leading-relaxed">
                  Let's get you set up to automatically trade crypto signals from Telegram in just a few minutes.
                </p>
                
                <div className="flex flex-col gap-4 w-full max-w-md text-left mb-10">
                  <div className="flex items-center gap-4 bg-secondary/50 p-4 rounded-2xl border border-border">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">1</div>
                    <p className="text-sm font-medium text-foreground">Connect your exchange API keys</p>
                  </div>
                  <div className="flex items-center gap-4 bg-secondary/50 p-4 rounded-2xl border border-border">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">2</div>
                    <p className="text-sm font-medium text-foreground">Add Telegram signal channels</p>
                  </div>
                  <div className="flex items-center gap-4 bg-secondary/50 p-4 rounded-2xl border border-border">
                    <div className="h-10 w-10 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">3</div>
                    <p className="text-sm font-medium text-foreground">Let the bot auto-trade for you</p>
                  </div>
                </div>

                <button onClick={nextStep} className="w-full max-w-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 text-lg">
                  Get Started <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Step 2: Connect Exchange */}
            {step === 2 && (
              <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-500">
                <div className="mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center mb-4">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Connect Your Exchange</h2>
                  <p className="text-muted-foreground">We need your API keys to execute trades on your behalf. We recommend using keys restricted to spot trading only.</p>
                </div>

                <div className="space-y-5 mb-auto">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Select Exchange</label>
                    <select 
                      value={exchangeType}
                      onChange={(e) => setExchangeType(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm appearance-none"
                    >
                      <option value="binance">Binance</option>
                      <option value="bybit">ByBit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">API Key</label>
                    <input 
                      type="text"
                      placeholder="Paste your API key here"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">API Secret</label>
                    <input 
                      type="password"
                      placeholder="Paste your API secret here"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm font-mono text-sm"
                    />
                  </div>

                  {/* Demo Mode Toggle — Bybit only */}
                  {exchangeType === 'bybit' && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-300 font-semibold text-sm">Demo Trading Mode</p>
                          <p className="text-zinc-500 text-xs mt-0.5">Uses <code className="text-amber-400/80">api-demo.bybit.com</code> with virtual funds.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDemoMode(v => !v)}
                          className={`relative w-12 h-7 rounded-full transition-colors ${demoMode ? 'bg-amber-500' : 'bg-zinc-700'}`}
                        >
                          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${demoMode ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                      {demoMode && (
                        <p className="text-amber-400/70 text-xs mt-2 leading-relaxed">
                          ⚠ You must use API keys generated while in Bybit Demo Mode. Live keys will not work here.
                        </p>
                      )}
                    </div>
                  )}

                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-border">
                  <button onClick={nextStep} className="flex-1 py-3.5 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors">
                    Skip for now
                  </button>
                  <button onClick={handleConnectExchange} disabled={loading} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                    {loading ? 'Connecting...' : 'Connect Exchange'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Add Channel */}
            {step === 3 && (
              <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-500">
                <div className="mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center mb-4">
                    <Rss className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Add a Signal Channel</h2>
                  <p className="text-muted-foreground">What Telegram channel should we listen to? You can add more later.</p>
                </div>

                <div className="space-y-5 mb-auto">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Channel Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Sparta Crypto"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Use the visible name in Telegram (e.g. "Sparta Crypto" if that's how it appears).</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Telegram Username / ID</label>
                    <input 
                      type="text"
                      placeholder="e.g. SpartaCrypto2 or -100123456789"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm font-mono text-sm"
                    />
                    <div className="bg-secondary/30 rounded-lg p-3 mt-3 space-y-2">
                      <p className="text-xs text-foreground font-semibold">Quick rule to remember:</p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                        <li><strong>Public channel</strong> → use the username from the link (e.g. <code>SpartaCrypto2</code> or <code>@SpartaCrypto2</code>)</li>
                        <li><strong>Private channel</strong> → use numeric ID (starts with <code>-100...</code>)</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Risk Per Trade (%) <span className="text-muted-foreground/60 ml-1">max 10%</span>
                    </label>
                    <input 
                      type="number"
                      required
                      min={0.1}
                      max={10}
                      step={0.1}
                      value={riskPercent}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > 10) setRiskPercent(10);
                        else setRiskPercent(val);
                      }}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      The stop loss of each trade won't risk more than this % of your account balance.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-border">
                  <button onClick={nextStep} className="flex-1 py-3.5 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors">
                    Skip for now
                  </button>
                  <button onClick={handleAddChannel} disabled={loading} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2">
                    {loading ? 'Adding...' : 'Add Channel'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Connect Telegram */}
            {step === 4 && (
              <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-500">
                <div className="mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-[#0088cc]/20 text-[#0088cc] flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Connect Telegram Notifications</h2>
                  <p className="text-muted-foreground">Get real-time execution alerts sent straight to your Telegram.</p>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center bg-secondary/30 rounded-2xl border border-border p-8 text-center mb-8">
                  {!linkCode ? (
                    <div className="text-center py-4">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Telegram Alerts</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mb-6">Link your Telegram account to instantly receive notifications for all your trades.</p>
                      <button 
                        onClick={generateLinkCode}
                        disabled={codeLoading}
                        className="bg-[#0088cc] hover:bg-[#0077b3] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#0088cc]/25 disabled:opacity-50">
                        {codeLoading ? 'Generating...' : 'Generate Linking Code'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                      <h3 className="text-white font-bold mb-2">Your 6-Digit Linking Code:</h3>
                      <div className="bg-background border border-border px-6 py-3 rounded-xl mb-4">
                        <span className="text-3xl font-mono font-bold tracking-widest text-blue-400">{linkCode}</span>
                      </div>
                      <div className="text-left text-sm text-muted-foreground space-y-2 mb-6 bg-background/50 p-4 rounded-lg w-full max-w-sm">
                        <p>1. Open <a href="https://t.me/FundzCopySignalBot" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">@FundzCopySignalBot</a></p>
                        <p>2. Tap <strong>Start</strong>, then send the 6-digit code above as a message.</p>
                        <p>3. Come back here and click the button below.</p>
                      </div>
                      <button 
                        onClick={async () => {
                          setCodeLoading(true);
                          await fetchTelegramStatus();
                          setCodeLoading(false);
                        }}
                        disabled={codeLoading}
                        className="mt-2 bg-[#0088cc] hover:bg-[#0077b3] text-white font-semibold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {codeLoading ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : null}
                        I've sent the code
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6 border-t border-border mt-auto">
                  <button onClick={() => { setError(null); nextStep(); }} className="w-full py-3.5 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors">
                    Skip this step
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <div className="flex flex-col items-center justify-center text-center h-full animate-in zoom-in duration-500">
                <div className="h-24 w-24 rounded-full bg-success/20 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full border border-success/30 animate-ping opacity-30" />
                  <CheckCircle2 className="h-12 w-12 text-success" />
                </div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight mb-4">You're All Set!</h2>
                <p className="text-muted-foreground text-lg mb-10 max-w-sm leading-relaxed">
                  The bot is now configured and ready to execute trades automatically.
                </p>
                
                <button onClick={completeOnboarding} className="w-full max-w-sm bg-success hover:bg-success/90 text-success-foreground font-bold py-4 rounded-xl transition-all shadow-lg shadow-success/25 flex items-center justify-center gap-2 text-lg">
                  Go to Dashboard <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
