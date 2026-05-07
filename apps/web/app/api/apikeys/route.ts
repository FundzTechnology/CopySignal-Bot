import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';
import ccxt from 'ccxt';

// NOTE: This route should only be accessible to the authenticated user
// The encryption happens here — API keys must never travel as plaintext inside DB
export async function POST(req: NextRequest) {
  const { userId, exchange, apiKey, apiSecret, testnet, demoMode } = await req.json();

  // Encrypt before storage
  // In Next.js API routes, use the Node crypto module
  const { encrypt } = await import('@/lib/crypto');

  try {
    // ── Validate API Key ─────────────────────────────────────────────────
    let balance;
    try {
      if (exchange === 'binance') {
        const binance = new ccxt.binance({ apiKey, secret: apiSecret, enableRateLimit: false });
        if (testnet) binance.setSandboxMode(true);
        balance = await binance.fetchBalance();
      } else if (exchange === 'bybit') {
        const bybitOpts: any = { apiKey, secret: apiSecret, enableRateLimit: false };
        if (demoMode) {
          // Bybit Demo Trading uses api-demo.bybit.com
          bybitOpts.urls = { api: { public: 'https://api-demo.bybit.com', private: 'https://api-demo.bybit.com' } };
        }
        const bybit = new ccxt.bybit(bybitOpts);
        if (testnet && !demoMode) bybit.setSandboxMode(true);
        balance = await bybit.fetchBalance();
      } else {
        throw new Error('Unsupported exchange');
      }
    } catch (err: any) {
      console.error('[API Key Validation Failed]', err.message);
      return NextResponse.json({ error: 'Invalid API key or insufficient permissions. Please check your credentials.' }, { status: 400 });
    }
    
    // Check withdrawal permissions (warning only, but good practice to detect)
    // ccxt doesn't provide a uniform way to check withdrawal perms directly without making a withdrawal
    // but the fetchBalance success guarantees we have READ access.
    // Realistically, trading bots also need createOrder permissions. We could test an order if needed.

    const doc = await db.createDocument("api_keys", {
      user_id: userId,
      exchange,
      api_key: encrypt(apiKey),
      api_secret: encrypt(apiSecret),
      testnet: testnet || false,
      demo_mode: demoMode || false,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ id: doc.id, exchange, created: true });
  } catch (error: any) {
    console.error('[apikeys POST] Error:', error.message);
    return NextResponse.json({ error: 'An unexpected error occurred while saving your API key.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const records = await db.listDocuments("api_keys", {
      filters: { user_id: userId }
    });
    
    // Do NOT return the plaintext or even ciphertext keys, only the status
    const sanitized = records.map((r: any) => ({
      id: r.id || r.data?.id,
      exchange: r.exchange || r.data?.exchange,
      demo_mode: r.demo_mode || r.data?.demo_mode || false,
    }));

    return NextResponse.json(sanitized);
  } catch (error: any) {
    console.error('[apikeys GET] Error:', error.message);
    return NextResponse.json({ error: 'Failed to load API keys.' }, { status: 500 });
  }
}
