import { db } from '../db/cocobase.js';
import { sendTradeAlert } from '../services/alertBot.js';

export async function runDailySubscriptionCheck() {
  console.log('🔄 Running daily subscription check...');

  const now = new Date();

  // Fetch all users on paid/trial plans
  // Fetch all users, filter paid/trial plans in memory
  // (Cocobase filters do not support array values natively)
  const allUsers = await db.listDocuments('users', {});
  const activeUsers = allUsers.filter(
    (u: any) => ['starter', 'pro', 'trial'].includes(u.plan)
  );

  let processed = 0;

  for (const user of activeUsers) {
    const u = user as any;
    if (!u.plan_expires_at) continue;

    const expiresAt = new Date(u.plan_expires_at);
    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // ── CASE 1: Expired ─────────────────────────────────────────
    if (daysRemaining <= 0) {
      await db.updateDocument('users', u.id, {
        plan: 'free',
        plan_expires_at: null,
        subscription_warning: false,
        days_remaining: 0,
      });

      if (u.telegram_user_id) {
        await sendTradeAlert(u.telegram_user_id, {
          type: 'expiry',
          message: `⛔ *Subscription Expired*\n\nYour bot has been paused.\n\nSend USDC to renew and reactivate → go to your dashboard Billing page.`,
        } as any);
      }
      console.log(`⛔ ${u.id} expired — downgraded to free`);

    // ── CASE 2: 1–3 days remaining — daily reminders ─────────────
    } else if (daysRemaining <= 3) {
      await db.updateDocument('users', u.id, {
        subscription_warning: true,
        days_remaining: daysRemaining,
      });

      if (u.telegram_user_id) {
        const emoji = daysRemaining === 1 ? '🔴' : '⏳';
        const urgency = daysRemaining === 1
          ? `*Last day.* Your bot pauses tomorrow if you don't renew.`
          : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining on your *${u.plan?.toUpperCase()}* plan.`;

        await sendTradeAlert(u.telegram_user_id, {
          type: 'renewal_reminder',
          message: `${emoji} *Subscription Reminder*\n\n${urgency}\n\nRenew now → dashboard → Billing.`,
        } as any);
      }
      console.log(`⏳ Reminder sent to ${u.id} — ${daysRemaining} day(s) left`);

    // ── CASE 3: More than 3 days — clear stale warning ─────────
    } else if (u.subscription_warning) {
      await db.updateDocument('users', u.id, {
        subscription_warning: false,
        days_remaining: daysRemaining,
      });
    }

    processed++;
  }

  console.log(`✅ Subscription check done — processed ${processed} users`);
}
