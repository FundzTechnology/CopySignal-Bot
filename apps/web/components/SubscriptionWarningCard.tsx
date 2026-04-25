'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function SubscriptionWarningCard() {
  const { user } = useAuth();
  const [daysLeft, setDaysLeft] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user?.data?.plan_expires_at) return;
    if (user.data.plan === 'free') return;

    const expiresAt = new Date(user.data.plan_expires_at);
    const now = new Date();
    const diff = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff > 0 && diff <= 3) {
      setDaysLeft(diff);
      setVisible(true);
    }
  }, [user]);

  if (!visible) return null;

  const urgency = daysLeft === 1 ? 'red' : daysLeft === 2 ? 'orange' : 'yellow';

  const styles = {
    red:    { card: 'border-red-500/60 bg-red-950/70',    text: 'text-red-400',    btn: 'bg-red-600 hover:bg-red-700' },
    orange: { card: 'border-orange-500/60 bg-orange-950/70', text: 'text-orange-400', btn: 'bg-orange-600 hover:bg-orange-700' },
    yellow: { card: 'border-yellow-500/60 bg-yellow-950/70', text: 'text-yellow-400', btn: 'bg-yellow-600 hover:bg-yellow-700' },
  };
  const s = styles[urgency];

  return (
    <div
      className={`fixed bottom-5 left-5 z-50 w-72 rounded-2xl border backdrop-blur-md p-4 shadow-2xl ${s.card}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">⏳</span>
        <span className={`font-bold text-sm ${s.text}`}>Subscription Expiring</span>
      </div>

      <p className="text-white text-sm mb-0.5">
        <span className={`font-mono font-bold text-2xl ${s.text}`}>{daysLeft}</span>
        {' '}day{daysLeft !== 1 ? 's' : ''} remaining
      </p>

      <p className="text-zinc-400 text-xs mb-3">
        Your bot will pause when this expires. Renew now to stay active.
      </p>

      <a
        href="/dashboard/billing"
        className={`block w-full text-center text-white text-sm font-semibold py-2 rounded-lg transition ${s.btn}`}
      >
        Renew Now →
      </a>

      {/* No dismiss button — by design */}
    </div>
  );
}
