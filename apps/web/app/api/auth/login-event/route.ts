import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

/**
 * Login Activity Logger
 * Records login attempts (success/failure) with IP, device, and timestamp.
 * Called from the login page after auth attempt.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, status } = body;

    if (!email || !status) {
      return NextResponse.json({ error: 'email and status required' }, { status: 400 });
    }

    // Extract IP from headers (works with Vercel, Cloudflare, etc.)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Parse user-agent into friendly device string
    const rawUA = req.headers.get('user-agent') || 'Unknown';
    const device = parseUserAgent(rawUA);

    // Get approximate location from IP (free API, best-effort)
    let country = 'Unknown';
    let city = 'Unknown';
    try {
      if (ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: AbortSignal.timeout(3000),
        });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          country = geo.country_name || 'Unknown';
          city = geo.city || 'Unknown';
        }
      }
    } catch {
      // Geo lookup failed — non-critical, continue
    }

    await db.createDocument('login_events', {
      user_id: userId || null,
      email,
      ip_address: ip,
      country,
      city,
      device,
      status, // 'success' | 'failed'
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ logged: true });
  } catch (error: any) {
    console.error('[login-event] Error:', error.message);
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}

/**
 * GET — Fetch login history for a specific user
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const events = await db.listDocuments('login_events', {
      filters: { user_id: userId },
    });

    // Sort by timestamp descending, return last 10
    const sorted = (events as any[])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return NextResponse.json(sorted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

function parseUserAgent(ua: string): string {
  // Browser detection
  let browser = 'Unknown Browser';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';

  // OS detection
  let os = 'Unknown OS';
  if (ua.includes('Windows NT')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('iPhone')) os = 'iPhone';
  else if (ua.includes('iPad')) os = 'iPad';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('CrOS')) os = 'ChromeOS';

  return `${browser} on ${os}`;
}
