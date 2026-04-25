import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, channelUsername, exchange, riskPercent, maxTradesPerDay } = body;

  const channel = await db.createDocument("channels", {
    user_id: userId,
    telegram_channel_id: null,  // resolved by the bot when it first sees the channel
    channel_username: channelUsername,
    channel_name: channelUsername,
    is_active: true,
    exchange,
    risk_percent: riskPercent,
    max_trades_per_day: maxTradesPerDay,
    created_at: new Date().toISOString()
  });

  return NextResponse.json(channel);
}

export async function DELETE(req: NextRequest) {
  const { channelId } = await req.json();
  await db.updateDocument("channels", channelId, { is_active: false });
  return NextResponse.json({ success: true });
}
