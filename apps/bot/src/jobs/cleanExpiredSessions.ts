import { db } from '../db/cocobase.js';
import { createHelius } from 'helius-sdk';

const helius = createHelius({ apiKey: process.env.HELIUS_API_KEY! });

// Remove address from Helius Webhook when session expires
async function removeAddressFromHeliusWebhook(address: string) {
  try {
    const webhooks = await helius.getAllWebhooks();
    const webhook = webhooks.find(
      (w: any) => w.webhookURL === process.env.HELIUS_WEBHOOK_URL
    );
    if (!webhook) return;

    const currentAddresses: string[] = webhook.accountAddresses || [];
    if (currentAddresses.includes(address)) {
      await helius.editWebhook(webhook.webhookID, {
        accountAddresses: currentAddresses.filter(a => a !== address),
        webhookURL: process.env.HELIUS_WEBHOOK_URL!,
        transactionTypes: ['TRANSFER'],
        webhookType: 'enhanced'
      });
    }
  } catch (error) {
    console.error("Error removing address from webhook:", error);
  }
}

// Run periodically to clean up
export async function cleanExpiredPaymentSessions() {
  const expiredSessions = await db.listDocuments("payment_sessions", {
    filters: { status: 'pending' }
  });

  const now = new Date();
  for (const session of expiredSessions) {
    const sessionAny = session as any;
    if (new Date(sessionAny.expires_at) < now) {
      await db.updateDocument("payment_sessions", sessionAny.id, {
        status: 'expired'
      });
      
      const targetAddress = sessionAny.solana_usdc_address || sessionAny.sui_address;
      if (targetAddress && sessionAny.chain === 'solana') {
        await removeAddressFromHeliusWebhook(targetAddress);
      }
    }
  }
}
