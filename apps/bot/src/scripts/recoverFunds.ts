import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createRecoverNestedInstruction,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { deriveSolanaKeypair } from '../payments/solanaWalletDeriver.js';

const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
);

const REAL_USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const FAKE_USDC_MINT = new PublicKey('DSgSbuu4J4tDFjo7qb98TjtNeDwMHH68CwiKZi66P3Y3');

async function recover() {
  console.log("🔍 Starting manual nested fund recovery script...");
  
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("❌ Please provide a user_index as the first argument.");
    process.exit(1);
  }
  const userIndex = parseInt(args[0], 10);

  const MASTER_WALLET_ENV = process.env.SOLANA_MASTER_WALLET;
  if (!MASTER_WALLET_ENV) {
    console.error("❌ SOLANA_MASTER_WALLET not set.");
    process.exit(1);
  }
  const masterWallet = new PublicKey(MASTER_WALLET_ENV);
  const masterUSDC_ATA = await getAssociatedTokenAddress(REAL_USDC_MINT, masterWallet);

  // 1. Get the user's base wallet (owner)
  const userKeypair = deriveSolanaKeypair(userIndex);
  const baseWallet = userKeypair.publicKey;

  // 2. Derive the fake ATA (this is what the user was previously given and sent USDC to)
  const fakeATA = await getAssociatedTokenAddress(FAKE_USDC_MINT, baseWallet);

  // 3. The nested ATA is the REAL USDC ATA owned by the fake ATA
  const nestedATA = await getAssociatedTokenAddress(REAL_USDC_MINT, fakeATA, true);

  // 4. The destination is the user's REAL USDC ATA
  const userRealATA = await getAssociatedTokenAddress(REAL_USDC_MINT, baseWallet);

  console.log(`Base Wallet: ${baseWallet.toString()}`);
  console.log(`Fake ATA (Sent Address): ${fakeATA.toString()}`);
  console.log(`Nested ATA (Trapped Funds): ${nestedATA.toString()}`);
  console.log(`User Real ATA: ${userRealATA.toString()}`);

  try {
    const nestedInfo = await connection.getAccountInfo(nestedATA);
    if (!nestedInfo) {
      console.log(`⚠️ Nested ATA is empty or does not exist. Nothing to rescue.`);
      process.exit(0);
    }
    const balance = await connection.getTokenAccountBalance(nestedATA);
    const amount = balance.value.amount;
    
    if (parseInt(amount) === 0) {
      console.log(`⚠️ Nested ATA exists but has 0 balance.`);
      process.exit(0);
    }

    console.log(`🤑 Found ${parseInt(amount) / 1_000_000} USDC trapped! Executing Rescue...`);

    // Check SOL balance for gas fees
    const solBalance = await connection.getBalance(baseWallet);
    const MIN_SOL_REQUIRED = 0.002 * 1_000_000_000; // 0.002 SOL in lamports
    if (solBalance < MIN_SOL_REQUIRED) {
      console.error(`\n❌ INSUFFICIENT SOL FOR GAS FEES!`);
      console.error(`The base wallet (${baseWallet.toString()}) needs native SOL to pay for the recovery transaction.`);
      console.error(`Please send at least 0.002 SOL to: ${baseWallet.toString()}`);
      console.error(`After sending SOL, run this script again.\n`);
      process.exit(1);
    }

    const tx = new Transaction();

    // Check if user's real ATA exists, if not, create it
    const realATAInfo = await connection.getAccountInfo(userRealATA);
    if (!realATAInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          baseWallet, // payer
          userRealATA, // ata
          baseWallet, // owner
          REAL_USDC_MINT // mint
        )
      );
    }

    // Add RecoverNested Instruction
    tx.add(
      createRecoverNestedInstruction(
        nestedATA, // nestedAssociatedToken
        REAL_USDC_MINT, // nestedMint
        userRealATA, // destinationAssociatedToken
        fakeATA, // ownerAssociatedToken
        FAKE_USDC_MINT, // ownerMint
        baseWallet // owner (Signer)
      )
    );

    // Now that funds are in userRealATA, sweep them to Master Wallet
    tx.add(
      createTransferInstruction(
        userRealATA, // from
        masterUSDC_ATA, // to
        baseWallet, // owner
        parseInt(amount), // amount
        [],
        TOKEN_PROGRAM_ID
      )
    );

    console.log("Sending transaction...");
    const signature = await connection.sendTransaction(
      tx,
      [userKeypair], // userKeypair pays fees and signs
      { skipPreflight: false, preflightCommitment: 'confirmed' }
    );
    await connection.confirmTransaction(signature, 'confirmed');

    console.log(`✅ Rescue Successful! Signature: ${signature}`);

  } catch (error) {
    console.error(`❌ Error during rescue:`, error);
  }
}

recover();
