'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { db } from '@/lib/cocobase';
import { Bot, LayoutDashboard, Rss, ArrowRightLeft, Settings, CreditCard, LogOut } from 'lucide-react';
import { FooterBranding } from '@/components/FooterBranding';

const links = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Channels',  href: '/dashboard/channels', icon: Rss },
  { name: 'Trades',    href: '/dashboard/trades', icon: ArrowRightLeft },
  { name: 'Settings',  href: '/dashboard/settings', icon: Settings },
  { name: 'Billing',   href: '/dashboard/billing', icon: CreditCard },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await db.auth.logout();
    router.push('/login');
  };

  return (
    <aside className="w-[280px] bg-card border-r border-border p-6 flex-col justify-between hidden md:flex shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-20">
      <div className="flex flex-col gap-8 h-full">
        {/* Logo area */}
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">CopySignal</h2>
            <p className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">Auto-trade Bot</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
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
