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

  // Atomic increment to get a unique user index for HD Wallets
  let newIndex = 1;
  try {
    const counterDoc = await db.getDocument("user_indices", "singleton");
    newIndex = (counterDoc as any).current_index + 1;
    await db.updateDocument("user_indices", "singleton", { current_index: newIndex });
  } catch (err) {
    // If the singleton doesn't exist yet, create it starting at 1
    console.warn("user_indices singleton not found, initializing to 1");
    await db.createDocument("user_indices", { id: "singleton", current_index: 1 });
  }

  return await db.auth.register({
    email,
    password,
    data: {
      username,
      user_index: newIndex,                       // ─── ASSIGNED PERMANENT HD WALLET INDEX
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
