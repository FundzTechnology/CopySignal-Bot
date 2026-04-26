// apps/bot/src/scripts/generateMasterSeed.ts
// Run this ONCE. Save the output to Fly.io secrets. Never run again.
import * as bip39 from 'bip39';

const mnemonic = bip39.generateMnemonic(256); // 24-word seed phrase
console.log('\n=== MASTER SEED ===');
console.log('Mnemonic (24 words):', mnemonic);
console.log('\nStore this in your environment as:');
console.log('SOLANA_MASTER_MNEMONIC="..."');
console.log('SUI_MASTER_MNEMONIC="..."');
console.log('\nNEVER commit this. NEVER share this. NEVER lose this.');
console.log('All user payment wallets are derived from this seed.');
