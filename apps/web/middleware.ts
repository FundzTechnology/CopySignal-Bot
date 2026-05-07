import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — CORS, Security Headers, Rate Limiting
 * Runs on every request before it reaches the route handler.
 */

// ── CORS Configuration ──────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://copysignal-bot.fundztechnology.com',
  'https://www.copysignal-bot.fundztechnology.com',
  'https://copysignal-bot.vercel.app',
  'https://copysignal-bot.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

// ── Simple In-Memory Rate Limiter ────────────────────────────────────────
// NOTE: In a multi-instance deployment, use Redis instead. This works fine
// for a single Vercel serverless instance.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60;        // 60 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return false;
  }
  return true;
}

// Clean up old entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }, 5 * 60_000);
}

export function middleware(req: NextRequest) {
  const response = NextResponse.next();
  const origin = req.headers.get('origin') || '';
  const pathname = req.nextUrl.pathname;

  // ── CORS Headers ───────────────────────────────────────────────────────
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  // ── Rate Limiting on API routes ────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // ── Security Headers ───────────────────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    // Run on all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest\\.json).*)',
  ],
};
