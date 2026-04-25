import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

// NOTE: This route should only be accessible to the authenticated user
// The encryption happens here — API keys must never travel as plaintext inside DB
export async function POST(req: NextRequest) {
  const { userId, exchange, apiKey, apiSecret, testnet } = await req.json();

  // Encrypt before storage
  // In Next.js API routes, use the Node crypto module
  const { encrypt } = await import('@/lib/crypto');

  try {
    const doc = await db.createDocument("api_keys", {
      user_id: userId,
      exchange,
      api_key: encrypt(apiKey),
      api_secret: encrypt(apiSecret),
      testnet: testnet || false,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ id: doc.id, exchange, created: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
