'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/cocobase';

const links = [
  { name: '📊 Dashboard', href: '/dashboard' },
  { name: '📡 Channels',  href: '/dashboard/channels' },
  { name: '💹 Trades',    href: '/dashboard/trades' },
  { name: '⚙️ Settings',  href: '/dashboard/settings' },
  { name: '💳 Billing',   href: '/dashboard/billing' },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await db.auth.logout();
    router.push('/login');
  };

  return (
    <div className="md:hidden">
      {/* Top Header Bar for Mobile */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-white tracking-tight">CopySignal</h1>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-zinc-400 hover:text-white transition"
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-sm flex flex-col pt-20 px-6 pb-6 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-2 flex-1">
            {links.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3.5 rounded-xl text-base transition font-semibold ${
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
          
          <button
            onClick={handleSignOut}
            className="w-full mt-auto bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3.5 rounded-xl transition font-semibold text-center"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
