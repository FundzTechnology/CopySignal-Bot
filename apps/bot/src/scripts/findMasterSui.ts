import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

const SUI_MASTER_MNEMONIC = "ceiling convince panda usage stem huge trigger regular phone sniff wine area also local normal yellow sponsor illegal foam method cotton memory forest blast";
const TARGET_ADDRESS = "0x7f821d44c87a6c44689298672fea7e54800a8a4f9cba2edd6776d8233c7b819f";

const seed = bip39.mnemonicToSeedSync(SUI_MASTER_MNEMONIC);

const pathsToTry = [
  // standard sui derivation
  `m/44'/784'/0'/0'/0'`,
  `m/44'/784'/0'/0'/1'`,
  `m/44'/784'/1'/0'/0'`,
  // some wallets use solana path for sui?
  `m/44'/501'/0'/0'`,
  `m/44'/501'/0'/0'/0'`,
  // raw ed25519 paths
  `m/44'/784'/0'/0'`,
  `m/44'/784'/0'`,
];

for (let i = 0; i < 50; i++) {
  pathsToTry.push(`m/44'/784'/${i}'/0'/0'`);
  pathsToTry.push(`m/44'/784'/0'/0'/${i}'`);
  pathsToTry.push(`m/44'/784'/${i}'/0'`);
}

console.log("Searching for master wallet...");
for (const path of pathsToTry) {
  try {
    const derived = derivePath(path, seed.toString('hex'));
    const kp = Ed25519Keypair.fromSecretKey(derived.key);
    const addr = kp.getPublicKey().toSuiAddress();
    if (addr === TARGET_ADDRESS) {
      console.log(`FOUND TARGET at path: ${path}`);
      break;
    }
  } catch(e) {}
}
console.log("Search complete.");
