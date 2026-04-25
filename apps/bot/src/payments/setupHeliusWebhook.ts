import { createHelius } from 'helius-sdk';

export async function ensureHeliusWebhook() {
  const apiKey = process.env.HELIUS_API_KEY;
  const webhookUrl = process.env.HELIUS_WEBHOOK_URL;
  const walletAddress = process.env.SOLANA_WALLET_ADDRESS;

  if (!apiKey || !webhookUrl || !walletAddress) {
    console.warn(
      '⚠️  Helius webhook skipped — HELIUS_API_KEY, HELIUS_WEBHOOK_URL, or SOLANA_WALLET_ADDRESS not set'
    );
    return;
  }

  try {
    const helius = createHelius(apiKey);

    // List existing webhooks — helius-sdk v1.x uses helius.webhooks.list()
    const existingWebhooks = await helius.webhooks.list();
    const alreadyExists = existingWebhooks.some(
      (w: any) => w.webhookURL === webhookUrl
    );

    if (alreadyExists) {
      console.log('✅ Helius webhook already registered');
      return;
    }

    await helius.webhooks.create({
      accountAddresses: [walletAddress],
      webhookURL: webhookUrl,
      transactionTypes: ['TRANSFER'] as any,
      webhookType: 'enhanced' as any,
    });

    console.log(`✅ Helius webhook created → ${webhookUrl}`);
  } catch (err) {
    console.error('❌ Failed to register Helius webhook:', err);
  }
}
