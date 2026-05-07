'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { db } from '@/lib/cocobase';
import { useAuth } from '@/hooks/useAuth';

interface BotStatusContextType {
  botActive: boolean;
  channelCount: number;
  pausing: boolean;
  refresh: () => Promise<void>;
  toggleBot: () => Promise<void>;
}

const BotStatusContext = createContext<BotStatusContextType>({
  botActive: false,
  channelCount: 0,
  pausing: false,
  refresh: async () => {},
  toggleBot: async () => {},
});

export function BotStatusProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [botActive, setBotActive] = useState(false);
  const [channelCount, setChannelCount] = useState(0);
  const [pausing, setPausing] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const channels = await db.listDocuments('channels', {
        filters: { user_id: user.id, is_active: true },
      });
      const count = Array.isArray(channels) ? channels.length : 0;
      setChannelCount(count);
      setBotActive(count > 0);
    } catch {
      // Non-critical
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleBot = useCallback(async () => {
    if (!user) return;
    const msg = botActive
      ? 'Pause all bots? Open trades stay open but no new signals will execute.'
      : 'Resume all bots? Signal listening will restart.';
    if (!confirm(msg)) return;

    setPausing(true);
    try {
      const channels = await db.listDocuments('channels', {
        filters: { user_id: user.id },
      });
      for (const ch of channels as any[]) {
        const docId = ch.id || ch._id;
        if (docId) {
          await db.updateDocument('channels', docId, { is_active: !botActive });
        }
      }
      setBotActive(!botActive);
      setChannelCount(botActive ? 0 : (channels as any[]).length);
    } catch {
      alert('Failed to update bot status. Please try again.');
    } finally {
      setPausing(false);
    }
  }, [user, botActive]);

  return (
    <BotStatusContext.Provider value={{ botActive, channelCount, pausing, refresh, toggleBot }}>
      {children}
    </BotStatusContext.Provider>
  );
}

export const useBotStatus = () => useContext(BotStatusContext);
