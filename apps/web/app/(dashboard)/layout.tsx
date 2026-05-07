'use client';

import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import SubscriptionWarningCard from '@/components/SubscriptionWarningCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { BotStatusProvider } from '@/context/BotStatusContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <BotStatusProvider>
        <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
          <MobileNav />
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
          <SubscriptionWarningCard />
        </div>
      </BotStatusProvider>
    </ToastProvider>
  );
}
