'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/cocobase';
import { useAuth } from '@/hooks/useAuth';
import TradeFeed from '@/components/dashboard/TradeFeed';
import StatsCards from '@/components/dashboard/StatsCards';
import AddChannelForm from '@/components/dashboard/AddChannelForm';
import AddApiKeyForm from '@/components/dashboard/AddApiKeyForm';

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
      <div>
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-zinc-500 text-sm">Welcome back, {user.email}</p>
      </div>

      {/* Stats Cards — real data from Cocobase */}
      <StatsCards trades={trades} />

      {/* Live Trade Feed — real-time WebSocket */}
      <TradeFeed />

      {/* Channel & API Key Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AddChannelForm userId={user.id} />
        <AddApiKeyForm userId={user.id} />
      </div>
    </div>
  );
}
