'use client';

import { useState } from 'react';

interface Props {
  userId: string;
}

export default function AddChannelForm({ userId }: Props) {
  const [channelUsername, setChannelUsername] = useState('');
  const [exchange, setExchange] = useState('bybit');
  const [riskPercent, setRiskPercent] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          channelUsername: channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`,
          exchange,
          riskPercent,
          maxTradesPerDay: 5,
        }),
      });

      if (!res.ok) throw new Error('Failed to add channel');
      const data = await res.json();
      setMessage(`✅ Channel "${data.channel_name}" added! Bot will start listening within 5 seconds.`);
      setChannelUsername('');
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-white font-semibold text-lg mb-4">➕ Add Telegram Channel</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-zinc-400 text-sm block mb-1">Channel Username</label>
          <input
            id="channel-username-input"
            type="text"
            placeholder="@signalchannel"
            value={channelUsername}
            onChange={e => setChannelUsername(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-zinc-400 text-sm block mb-1">Exchange</label>
          <select
            id="exchange-select"
            value={exchange}
            onChange={e => setExchange(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="bybit">Bybit</option>
            <option value="binance">Binance</option>
          </select>
        </div>
        <div>
          <label className="text-zinc-400 text-sm block mb-1">Risk per trade (%)</label>
          <input
            id="risk-percent-input"
            type="number"
            min="0.1"
            max="5"
            step="0.1"
            value={riskPercent}
            onChange={e => setRiskPercent(parseFloat(e.target.value))}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          id="add-channel-btn"
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors"
        >
          {loading ? 'Adding...' : 'Add Channel'}
        </button>
        {message && <p className="text-sm text-zinc-400">{message}</p>}
      </form>
    </div>
  );
}
