'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/cocobase';
import { useToast } from '@/components/ui/ToastProvider';
import { Shield, Monitor, MapPin, Clock, CheckCircle2, XCircle, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'error' | 'success', text: string} | null>(null);

  // Form State
  const [exchange, setExchange] = useState('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  
  // Existing Keys State
  const [hasBinance, setHasBinance] = useState(false);
  const [hasBybit, setHasBybit] = useState(false);

  // Login Activity
  const [loginEvents, setLoginEvents] = useState<any[]>([]);
  const [loginLoading, setLoginLoading] = useState(true);

  // Multi-TP Settings
  const [tpSplitEnabled, setTpSplitEnabled] = useState(true);
  const [tpSplitPercent, setTpSplitPercent] = useState(50);

  const fetchKeys = async () => {
    if (!user) return;
    try {
      setLoading(true);
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

  const fetchLoginEvents = async () => {
    if (!user) return;
    try {
      setLoginLoading(true);
      const res = await fetch(`/api/auth/login-event?userId=${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLoginEvents(data);
      }
    } catch {
      // non-critical
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
    fetchLoginEvents();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, exchange, apiKey, apiSecret })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save API key');
      
      setStatusMsg({ type: 'success', text: 'API Keys encrypted and saved successfully!' });
      showToast('API keys saved and encrypted', 'success');
      setApiKey('');
      setApiSecret('');
      
      if (exchange === 'binance') setHasBinance(true);
      if (exchange === 'bybit') setHasBybit(true);
      
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOutAll = async () => {
    if (confirm('This will sign you out of all devices. Continue?')) {
      showToast('Signed out of all devices', 'info');
      await logout(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage your exchange API keys, security, and trade settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
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

      {/* ── Trade Settings ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-1">Trade Settings</h2>
        <p className="text-zinc-500 text-sm mb-5">Configure how the bot handles trades with multiple take-profit levels.</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">Multi-TP Partial Close</p>
              <p className="text-zinc-500 text-xs mt-0.5">When a signal has multiple TPs, close a portion at TP1 and move SL to entry.</p>
            </div>
            <button
              onClick={() => setTpSplitEnabled(v => !v)}
              className={`relative w-12 h-7 rounded-full transition-colors ${tpSplitEnabled ? 'bg-blue-600' : 'bg-zinc-700'}`}
            >
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${tpSplitEnabled ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          {tpSplitEnabled && (
            <div>
              <label className="block text-zinc-400 text-xs mb-2">Percentage to close at TP1</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={10}
                  max={90}
                  step={5}
                  value={tpSplitPercent}
                  onChange={e => setTpSplitPercent(Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-white font-mono text-sm w-12 text-right">{tpSplitPercent}%</span>
              </div>
              <p className="text-zinc-500 text-xs mt-2">
                Close {tpSplitPercent}% of position at TP1. Remaining {100 - tpSplitPercent}% rides to TP2+. Stop loss will automatically move to entry price after TP1 is hit.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Login Activity ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Login Activity</h2>
              <p className="text-zinc-500 text-xs">Last 10 login attempts on your account</p>
            </div>
          </div>
          <button
            onClick={handleSignOutAll}
            className="flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-2 rounded-lg transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out All Devices
          </button>
        </div>

        {loginLoading ? (
          <div className="text-zinc-500 text-sm py-8 text-center">Loading login history...</div>
        ) : loginEvents.length === 0 ? (
          <div className="text-zinc-500 text-sm py-8 text-center">No login events recorded yet.</div>
        ) : (
          <div className="space-y-2">
            {loginEvents.map((event, i) => (
              <div key={i} className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
                <div className="shrink-0">
                  {event.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white text-sm font-medium flex items-center gap-1.5">
                      <Monitor className="h-3.5 w-3.5 text-zinc-400" />
                      {event.device || 'Unknown device'}
                    </span>
                    <span className="text-zinc-500 text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.city}, {event.country}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-0.5">IP: {event.ip_address}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-zinc-400 text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(event.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-zinc-500 text-[10px]">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
