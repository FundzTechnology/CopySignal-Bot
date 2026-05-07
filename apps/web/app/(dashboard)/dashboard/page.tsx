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
  const [channels, setChannels] = useState<any[]>([]);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [channelsLoading, setChannelsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      db.listDocuments("trade_logs", { filters: { user_id: user.id } }),
      db.listDocuments("channels", { filters: { user_id: user.id } })
    ]).then(([tradeDocs, channelDocs]) => {
      setTrades((tradeDocs as any[]).sort((a: any, b: any) =>
        new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime()
      ));
      setChannels(channelDocs as any[]);
      setTradesLoading(false);
      setChannelsLoading(false);
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

  const isLoading = tradesLoading || channelsLoading;

  if (isLoading) {
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

  const activeChannels = channels.filter(c => c.is_active).length;
  const botActive = activeChannels > 0;
  const isEmpty = channels.length === 0 && trades.length === 0;

  return (
    <div className="space-y-8">
      {/* Bot Status Banner */}
      <div className={`border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${botActive ? 'bg-primary/10 border-primary/20' : 'bg-red-500/10 border-red-500/20'}`}>
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${botActive ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}`}>
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-foreground font-semibold">Bot Engine</h2>
              <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${botActive ? 'bg-success/20 text-success border-success/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                {botActive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                )}
                {botActive ? 'Active' : 'Paused'}
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              {botActive ? `Listening for signals on ${activeChannels} channel(s)` : 'Not listening for signals'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-1 tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, {user.data?.username || user.email}</p>
      </div>

      {isEmpty ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-sm">
          <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Welcome to CopySignal Bot</h2>
          <p className="text-muted-foreground mb-8">
            You don't have any signal channels connected yet. Let's get you set up so you can start auto-trading.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 text-left mb-8">
            <div className="bg-secondary/50 p-4 rounded-xl border border-border">
              <span className="text-xs font-bold text-primary mb-1 block">STEP 1</span>
              <p className="text-sm text-foreground font-medium">Connect your Telegram</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-xl border border-border">
              <span className="text-xs font-bold text-primary mb-1 block">STEP 2</span>
              <p className="text-sm text-foreground font-medium">Add API Keys</p>
            </div>
          </div>
          <a href="/dashboard/channels" className="inline-flex bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-primary/25">
            Connect First Channel
          </a>
        </div>
      ) : (
        <>
          {/* Stats Cards — real data from Cocobase */}
          <StatsCards trades={trades} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* P&L Chart */}
            <PnlChart trades={trades} />

            {/* Live Trade Feed — real-time WebSocket */}
            <TradeFeed />
          </div>
        </>
      )}

      {/* Channel & API Key Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AddChannelForm userId={user.id} />
        <AddApiKeyForm userId={user.id} />
      </div>
    </div>
  );
}
