'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/cocobase';

// Note: Actual encryption should ideally happen server-side or via an API route. 
// For this MVP, we save directly to Cocobase. In the real flow, the server 
// handles the AES encryption before inserting into DB per RISK 1 mitigation.
// Because of the client-side direct-DB write architecture right now, we will
// create an API route to handle saving the key if we want proper security, 
// but for the immediate UI fix, we will simulate the form.

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'error' | 'success', text: string} | null>(null);

  // Form State
  const [exchange, setExchange] = useState('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  
  // Existing Keys State (just showing they exist, never showing the plaintext)
  const [hasBinance, setHasBinance] = useState(false);
  const [hasBybit, setHasBybit] = useState(false);

  const fetchKeys = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Because of Cocobase rules (Server Only for read), this client call might fail
      // if Risk 5 mitigations were fully applied to read rules.
      // Ideally, the user's keys are fetched via an API route.
      // We will attempt to fetch or just let the user overwrite.
      const res = await fetch(`/api/apikeys?userId=${user.id}`).then(r => r.json()).catch(() => []);
      
      if (Array.isArray(res)) {
        setHasBinance(res.some(k => k.exchange === 'binance'));
        setHasBybit(res.some(k => k.exchange === 'bybit'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setStatusMsg(null);
    try {
      // Send to internal Next.js API route to handle secure AES encryption
      // before it reaches Cocobase.
      const res = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          exchange,
          apiKey,
          apiSecret
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save API key');
      
      setStatusMsg({ type: 'success', text: 'API Keys encrypted and saved successfully!' });
      setApiKey('');
      setApiSecret('');
      
      if (exchange === 'binance') setHasBinance(true);
      if (exchange === 'bybit') setHasBybit(true);
      
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage your exchange API keys. Keys are AES-256 encrypted before storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Exchange Status Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Connected Exchanges</h2>
          
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 text-yellow-500 rounded-lg flex items-center justify-center font-bold">B</div>
              <div>
                <h3 className="text-white font-bold">Binance</h3>
                <p className="text-zinc-500 text-xs">Spot & Futures</p>
              </div>
            </div>
            {hasBinance ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">Connected</span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-500">Not Configured</span>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 text-orange-500 rounded-lg flex items-center justify-center font-bold">By</div>
              <div>
                <h3 className="text-white font-bold">Bybit</h3>
                <p className="text-zinc-500 text-xs">Derivatives</p>
              </div>
            </div>
            {hasBybit ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">Connected</span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-500">Not Configured</span>
            )}
          </div>
        </div>

        {/* Add/Update Key Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4">Add Exchange Keys</h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            {statusMsg && (
              <div className={`px-4 py-3 rounded-lg text-sm ${statusMsg.type === 'error' ? 'bg-red-500/10 border border-red-500/50 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400'}`}>
                {statusMsg.text}
              </div>
            )}
            
            <div>
              <label className="block text-zinc-400 text-sm mb-1">Exchange</label>
              <select
                value={exchange}
                onChange={e => setExchange(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition appearance-none"
              >
                <option value="binance">Binance</option>
                <option value="bybit">Bybit</option>
              </select>
            </div>
            
            <div>
              <label className="block text-zinc-400 text-sm mb-1">API Key</label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition font-mono text-sm"
              />
            </div>
            
            <div>
              <label className="block text-zinc-400 text-sm mb-1">API Secret</label>
              <input
                type="password"
                required
                value={apiSecret}
                onChange={e => setApiSecret(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition font-mono text-sm"
              />
            </div>
            
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition mt-2"
            >
              {saving ? 'Encrypting & Saving...' : 'Save Keys'}
            </button>
            
            <p className="text-zinc-500 text-xs text-center mt-4">
              Keys are AES-256-CBC encrypted on our secure server before reaching the database.
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}
