import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

/**
 * Admin API — Protected by plain-text password.
 * Handles: system metrics, user management, global messaging.
 */

function verifyAdmin(req: NextRequest): boolean {
  // Read fresh on every request — Fly.io injects secrets after module load
  const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'Fundz,family1').trim().replace(/\s/g, '');
  const authHeader = (req.headers.get('x-admin-token') || '').trim().replace(/\s/g, '');

  if (!authHeader) {
    console.log('[Admin] No x-admin-token header provided');
    return false;
  }

  const match = authHeader === ADMIN_PASSWORD;
  if (!match) {
    console.log(`[Admin] Password mismatch — received len: ${authHeader.length}, expected len: ${ADMIN_PASSWORD.length}`);
    console.log(`[Admin] First/last received: "${authHeader[0]}...${authHeader[authHeader.length - 1]}"`);
    console.log(`[Admin] First/last expected: "${ADMIN_PASSWORD[0]}...${ADMIN_PASSWORD[ADMIN_PASSWORD.length - 1]}"`);
  }

  return match;
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
        // Fetch real users from Cocobase auth system (not the 'users' collection)
        let authUsers: any[] = [];
        try {
          authUsers = await db.auth.listUsers() as unknown as any[];
        } catch {
          authUsers = [];
        }
        
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        // Fetch recent trades (last 24h) — collection may not exist
        let allTrades: any[] = [];
        try {
          allTrades = await db.listDocuments('trade_logs', {}) as any[];
        } catch {
          // Collection doesn't exist yet
        }
        const recentTrades = allTrades.filter(t => (t.created_at || t.data?.created_at) > oneDayAgo);
        
        // Fetch recent errors — collection may not exist
        let allErrors: any[] = [];
        try {
          allErrors = await db.listDocuments('system_errors', {}) as any[];
        } catch {
          // Collection doesn't exist yet
        }
        const recentErrors = allErrors
          .sort((a: any, b: any) => new Date(b.timestamp || b.data?.timestamp || 0).getTime() - new Date(a.timestamp || a.data?.timestamp || 0).getTime())
          .slice(0, 20);

        // Fetch payment sessions — collection may not exist
        let sessions: any[] = [];
        try {
          sessions = await db.listDocuments('payment_sessions', {}) as any[];
        } catch {
          // Collection doesn't exist yet
        }
        const stuckSessions = sessions.filter((s: any) => {
          if ((s.status || s.data?.status) !== 'pending') return false;
          const created = new Date(s.created_at || s.data?.created_at).getTime();
          return (now.getTime() - created) > 60 * 60 * 1000; // >1hr
        });

        // User breakdown — auth users store data in the .data field
        const getUserData = (u: any) => u.data || u;
        const onTrial = authUsers.filter((u: any) => {
          const d = getUserData(u);
          return d.plan === 'trial' || d.plan === 'free' || !d.plan;
        });
        const starter = authUsers.filter((u: any) => getUserData(u).plan === 'starter');
        const pro = authUsers.filter((u: any) => getUserData(u).plan === 'pro');
        
        // Today's expired
        const todayStr = now.toISOString().split('T')[0];
        const expiredToday = authUsers.filter((u: any) => {
          const d = getUserData(u);
          return d.plan_expires_at && d.plan_expires_at.startsWith(todayStr);
        });

        return NextResponse.json({
          system: {
            uptime: process.uptime(),
            timestamp: now.toISOString(),
          },
          metrics_24h: {
            signals_received: recentTrades.length,
            signals_executed: recentTrades.filter((t: any) => (t.status || t.data?.status) === 'filled').length,
            signals_skipped: recentTrades.filter((t: any) => (t.status || t.data?.status) === 'skipped').length,
            execution_errors: recentTrades.filter((t: any) => (t.status || t.data?.status) === 'error').length,
          },
          users: {
            total: authUsers.length,
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
        // Fetch real users from Cocobase auth
        let authUsers: any[] = [];
        try {
          authUsers = await db.auth.listUsers() as unknown as any[];
        } catch {
          authUsers = [];
        }
        const sanitized = authUsers.map((u: any) => {
          const d = u.data || u;
          return {
            id: u.id || u._id,
            email: d.email || u.email,
            username: d.username,
            plan: d.plan || 'free',
            subscription_end: d.plan_expires_at || d.subscription_end,
            telegram_linked: !!d.telegram_user_id,
            created_at: d.created_at,
          };
        });
        return NextResponse.json(sanitized);
      }

      case 'notifications': {
        let notifs: any[] = [];
        try {
          notifs = await db.listDocuments('global_notifications', {}) as any[];
        } catch {
          // Collection doesn't exist yet
        }
        const sorted = notifs.sort((a: any, b: any) => 
          new Date(b.created_at || b.data?.created_at || 0).getTime() - new Date(a.created_at || a.data?.created_at || 0).getTime()
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
