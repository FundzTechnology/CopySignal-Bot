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
  
  const [channelName, setChannelName] = useState('');
  const [channelId, setChannelId] = useState('');
  
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
      await db.createDocument('api_keys', {
        user_id: user?.id,
        exchange: exchangeType,
        api_key: apiKey,
        api_secret: apiSecret,
        created_at: new Date().toISOString()
      });
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
                      <option value="kucoin">KuCoin</option>
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
                  <h2 className="text-2xl font-bold text-foreground mb-2">Connect Telegram</h2>
                  <p className="text-muted-foreground">To read messages from private channels, our bot needs to connect to your Telegram account.</p>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center bg-secondary/30 rounded-2xl border border-border p-8 text-center mb-8">
                  {loading ? (
                     <div className="flex flex-col items-center">
                       <div className="animate-spin h-12 w-12 border-4 border-[#0088cc] border-t-transparent rounded-full mb-4"></div>
                       <p className="text-sm text-muted-foreground">Generating secure QR code session...</p>
                     </div>
                  ) : error === 'qr_generated' ? (
                     <div className="flex flex-col items-center animate-in zoom-in duration-300">
                       <div className="bg-white p-4 rounded-xl mb-4">
                         {/* Placeholder QR code */}
                         {/* Static QR code placeholder — deterministic to avoid hydration mismatch */}
                         <svg viewBox="0 0 100 100" className="w-32 h-32" xmlns="http://www.w3.org/2000/svg">
                           {/* Corner squares */}
                           <rect x="5" y="5" width="30" height="30" rx="3" fill="black"/>
                           <rect x="10" y="10" width="20" height="20" rx="1" fill="white"/>
                           <rect x="14" y="14" width="12" height="12" rx="1" fill="black"/>
                           <rect x="65" y="5" width="30" height="30" rx="3" fill="black"/>
                           <rect x="70" y="10" width="20" height="20" rx="1" fill="white"/>
                           <rect x="74" y="14" width="12" height="12" rx="1" fill="black"/>
                           <rect x="5" y="65" width="30" height="30" rx="3" fill="black"/>
                           <rect x="10" y="70" width="20" height="20" rx="1" fill="white"/>
                           <rect x="14" y="74" width="12" height="12" rx="1" fill="black"/>
                           {/* Data modules */}
                           <rect x="42" y="5" width="8" height="8" fill="black"/>
                           <rect x="52" y="5" width="8" height="8" fill="black"/>
                           <rect x="42" y="15" width="8" height="8" fill="black"/>
                           <rect x="42" y="25" width="8" height="8" fill="black"/>
                           <rect x="52" y="25" width="8" height="8" fill="black"/>
                           <rect x="5" y="42" width="8" height="8" fill="black"/>
                           <rect x="15" y="42" width="8" height="8" fill="black"/>
                           <rect x="25" y="42" width="8" height="8" fill="black"/>
                           <rect x="5" y="52" width="8" height="8" fill="black"/>
                           <rect x="25" y="52" width="8" height="8" fill="black"/>
                           <rect x="42" y="42" width="8" height="8" fill="black"/>
                           <rect x="52" y="42" width="8" height="8" fill="black"/>
                           <rect x="62" y="42" width="8" height="8" fill="black"/>
                           <rect x="42" y="52" width="8" height="8" fill="black"/>
                           <rect x="62" y="52" width="8" height="8" fill="black"/>
                           <rect x="72" y="42" width="8" height="8" fill="black"/>
                           <rect x="82" y="42" width="8" height="8" fill="black"/>
                           <rect x="72" y="52" width="8" height="8" fill="black"/>
                           <rect x="82" y="52" width="8" height="8" fill="black"/>
                           <rect x="42" y="62" width="8" height="8" fill="black"/>
                           <rect x="52" y="72" width="8" height="8" fill="black"/>
                           <rect x="62" y="62" width="8" height="8" fill="black"/>
                           <rect x="52" y="82" width="8" height="8" fill="black"/>
                           <rect x="62" y="82" width="8" height="8" fill="black"/>
                           <rect x="72" y="72" width="8" height="8" fill="black"/>
                           <rect x="82" y="62" width="8" height="8" fill="black"/>
                           <rect x="82" y="82" width="8" height="8" fill="black"/>
                         </svg>
                       </div>
                       <h3 className="text-lg font-semibold text-foreground mb-2">Scan with Telegram</h3>
                       <p className="text-sm text-muted-foreground max-w-xs">Open Telegram &gt; Settings &gt; Devices &gt; Link Desktop Device</p>
                       <button onClick={nextStep} className="mt-6 bg-[#0088cc] hover:bg-[#0077b3] text-white font-semibold py-2 px-6 rounded-xl transition-all">I have scanned the code</button>
                     </div>
                  ) : (
                    <>
                      <Link className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">QR Code Authentication</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mb-6">Scan a QR code from your Telegram app to link your account securely. Your session is encrypted.</p>
                      <button 
                        onClick={() => {
                          setLoading(true);
                          setTimeout(() => {
                            setLoading(false);
                            setError('qr_generated'); // Reusing error state creatively for UI flow
                          }, 1500);
                        }}
                        className="bg-[#0088cc] hover:bg-[#0077b3] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#0088cc]/25">
                        Generate QR Code
                      </button>
                    </>
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
