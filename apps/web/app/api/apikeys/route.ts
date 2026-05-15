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
    // NOTE: Users may NOT enable "Assets" permission on Bybit, which means
    // fetchBalance() will fail. We try fetchBalance first, then fall back to
    // fetchOpenOrders/fetchPositions which only need "Trade" permissions.
    let validated = false;
    try {
      if (exchange === 'binance') {
        const binance = new ccxt.binance({ apiKey, secret: apiSecret, enableRateLimit: false });
        if (testnet) binance.setSandboxMode(true);
        await binance.fetchBalance();
        validated = true;
      } else if (exchange === 'bybit') {
        const bybitOpts: any = { apiKey, secret: apiSecret, enableRateLimit: false };
        const bybit = new ccxt.bybit(bybitOpts);

        if (demoMode) {
          // Bybit Demo Trading: override ALL URL keys to the demo endpoint.
          const hostname = (bybit as any).hostname || 'bybit.com';
          const demoBase = `https://api-demo.${hostname}`;
          
          const currentApi = (bybit.urls as any)['api'];
          if (typeof currentApi === 'object' && currentApi !== null) {
            for (const key of Object.keys(currentApi)) {
              if (typeof currentApi[key] === 'string') {
                currentApi[key] = demoBase;
              } else if (typeof currentApi[key] === 'object' && currentApi[key] !== null) {
                for (const subKey of Object.keys(currentApi[key])) {
                  currentApi[key][subKey] = demoBase;
                }
              }
            }
          } else {
            (bybit.urls as any)['api'] = demoBase;
          }
          
          console.log('[API Key Validation] Bybit Demo mode — URLs overridden to:', demoBase);
        } else if (testnet) {
          bybit.setSandboxMode(true);
        }

        // Strategy: Try multiple endpoints in order of permission requirements.
        // fetchBalance needs "Assets/Account" permission (user may NOT have this)
        // fetchOpenOrders needs only "Trade" permission (user likely has this)
        
        // Attempt 1: fetchBalance (requires Assets permission)
        try {
          await bybit.fetchBalance({ type: 'unified' });
          console.log('[API Key Validation] Bybit fetchBalance(unified) succeeded');
          validated = true;
        } catch (balErr: any) {
          console.log('[API Key Validation] fetchBalance failed:', balErr.message);
          
          // Attempt 2: fetchOpenOrders (requires only Trade permission)
          try {
            await bybit.fetchOpenOrders('BTC/USDT:USDT');
            console.log('[API Key Validation] Bybit fetchOpenOrders succeeded');
            validated = true;
          } catch (ordErr: any) {
            console.log('[API Key Validation] fetchOpenOrders failed:', ordErr.message);
            
            // Attempt 3: fetchPositions (requires only Trade permission)
            try {
              await bybit.fetchPositions(['BTC/USDT:USDT']);
              console.log('[API Key Validation] Bybit fetchPositions succeeded');
              validated = true;
            } catch (posErr: any) {
              console.log('[API Key Validation] fetchPositions failed:', posErr.message);
              // All attempts failed — this key is truly invalid
              throw new Error(`API key validation failed. Last error: ${posErr.message}`);
            }
          }
        }
      } else {
        throw new Error('Unsupported exchange');
      }
    } catch (err: any) {
      console.error('[API Key Validation Failed]', err.message);
      return NextResponse.json({ error: `Validation failed: ${err.message}` }, { status: 400 });
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
