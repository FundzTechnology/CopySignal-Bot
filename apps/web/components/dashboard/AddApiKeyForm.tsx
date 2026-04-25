'use client';

import { useState } from 'react';

interface Props {
  userId: string;
}

export default function AddApiKeyForm({ userId }: Props) {
  const [exchange, setExchange] = useState('bybit');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [testnet, setTestnet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, exchange, apiKey, apiSecret, testnet }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save API key');
      }

      setMessage(`✅ ${exchange.charAt(0).toUpperCase() + exchange.slice(1)} API key saved securely (encrypted).`);
      setApiKey('');
      setApiSecret('');
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-white font-semibold text-lg mb-4">🔑 Connect Exchange API Key</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-zinc-400 text-sm block mb-1">Exchange</label>
          <select
            id="apikey-exchange-select"
            value={exchange}
            onChange={e => setExchange(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="bybit">Bybit</option>
            <option value="binance">Binance</option>
          </select>
        </div>
        <div>
          <label className="text-zinc-400 text-sm block mb-1">API Key</label>
          <input
            id="api-key-input"
            type="text"
            placeholder="Your exchange API key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-zinc-400 text-sm block mb-1">API Secret</label>
          <input
            id="api-secret-input"
            type="password"
            placeholder="Your exchange API secret"
            value={apiSecret}
            onChange={e => setApiSecret(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="testnet-checkbox"
            type="checkbox"
            checked={testnet}
            onChange={e => setTestnet(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="testnet-checkbox" className="text-zinc-400 text-sm">Use Testnet</label>
        </div>
        <button
          id="save-apikey-btn"
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 hover:bg-green-600 disabled:bg-zinc-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors"
        >
          {loading ? 'Saving...' : 'Save API Key (Encrypted)'}
        </button>
        {message && <p className="text-sm text-zinc-400">{message}</p>}
      </form>
    </div>
  );
}
