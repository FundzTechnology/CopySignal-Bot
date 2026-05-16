import { TrendingUp, Activity, Crosshair, BarChart3 } from 'lucide-react';

export default function StatsCards({ trades }: { trades: any[] }) {
  // Unwrap Cocobase .data nesting
  const normalised = trades.map((t: any) => {
    const d = t.data || t;
    return {
      status:      (d.status      || t.status      || '').toLowerCase(),
      pnl:          d.pnl         ?? t.pnl         ?? null,
      executed_at:  d.executed_at || d.created_at  || t.executed_at || t.created_at || '',
    };
  });

  const totalPnl = normalised.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const closedTrades = normalised.filter(t =>
    t.status === 'filled' || t.status === 'tp_hit' || t.status === 'sl_hit' || t.status === 'closed'
  );
  const wins = closedTrades.filter(t => t.status === 'tp_hit' || (t.pnl != null && t.pnl > 0));
  const winRate = closedTrades.length ? (wins.length / closedTrades.length * 100).toFixed(0) : 0;
  const todayTrades = normalised.filter(t => {
    const d = new Date(t.executed_at);
    return !isNaN(d.getTime()) && d.toDateString() === new Date().toDateString();
  });

  const stats = [
    { 
      label: 'Total P&L', 
      value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, 
      color: totalPnl >= 0 ? 'text-success' : 'text-destructive',
      icon: TrendingUp,
      bgColor: totalPnl >= 0 ? 'bg-success/10' : 'bg-destructive/10',
      iconColor: totalPnl >= 0 ? 'text-success' : 'text-destructive'
    },
    { 
      label: 'Trades Today', 
      value: todayTrades.length.toString(), 
      color: 'text-foreground',
      icon: Activity,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    { 
      label: 'Win Rate', 
      value: `${winRate}%`, 
      color: 'text-primary',
      icon: Crosshair,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    { 
      label: 'Total Trades', 
      value: closedTrades.length.toString(), 
      color: 'text-foreground',
      icon: BarChart3,
      bgColor: 'bg-zinc-500/10',
      iconColor: 'text-zinc-400'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Icon className="h-16 w-16 -mr-4 -mt-4 text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">{stat.label}</p>
            </div>
            <p className={`text-3xl font-bold font-mono tracking-tight relative z-10 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
