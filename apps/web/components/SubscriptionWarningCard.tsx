'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SubscriptionWarningCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [daysLeft, setDaysLeft] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user?.data?.plan_expires_at) return;
    if (user.data.plan === 'free') return;

    // Don't re-show if dismissed this session
    if (sessionStorage.getItem('sub_warning_dismissed') === 'true') return;

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

  const dismiss = () => {
    sessionStorage.setItem('sub_warning_dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  const urgency = daysLeft === 1 ? 'red' : daysLeft === 2 ? 'orange' : 'yellow';

  const styles = {
    red: {
      card: 'border-red-500/60 bg-red-950/80',
      text: 'text-red-400',
      btn: 'bg-red-600 hover:bg-red-700',
      close: 'text-red-300 hover:text-red-100 hover:bg-red-800/60',
    },
    orange: {
      card: 'border-orange-500/60 bg-orange-950/80',
      text: 'text-orange-400',
      btn: 'bg-orange-600 hover:bg-orange-700',
      close: 'text-orange-300 hover:text-orange-100 hover:bg-orange-800/60',
    },
    yellow: {
      card: 'border-yellow-500/60 bg-yellow-950/80',
      text: 'text-yellow-400',
      btn: 'bg-yellow-600 hover:bg-yellow-700',
      close: 'text-yellow-300 hover:text-yellow-100 hover:bg-yellow-800/60',
    },
  };
  const s = styles[urgency];

  return (
    <div
      className={`fixed bottom-5 left-5 z-50 w-76 max-w-xs rounded-2xl border backdrop-blur-md p-4 shadow-2xl ${s.card}`}
      style={{ animation: 'slideInLeft 0.3s ease-out' }}
    >
      {/* Header row with title + dismiss button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏳</span>
          <span className={`font-bold text-sm ${s.text}`}>Subscription Expiring</span>
        </div>

        {/* ── Dismiss Button ─────────────────────────────── */}
        <button
          onClick={dismiss}
          aria-label="Dismiss subscription warning"
          className={`ml-2 rounded-lg p-1.5 transition-colors ${s.close}`}
          title="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
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

      <style jsx>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
