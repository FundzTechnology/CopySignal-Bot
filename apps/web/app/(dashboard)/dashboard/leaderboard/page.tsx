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
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Fetch ALL trade_logs (no filter — leaderboard is global across users)
        const allDocs = await db.listDocuments('trade_logs', {}) as any[];

        // Unwrap Cocobase .data nesting
        const trades = allDocs.map((r: any) => {
          const d = r.data || r;
          return {
            channel_id:       d.channel_id       || r.channel_id       || 'unknown',
            channel_name:     d.channel_name     || r.channel_name     || '',
            channel_username: d.channel_username || r.channel_username || '',
            user_id:          d.user_id          || r.user_id          || '',
            status:           (d.status          || r.status           || '').toLowerCase(),
            pnl:              d.pnl              ?? r.pnl              ?? null,
            created_at:       d.created_at       || d.executed_at      || r.created_at || r.executed_at || '',
          };
        });

        // Filter by period
        const now = Date.now();
        const filtered = trades.filter(t => {
          if (period === 'all') return true;
          const created = new Date(t.created_at).getTime();
          if (isNaN(created)) return false;
          const days = period === 'week' ? 7 : 30;
          return (now - created) < days * 24 * 60 * 60 * 1000;
        });

        // Group by channel_id
        const channelMap = new Map<string, {
          name: string;
          username: string;
          trades: typeof trades;
          users: Set<string>;
        }>();

        for (const t of filtered) {
          const key = t.channel_id || 'unknown';

          if (!channelMap.has(key)) {
            // Resolve the best display name:
            // prefer channel_name → fall back to @channel_username → fall back to key
            const displayName =
              t.channel_name && t.channel_name !== 'Unknown Channel'
                ? t.channel_name
                : t.channel_username
                  ? `@${t.channel_username}`
                  : key === 'unknown' ? 'Unknown Channel' : key;

            channelMap.set(key, {
              name: displayName,
              username: t.channel_username || '',
              trades: [],
              users: new Set(),
            });
          }

          const entry = channelMap.get(key)!;
          entry.trades.push(t);
          if (t.user_id) entry.users.add(t.user_id);
        }

        // Compute metrics per channel
        const leaderboard: LeaderboardEntry[] = [];
        for (const [, val] of channelMap) {
          const closed = val.trades.filter(t =>
            t.status === 'tp_hit' || t.status === 'sl_hit' ||
            t.status === 'closed' || t.status === 'filled'
          );
          const wins = closed.filter(t =>
            t.status === 'tp_hit' || (t.status === 'filled' && (t.pnl ?? 0) > 0)
          );
          const totalPnl = closed.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
          const win_rate = closed.length > 0
            ? Math.round((wins.length / closed.length) * 100)
            : 0;

          leaderboard.push({
            channel_name:     val.name,
            channel_username: val.username,
            win_rate,
            total_pnl:    totalPnl,
            signals_count: val.trades.length,
            users_count:   val.users.size,
          });
        }

        // Sort by win rate, then P&L
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
          <div className="animate-spin h-8 w-8 border-[3px] border-primary border-t-transparent rounded-full" />
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
            <div
              key={idx}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4 hover:border-zinc-700 transition-colors"
            >
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
                    {entry.signals_count} signal{entry.signals_count !== 1 ? 's' : ''}
                  </span>
                  <span>
                    {entry.users_count} user{entry.users_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Metrics — Win Rate + P&L only (no Risk Score) */}
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-center hidden sm:block">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">Win Rate</p>
                  <p className={`font-bold text-sm mt-1 ${
                    entry.win_rate >= 50 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {entry.win_rate}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">
                    {period === 'week' ? 'This Week P&L' : period === 'month' ? 'This Month P&L' : 'All Time P&L'}
                  </p>
                  <p className={`font-bold text-sm mt-1 ${entry.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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
