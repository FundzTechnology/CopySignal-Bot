import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const SUI_USDC_TYPE = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';
const SUI_USDC_TYPE_LEGACY = '0x7f821d44c87a6c44689298672fea7e54800a8a4f9cba2edd6776d8233c7b819f::usdc::USDC';

const MASTER_MNEMONIC = process.env.SUI_MASTER_MNEMONIC!;
const MASTER_SUI_ADDRESS = process.env.SUI_MASTER_WALLET!;

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

export function deriveSuiKeypair(userIndex: number): Ed25519Keypair {
  const seed = bip39.mnemonicToSeedSync(MASTER_MNEMONIC);
  const derived = derivePath(`m/44'/784'/${userIndex}'/0'/0'`, seed.toString('hex'));
  return Ed25519Keypair.fromSecretKey(derived.key);
}

export function getMasterKeypair(): Ed25519Keypair {
  const seed = bip39.mnemonicToSeedSync(MASTER_MNEMONIC);
  const derived = derivePath(`m/44'/784'/0'/0'/0'`, seed.toString('hex'));
  return Ed25519Keypair.fromSecretKey(derived.key);
}

async function run() {
  console.log("Master wallet from env:", MASTER_SUI_ADDRESS);
  const masterKp = getMasterKeypair();
  console.log("Master derived address:", masterKp.getPublicKey().toSuiAddress());
  
  if (masterKp.getPublicKey().toSuiAddress() !== MASTER_SUI_ADDRESS) {
    console.log("WARNING: Master derived address does not match SUI_MASTER_WALLET in .env!");
  }

  let targetIndex = -1;
  let targetKeypair: Ed25519Keypair | null = null;
  for (let i = 0; i < 1000; i++) {
    const kp = deriveSuiKeypair(i);
    if (kp.getPublicKey().toSuiAddress() === '0xd572bba19f45c5b65e35cf95635991706627a1163d946b8e302f91e3401c83c3') {
      targetIndex = i;
      targetKeypair = kp;
      break;
    }
  }

  if (!targetKeypair) {
    console.log("Could not find matching keypair in first 1000 indices.");
    return;
  }
  
  console.log(`Found matching keypair at index ${targetIndex}: ${targetKeypair.getPublicKey().toSuiAddress()}`);

  const coins = await client.getCoins({
    owner: targetKeypair.getPublicKey().toSuiAddress(),
    coinType: SUI_USDC_TYPE
  });

  const legacyCoins = await client.getCoins({
    owner: targetKeypair.getPublicKey().toSuiAddress(),
    coinType: SUI_USDC_TYPE_LEGACY
  });

  const allCoins = [...coins.data, ...legacyCoins.data];

  console.log("USDC Coins:", allCoins);
  
  if (allCoins.length === 0) {
    console.log("No USDC found.");
    return;
  }

  try {
    const tx = new TransactionBlock();
    const totalCoinIds = allCoins.map(c => c.coinObjectId);
    if (totalCoinIds.length > 1) {
      tx.mergeCoins(tx.object(totalCoinIds[0]), totalCoinIds.slice(1).map(id => tx.object(id)));
    }
    tx.transferObjects([tx.object(totalCoinIds[0])], tx.pure(MASTER_SUI_ADDRESS));
    
    // Attempt gas sponsorship
    tx.setSender(targetKeypair.getPublicKey().toSuiAddress());
    tx.setGasOwner(masterKp.getPublicKey().toSuiAddress());

    const txBytes = await tx.build({ client });
    
    // Sign with both
    const userSig = await targetKeypair.signTransactionBlock(txBytes);
    const masterSig = await masterKp.signTransactionBlock(txBytes);

    const result = await client.executeTransactionBlock({
      transactionBlock: txBytes,
      signature: [userSig.signature, masterSig.signature],
      options: { showEffects: true }
    });

    console.log("Sweep successful! Digest:", result.digest);
  } catch (e) {
    console.error("Sponsored sweep failed. Falling back to funding logic...", e);
    // Fallback: Send 0.005 SUI from master to user
    try {
      const fundTx = new TransactionBlock();
      const [coin] = fundTx.splitCoins(fundTx.gas, [fundTx.pure(5_000_000)]);
      fundTx.transferObjects([coin], fundTx.pure(targetKeypair.getPublicKey().toSuiAddress()));
      
      const fundResult = await client.signAndExecuteTransactionBlock({
        signer: masterKp,
        transactionBlock: fundTx,
        options: { showEffects: true }
      });
      console.log("Funded 0.005 SUI to user wallet! Digest:", fundResult.digest);

      // Now sleep for a bit to allow network to sync
      await new Promise(r => setTimeout(r, 3000));

      const sweepTx = new TransactionBlock();
      const totalCoinIds2 = allCoins.map(c => c.coinObjectId);
      if (totalCoinIds2.length > 1) {
        sweepTx.mergeCoins(sweepTx.object(totalCoinIds2[0]), totalCoinIds2.slice(1).map(id => sweepTx.object(id)));
      }
      sweepTx.transferObjects([sweepTx.object(totalCoinIds2[0])], sweepTx.pure(MASTER_SUI_ADDRESS));
      
      const sweepResult = await client.signAndExecuteTransactionBlock({
        signer: targetKeypair,
        transactionBlock: sweepTx,
        options: { showEffects: true }
      });
      console.log("Sweep successful after funding! Digest:", sweepResult.digest);
    } catch (fallbackError) {
      console.error("Fallback sweep also failed:", fallbackError);
    }
  }
}

run();
