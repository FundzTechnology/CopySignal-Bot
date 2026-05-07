'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const styles: Record<ToastType, { bg: string; icon: React.ReactNode; border: string }> = {
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: <XCircle className="h-5 w-5 text-red-400 shrink-0" />,
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />,
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: <Info className="h-5 w-5 text-blue-400 shrink-0" />,
  },
};

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const s = styles[type];

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xl
        ${s.bg} ${s.border}
        transition-all duration-300
        ${isExiting ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100'}
        animate-in slide-in-from-right-8 duration-300
      `}
    >
      {s.icon}
      <p className="text-sm text-foreground flex-1 leading-relaxed">{message}</p>
      <button
        onClick={handleClose}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
