import { NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

export async function POST(req: Request) {
  try {
    const { userId, chain, plan } = await req.json();

    if (!userId || !chain || !plan) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const user = await db.auth.getUserById(userId);
    if (!user || !user.data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userIndex = user.data.user_index;
    if (userIndex === undefined || userIndex === null) {
      return NextResponse.json({ error: 'User missing HD wallet index' }, { status: 400 });
    }

    // Call the bot engine's REST API or generate it here directly?
    // Since the web dashboard doesn't have the master seed (it's in apps/bot),
    // we should really proxy this request to the bot API, or we can just fetch it from DB if we know what to do.
    // Wait, apps/web shouldn't hold the master mnemonic.
    // In our PRD, the web app calls the bot's REST API endpoint.
    
    const botUrl = process.env.BOT_URL || 'http://localhost:8080';
    const response = await fetch(`${botUrl}/api/payments/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userIndex, chain, plan })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bot returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Session generation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
