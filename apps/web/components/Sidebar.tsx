'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/cocobase';
import { useAuth } from '@/hooks/useAuth';
import { Bot, LayoutDashboard, Rss, ArrowRightLeft, Settings, CreditCard, LogOut, PauseCircle, PlayCircle, Trophy } from 'lucide-react';
import { FooterBranding } from '@/components/FooterBranding';
import { NotificationBell } from '@/components/NotificationBell';

const links = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Channels',  href: '/dashboard/channels', icon: Rss },
  { name: 'Trades',    href: '/dashboard/trades', icon: ArrowRightLeft },
  { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  { name: 'Settings',  href: '/dashboard/settings', icon: Settings },
  { name: 'Billing',   href: '/dashboard/billing', icon: CreditCard },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [botActive, setBotActive] = useState(true);
  const [channelCount, setChannelCount] = useState(0);
  const [pausing, setPausing] = useState(false);

  // Fetch bot status (count of active channels)
  const fetchBotStatus = useCallback(async () => {
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
    fetchBotStatus();
  }, [fetchBotStatus]);

  const handleSignOut = async () => {
    await db.auth.logout();
    router.push('/login');
  };

  // ── Emergency Stop / Resume ─────────────────────────────────────────
  const handleEmergencyStop = async () => {
    if (!user) return;
    const action = botActive ? 'pause' : 'resume';
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
          await db.updateDocument('channels', docId, {
            is_active: !botActive,
          });
        }
      }

      setBotActive(!botActive);
      setChannelCount(botActive ? 0 : (channels as any[]).length);
    } catch (err) {
      console.error('Emergency stop error:', err);
      alert('Failed to update bot status. Please try again.');
    } finally {
      setPausing(false);
    }
  };

  return (
    <aside className="w-[280px] bg-card border-r border-border p-6 flex-col justify-between hidden md:flex shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-20">
      <div className="flex flex-col gap-6 h-full">
        {/* Logo area */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">CopySignal</h2>
              <p className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">Auto-trade Bot</p>
            </div>
          </div>
          <NotificationBell />
        </div>

        {/* Bot Status Indicator */}
        <div className={`rounded-xl px-4 py-3 border ${botActive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2.5 h-2.5 rounded-full ${botActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-xs font-semibold ${botActive ? 'text-emerald-400' : 'text-red-400'}`}>
              {botActive ? 'Bot Active' : 'Bot Paused'}
            </span>
          </div>
          <p className="text-muted-foreground text-[10px]">
            {botActive ? `Listening to ${channelCount} channel${channelCount !== 1 ? 's' : ''}` : 'No signals being processed'}
          </p>
        </div>

        {/* Emergency Stop / Resume */}
        <button
          onClick={handleEmergencyStop}
          disabled={pausing}
          className={`flex items-center justify-center gap-2 w-full font-semibold py-2.5 rounded-xl transition-all text-sm disabled:opacity-50 ${
            botActive
              ? 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30'
              : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {pausing ? (
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : botActive ? (
            <PauseCircle className="h-4 w-4" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          {pausing ? 'Processing...' : botActive ? 'Pause All Bots' : 'Resume All Bots'}
        </button>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {links.map(link => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all font-medium group ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Bottom actions & branding */}
        <div className="mt-auto pt-6 border-t border-border flex flex-col gap-4">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full text-left text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-4 py-3 rounded-xl transition-all text-sm font-medium group"
          >
            <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
            Sign Out
          </button>
          
          <div className="scale-90 origin-left opacity-70 hover:opacity-100 transition-opacity">
            <FooterBranding />
          </div>
        </div>
      </div>
    </aside>
  );
}
