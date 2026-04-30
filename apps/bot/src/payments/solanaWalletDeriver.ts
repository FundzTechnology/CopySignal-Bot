import { Keypair, Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// Derive a unique keypair for a given user index
// userIndex is a stable integer assigned to each user (e.g., sequential DB ID)
export function deriveSolanaKeypair(userIndex: number): Keypair {
  const MASTER_MNEMONIC = process.env.SOLANA_MASTER_MNEMONIC;
  if (!MASTER_MNEMONIC) {
    throw new Error("SOLANA_MASTER_MNEMONIC is not defined in environment variables.");
  }
  const seed = bip39.mnemonicToSeedSync(MASTER_MNEMONIC);

  // BIP44 derivation path for Solana (coin type 501)
  // Each user gets their own account index
  const path = `m/44'/501'/${userIndex}'/0'`;
  const derived = derivePath(path, seed.toString('hex'));

  return Keypair.fromSeed(derived.key);
}

// Get the base Solana wallet address for a user.
// We give users this base address so standard wallets (like Phantom) correctly route tokens to the ATA.
export async function getDerivedSolanaWalletAddress(
  userIndex: number
): Promise<string> {
  const keypair = deriveSolanaKeypair(userIndex);
  return keypair.publicKey.toString();
}

// Sweep USDC from a user's derived wallet to your master wallet
// Called after confirming a successful payment
export async function sweepUSDCToMaster(
  userIndex: number,
  connection: Connection
): Promise<string | null> {
  const MASTER_WALLET_ENV = process.env.SOLANA_MASTER_WALLET;
  if (!MASTER_WALLET_ENV) {
    console.error("SOLANA_MASTER_WALLET not set. Cannot sweep funds.");
    return null;
  }
  const MASTER_WALLET = new PublicKey(MASTER_WALLET_ENV);
  const userKeypair = deriveSolanaKeypair(userIndex);
  const userATA = await getAssociatedTokenAddress(USDC_MINT, userKeypair.publicKey);
  const masterATA = await getAssociatedTokenAddress(USDC_MINT, MASTER_WALLET);

  // Check balance safely
  try {
    const accountInfo = await connection.getAccountInfo(userATA);
    if (!accountInfo) {
      // Account doesn't exist (uninitialized) -> 0 balance
      return null;
    }

    const balance = await connection.getTokenAccountBalance(userATA);
    const amount = balance.value.amount; // Raw amount in smallest units (6 decimals for USDC)
    if (parseInt(amount) === 0) return null;

    // Build transfer transaction
    const transaction = new Transaction().add(
      createTransferInstruction(
        userATA,        // From: user's derived USDC account
        masterATA,      // To: your master USDC account
        userKeypair.publicKey,
        parseInt(amount),
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const signature = await connection.sendTransaction(
      transaction,
      [userKeypair],
      { skipPreflight: false, preflightCommitment: 'confirmed' }
    );

    await connection.confirmTransaction(signature, 'confirmed');
    console.log(`✅ Swept ${parseInt(amount) / 1_000_000} USDC from user ${userIndex} to master`);
    return signature;
  } catch (err) {
    console.error(`Sweep failed for user ${userIndex}:`, err);
    return null;
  }
}
