import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
);

// Derivation path for index 1 (which all users currently share)
const userIndex = 1;
const pathDerivation = `m/44'/501'/${userIndex}'/0'`;
const targetAddress = 'AAz75J7ZzmGHwTnwsmvmBUr77MqgR97pCkfavXVgfJkK';

async function recoverMistakenSol() {
  console.log("🔍 Checking balance for derived index 1...");
  
  const mnemonic = process.env.SOLANA_MASTER_MNEMONIC;
  if (!mnemonic) {
    console.error("❌ SOLANA_MASTER_MNEMONIC is not defined in environment variables.");
    process.exit(1);
  }
  
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const derived = derivePath(pathDerivation, seed.toString('hex'));
  const keypair = Keypair.fromSeed(derived.key);
  
  const senderPubKey = keypair.publicKey;
  console.log(`Derived Solana Address: ${senderPubKey.toBase58()}`);
  
  const balance = await connection.getBalance(senderPubKey);
  console.log(`Balance: ${balance / 1_000_000_000} SOL (${balance} lamports)`);
  
  if (balance === 0) {
    console.log("❌ No SOL balance found on this address. Balance is 0.");
    process.exit(0);
  }
  
  console.log(`Initiating sweep to user's address: ${targetAddress}`);
  
  // Create transfer transaction
  const tx = new Transaction();
  
  // We need to fetch the blockhash and calculate the exact transaction fee to withdraw the maximum amount.
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = senderPubKey;
  
  // Add a transfer instruction for the full balance (temporarily set to 0, we'll calculate fee)
  const { SystemProgram } = await import('@solana/web3.js');
  
  // Estimate transaction fee (usually 5000 lamports for single signature transfer)
  const estimatedFee = 5000;
  const sweepAmount = balance - estimatedFee;
  
  if (sweepAmount <= 0) {
    console.log("❌ Balance is too low to cover transaction fees.");
    process.exit(1);
  }
  
  tx.add(
    SystemProgram.transfer({
      fromPubkey: senderPubKey,
      toPubkey: new PublicKey(targetAddress),
      lamports: sweepAmount,
    })
  );
  
  console.log(`Sending transaction of ${sweepAmount / 1_000_000_000} SOL...`);
  try {
    const signature = await sendAndConfirmTransaction(connection, tx, [keypair]);
    console.log(`✅ Success! Tx Signature: ${signature}`);
  } catch (err) {
    console.error("❌ Failed to sweep SOL:", err);
  }
}

recoverMistakenSol();
