import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

/**
 * Password Reset — Request
 * Triggers Cocobase's built-in password reset email flow.
 * The reset link expires after 1 hour and is one-time use.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Sanitize
    const cleanEmail = email.trim().toLowerCase();

    // Use Cocobase built-in password reset
    // This sends the user an email with {reset_link} — expires in 1 hour, one-time use
    await db.auth.requestPasswordReset(cleanEmail);

    // Always return success even if email doesn't exist (prevents email enumeration)
    return NextResponse.json({
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  } catch (error: any) {
    console.error('[reset-password] Error:', error.message);
    // Still return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  }
}
