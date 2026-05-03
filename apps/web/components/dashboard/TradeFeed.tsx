'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/cocobase';
import { useAuth } from '@/hooks/useAuth';
import { Activity, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

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

  if (loading) return (
    <div className="bg-card rounded-2xl border border-border p-8 flex items-center justify-center">
       <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Activity className="h-6 w-6 animate-pulse" />
          <p className="text-sm font-medium">Loading live feed...</p>
       </div>
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="p-5 border-b border-border flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </div>
          <h2 className="text-foreground font-semibold">Live Trade Feed</h2>
        </div>
        <div className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          Auto-updating
        </div>
      </div>
      
      <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto custom-scrollbar">
        {trades.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">No trades executed yet</p>
            <p className="text-muted-foreground text-sm max-w-sm">Connect a signal channel and set up your exchange API keys to start auto-trading.</p>
          </div>
        ) : (
          trades.map(trade => (
            <div key={trade.id} className="flex items-center justify-between p-4 sm:p-5 hover:bg-secondary/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${trade.side === 'Buy' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                   {trade.side === 'Buy' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <p className="text-foreground font-mono font-bold tracking-tight">{trade.symbol}</p>
                     <span className="text-muted-foreground text-xs font-medium px-2 py-0.5 bg-secondary rounded text-[10px] uppercase">
                       {trade.side}
                     </span>
                  </div>
                  <p className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {new Date(trade.executed_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="text-right hidden sm:block">
                <p className="text-foreground font-mono text-sm mb-1">
                  <span className="text-muted-foreground mr-2 font-sans text-xs">Entry:</span>
                  ${trade.entry_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </p>
                <p className="text-muted-foreground font-mono text-xs">
                  <span className="font-sans mr-1">Qty:</span>{trade.qty}
                </p>
              </div>
              
              <div className="text-right ml-4 flex flex-col items-end gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  trade.status === 'filled' ? 'bg-success/10 text-success border border-success/20' :
                  trade.status === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                  'bg-secondary text-muted-foreground border border-border'
                }`}>
                  {trade.status === 'filled' && <CheckCircle2 className="h-3 w-3" />}
                  {trade.status === 'error' && <XCircle className="h-3 w-3" />}
                  {trade.status !== 'filled' && trade.status !== 'error' && <Activity className="h-3 w-3" />}
                  <span className="capitalize">{trade.status}</span>
                </div>
                
                {trade.pnl !== null && trade.pnl !== undefined && (
                  <p className={`text-sm font-bold font-mono tracking-tight ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
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
