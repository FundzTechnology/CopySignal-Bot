import { NextResponse } from 'next/server';
import { db } from '@/lib/cocobase';

// ─── Lazy imports for HD wallet derivation ────────────────────────────────────
// We derive addresses directly here so this API works on Vercel (serverless)
// without needing a running bot engine at localhost:3001.

async function deriveSolanaAddress(userIndex: number): Promise<string> {
  const bip39 = await import('bip39');
  const { derivePath } = await import('ed25519-hd-key');
  const { Keypair } = await import('@solana/web3.js');

  const mnemonic = process.env.SOLANA_MASTER_MNEMONIC;
  if (!mnemonic) throw new Error('SOLANA_MASTER_MNEMONIC env var is not set.');

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const path = `m/44'/501'/${userIndex}'/0'`;
  const derived = derivePath(path, seed.toString('hex'));
  const keypair = Keypair.fromSeed(derived.key);
  return keypair.publicKey.toString();
}

async function deriveSuiAddress(userIndex: number): Promise<string> {
  const bip39 = await import('bip39');
  const { derivePath } = await import('ed25519-hd-key');
  const { Ed25519Keypair } = await import('@mysten/sui.js/keypairs/ed25519');

  const mnemonic = process.env.SUI_MASTER_MNEMONIC;
  if (!mnemonic) throw new Error('SUI_MASTER_MNEMONIC env var is not set.');

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const path = `m/44'/784'/${userIndex}'/0'/0'`;
  const derived = derivePath(path, seed.toString('hex'));
  const keypair = Ed25519Keypair.fromSecretKey(derived.key);
  return keypair.getPublicKey().toSuiAddress();
}

export async function POST(req: Request) {
  try {
    const { userId, userIndex, chain, plan } = await req.json();

    if (!userId || !chain || !plan) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (userIndex === undefined || userIndex === null) {
      return NextResponse.json({ error: 'User missing HD wallet index. Please contact support.' }, { status: 400 });
    }

    // ── Derive wallet address based on chain ─────────────────────────────────
    let address: string;
    try {
      if (chain === 'solana') {
        address = await deriveSolanaAddress(userIndex);
      } else if (chain === 'sui') {
        address = await deriveSuiAddress(userIndex);
      } else {
        return NextResponse.json({ error: 'Invalid chain. Use "solana" or "sui".' }, { status: 400 });
      }
    } catch (derivErr: any) {
      console.error('Wallet derivation failed:', derivErr.message);
      // Provide a more actionable error message in production
      const msg = derivErr.message.includes('env var')
        ? 'Payment service is not configured yet. Please contact support.'
        : 'Failed to generate wallet. Please try again.';
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // ── Create a 2-hour payment session record in Cocobase ───────────────────
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const amountExpected = plan === 'starter' ? 10 : 25;

    try {
      await db.createDocument('payment_sessions', {
        user_id: userId,
        user_index: userIndex,
        plan,
        chain,
        [`${chain}_address`]: address,
        amount_expected: amountExpected,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
      });
    } catch (sessionErr: any) {
      // Non-fatal: the address is still valid even if session save fails
      console.warn('Could not save payment session to DB:', sessionErr.message);
    }

    return NextResponse.json({ address, expiresAt, chain, plan });

  } catch (error: any) {
    console.error('Session generation failed:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
