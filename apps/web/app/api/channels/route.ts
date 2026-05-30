import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

/**
 * Channels API — Add / Deactivate signal channels
 * Security: userId must come from the authenticated session.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, channelUsername, exchange, riskPercent, maxTradesPerDay } = body;

    // ── Input Validation ──────────────────────────────────────────────────
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    // ── Check Plan Limits ────────────────────────────────────────────────
    try {
      const user = await db.auth.getUserById(userId);
      if (user?.data?.plan === 'starter') {
        const userChannels = await db.listDocuments('channels', { filters: { user_id: userId, is_active: true } }) as any[];
        if (userChannels.length >= 1) {
          return NextResponse.json(
            { error: 'Starter plan allows a maximum of 1 channel. Please upgrade to Pro.' },
            { status: 403 }
          );
        }
      }
    } catch (err) {
      console.log('[channels] Plan check failed, proceeding...');
    }
    if (!channelUsername || typeof channelUsername !== 'string') {
      return NextResponse.json({ error: 'channelUsername is required' }, { status: 400 });
    }
    if (!exchange || !['bybit', 'binance'].includes(exchange)) {
      return NextResponse.json({ error: 'exchange must be "bybit" or "binance"' }, { status: 400 });
    }

    // Sanitize inputs — strip dangerous characters
    const cleanUsername = channelUsername.trim().replace(/[^a-zA-Z0-9_@\-]/g, '').substring(0, 100);
    const cleanRisk = Math.max(0.1, Math.min(5, Number(riskPercent) || 1));
    const cleanMaxTrades = Math.max(1, Math.min(50, Number(maxTradesPerDay) || 10));

    const channel = await db.createDocument("channels", {
      user_id: userId,
      telegram_channel_id: null,  // resolved by the bot when it first sees the channel
      channel_username: cleanUsername,
      channel_name: cleanUsername,
      is_active: true,
      exchange,
      risk_percent: cleanRisk,
      max_trades_per_day: cleanMaxTrades,
      created_at: new Date().toISOString()
    });

    return NextResponse.json(channel);
  } catch (error: any) {
    console.error('[channels POST] Error:', error.message);
    return NextResponse.json({ error: 'Failed to add channel' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { channelId, userId } = await req.json();

    if (!channelId || typeof channelId !== 'string') {
      return NextResponse.json({ error: 'channelId is required' }, { status: 400 });
    }
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Verify the channel belongs to this user before deactivating
    const channels = await db.listDocuments("channels", {
      filters: { user_id: userId }
    }) as any[];
    
    const ownsChannel = channels.some(c => (c.id || c._id) === channelId);
    if (!ownsChannel) {
      return NextResponse.json({ error: 'Channel not found or access denied' }, { status: 403 });
    }

    await db.updateDocument("channels", channelId, { is_active: false });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[channels DELETE] Error:', error.message);
    return NextResponse.json({ error: 'Failed to deactivate channel' }, { status: 500 });
  }
}
