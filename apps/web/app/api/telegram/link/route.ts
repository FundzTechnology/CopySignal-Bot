import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

/**
 * Telegram Link Token API
 * POST — Generate a 6-digit OTP code for linking Telegram to user account
 * GET  — Check if user's Telegram is currently linked
 */

function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Generate a 6-digit numeric code
    const code = generate6DigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Delete any existing unused tokens for this user
    try {
      const existing = await db.listDocuments('telegram_link_tokens', {
        filters: { user_id: userId, used: false }
      }) as any[];
      for (const token of existing) {
        await db.updateDocument('telegram_link_tokens', token.id || token._id, { used: true });
      }
    } catch {
      // Collection may not exist yet — that's fine
    }

    // Create new token
    await db.createDocument('telegram_link_tokens', {
      user_id: userId,
      code,
      used: false,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ code, expiresAt });
  } catch (error: any) {
    console.error('[telegram-link POST] Error:', error.message);
    return NextResponse.json({ error: 'Failed to generate linking code' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    let telegramChatId = null;
    let telegramUsername = null;

    // Check the custom 'users' collection where the bot stores telegram link data
    // Try filtered query first
    try {
      const userDocs = await db.listDocuments('users', {
        filters: { user_id: userId }
      }) as any[];

      if (userDocs.length > 0) {
        const doc = userDocs[0];
        const d = doc.data || doc;
        telegramChatId = d.telegram_user_id || doc.telegram_user_id;
        telegramUsername = d.telegram_username || doc.telegram_username;
      }
    } catch {
      // filter may not work
    }

    // Fallback: Cocobase wraps fields in .data — filter won't match data.user_id
    if (!telegramChatId) {
      try {
        const allDocs = await db.listDocuments('users', {}) as any[];
        const match = allDocs.find((doc: any) => {
          const d = doc.data || doc;
          return (d.user_id || doc.user_id) === userId;
        });
        if (match) {
          const d = match.data || match;
          telegramChatId = d.telegram_user_id || match.telegram_user_id;
          telegramUsername = d.telegram_username || match.telegram_username;
        }
      } catch {
        // Collection may not exist yet
      }
    }

    return NextResponse.json({
      linked: !!telegramChatId,
      telegram_username: telegramUsername || null,
    });
  } catch (error: any) {
    console.error('[telegram-link GET] Error:', error.message);
    return NextResponse.json({ linked: false });
  }
}
