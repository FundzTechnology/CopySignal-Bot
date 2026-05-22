/**
 * Wipe API Keys Script
 * 
 * Deletes ALL documents from the 'api_keys' collection in Cocobase.
 * Run with: npx tsx src/scripts/wipeApiKeys.ts
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { Cocobase } from 'cocobase';

const db = new Cocobase({
  apiKey: process.env.COCOBASE_API_KEY!,
});

async function wipeApiKeys() {
  console.log('🗑️  Fetching all API key documents...');

  try {
    const allKeys = await db.listDocuments('api_keys', {}) as any[];
    console.log(`📦 Found ${allKeys.length} API key document(s).`);

    if (allKeys.length === 0) {
      console.log('✅ No API keys to delete. Collection is already clean.');
      return;
    }

    let deleted = 0;
    let failed = 0;

    for (const doc of allKeys) {
      const docId = doc.id || doc._id;
      if (!docId) {
        console.warn('⚠️  Skipping document with no ID:', JSON.stringify(doc).slice(0, 100));
        failed++;
        continue;
      }

      try {
        await db.deleteDocument('api_keys', docId);
        deleted++;
        console.log(`  ✓ Deleted ${docId}`);
      } catch (err: any) {
        console.error(`  ✗ Failed to delete ${docId}:`, err.message);
        failed++;
      }
    }

    console.log(`\n🏁 Done. Deleted: ${deleted}, Failed: ${failed}`);
  } catch (err: any) {
    console.error('❌ Failed to fetch API keys:', err.message);
    process.exit(1);
  }
}

wipeApiKeys().then(() => process.exit(0));
