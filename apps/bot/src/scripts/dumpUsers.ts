import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { db } from '../db/cocobase.js';

async function listUsers() {
  try {
    const res = await db.auth.listUsers();
    const usersList = (res as any).users || (res as any).data || (Array.isArray(res) ? res : []);
    for (const u of usersList) {
      console.log(`User ID: ${u.id} | Email: ${u.email} | Index: ${u.data?.user_index} | Plan: ${u.data?.plan}`);
    }
    
    console.log('\n--- PAYMENT SESSIONS ---');
    const sessions = await db.listDocuments('payment_sessions', {});
    for (const s of (sessions as any[])) {
      const data = s.data || s;
      console.log(`Session ID: ${s.id || s._id} | User ID: ${data.user_id} | Index: ${data.user_index} | Chain: ${data.chain} | Plan: ${data.plan} | Status: ${data.status} | Created: ${data.created_at}`);
    }
  } catch (err) {
    console.error(err);
  }
}

listUsers();
