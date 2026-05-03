'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/cocobase';
import { useAuth } from '@/hooks/useAuth';
import TradeFeed from '@/components/dashboard/TradeFeed';
import StatsCards from '@/components/dashboard/StatsCards';
import PnlChart from '@/components/dashboard/PnlChart';
import AddChannelForm from '@/components/dashboard/AddChannelForm';
import AddApiKeyForm from '@/components/dashboard/AddApiKeyForm';
import { Activity, Bot, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);
  const [tradesLoading, setTradesLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    db.listDocuments("trade_logs", {
      filters: { user_id: user.id }
    }).then((docs: any) => {
      setTrades(docs.sort((a: any, b: any) =>
        new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime()
      ));
      setTradesLoading(false);
    });

    // Watch for new trades in real time using correct Cocobase realtime API
    const watcher = db.realtime.collection("trade_logs", { user_id: user.id });
    watcher.connect();
    watcher.onCreate((event: any) => {
      const trade = event.data;
      if (trade?.user_id === user.id) {
        setTrades(prev => [trade, ...prev]);
      }
    });

    return () => watcher.disconnect();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Please <a href="/login" className="text-blue-400 underline">log in</a> to view your dashboard.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Bot Status Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-foreground font-semibold">Bot Engine</h2>
              <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                Active
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">Listening for signals on all connected channels</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
          View Logs <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-1 tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, {user.data?.username || user.email}</p>
      </div>

      {/* Stats Cards — real data from Cocobase */}
      <StatsCards trades={trades} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* P&L Chart */}
        <PnlChart trades={trades} />

        {/* Live Trade Feed — real-time WebSocket */}
        <TradeFeed />
      </div>

      {/* Channel & API Key Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AddChannelForm userId={user.id} />
        <AddApiKeyForm userId={user.id} />
      </div>
    </div>
  );
}
