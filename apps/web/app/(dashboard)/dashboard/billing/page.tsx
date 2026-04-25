'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface RefCodes {
  sol_ref_code: string;
  sui_ref_code: string;
}

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
    price: '$29 / mo',
    amount: 29,
    channels: '1 channel',
    exchanges: '1 exchange',
    trades: '5 / day',
    features: ['Telegram alerts', 'Basic dashboard', 'Bybit OR Binance'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79 / mo',
    amount: 79,
    channels: 'Unlimited',
    exchanges: 'Both',
    trades: 'Unlimited',
    features: ['Full dashboard', 'P&L analytics', 'Bybit + Binance', 'Priority support'],
    recommended: true,
  },
];

// Wallet addresses
const SOLANA_WALLET = process.env.NEXT_PUBLIC_SOLANA_WALLET_ADDRESS || '';
const SUI_WALLET = process.env.NEXT_PUBLIC_SUI_WALLET_ADDRESS || '';

export default function BillingPage() {
  const { user } = useAuth();
  const [refCodes, setRefCodes] = useState<RefCodes | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>('pro');
  const [selectedChain, setSelectedChain] = useState<'sui' | 'solana'>('sui');
  const [copied, setCopied] = useState<string | null>(null);
  const [loadingRefs, setLoadingRefs] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/billing/refcodes?userId=${user.id}`)
      .then(r => r.json())
      .then(data => { setRefCodes(data); setLoadingRefs(false); })
      .catch(() => setLoadingRefs(false));
  }, [user]);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const plan = user?.data?.plan || 'free';
  const expiresAt = user?.data?.plan_expires_at
    ? new Date(user.data.plan_expires_at).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null;

  const walletAddress = selectedChain === 'sui' ? SUI_WALLET : SOLANA_WALLET;
  const refCode = selectedChain === 'sui' ? refCodes?.sui_ref_code : refCodes?.sol_ref_code;
  const selectedPlanAmount = PLANS.find(p => p.id === selectedPlan)?.amount || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Subscription</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Pay with USDC on Solana or SUI. Payments are instant and irreversible.
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-zinc-400 text-sm">Current Plan</p>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-2xl font-bold capitalize ${
                plan === 'pro' ? 'text-blue-400' :
                plan === 'starter' ? 'text-emerald-400' :
                plan === 'trial' ? 'text-purple-400' :
                'text-zinc-400'
              }`}>
                {plan === 'trial' ? '✨ Trial (Pro)' : plan.charAt(0).toUpperCase() + plan.slice(1)}
              </span>
            </div>
            {expiresAt && (
              <p className="text-zinc-500 text-xs mt-1">
                {plan === 'free' ? '' : `Expires: ${expiresAt}`}
              </p>
            )}
          </div>
          {plan === 'free' && (
            <div className="bg-zinc-800 rounded-xl px-4 py-2 text-zinc-400 text-sm">
              Subscribe below to activate auto-trading
            </div>
          )}
        </div>
      </div>

      {/* Plan Selector */}
      <div>
        <h2 className="text-white font-semibold mb-4">Choose a Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map(p => (
            <button
              key={p.id}
              onClick={() => p.amount && setSelectedPlan(p.id as 'starter' | 'pro')}
              disabled={!p.amount}
              className={`relative text-left rounded-2xl border p-5 transition ${
                p.recommended
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-zinc-800 bg-zinc-900'
              } ${selectedPlan === p.id && p.amount ? 'ring-2 ring-blue-500' : ''} ${
                !p.amount ? 'opacity-50 cursor-default' : 'hover:border-zinc-600 cursor-pointer'
              }`}
            >
              {p.recommended && (
                <span className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  MOST POPULAR
                </span>
              )}
              <div className="font-bold text-white text-lg">{p.name}</div>
              <div className="text-blue-400 font-mono font-bold text-xl mt-1">{p.price}</div>
              <ul className="mt-3 space-y-1">
                {p.features.map(f => (
                  <li key={f} className="text-zinc-400 text-xs flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span> {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
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
        </div>

        {/* Step 1 — Wallet Address */}
        <div>
          <p className="text-zinc-400 text-sm mb-2 font-medium">
            Step 1 — Send to this wallet address
          </p>
          <div className="flex items-center gap-2 bg-zinc-800 rounded-xl p-3">
            <code className="text-zinc-200 text-xs flex-1 break-all font-mono leading-relaxed">
              {walletAddress || '(wallet address not configured)'}
            </code>
            <button
              onClick={() => copy(walletAddress, 'wallet')}
              className="shrink-0 bg-zinc-700 hover:bg-zinc-600 text-white text-xs px-3 py-1.5 rounded-lg transition"
            >
              {copied === 'wallet' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Step 2 — Reference Code */}
        <div>
          <p className="text-zinc-400 text-sm mb-2 font-medium">
            Step 2 — Include this reference code in the memo / note field
          </p>
          {loadingRefs ? (
            <div className="bg-zinc-800 rounded-xl p-3 animate-pulse h-12" />
          ) : (
            <div className="flex items-center gap-2 bg-zinc-800 rounded-xl p-3">
              <code className="text-emerald-400 text-sm flex-1 font-mono font-bold tracking-widest">
                {refCode || 'Loading...'}
              </code>
              <button
                onClick={() => copy(refCode || '', 'ref')}
                className="shrink-0 bg-zinc-700 hover:bg-zinc-600 text-white text-xs px-3 py-1.5 rounded-lg transition"
              >
                {copied === 'ref' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          )}
          <p className="text-zinc-500 text-xs mt-2">
            ⚠️ This reference code links your payment to your account. Missing it means manual review is needed.
          </p>
        </div>

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
                <li>Paste the wallet address above</li>
                <li>Enter <span className="text-white">${selectedPlanAmount}</span> as the amount</li>
                <li>In the <span className="text-white">memo / note</span> field, paste your reference code</li>
                <li>Confirm and send</li>
              </>
            ) : (
              <>
                <li>Open <span className="text-white">Phantom</span> → tap Send</li>
                <li>Select <span className="text-white">USDC</span> (not SOL)</li>
                <li>Paste the wallet address above</li>
                <li>Enter <span className="text-white">${selectedPlanAmount}</span></li>
                <li>Add your reference code in the <span className="text-white">memo</span> field</li>
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

      {/* USDC Contract Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider">
          USDC Contract Addresses (for verification)
        </p>
        <div className="space-y-2">
          <div>
            <span className="text-zinc-500 text-xs">SUI: </span>
            <code className="text-zinc-300 text-xs font-mono">
              0x7f821d44c87a6c44689298672fea7e54800a8a4f9cba2edd6776d8233c7b819f
            </code>
          </div>
          <div>
            <span className="text-zinc-500 text-xs">Solana: </span>
            <code className="text-zinc-300 text-xs font-mono">
              DSgSbuu4J4tDFjo7qb98TjtNeDwMHH68CwiKZi66P3Y3
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
