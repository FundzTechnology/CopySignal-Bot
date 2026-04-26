'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function ChannelRulesPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Fetch channels for this user
    fetch(`/api/channels?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setChannels(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [user]);

  const saveRule = async (channelId: string, updates: any) => {
    try {
      await fetch(`/api/channels/${channelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      // Optimistic update
      setChannels(prev => prev.map(c => c.id === channelId ? { ...c, ...updates } : c));
    } catch (err) {
      alert("Failed to save rules");
    }
  };

  if (loading) return <div className="text-zinc-400">Loading channels...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Signal Rules & Filtering</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Configure how signals are parsed and executed for each of your channels.
        </p>
      </div>

      {channels.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-400">
          No active channels found. Add a channel in the Channels tab first.
        </div>
      ) : (
        <div className="space-y-6">
          {channels.map(channel => (
            <div key={channel.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex justify-between items-start border-b border-zinc-800 pb-4 mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{channel.channel_name || channel.channel_username}</h3>
                  <p className="text-zinc-500 text-sm">Exchange: {channel.exchange.toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Trigger Keyword */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">Trigger Keyword</label>
                  <p className="text-xs text-zinc-500">Only messages containing this exact word will be processed as signals.</p>
                  <input 
                    type="text" 
                    placeholder="e.g. LONG, SIGNAL, VIP"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    defaultValue={channel.trigger_keyword || ''}
                    onBlur={(e) => saveRule(channel.id, { trigger_keyword: e.target.value })}
                  />
                </div>

                {/* TP Selection Rule */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">Take Profit Strategy</label>
                  <p className="text-xs text-zinc-500">Which take-profit target should be used for the exchange limit order?</p>
                  <select 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    defaultValue={channel.tp_rule || 'TP1'}
                    onChange={(e) => saveRule(channel.id, { tp_rule: e.target.value })}
                  >
                    <option value="TP1">Target 1 (Safest)</option>
                    <option value="TP2">Target 2</option>
                    <option value="TP3">Target 3</option>
                    <option value="MIDDLE">Middle Target</option>
                    <option value="LAST">Last Target (Highest RR)</option>
                  </select>
                </div>

                {/* Message Buffer Window */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">Message Buffer (Seconds)</label>
                  <p className="text-xs text-zinc-500">Wait this long to stitch split messages together.</p>
                  <input 
                    type="number" 
                    placeholder="15"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    defaultValue={channel.buffer_window_seconds || 15}
                    onBlur={(e) => saveRule(channel.id, { buffer_window_seconds: parseInt(e.target.value) || 15 })}
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-blue-500 rounded bg-zinc-800 border-zinc-700"
                      defaultChecked={channel.allow_medium_confidence || false}
                      onChange={(e) => saveRule(channel.id, { allow_medium_confidence: e.target.checked })}
                    />
                    <div>
                      <span className="text-sm font-semibold text-zinc-300 block">Allow Medium Confidence</span>
                      <span className="text-xs text-zinc-500 block">Execute signals even if some details (like Leverage) are missing.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-blue-500 rounded bg-zinc-800 border-zinc-700"
                      defaultChecked={channel.management_commands_enabled !== false}
                      onChange={(e) => saveRule(channel.id, { management_commands_enabled: e.target.checked })}
                    />
                    <div>
                      <span className="text-sm font-semibold text-zinc-300 block">Enable Dynamic Trade Management</span>
                      <span className="text-xs text-zinc-500 block">Listen for commands like "Move SL to Entry" or "Hold to TP3".</span>
                    </div>
                  </label>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
