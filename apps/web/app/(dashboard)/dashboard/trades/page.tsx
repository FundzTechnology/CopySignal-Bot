'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/cocobase';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';

interface TradeLog {
  id: string;
  symbol: string;
  side: string;
  entry_price: number;
  take_profit?: number;
  stop_loss?: number;
  status: string;
  pnl?: number;
  qty: number;
  channel_name?: string;
  exchange?: string;
  created_at: string;
  error_msg?: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  FILLED:  { label: 'Filled',   cls: 'bg-blue-500/20 text-blue-400' },
  TP_HIT:  { label: '🎯 TP Hit', cls: 'bg-emerald-500/20 text-emerald-400' },
  SL_HIT:  { label: '🛑 SL Hit', cls: 'bg-red-500/20 text-red-400' },
  CLOSED:  { label: 'Closed',   cls: 'bg-zinc-500/20 text-zinc-400' },
  ERROR:   { label: 'Error',    cls: 'bg-red-500/20 text-red-400' },
  PENDING: { label: 'Pending',  cls: 'bg-amber-500/20 text-amber-400' },
};

export default function TradesPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTrades = async () => {
      try {
        let raw: any[] = [];

        // Try filtered query first
        try {
          raw = await db.listDocuments('trade_logs', {
            filters: { user_id: user.id }
          }) as any[];
        } catch {}

        // Fallback: fetch all and filter in code (Cocobase .data nesting)
        if (raw.length === 0) {
          try {
            const all = await db.listDocuments('trade_logs', {}) as any[];
            raw = all.filter((r: any) => {
              const d = r.data || r;
              return (d.user_id || r.user_id) === user.id;
            });
          } catch {}
        }

        const mapped: TradeLog[] = raw.map((r: any) => {
          const d = r.data || r;
          return {
            id: r.id || r._id,
            symbol: d.symbol || r.symbol,
            side: (d.side || r.side || '').toUpperCase(),
            entry_price: d.entry_price || r.entry_price,
            take_profit: d.take_profit || r.take_profit,
            stop_loss: d.stop_loss || r.stop_loss,
            status: (d.status || r.status || 'pending').toUpperCase(),
            pnl: d.pnl ?? r.pnl,
            qty: d.qty || r.qty,
            channel_name: d.channel_name || r.channel_name || '—',
            exchange: d.exchange || r.exchange,
            created_at: d.created_at || d.executed_at || r.created_at || r.executed_at,
            error_msg: d.error_msg || r.error_msg,
          };
        });

        // Sort newest first
        mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setTrades(mapped);
      } catch (err) {
        console.error('Failed to fetch trades', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user]);

  const formatPrice = (p?: number) =>
    p != null ? `$${Number(p).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : '—';

  const renderPnl = (trade: TradeLog) => {
    if (trade.pnl == null) return <span className="text-zinc-600">—</span>;
    const pos = trade.pnl >= 0;
    return (
      <span className={`flex items-center justify-end gap-1 font-bold font-mono ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
        {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {pos ? '+' : ''}{trade.pnl.toFixed(2)} USDT
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-zinc-500/20 text-zinc-400' };
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${cfg.cls}`}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Trade History</h1>
        <p className="text-zinc-400 text-sm mt-1">
          A log of all trades executed by the bot on your connected exchanges.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-zinc-500 text-center animate-pulse">Loading trade history...</div>
        ) : trades.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <span className="text-4xl mb-4">💤</span>
            <h3 className="text-white font-bold mb-1">No trades yet</h3>
            <p className="text-zinc-500 text-sm">
              When the bot detects a signal in your monitored channels, trades will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Symbol</th>
                  <th className="p-4 font-semibold">Side</th>
                  <th className="p-4 font-semibold hidden md:table-cell">Channel</th>
                  <th className="p-4 font-semibold">Entry</th>
                  <th className="p-4 font-semibold hidden sm:table-cell">TP / SL</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">P&amp;L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {trades.map(trade => (
                  <tr
                    key={trade.id}
                    className="hover:bg-zinc-800/30 transition"
                    title={trade.error_msg || undefined}
                  >
                    <td className="p-4 text-zinc-400 whitespace-nowrap text-xs">
                      {new Date(trade.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-white">{trade.symbol}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        trade.side === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-zinc-400 text-xs">
                        <Radio className="h-3 w-3" />
                        {trade.channel_name}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300 font-mono text-xs">
                      {formatPrice(trade.entry_price)}
                    </td>
                    <td className="p-4 hidden sm:table-cell text-xs font-mono">
                      <span className="text-emerald-400">{formatPrice(trade.take_profit)}</span>
                      <span className="text-zinc-600 mx-1">/</span>
                      <span className="text-red-400">{formatPrice(trade.stop_loss)}</span>
                    </td>
                    <td className="p-4">{getStatusBadge(trade.status)}</td>
                    <td className="p-4 text-right">{renderPnl(trade)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
