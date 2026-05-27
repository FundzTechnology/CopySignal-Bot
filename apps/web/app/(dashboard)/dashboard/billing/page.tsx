'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/cocobase';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    channels: '0',
    exchanges: '—',
    trades: '0',
    features: ['View signals only', 'No auto-execution'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$10.5 / mo',
    amount: 10,
    channels: '1 channel',
    exchanges: '1 exchange',
    trades: '5 / day',
    features: ['Telegram alerts', 'Basic dashboard', 'Bybit OR Binance'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$25.5 / mo',
    amount: 25,
    channels: 'Unlimited',
    exchanges: 'Both',
    trades: 'Unlimited',
    features: ['Full dashboard', 'P&L analytics', 'Bybit + Binance', 'Priority support'],
    recommended: true,
  },
];

export default function BillingPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>('pro');
  const [selectedChain, setSelectedChain] = useState<'sui' | 'solana'>('sui');
  const [copied, setCopied] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentSession, setPaymentSession] = useState<{ address: string, expiresAt: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const docs = await db.listDocuments('payment_sessions', {
          filters: { user_id: user.id }
        }) as any[];
        setHistory(docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
    };
    fetchHistory();
  }, [user]);

  const generateSession = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/billing/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          userIndex: user.data?.user_index,
          chain: selectedChain, 
          plan: selectedPlan 
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPaymentSession({ address: data.address, expiresAt: data.expiresAt });
    } catch (err) {
      console.error(err);
      alert('Failed to generate payment address');
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    if (!paymentSession) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(paymentSession.expiresAt).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('EXPIRED');
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentSession]);

  // Reset session if chain or plan changes
  useEffect(() => {
    setPaymentSession(null);
  }, [selectedChain, selectedPlan]);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

    const plan = user?.data?.plan || 'free';
  const expiresAtDate = user?.data?.plan_expires_at ? new Date(user.data.plan_expires_at) : null;
  const expiresAt = expiresAtDate
    ? expiresAtDate.toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null;

  const baseAmount = PLANS.find(p => p.id === selectedPlan)?.amount || 0;
  const selectedPlanAmount = baseAmount ? baseAmount + 0.5 : 0;

  // Renewal UX logic
  const isExpiringSoon = expiresAtDate && (expiresAtDate.getTime() - Date.now() < 5 * 24 * 60 * 60 * 1000);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pay with USDC on Solana or SUI. Payments are instant and irreversible.
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
        {isExpiringSoon && (
          <div className="absolute top-0 left-0 w-full bg-orange-500/20 border-b border-orange-500/30 px-4 py-2 flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-semibold text-orange-400">Your plan expires soon! Renew now to avoid interruption.</span>
          </div>
        )}
        <div className={`flex items-center justify-between flex-wrap gap-4 ${isExpiringSoon ? 'mt-8' : ''}`}>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Current Plan</p>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-2xl font-bold capitalize ${
                plan === 'pro' ? 'text-primary' :
                plan === 'starter' ? 'text-emerald-400' :
                plan === 'trial' ? 'text-purple-400' :
                'text-muted-foreground'
              }`}>
                {plan === 'trial' ? '✨ Trial (Pro)' : plan.charAt(0).toUpperCase() + plan.slice(1)}
              </span>
            </div>
            {expiresAt && (
              <p className="text-muted-foreground text-xs mt-1.5 flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5" /> {plan === 'free' ? '' : `Expires: ${expiresAt}`}
              </p>
            )}
          </div>
          {plan === 'free' && (
            <div className="bg-secondary rounded-xl px-4 py-2 text-muted-foreground text-sm font-medium border border-border">
              Subscribe below to activate auto-trading
            </div>
          )}
        </div>
      </div>

      {/* Plan Selector */}
      <div>
        <h2 className="text-foreground font-semibold mb-4 text-lg">Choose a Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map(p => {
            const isCurrentPlan = plan === p.id;
            return (
            <button
              key={p.id}
              onClick={() => p.amount && setSelectedPlan(p.id as 'starter' | 'pro')}
              disabled={!p.amount}
              className={`relative text-left rounded-2xl border p-5 transition-all ${
                p.recommended
                  ? 'border-primary/50 bg-primary/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  : 'border-border bg-card'
              } ${selectedPlan === p.id && p.amount ? 'ring-2 ring-primary border-transparent' : ''} ${
                !p.amount ? 'opacity-50 cursor-default' : 'hover:border-primary/30 cursor-pointer hover:bg-secondary/30'
              }`}
            >
              {p.recommended && (
                <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  MOST POPULAR
                </span>
              )}
              <div className="font-bold text-foreground text-lg">{p.name}</div>
              <div className="text-primary font-mono font-bold text-xl mt-1.5 flex items-center gap-2">
                {isCurrentPlan && p.amount ? 'Renew for ' + p.price : p.price}
              </div>
              <ul className="mt-4 space-y-2">
                {p.features.map(f => (
                  <li key={f} className="text-muted-foreground text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </button>
            );
          })}
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-white font-semibold">Pay with USDC</h2>
          {/* Chain Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedChain('sui')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                selectedChain === 'sui'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              SUI
              <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                ✅ Recommended
              </span>
            </button>
            <button
              onClick={() => setSelectedChain('solana')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                selectedChain === 'solana'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              Solana
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-400 text-sm">Amount to send</p>
          <p className="text-white font-mono text-3xl font-bold mt-1">
            ${selectedPlanAmount} <span className="text-zinc-400 text-base">USDC</span>
          </p>
          <p className="text-zinc-500 text-xs mt-1">
            {selectedChain === 'sui' ? 'USDC on SUI network' : 'USDC on Solana network'}
          </p>
          <p className="text-yellow-400 text-xs mt-2 font-semibold">
            (Includes an extra $0.50 to cover exchange withdrawal fees and ensure the system picks up the payment)
          </p>
        </div>

        {!paymentSession ? (
          <button 
            onClick={generateSession}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition disabled:opacity-50"
          >
            {isGenerating ? 'Generating Wallet...' : 'Generate Payment Wallet'}
          </button>
        ) : (
          <div className="space-y-4 border border-blue-900/50 bg-blue-950/20 p-5 rounded-xl">
            <div className="flex justify-between items-center">
              <p className="text-zinc-300 text-sm font-medium">Send EXACTLY ${selectedPlanAmount} USDC to this unique address:</p>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-zinc-400">Expires in:</span>
                 <span className={`font-mono text-sm font-bold ${timeLeft === 'EXPIRED' ? 'text-red-400' : 'text-emerald-400'}`}>{timeLeft}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-zinc-800 rounded-xl p-3">
              <code className="text-emerald-400 text-sm flex-1 break-all font-mono leading-relaxed">
                {paymentSession.address}
              </code>
              <button
                onClick={() => copy(paymentSession.address, 'wallet')}
                className="shrink-0 bg-zinc-700 hover:bg-zinc-600 text-white text-xs px-3 py-1.5 rounded-lg transition"
              >
                {copied === 'wallet' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            
            <p className="text-blue-400 text-xs font-semibold">
              ℹ️ No memo required! This wallet is uniquely generated for your account. Payment is confirmed automatically.
            </p>
          </div>
        )}

        {/* Step 3 — Instructions */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
          <p className="text-white text-sm font-semibold mb-2">
            {selectedChain === 'sui' ? '📱 How to pay with Sui Wallet' : '📱 How to pay with Phantom'}
          </p>
          <ol className="text-zinc-400 text-xs space-y-1.5 list-decimal list-inside">
            {selectedChain === 'sui' ? (
              <>
                <li>Open <span className="text-white">Sui Wallet</span> → tap Send</li>
                <li>Select <span className="text-white">USDC</span> as the token</li>
                <li>Paste your unique wallet address above</li>
                <li>Enter <span className="text-white">${selectedPlanAmount}</span> as the amount</li>
                <li>Confirm and send</li>
              </>
            ) : (
              <>
                <li>Open <span className="text-white">Phantom</span> → tap Send</li>
                <li>Select <span className="text-white">USDC</span> (not SOL)</li>
                <li>Paste your unique wallet address above</li>
                <li>Enter <span className="text-white">${selectedPlanAmount}</span></li>
                <li>Confirm and send</li>
              </>
            )}
          </ol>
        </div>

        {/* What happens next */}
        <div className="border-t border-zinc-800 pt-4">
          <p className="text-zinc-500 text-xs">
            🕐 <span className="text-zinc-300">What happens next:</span> Once your transaction is confirmed on-chain (usually within 2–5 seconds on SUI, ~2 seconds on Solana), your account is automatically upgraded and you&apos;ll receive a Telegram confirmation. Your plan is valid for 30 days from the payment date.
          </p>
        </div>
        </div>

      {/* Payment History Table */}
      <div className="pt-8 border-t border-border mt-12">
        <h2 className="text-xl font-bold text-foreground mb-4">Payment History</h2>
        {history.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
            No payments found.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Network</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Tx Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((h) => (
                    <tr key={h.id || (h as any)._id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium">
                        {new Date(h.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap capitalize text-muted-foreground">
                        {h.plan}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-foreground font-mono">
                        ${h.amount_expected} USDC
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap capitalize text-muted-foreground">
                        {h.chain}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          h.status.includes('confirmed') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          h.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          h.status === 'expired' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                          {h.status === 'confirmed_late' ? 'LATE CONFIRM' : h.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {h.tx_signature ? (
                          <a 
                            href={h.chain === 'solana' ? `https://solscan.io/tx/${h.tx_signature}` : `https://suivision.xyz/txblock/${h.tx_signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-mono text-xs truncate max-w-[120px] block"
                          >
                            {h.tx_signature.substring(0, 16)}...
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
