'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { db } from '@/lib/cocobase';
import { useRouter } from 'next/navigation';

const links = [
  { name: '📊 Dashboard', href: '/dashboard' },
  { name: '📡 Channels',  href: '/dashboard/channels' },
  { name: '💹 Trades',    href: '/dashboard/trades' },
  { name: '⚙️ Settings',  href: '/dashboard/settings' },
  { name: '💳 Billing',   href: '/dashboard/billing' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await db.auth.logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col justify-between hidden md:flex shrink-0">
      <div>
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white">CopySignal</h2>
          <p className="text-zinc-500 text-xs mt-0.5">Auto-trade crypto signals</p>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2.5 rounded-lg text-sm transition font-medium ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={handleSignOut}
        className="text-left text-zinc-500 hover:text-white hover:bg-zinc-800 px-4 py-2.5 rounded-lg transition text-sm"
      >
        Sign Out
      </button>
    </aside>
  );
}
