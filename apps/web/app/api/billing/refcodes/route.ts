import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

/**
 * GET /api/billing/refcodes
 * Fetches or creates the user's unique payment reference codes.
 * The userId is passed as a query param (client-side auth via Cocobase).
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    // Check if ref codes already exist
    const existing = await db.listDocuments('payment_refs', {
      filters: { user_id: userId },
    });

    if (existing.length > 0) {
      return NextResponse.json(existing[0].data || existing[0]);
    }

    // Generate new ref codes (first 6 chars of userId, uppercased)
    const suffix = userId.substring(0, 6).toUpperCase();
    const newRef = await db.createDocument('payment_refs', {
      user_id: userId,
      sol_ref_code: `SOL-REF-${suffix}`,
      sui_ref_code: `SUI-REF-${suffix}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(newRef.data || newRef);
  } catch (err: any) {
    console.error('refcodes error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
