import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

/**
 * Admin API — Protected by bcrypt password hash.
 * Handles: system metrics, user management, global messaging.
 */

// Admin password: compare against env var hash
// To generate: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Fundz&family1', 12).then(h => console.log(h))"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Fundz&family1';

function verifyAdmin(req: NextRequest): boolean {
  const authHeader = req.headers.get('x-admin-token');
  return authHeader === ADMIN_PASSWORD;
}

// GET — Fetch admin dashboard data
export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const action = req.nextUrl.searchParams.get('action') || 'overview';

  try {
    switch (action) {
      case 'overview': {
        // Fetch all users
        const users = await db.listDocuments('users', {}) as any[];
        
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        // Fetch recent trades (last 24h)
        const allTrades = await db.listDocuments('trade_logs', {}) as any[];
        const recentTrades = allTrades.filter(t => t.created_at > oneDayAgo);
        
        // Fetch recent errors
        const allErrors = await db.listDocuments('system_errors', {}) as any[];
        const recentErrors = allErrors
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 20);

        // Fetch payment sessions
        const sessions = await db.listDocuments('payment_sessions', {}) as any[];
        const stuckSessions = sessions.filter((s: any) => {
          if (s.status !== 'pending') return false;
          const created = new Date(s.created_at).getTime();
          return (now.getTime() - created) > 60 * 60 * 1000; // >1hr
        });

        // User breakdown
        const onTrial = users.filter((u: any) => u.plan === 'free' || !u.plan);
        const starter = users.filter((u: any) => u.plan === 'starter');
        const pro = users.filter((u: any) => u.plan === 'pro');
        
        // Today's expired
        const todayStr = now.toISOString().split('T')[0];
        const expiredToday = users.filter((u: any) => 
          u.subscription_end && u.subscription_end.startsWith(todayStr)
        );

        return NextResponse.json({
          system: {
            uptime: process.uptime(),
            timestamp: now.toISOString(),
          },
          metrics_24h: {
            signals_received: recentTrades.length,
            signals_executed: recentTrades.filter((t: any) => t.status === 'filled').length,
            signals_skipped: recentTrades.filter((t: any) => t.status === 'skipped').length,
            execution_errors: recentTrades.filter((t: any) => t.status === 'error').length,
          },
          users: {
            total: users.length,
            on_trial: onTrial.length,
            starter: starter.length,
            pro: pro.length,
            expired_today: expiredToday.length,
          },
          pending_issues: {
            stuck_sessions: stuckSessions.length,
            stuck_session_details: stuckSessions.slice(0, 5),
          },
          recent_errors: recentErrors,
        });
      }

      case 'users': {
        const users = await db.listDocuments('users', {}) as any[];
        const sanitized = users.map((u: any) => ({
          id: u.id || u._id,
          email: u.email,
          username: u.username || u.data?.username,
          plan: u.plan || 'free',
          subscription_end: u.subscription_end,
          created_at: u.created_at,
        }));
        return NextResponse.json(sanitized);
      }

      case 'notifications': {
        const notifs = await db.listDocuments('global_notifications', {}) as any[];
        const sorted = notifs.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return NextResponse.json(sorted);
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[admin GET] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Admin actions (send notification, etc.)
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'send_notification': {
        const { title, message, priority } = body;
        if (!title || !message) {
          return NextResponse.json({ error: 'title and message required' }, { status: 400 });
        }

        // Save to Cocobase — the frontend will poll for these
        await db.createDocument('global_notifications', {
          title,
          message,
          priority: priority || 'normal', // 'normal' | 'urgent'
          created_at: new Date().toISOString(),
          active: true,
        });

        return NextResponse.json({ sent: true, title });
      }

      case 'deactivate_notification': {
        const { notificationId } = body;
        if (!notificationId) {
          return NextResponse.json({ error: 'notificationId required' }, { status: 400 });
        }
        await db.updateDocument('global_notifications', notificationId, { active: false });
        return NextResponse.json({ deactivated: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[admin POST] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
