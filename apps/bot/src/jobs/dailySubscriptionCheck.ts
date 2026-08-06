import { db } from '../db/cocobase.js';
import { sendTelegramMessage } from '../services/telegramService.js';

export async function runDailySubscriptionCheck() {
  console.log('🔄 Running daily subscription check...');

  const now = new Date();
  let authUsers: any[] = [];
  try {
    authUsers = await db.auth.listUsers() as unknown as any[];
  } catch (err: any) {
    console.error('Failed to list auth users:', err.message || err);
    return;
  }

  const activeUsers = authUsers.filter((u: any) => {
    const d = u.data || {};
    return ['starter', 'pro', 'trial'].includes(d.plan);
  });

  let processed = 0;

  for (const user of activeUsers) {
    const u = user.data || {};
    const userId = user.id || user._id;
    if (!u.plan_expires_at) continue;

    const expiresAt = new Date(u.plan_expires_at);
    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // ── CASE 1: Expired ─────────────────────────────────────────
    if (daysRemaining <= 0) {
      // Downgrade expired account to plan: 'free' in auth
      try {
        await (db.auth as any).updateUser(userId, {
          data: {
            ...u,
            plan: 'free',
            plan_expires_at: null,
            subscription_warning: false,
            days_remaining: 0
          }
        });
      } catch (err: any) {
        console.error(`Failed to update auth for expired user ${userId}:`, err.message);
      }

      // Pause active signal listeners by setting is_active = false on all user channels
      try {
        const userChannels = await db.listDocuments('channels', {
          filters: { user_id: userId, is_active: true }
        }) as any[];
        for (const channel of userChannels) {
          const chId = channel.id || channel._id;
          await db.updateDocument('channels', chId, { is_active: false });
          console.log(`🔇 Deactivated channel ${chId} for expired user ${userId}`);
        }
      } catch (err: any) {
        console.error(`Failed to deactivate channels for user ${userId}:`, err.message);
      }

      // Backup users collection update
      try {
        await db.updateDocument('users', userId, {
          plan: 'free',
          plan_expires_at: null,
          subscription_warning: false,
          days_remaining: 0,
        });
      } catch {}

      if (u.telegram_user_id) {
        await sendTelegramMessage(u.telegram_user_id, `⛔ *Subscription Expired*\n\nYour bot has been paused.\n\nSend USDC to renew and reactivate → go to your dashboard Billing page.`);
      }
      console.log(`⛔ ${userId} expired — downgraded to free and channels deactivated`);

    // ── CASE 2: 1–3 days remaining — daily reminders ─────────────
    } else if (daysRemaining <= 3) {
      try {
        await (db.auth as any).updateUser(userId, {
          data: {
            ...u,
            subscription_warning: true,
            days_remaining: daysRemaining,
          }
        });
      } catch {}

      try {
        await db.updateDocument('users', userId, {
          subscription_warning: true,
          days_remaining: daysRemaining,
        });
      } catch {}

      if (u.telegram_user_id) {
        const emoji = daysRemaining === 1 ? '🔴' : '⏳';
        const urgency = daysRemaining === 1
          ? `*Last day.* Your bot pauses tomorrow if you don't renew.`
          : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining on your *${u.plan?.toUpperCase()}* plan.`;

        await sendTelegramMessage(u.telegram_user_id, `${emoji} *Subscription Reminder*\n\n${urgency}\n\nRenew now → dashboard → Billing.`);
      }
      console.log(`⏳ Reminder sent to ${userId} — ${daysRemaining} day(s) left`);

    // ── CASE 3: More than 3 days — clear stale warning ─────────
    } else if (u.subscription_warning) {
      try {
        await (db.auth as any).updateUser(userId, {
          data: {
            ...u,
            subscription_warning: false,
            days_remaining: daysRemaining,
          }
        });
      } catch {}

      try {
        await db.updateDocument('users', userId, {
          subscription_warning: false,
          days_remaining: daysRemaining,
        });
      } catch {}
    }

    processed++;
  }

  console.log(`✅ Subscription check done — processed ${processed} users`);
}
