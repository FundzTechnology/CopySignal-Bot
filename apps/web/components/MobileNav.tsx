'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { db } from '@/lib/cocobase';
import { Bot, LayoutDashboard, Rss, ArrowRightLeft, Settings, CreditCard, LogOut, Menu, X, PauseCircle, PlayCircle, Trophy } from 'lucide-react';
import { FooterBranding } from '@/components/FooterBranding';
import { NotificationBell } from '@/components/NotificationBell';
import { useBotStatus } from '@/context/BotStatusContext';

const links = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Channels',  href: '/dashboard/channels', icon: Rss },
  { name: 'Trades',    href: '/dashboard/trades', icon: ArrowRightLeft },
  { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  { name: 'Settings',  href: '/dashboard/settings', icon: Settings },
  { name: 'Billing',   href: '/dashboard/billing', icon: CreditCard },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { botActive, channelCount, pausing, toggleBot } = useBotStatus();

  const handleSignOut = async () => {
    await db.auth.logout();
    router.push('/login');
  };

  return (
    <div className="md:hidden">
      {/* Top Header Bar for Mobile */}
      <header className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">CopySignal</h1>
        </div>

        {/* Bot status indicator and Notification Bell on mobile header */}
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${botActive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <div className={`w-2 h-2 rounded-full ${botActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-[10px] font-semibold ${botActive ? 'text-emerald-400' : 'text-red-400'}`}>
              {botActive ? 'LIVE' : 'OFF'}
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md flex flex-col pt-20 px-6 pb-6 animate-in slide-in-from-top-4 duration-200">
          
          {/* Emergency Stop — Top of drawer */}
          <button
            onClick={toggleBot}
            disabled={pausing}
            className={`flex items-center justify-center gap-2 w-full font-semibold py-3 rounded-xl transition-all text-sm mb-4 disabled:opacity-50 ${
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

          <nav className="flex flex-col gap-2 flex-1">
            {links.map(link => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base transition-all font-medium group ${
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
          
          <div className="mt-auto pt-6 flex flex-col gap-6 border-t border-border">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-3 w-full bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-3.5 rounded-xl transition-all font-semibold"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
            <div className="flex justify-center scale-90">
               <FooterBranding />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

