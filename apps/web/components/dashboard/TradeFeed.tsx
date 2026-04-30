'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/cocobase';
import { useAuth } from '@/hooks/useAuth';

interface TradeLog {
  id: string;
  symbol: string;
  side: string;
  qty: number;
  entry_price: number;
  take_profit: number;
  stop_loss: number;
  status: string;
  executed_at: string;
  pnl: number | null;
}

export default function TradeFeed() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Load existing trades
    db.listDocuments("trade_logs", {
      filters: { user_id: user.id }
    }).then((docs: any) => {
      setTrades(Array.isArray(docs) ? docs.sort((a: any, b: any) =>
        new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime()
      ) : []);
      setLoading(false);
    });

    // Watch for new trades in real time using the correct Cocobase realtime API
    const watcher = db.realtime.collection("trade_logs", { user_id: user.id });
    watcher.connect();
    watcher.onCreate((event: any) => {
      const trade = event.data;
      if (trade?.user_id === user.id) {
        setTrades(prev => [trade, ...prev]);
      }
    });

    return () => {
      setTimeout(() => watcher.disconnect(), 1000);
    };
  }, [user]);

  if (loading) return <div className="text-zinc-500 p-4">Loading trades...</div>;

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <h2 className="text-white font-semibold">Live Trade Feed</h2>
      </div>
      <div className="divide-y divide-zinc-800 max-h-[400px] overflow-y-auto">
        {trades.length === 0 ? (
          <p className="p-4 text-zinc-500 text-sm">No trades yet. Add a channel to start.</p>
        ) : (
          trades.map(trade => (
            <div key={trade.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <span className={`text-lg ${trade.side === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.side === 'Buy' ? '🟢' : '🔴'}
                </span>
                <div>
                  <p className="text-white font-mono font-semibold">{trade.symbol}</p>
                  <p className="text-zinc-500 text-xs">
                    {new Date(trade.executed_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-zinc-300 text-sm">Entry: ${trade.entry_price?.toLocaleString()}</p>
                <p className="text-zinc-500 text-xs">Qty: {trade.qty}</p>
              </div>
              <div className="text-right ml-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  trade.status === 'filled' ? 'bg-green-900/50 text-green-400' :
                  trade.status === 'error' ? 'bg-red-900/50 text-red-400' :
                  'bg-zinc-700 text-zinc-400'
                }`}>
                  {trade.status}
                </span>
                {trade.pnl !== null && trade.pnl !== undefined && (
                  <p className={`text-sm font-semibold mt-1 ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl?.toFixed(2)} USDT
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
