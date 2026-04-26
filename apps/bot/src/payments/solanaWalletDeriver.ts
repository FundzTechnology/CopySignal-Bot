import { Keypair, Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

const USDC_MINT = new PublicKey('DSgSbuu4J4tDFjo7qb98TjtNeDwMHH68CwiKZi66P3Y3');
const MASTER_MNEMONIC = process.env.SOLANA_MASTER_MNEMONIC!;
const MASTER_WALLET = process.env.SOLANA_MASTER_WALLET ? new PublicKey(process.env.SOLANA_MASTER_WALLET) : null;

// Derive a unique keypair for a given user index
// userIndex is a stable integer assigned to each user (e.g., sequential DB ID)
export function deriveSolanaKeypair(userIndex: number): Keypair {
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

// Get the USDC token account address for a derived keypair
export async function getDerivedUSDCAddress(
  userIndex: number,
  connection: Connection
): Promise<string> {
  const keypair = deriveSolanaKeypair(userIndex);

  // Get the Associated Token Account for USDC at this keypair's address
  const ata = await getAssociatedTokenAddress(
    USDC_MINT,
    keypair.publicKey
  );

  return ata.toString();
}

// Sweep USDC from a user's derived wallet to your master wallet
// Called after confirming a successful payment
export async function sweepUSDCToMaster(
  userIndex: number,
  connection: Connection
): Promise<string | null> {
  if (!MASTER_WALLET) {
    console.error("SOLANA_MASTER_WALLET not set. Cannot sweep funds.");
    return null;
  }
  const userKeypair = deriveSolanaKeypair(userIndex);
  const userATA = await getAssociatedTokenAddress(USDC_MINT, userKeypair.publicKey);
  const masterATA = await getAssociatedTokenAddress(USDC_MINT, MASTER_WALLET);

  // Check balance
  try {
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
