import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import SubscriptionWarningCard from '@/components/SubscriptionWarningCard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-white">
      <MobileNav />
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        {children}
      </main>
      {/* Subscription expiry warning — appears bottom-left at ≤3 days remaining */}
      <SubscriptionWarningCard />
    </div>
  );
}
