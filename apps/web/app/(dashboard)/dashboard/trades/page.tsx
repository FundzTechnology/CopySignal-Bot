'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/cocobase';

interface TradeLog {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  entry_price: number;
  status: 'PENDING' | 'FILLED' | 'ERROR';
  pnl_usdt?: number;
  created_at: string;
}

export default function TradesPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchTrades = async () => {
      try {
        const res = await db.listDocuments('trade_logs', {
          filters: { user_id: user.id }
        });
        const mapped = res.map((r: any) => ({
          id: r.id,
          ...r.data,
        }));
        // Sort by newest first
        mapped.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setTrades(mapped);
      } catch (err) {
        console.error('Failed to fetch trades', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrades();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
                  <th className="p-4 font-semibold">Entry Price</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {trades.map(trade => (
                  <tr key={trade.id} className="hover:bg-zinc-800/30 transition">
                    <td className="p-4 text-zinc-400 whitespace-nowrap">
                      {new Date(trade.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-white">{trade.symbol}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        trade.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300 font-mono">
                      {trade.entry_price ? `$${trade.entry_price}` : '—'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        trade.status === 'FILLED' ? 'bg-emerald-500/20 text-emerald-400' : 
                        trade.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-bold">
                      {trade.pnl_usdt !== undefined ? (
                        <span className={trade.pnl_usdt >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {trade.pnl_usdt >= 0 ? '+' : ''}{trade.pnl_usdt} USDT
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
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
