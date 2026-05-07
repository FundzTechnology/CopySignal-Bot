'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/cocobase';
import { BarChart3, TrendingUp, TrendingDown, Radio, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ChannelPerf {
  id: string;
  channel_name: string;
  channel_username: string;
  is_active: boolean;
  signals_received: number;
  signals_executed: number;
  win_rate: number;
  total_pnl: number;
  best_trade: { symbol: string; pnl: number } | null;
  worst_trade: { symbol: string; pnl: number } | null;
  last_signal: string | null;
}

export default function ChannelPerformancePage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<ChannelPerf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchPerformance = async () => {
      try {
        // Get all user channels
        const channelDocs = await db.listDocuments('channels', {
          filters: { user_id: user.id },
        }) as any[];

        // Get all user trades
        const trades = await db.listDocuments('trade_logs', {
          filters: { user_id: user.id },
        }) as any[];

        // Compute per-channel metrics
        const perf: ChannelPerf[] = channelDocs.map(ch => {
          const channelTrades = trades.filter(t => t.channel_id === (ch.id || ch._id));
          const executed = channelTrades.filter(t => t.status === 'filled' || t.status === 'closed');
          const wins = executed.filter(t => (t.pnl || 0) > 0);
          const totalPnl = executed.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0);
          
          let best: { symbol: string; pnl: number } | null = null;
          let worst: { symbol: string; pnl: number } | null = null;
          
          if (executed.length > 0) {
            const sorted = [...executed].sort((a, b) => (b.pnl || 0) - (a.pnl || 0));
            best = { symbol: sorted[0].symbol, pnl: sorted[0].pnl || 0 };
            worst = { symbol: sorted[sorted.length - 1].symbol, pnl: sorted[sorted.length - 1].pnl || 0 };
          }

          const lastSignal = channelTrades.length > 0
            ? channelTrades.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at
            : null;

          return {
            id: ch.id || ch._id,
            channel_name: ch.channel_name || 'Unknown',
            channel_username: ch.channel_username || '',
            is_active: ch.is_active ?? false,
            signals_received: channelTrades.length,
            signals_executed: executed.length,
            win_rate: executed.length > 0 ? Math.round((wins.length / executed.length) * 100) : 0,
            total_pnl: totalPnl,
            best_trade: best,
            worst_trade: worst,
            last_signal: lastSignal,
          };
        });

        setChannels(perf);
      } catch (err) {
        console.error('Failed to fetch channel performance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [user]);

  const formatPnl = (val: number) => {
    const sign = val >= 0 ? '+' : '';
    return `${sign}$${val.toFixed(2)}`;
  };

  const timeAgo = (ts: string | null) => {
    if (!ts) return 'No signals yet';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Channel Performance
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Per-channel win rates, P&L, and signal analytics.
        </p>
      </div>

      {channels.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <BarChart3 className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">No channels connected yet</h3>
          <p className="text-zinc-500 text-sm mb-6">Add a signal channel to start tracking performance.</p>
          <a href="/dashboard/channels" className="bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-6 rounded-xl transition-all">
            Add Channel
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {channels.map(ch => (
            <div key={ch.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Radio className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{ch.channel_name}</h3>
                    {ch.channel_username && (
                      <p className="text-zinc-500 text-xs">@{ch.channel_username}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${ch.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  <span className={`text-xs font-semibold ${ch.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                    {ch.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <p className="text-zinc-500 text-xs mb-1">Signals</p>
                  <p className="text-white font-bold text-lg">{ch.signals_received}</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <p className="text-zinc-500 text-xs mb-1">Executed</p>
                  <p className="text-white font-bold text-lg">{ch.signals_executed}</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <p className="text-zinc-500 text-xs mb-1">Win Rate</p>
                  <p className={`font-bold text-lg ${ch.win_rate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {ch.win_rate}%
                  </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <p className="text-zinc-500 text-xs mb-1">Total P&L</p>
                  <p className={`font-bold text-lg ${ch.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPnl(ch.total_pnl)}
                  </p>
                </div>
              </div>

              {/* Best / Worst / Last Signal */}
              <div className="flex flex-wrap gap-4 text-xs">
                {ch.best_trade && (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>Best: {ch.best_trade.symbol} {formatPnl(ch.best_trade.pnl)}</span>
                  </div>
                )}
                {ch.worst_trade && (
                  <div className="flex items-center gap-1.5 text-red-400">
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    <span>Worst: {ch.worst_trade.symbol} {formatPnl(ch.worst_trade.pnl)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last signal: {timeAgo(ch.last_signal)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
