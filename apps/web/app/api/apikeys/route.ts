import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';
import ccxt from 'ccxt';

// NOTE: This route should only be accessible to the authenticated user
// The encryption happens here — API keys must never travel as plaintext inside DB
export async function POST(req: NextRequest) {
  const { userId, exchange, apiKey, apiSecret, testnet, demoMode } = await req.json();

  // Encrypt before storage
  // In Next.js API routes, use the Node crypto module
  const { encrypt, decrypt } = await import('@/lib/crypto');

  try {
    // ── Check API Key Uniqueness ──────────────────────────────────────────
    try {
      const allKeys = await db.listDocuments('api_keys', {}) as any[];
      for (const existing of allKeys) {
        const existingApiKey = existing.api_key || existing.data?.api_key;
        const existingUserId = existing.user_id || existing.data?.user_id;
        if (!existingApiKey) continue;

        try {
          const decryptedKey = decrypt(existingApiKey);
          if (decryptedKey === apiKey && existingUserId !== userId) {
            return NextResponse.json(
              { error: 'This API key is already linked to another account.' },
              { status: 409 }
            );
          }
          // Also prevent the same user from adding the same key twice
          if (decryptedKey === apiKey && existingUserId === userId) {
            return NextResponse.json(
              { error: 'You have already added this API key.' },
              { status: 409 }
            );
          }
        } catch {
          // Decryption failed for this record — skip it
          continue;
        }
      }
    } catch (err) {
      // Collection may not exist yet — proceed with saving
      console.log('[apikeys] Uniqueness check skipped (collection may not exist yet)');
    }

    // ── Validate API Key ─────────────────────────────────────────────────
    let balance;
    try {
      if (exchange === 'binance') {
        const binance = new ccxt.binance({ apiKey, secret: apiSecret, enableRateLimit: false });
        if (testnet) binance.setSandboxMode(true);
        balance = await binance.fetchBalance();
      } else if (exchange === 'bybit') {
        const bybitOpts: any = { apiKey, secret: apiSecret, enableRateLimit: false };
        const bybit = new ccxt.bybit(bybitOpts);

        if (demoMode) {
          // Bybit Demo Trading: override ALL URL keys to the demo endpoint.
          // CCXT v4+ uses nested keys like v5, linear, inverse, spot, etc.
          // We must override every single one, not just a few.
          const hostname = (bybit as any).hostname || 'bybit.com';
          const demoBase = `https://api-demo.${hostname}`;
          
          const currentApi = (bybit.urls as any)['api'];
          if (typeof currentApi === 'object' && currentApi !== null) {
            // Override every key in the existing API URL map
            for (const key of Object.keys(currentApi)) {
              if (typeof currentApi[key] === 'string') {
                currentApi[key] = demoBase;
              } else if (typeof currentApi[key] === 'object' && currentApi[key] !== null) {
                // Some keys have nested objects (e.g., { public: '...', private: '...' })
                for (const subKey of Object.keys(currentApi[key])) {
                  currentApi[key][subKey] = demoBase;
                }
              }
            }
          } else {
            // Flat URL — just override it
            (bybit.urls as any)['api'] = demoBase;
          }
          
          console.log('[API Key Validation] Bybit Demo mode — URLs overridden to:', demoBase);
        } else if (testnet) {
          bybit.setSandboxMode(true);
        }

        // Try Unified Trading Account first (most new Bybit accounts use UTA)
        try {
          balance = await bybit.fetchBalance({ type: 'unified' });
          console.log('[API Key Validation] Bybit UTA fetchBalance succeeded');
        } catch (utaErr: any) {
          console.log('[API Key Validation] UTA fetchBalance failed, trying spot:', utaErr.message);
          try {
            balance = await bybit.fetchBalance({ type: 'spot' });
            console.log('[API Key Validation] Bybit spot fetchBalance succeeded');
          } catch (spotErr: any) {
            console.log('[API Key Validation] spot fetchBalance failed, trying default:', spotErr.message);
            // Final fallback to default
            balance = await bybit.fetchBalance();
          }
        }
      } else {
        throw new Error('Unsupported exchange');
      }
    } catch (err: any) {
      console.error('[API Key Validation Failed]', err.message);
      console.error('[API Key Validation] Full error:', JSON.stringify({ name: err.name, message: err.message }, null, 2));
      return NextResponse.json({ error: 'Invalid API key or insufficient permissions. Please check your credentials and ensure your API key has "Read" and "Trade" permissions enabled.' }, { status: 400 });
    }
    
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
