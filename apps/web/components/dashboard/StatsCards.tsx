export default function StatsCards({ trades }: { trades: any[] }) {
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const filledTrades = trades.filter(t => t.status === 'filled');
  const wins = filledTrades.filter(t => t.pnl && t.pnl > 0);
  const winRate = filledTrades.length ? (wins.length / filledTrades.length * 100).toFixed(0) : 0;
  const todayTrades = trades.filter(t =>
    new Date(t.executed_at).toDateString() === new Date().toDateString()
  );

  const stats = [
    { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'Trades Today', value: todayTrades.length, color: 'text-white' },
    { label: 'Win Rate', value: `${winRate}%`, color: 'text-blue-400' },
    { label: 'Total Trades', value: filledTrades.length, color: 'text-white' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(stat => (
        <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-500 text-sm mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
