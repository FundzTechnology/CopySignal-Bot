import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { db } from '../db/cocobase.js';

const SUI_USDC_TYPE = '0x7f821d44c87a6c44689298672fea7e54800a8a4f9cba2edd6776d8233c7b819f::usdc::USDC';
const MASTER_MNEMONIC = process.env.SUI_MASTER_MNEMONIC!;
const MASTER_SUI_ADDRESS = process.env.SUI_MASTER_WALLET!;

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

// Derive unique SUI keypair per user
export function deriveSuiKeypair(userIndex: number): Ed25519Keypair {
  if (!MASTER_MNEMONIC) {
    throw new Error("SUI_MASTER_MNEMONIC is not defined in environment variables.");
  }
  const seed = bip39.mnemonicToSeedSync(MASTER_MNEMONIC);

  // SUI uses coin type 784 in BIP44
  const path = `m/44'/784'/${userIndex}'/0'/0'`;
  const derived = derivePath(path, seed.toString('hex'));

  return Ed25519Keypair.fromSecretKey(derived.key);
}

export function getDerivedSuiAddress(userIndex: number): string {
  const keypair = deriveSuiKeypair(userIndex);
  return keypair.getPublicKey().toSuiAddress();
}

// Create a payment session for SUI USDC
export async function createSuiPaymentSession(
  userId: string,
  userIndex: number,
  plan: 'starter' | 'pro'
): Promise<{ address: string; expiresAt: string; sessionId: string }> {

  const suiAddress = getDerivedSuiAddress(userIndex);
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  const session = await db.createDocument("payment_sessions", {
    user_id: userId,
    user_index: userIndex,
    plan,
    sui_address: suiAddress,
    amount_expected: plan === 'starter' ? 29 : 79,
    status: 'pending',
    chain: 'sui',
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString()
  });

  return { address: suiAddress, expiresAt: expiresAt.toISOString(), sessionId: session.id };
}

// Sweep USDC from derived SUI address to master
export async function sweepSuiUSDCToMaster(userIndex: number): Promise<string | null> {
  if (!MASTER_SUI_ADDRESS) {
    console.error("SUI_MASTER_WALLET not set. Cannot sweep funds.");
    return null;
  }
  const keypair = deriveSuiKeypair(userIndex);
  const userAddress = keypair.getPublicKey().toSuiAddress();

  try {
    // Get all USDC coins owned by this derived address
    const coins = await client.getCoins({
      owner: userAddress,
      coinType: SUI_USDC_TYPE
    });

    if (!coins.data.length) return null;

    const tx = new TransactionBlock();
    const totalCoinIds = coins.data.map((c: any) => c.coinObjectId);

    // Merge all USDC coins if multiple, then transfer
    if (totalCoinIds.length > 1) {
      tx.mergeCoins(tx.object(totalCoinIds[0]), totalCoinIds.slice(1).map((id: string) => tx.object(id)));
    }

    tx.transferObjects([tx.object(totalCoinIds[0])], tx.pure(MASTER_SUI_ADDRESS));

    const result = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
    });

    console.log(`✅ Swept SUI USDC from user ${userIndex} to master. Digest: ${result.digest}`);
    return result.digest;
  } catch (err) {
    console.error(`SUI sweep failed for user ${userIndex}:`, err);
    return null;
  }
}
