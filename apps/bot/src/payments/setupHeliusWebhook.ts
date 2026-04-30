
interface HeliusWebhook {
  webhookID: string;
  webhookURL: string;
  accountAddresses: string[];
  transactionTypes: string[];
  webhookType: string;
}

const HELIUS_API_BASE = 'https://api.helius.xyz/v0/webhooks';

async function fetchWebhooks(apiKey: string): Promise<HeliusWebhook[]> {
  const res = await fetch(`${HELIUS_API_BASE}?api-key=${apiKey}`);
  if (!res.ok) throw new Error(`Helius API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<HeliusWebhook[]>;
}

export async function ensureHeliusWebhook() {
  const apiKey = process.env.HELIUS_API_KEY;
  const webhookUrl = process.env.HELIUS_WEBHOOK_URL;
  const walletAddress = process.env.SOLANA_MASTER_WALLET;

  if (!apiKey || !webhookUrl || !walletAddress) {
    console.warn(
      '⚠️  Helius webhook skipped — HELIUS_API_KEY, HELIUS_WEBHOOK_URL, or SOLANA_MASTER_WALLET not set'
    );
    return;
  }

  try {
    const existingWebhooks = await fetchWebhooks(apiKey);
    const alreadyExists = existingWebhooks.some((w) => w.webhookURL === webhookUrl);

    if (alreadyExists) {
      console.log('✅ Helius webhook already registered');
      return;
    }

    // Create new webhook
    const createRes = await fetch(`${HELIUS_API_BASE}?api-key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountAddresses: [walletAddress],
        webhookURL: webhookUrl,
        transactionTypes: ['TRANSFER'],
        webhookType: 'enhanced',
      }),
    });

    if (!createRes.ok) throw new Error(`Helius create error: ${createRes.status} ${createRes.statusText}`);

    console.log(`✅ Helius webhook created → ${webhookUrl}`);
  } catch (err: any) {
    const cause = err?.cause;
    const code = cause?.code ?? err?.code ?? '';
    if (code === 'EAI_AGAIN' || code === 'ENOTFOUND') {
      console.warn('⚠️  Helius webhook skipped — DNS unavailable (local network issue). This is fine; it will register automatically on Fly.io.');
    } else {
      console.error('❌ Failed to register Helius webhook:', err?.message ?? err, cause ? `| cause: ${cause?.message}` : '');
    }
  }
}

export async function addAddressToHeliusWebhook(address: string) {
  const apiKey = process.env.HELIUS_API_KEY;
  const webhookUrl = process.env.HELIUS_WEBHOOK_URL;
  if (!apiKey || !webhookUrl) return;

  try {
    const webhooks = await fetchWebhooks(apiKey);
    const webhook = webhooks.find((w) => w.webhookURL === webhookUrl);
    if (!webhook) return;

    const currentAddresses = webhook.accountAddresses ?? [];
    if (currentAddresses.includes(address)) return;

    await fetch(`${HELIUS_API_BASE}/${webhook.webhookID}?api-key=${apiKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookURL: webhookUrl,
        transactionTypes: ['TRANSFER'],
        accountAddresses: [...currentAddresses, address],
        webhookType: 'enhanced',
      }),
    });
  } catch (err: any) {
    if (err?.cause?.code === 'EAI_AGAIN' || err?.code === 'EAI_AGAIN') {
      console.warn('⚠️  Could not add address to Helius webhook — DNS not available.');
    } else {
      console.error('Error adding address to Helius webhook:', err?.message ?? err);
    }
  }
}
