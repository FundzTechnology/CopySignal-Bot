'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/cocobase';

interface Channel {
  id: string;
  name: string;
  telegram_id: string;
  is_active: boolean;
  created_at: string;
}

export default function ChannelsPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await db.listDocuments('channels', {
        filters: { user_id: user.id }
      });
      // Handle the fact that Cocobase returns `{ data: {...}, id: ... }` wrappers
      const mapped = res.map((r: any) => ({
        id: r.id,
        ...r.data,
      }));
      setChannels(mapped);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch channels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [user]);

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    setError(null);
    try {
      await db.createDocument('channels', {
        user_id: user.id,
        name,
        telegram_id: telegramId,
        is_active: true,
        created_at: new Date().toISOString()
      });
      setName('');
      setTelegramId('');
      await fetchChannels();
    } catch (err: any) {
      setError(err.message || 'Failed to add channel.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.deleteDocument('channels', id);
      setChannels(channels.filter(c => c.id !== id));
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Monitored Channels</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Add Telegram channels to listen to for trading signals.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Add New Channel</h2>
        <form onSubmit={handleAddChannel} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-1">Channel Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Binance Killers VIP"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1">Telegram ID or Username</label>
              <input
                type="text"
                required
                value={telegramId}
                onChange={e => setTelegramId(e.target.value)}
                placeholder="e.g. -100123456789 or @channelname"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition"
          >
            {submitting ? 'Adding...' : 'Add Channel'}
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Your Channels</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-zinc-500 text-center animate-pulse">Loading channels...</div>
        ) : channels.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-500">You are not monitoring any channels yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {channels.map(channel => (
              <div key={channel.id} className="p-6 flex items-center justify-between hover:bg-zinc-800/50 transition">
                <div>
                  <h3 className="font-bold text-white">{channel.name}</h3>
                  <code className="text-zinc-500 text-sm mt-1 font-mono">{channel.telegram_id}</code>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${channel.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {channel.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleDelete(channel.id)}
                    className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
