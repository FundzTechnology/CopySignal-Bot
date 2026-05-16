'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Activity, Users, CreditCard, AlertTriangle, RefreshCw,
  Send, Clock, Wifi, WifiOff, CheckCircle2, XCircle, Zap, Eye,
  ChevronRight, Bell, LogOut, Radio, TrendingUp, ArrowUpRight
} from 'lucide-react';

interface AdminData {
  system: { uptime: number; timestamp: string };
  metrics_24h: {
    signals_received: number;
    signals_executed: number;
    signals_skipped: number;
    execution_errors: number;
  };
  users: {
    total: number;
    on_trial: number;
    starter: number;
    pro: number;
    expired_today: number;
  };
  pending_issues: {
    stuck_sessions: number;
    stuck_session_details: any[];
  };
  recent_errors: any[];
}

export default function ControlPanelPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'notifications'>('overview');

  // User list
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Notification form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifPriority, setNotifPriority] = useState<'normal' | 'urgent'>('normal');
  const [sending, setSending] = useState(false);
  const [sentNotifs, setSentNotifs] = useState<any[]>([]);

  const headers = { 'x-admin-token': password.trim() };


  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin?action=overview', { headers: { 'x-admin-token': password } });
      if (res.ok) {
        setAuthenticated(true);
        const json = await res.json();
        setData(json);
      } else {
        setAuthError('Invalid password.');
      }
    } catch {
      setAuthError('Connection error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchOverview = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin?action=overview', { headers });
      if (res.ok) setData(await res.json());
    } catch {} 
    finally { setLoading(false); }
  }, [authenticated, password]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin?action=users', { headers });
      if (res.ok) setUsers(await res.json());
    } catch {}
    finally { setUsersLoading(false); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin?action=notifications', { headers });
      if (res.ok) setSentNotifs(await res.json());
    } catch {}
  };

  useEffect(() => {
    if (!authenticated) return;
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'notifications') fetchNotifications();
  }, [activeTab, authenticated]);

  const handleSendNotification = async () => {
    if (!notifTitle || !notifMessage) return;
    setSending(true);
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_notification', title: notifTitle, message: notifMessage, priority: notifPriority }),
      });
      setNotifTitle('');
      setNotifMessage('');
      fetchNotifications();
    } catch {}
    finally { setSending(false); }
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // ── Auth Gate ──────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Apple-style ambient gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent rounded-full blur-[100px]" />

        <div className="relative w-full max-w-sm">
          <div className="backdrop-blur-2xl bg-white/[0.05] border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="text-center mb-8">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-white text-xl font-semibold tracking-tight">Control Panel</h1>
              <p className="text-white/40 text-sm mt-1">Restricted access</p>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3 mb-4 text-center">
                {authError}
              </div>
            )}

            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              className="w-full bg-white/[0.05] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm placeholder:text-white/20"
            />

            <button
              onClick={handleAuth}
              disabled={authLoading || !password}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              {authLoading ? 'Verifying...' : 'Authenticate'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      {/* Background gradients */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/[0.06] backdrop-blur-xl bg-white/[0.02] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight">Control Panel</h1>
                <p className="text-white/30 text-[11px]">Fundz Technology</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchOverview} disabled={loading} className="p-2 rounded-lg hover:bg-white/5 transition text-white/50 hover:text-white">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setAuthenticated(false)} className="p-2 rounded-lg hover:bg-red-500/10 transition text-white/50 hover:text-red-400">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
            {(['overview', 'users', 'notifications'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* ── OVERVIEW TAB ────────────────────────────────────────── */}
          {activeTab === 'overview' && data && (
            <div className="space-y-6">
              {/* System Health */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <GlassCard icon={<Wifi className="h-4 w-4" />} label="System" value="Online" accent="emerald" />
                <GlassCard icon={<Clock className="h-4 w-4" />} label="Uptime" value={formatUptime(data.system.uptime)} accent="blue" />
                <GlassCard icon={<Users className="h-4 w-4" />} label="Total Users" value={String(data.users.total)} accent="purple" />
                <GlassCard icon={<AlertTriangle className="h-4 w-4" />} label="Stuck Payments" value={String(data.pending_issues.stuck_sessions)} accent={data.pending_issues.stuck_sessions > 0 ? 'red' : 'emerald'} />
              </div>

              {/* 24h Metrics */}
              <div>
                <h2 className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">Last 24 Hours</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <GlassCard icon={<Radio className="h-4 w-4" />} label="Signals Received" value={String(data.metrics_24h.signals_received)} accent="blue" />
                  <GlassCard icon={<Zap className="h-4 w-4" />} label="Executed" value={String(data.metrics_24h.signals_executed)} accent="emerald" />
                  <GlassCard icon={<Eye className="h-4 w-4" />} label="Skipped" value={String(data.metrics_24h.signals_skipped)} accent="yellow" />
                  <GlassCard icon={<XCircle className="h-4 w-4" />} label="Errors" value={String(data.metrics_24h.execution_errors)} accent={data.metrics_24h.execution_errors > 0 ? 'red' : 'emerald'} />
                </div>
              </div>

              {/* User Breakdown */}
              <div>
                <h2 className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">User Breakdown</h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <GlassCard label="Total" value={String(data.users.total)} accent="white" />
                  <GlassCard label="On Trial" value={String(data.users.on_trial)} accent="yellow" />
                  <GlassCard label="Starter" value={String(data.users.starter)} accent="blue" />
                  <GlassCard label="Pro" value={String(data.users.pro)} accent="purple" />
                  <GlassCard label="Expired Today" value={String(data.users.expired_today)} accent={data.users.expired_today > 0 ? 'red' : 'emerald'} />
                </div>
              </div>

              {/* Recent Errors */}
              {data.recent_errors.length > 0 && (
                <div>
                  <h2 className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">Recent Errors</h2>
                  <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                    {data.recent_errors.slice(0, 10).map((err, i) => (
                      <div key={i} className="px-4 py-3 border-b border-white/[0.04] last:border-0 flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-sm truncate">{err.message || 'Unknown error'}</p>
                          <p className="text-white/30 text-xs mt-0.5">{err.timestamp ? new Date(err.timestamp).toLocaleString() : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── USERS TAB ───────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div>
              {usersLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full" />
                </div>
              ) : users.length === 0 ? (
                <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
                  <Users className="h-10 w-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No users found.</p>
                </div>
              ) : (
                <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">User</th>
                          <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Plan</th>
                          <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Telegram</th>
                          <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Expires</th>
                          <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, i) => (
                          <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                            <td className="px-4 py-3">
                              <p className="text-white font-medium">{u.username || u.email}</p>
                              <p className="text-white/30 text-xs">{u.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                u.plan === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                                u.plan === 'starter' ? 'bg-blue-500/20 text-blue-300' :
                                u.plan === 'trial' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-white/[0.06] text-white/40'
                              }`}>
                                {(u.plan || 'free').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              {u.telegram_linked ? (
                                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300">Linked</span>
                              ) : (
                                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-white/[0.06] text-white/30">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-white/40 text-xs hidden sm:table-cell">
                              {u.subscription_end ? new Date(u.subscription_end).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-4 py-3 text-white/40 text-xs hidden sm:table-cell">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ───────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Compose */}
              <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Send className="h-4 w-4 text-purple-400" />
                  Send Global Notification
                </h3>
                <p className="text-white/40 text-xs mb-4">This will appear as an in-app notification for all users and be sent via the Telegram bot.</p>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Notification title"
                    value={notifTitle}
                    onChange={e => setNotifTitle(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition placeholder:text-white/20"
                  />
                  <textarea
                    placeholder="Message body..."
                    value={notifMessage}
                    onChange={e => setNotifMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition placeholder:text-white/20 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {(['normal', 'urgent'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setNotifPriority(p)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition capitalize ${
                            notifPriority === p
                              ? p === 'urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-white/[0.04] text-white/40 border border-transparent'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleSendNotification}
                      disabled={sending || !notifTitle || !notifMessage}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold py-2 px-5 rounded-xl transition-all text-sm flex items-center gap-2"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sent notifications */}
              {sentNotifs.length > 0 && (
                <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <h3 className="text-white/60 text-xs uppercase tracking-wider font-semibold">Sent Notifications</h3>
                  </div>
                  {sentNotifs.map((n, i) => (
                    <div key={i} className="px-4 py-3 border-b border-white/[0.03] last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white text-sm font-medium">{n.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          n.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/[0.06] text-white/30'
                        }`}>
                          {n.active ? 'Active' : 'Dismissed'}
                        </span>
                      </div>
                      <p className="text-white/40 text-xs">{n.message}</p>
                      <p className="text-white/20 text-[10px] mt-1">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Glass Card Component ─────────────────────────────────────────────
function GlassCard({ icon, label, value, accent }: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  const accentColors: Record<string, string> = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    white: 'text-white',
  };

  return (
    <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 hover:bg-white/[0.05] transition-all">
      {icon && <div className={`${accentColors[accent] || 'text-white/50'} mb-2`}>{icon}</div>}
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className={`text-xl font-bold tracking-tight ${accentColors[accent] || 'text-white'}`}>{value}</p>
    </div>
  );
}
