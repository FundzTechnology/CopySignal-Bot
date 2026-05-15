import { db } from './apps/bot/src/db/cocobase.js';

async function check() {
  try {
    const channels = await db.listDocuments('channels', {});
    console.log('\n--- CHANNELS ---');
    console.log(JSON.stringify(channels, null, 2));

    const signals = await db.listDocuments('signals', {});
    console.log('\n--- SIGNALS ---');
    console.log(JSON.stringify(signals, null, 2));
    
    console.log('\nDone.');
    process.exit(0);
  } catch(e) {
    console.error(e);
  }
}

check();
