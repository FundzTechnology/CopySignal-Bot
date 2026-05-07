'use client';

import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import SubscriptionWarningCard from '@/components/SubscriptionWarningCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ui/ToastProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
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
        {/* Subscription expiry warning — appears bottom-left at ≤3 days remaining */}
        <SubscriptionWarningCard />
      </div>
    </ToastProvider>
  );
}
