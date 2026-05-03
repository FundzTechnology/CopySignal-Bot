'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PnlChart({ trades }: { trades: any[] }) {
  const chartData = useMemo(() => {
    // If no trades, provide dummy data to keep the chart looking good
    if (!trades || trades.length === 0) {
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          pnl: 0
        };
      });
    }

    const dailyPnl: Record<string, number> = {};
    
    // Sort trades oldest to newest for cumulative
    const sortedTrades = [...trades].sort((a, b) => new Date(a.executed_at).getTime() - new Date(b.executed_at).getTime());
    
    let cumulativePnl = 0;

    sortedTrades.forEach(trade => {
      if (trade.status === 'filled' && trade.pnl !== null) {
        cumulativePnl += trade.pnl;
        const dateKey = new Date(trade.executed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyPnl[dateKey] = cumulativePnl;
      }
    });

    return Object.entries(dailyPnl).map(([date, pnl]) => ({
      date,
      pnl
    }));
  }, [trades]);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-foreground font-semibold mb-6">Cumulative P&L</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#a1a1aa" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#a1a1aa" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.5rem', color: '#fff' }}
              itemStyle={{ color: '#60a5fa' }}
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'P&L']}
            />
            <Area 
              type="monotone" 
              dataKey="pnl" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPnl)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
