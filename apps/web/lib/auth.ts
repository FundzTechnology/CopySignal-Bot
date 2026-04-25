import { db } from '@/lib/cocobase';

/**
 * Registers a new user with a 5-day free Pro trial.
 * Sets trial_used: true permanently — can never be reset.
 */
export async function registerUser(
  email: string,
  password: string,
  username: string
) {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 5); // 5 days from now

  return await db.auth.register({
    email,
    password,
    data: {
      username,
      plan: 'trial',                              // Starts on trial
      trial_used: true,                           // PERMANENT — never reset
      trial_ends_at: trialEndsAt.toISOString(),
      plan_expires_at: trialEndsAt.toISOString(), // Trial expiry = plan expiry
      telegram_user_id: null,
      subscription_warning: false,
      days_remaining: 5,
      created_at: new Date().toISOString(),
    },
  });
}
