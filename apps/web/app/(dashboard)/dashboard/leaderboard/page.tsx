'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/cocobase';
import { Trophy, TrendingUp, Radio, Calendar } from 'lucide-react';

interface LeaderboardEntry {
  channel_name: string;
  channel_username: string;
  win_rate: number;
  total_pnl: number;
  signals_count: number;
  users_count: number;
  risk_score: 'Low Risk' | 'Medium Risk' | 'High Risk';
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Aggregate trade_logs across all users, grouped by channel
        const trades = await db.listDocuments('trade_logs', {}) as any[];
        
        // Filter by period
        const now = Date.now();
        const filtered = trades.filter(t => {
          if (period === 'all') return true;
          const created = new Date(t.created_at).getTime();
          const days = period === 'week' ? 7 : 30;
          return (now - created) < days * 24 * 60 * 60 * 1000;
        });

        // Group by channel
        const channelMap = new Map<string, { 
          name: string; username: string; trades: any[]; users: Set<string> 
        }>();

        for (const t of filtered) {
          const key = t.channel_id || 'unknown';
          if (!channelMap.has(key)) {
            channelMap.set(key, {
              name: t.channel_name || 'Unknown Channel',
              username: t.channel_username || '',
              trades: [],
              users: new Set(),
            });
          }
          const entry = channelMap.get(key)!;
          entry.trades.push(t);
          if (t.user_id) entry.users.add(t.user_id);
        }

        // Compute metrics
        const leaderboard: LeaderboardEntry[] = [];
        for (const [, val] of channelMap) {
          const executed = val.trades.filter(t => t.status === 'filled' || t.status === 'closed');
          const wins = executed.filter(t => (t.pnl || 0) > 0);
          const totalPnl = executed.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0);
          
          const win_rate = executed.length > 0 ? Math.round((wins.length / executed.length) * 100) : 0;
          let risk_score: 'Low Risk' | 'Medium Risk' | 'High Risk' = 'High Risk';
          if (win_rate >= 60) risk_score = 'Low Risk';
          else if (win_rate >= 40) risk_score = 'Medium Risk';

          leaderboard.push({
            channel_name: val.name,
            channel_username: val.username,
            win_rate,
            total_pnl: totalPnl,
            signals_count: val.trades.length,
            users_count: val.users.size,
            risk_score,
          });
        }

        // Sort by win rate (descending), then by P&L
        leaderboard.sort((a, b) => {
          if (b.win_rate !== a.win_rate) return b.win_rate - a.win_rate;
          return b.total_pnl - a.total_pnl;
        });

        setEntries(leaderboard);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period]);

  const formatPnl = (val: number) => {
    const sign = val >= 0 ? '+' : '';
    return `${sign}$${val.toFixed(2)}`;
  };

  const medalColors = ['text-yellow-400', 'text-zinc-300', 'text-amber-600'];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            Signal Channel Leaderboard
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Rankings based on real execution data from CopySignal Bot users.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {(['week', 'month', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                period === p
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <Trophy className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">No data yet</h3>
          <p className="text-zinc-500 text-sm">
            Rankings will appear once signals are executed. Connect a channel to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4 hover:border-zinc-700 transition-colors">
              {/* Rank */}
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                {idx < 3 ? (
                  <Trophy className={`h-5 w-5 ${medalColors[idx]}`} />
                ) : (
                  <span className="text-zinc-400 font-bold text-sm">#{idx + 1}</span>
                )}
              </div>

              {/* Channel Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold truncate">{entry.channel_name}</h3>
                  {entry.channel_username && (
                    <span className="text-zinc-500 text-xs">@{entry.channel_username}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Radio className="h-3 w-3" />
                    {entry.signals_count} signals
                  </span>
                  <span>{entry.users_count} user{entry.users_count !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-center hidden md:block">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">Risk Score</p>
                  <p className={`font-bold text-xs mt-1 ${
                    entry.risk_score === 'Low Risk' ? 'text-emerald-400' :
                    entry.risk_score === 'Medium Risk' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {entry.risk_score === 'Low Risk' ? '🟢' : entry.risk_score === 'Medium Risk' ? '🟡' : '🔴'} {entry.risk_score}
                  </p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">Win Rate</p>
                  <p className={`font-bold text-sm ${entry.win_rate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {entry.win_rate}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">Avg P&L</p>
                  <p className={`font-bold text-sm ${entry.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPnl(entry.total_pnl)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
