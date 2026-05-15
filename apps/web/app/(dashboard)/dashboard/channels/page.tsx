'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/cocobase';
import { Plus, Trash2, Hash, Rss, Activity, ShieldAlert, Percent, ArrowDownUp } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  telegram_id: string;
  exchange: string;
  risk_percent: number;
  is_active: boolean;
  created_at: string;
}

export default function ChannelsPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [exchange, setExchange] = useState('bybit');
  const [riskPercent, setRiskPercent] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = async () => {
    if (!user) return;
    try {
      setLoading(true);

      let docs: any[] = [];
      try {
        docs = await db.listDocuments('channels', { filters: { user_id: user.id } }) as any[];
      } catch {}

      // Fallback: Cocobase .data nesting
      if (docs.length === 0) {
        try {
          const all = await db.listDocuments('channels', {}) as any[];
          docs = all.filter((r: any) => {
            const d = r.data || r;
            return (d.user_id || r.user_id) === user.id;
          });
        } catch {}
      }

      const mapped = docs.map((r: any) => {
        const d = r.data || r;
        return {
          id: r.id || r._id,
          name: d.name || r.name || 'Unnamed',
          telegram_id: d.telegram_id || d.telegram_channel_id || r.telegram_id || 'Unknown',
          exchange: d.exchange || r.exchange || 'bybit',
          risk_percent: d.risk_percent || r.risk_percent || 1,
          is_active: d.is_active ?? r.is_active ?? true,
          created_at: d.created_at || r.created_at || new Date().toISOString(),
        };
      });
      setChannels(mapped);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch channels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [user]);

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validate risk percent
    const clampedRisk = Math.min(Math.max(riskPercent, 0.1), 10);

    setSubmitting(true);
    setError(null);
    try {
      await db.createDocument('channels', {
        user_id: user.id,
        name,
        telegram_id: telegramId,
        telegram_channel_id: telegramId,   // bot reads this field
        channel_username: telegramId.startsWith('@') ? telegramId : undefined,
        exchange,
        risk_percent: clampedRisk,
        trigger_keyword: '',               // empty = accept all messages
        allow_medium_confidence: true,
        is_active: true,
        created_at: new Date().toISOString()
      });
      setName('');
      setTelegramId('');
      setExchange('bybit');
      setRiskPercent(1);
      await fetchChannels();
    } catch (err: any) {
      setError(err.message || 'Failed to add channel.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.deleteDocument('channels', id);
      setChannels(channels.filter(c => c.id !== id));
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Monitored Channels</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add Telegram channels to listen to for trading signals.
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add New Channel
        </h2>
        <form onSubmit={handleAddChannel} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-5 py-4 rounded-xl text-sm flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-muted-foreground text-sm font-medium">Channel Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Rss className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Binance Killers VIP"
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-muted-foreground text-sm font-medium">Telegram ID or Username</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                   <Hash className="h-4 w-4" />
                 </div>
                <input
                  type="text"
                  required
                  value={telegramId}
                  onChange={e => setTelegramId(e.target.value)}
                  placeholder="e.g. -100123456789 or @channelname"
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-muted-foreground text-sm font-medium">Exchange</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <ArrowDownUp className="h-4 w-4" />
                </div>
                <select
                  value={exchange}
                  onChange={e => setExchange(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value="bybit">Bybit</option>
                  <option value="binance">Binance</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-muted-foreground text-sm font-medium">
                Risk Per Trade (%)
                <span className="text-muted-foreground/60 ml-1">max 10%</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Percent className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  required
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={riskPercent}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    if (val > 10) {
                      setRiskPercent(10);
                    } else {
                      setRiskPercent(val);
                    }
                  }}
                  placeholder="1"
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground/60">
                The stop loss of each trade won't risk more than this % of your account balance.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 w-full md:w-auto justify-center"
          >
            {submitting ? (
              <>
                 <Activity className="h-4 w-4 animate-pulse" /> Adding...
              </>
            ) : (
              <>
                 <Plus className="h-4 w-4" /> Add Channel
              </>
            )}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">Your Channels</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map(i => (
               <div key={i} className="bg-card border border-border rounded-3xl p-6 h-40 animate-pulse" />
             ))}
          </div>
        ) : channels.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
              <Rss className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-foreground font-semibold text-lg">No channels monitored</p>
              <p className="text-muted-foreground max-w-sm mt-1">You are not monitoring any channels yet. Add one above to start listening for signals.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map(channel => (
              <div key={channel.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                {/* Decorative background element */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
                
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-foreground text-lg truncate pr-4">{channel.name}</h3>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider shrink-0 border ${channel.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                      {channel.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                    <Hash className="h-3.5 w-3.5" />
                    <code className="text-sm font-mono bg-secondary px-1.5 py-0.5 rounded truncate">
                      {channel.telegram_id}
                    </code>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase ${channel.exchange === 'bybit' ? 'bg-orange-500/10 text-orange-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {channel.exchange}
                    </span>
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {channel.risk_percent}% risk
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
                   <p className="text-xs text-muted-foreground">
                     Added {new Date(channel.created_at).toLocaleDateString()}
                   </p>
                   <button
                    onClick={() => handleDelete(channel.id)}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive p-2 rounded-lg transition-colors"
                    aria-label="Delete channel"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
