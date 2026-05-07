'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/cocobase';

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: 'normal' | 'urgent';
  created_at: string;
  active: boolean;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  // Load dismissed IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cs_dismissed_notifs');
      if (stored) setReadIds(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  // Fetch global notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const docs = await db.listDocuments('global_notifications', {}) as any[];
        const active = docs
          .filter((d: any) => d.active)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setNotifications(active);
      } catch {}
    };

    fetchNotifs();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifs, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter(n => !readIds.has(n.id || (n as any)._id)).length;

  const handleDismiss = (id: string) => {
    const newRead = new Set(readIds);
    newRead.add(id);
    setReadIds(newRead);
    try {
      localStorage.setItem('cs_dismissed_notifs', JSON.stringify([...newRead]));
    } catch {}
  };

  const handleMarkAllRead = () => {
    const allIds = new Set(notifications.map(n => n.id || (n as any)._id));
    setReadIds(allIds);
    try {
      localStorage.setItem('cs_dismissed_notifs', JSON.stringify([...allIds]));
    } catch {}
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-secondary/50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse min-w-[18px] h-[18px]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-foreground font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-primary text-xs hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map(n => {
                const nId = n.id || (n as any)._id;
                const isRead = readIds.has(nId);
                return (
                  <div
                    key={nId}
                    className={`px-4 py-3 border-b border-border last:border-0 transition-colors ${
                      isRead ? 'opacity-60' : 'bg-primary/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        {n.priority === 'urgent' ? (
                          <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className="text-foreground text-sm font-medium">{n.title}</p>
                          <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-muted-foreground/50 text-[10px] mt-1">
                            {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                          </p>
                        </div>
                      </div>
                      {!isRead && (
                        <button
                          onClick={() => handleDismiss(nId)}
                          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                          aria-label="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
