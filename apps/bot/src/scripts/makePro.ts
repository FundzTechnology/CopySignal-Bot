import * as dotenv from 'dotenv';
dotenv.config();

import { db } from '../db/cocobase.js';

async function upgradeUser() {
  try {
    console.log("Fetching users from auth...");
    // @ts-ignore
    const res = await db.auth.listUsers(); 
    const usersList = (res as any).users || (res as any).data || (Array.isArray(res) ? res : []);
    const target = usersList.find((u: any) => u.email === 'emmafund1984@gmail.com');
    if (!target) {
      console.log("User not found in listUsers.");
      return;
    }

    console.log("Found user:", target.id, "| Current plan:", target.data?.plan, "| Expires:", target.data?.plan_expires_at);
    
    const PRO_EXPIRY = '2032-12-31T23:59:59.000Z';

    console.log("Signing in as user to authenticate session for auth update...");
    await db.auth.login({ email: 'emmafund1984@gmail.com', password: 'bellofamily' });

    // Update via auth.updateUser (primary method — this is what the dashboard reads)
    await (db.auth as any).updateUser(target.id, {
      data: {
        ...target.data,
        plan: 'pro',
        plan_expires_at: PRO_EXPIRY,
        trial_used: true,
        subscription_warning: false,
      }
    });
    console.log("✅ Auth user data updated — plan: pro, expires:", PRO_EXPIRY);

    // Also update the custom users collection as backup
    try {
      const usersCol = await db.listDocuments('users', {}) as any[];
      const userDoc = usersCol.find((d: any) => {
        const dd = d.data || d;
        return (dd.user_id || d.user_id) === target.id;
      });
      if (userDoc) {
        const docId = userDoc.id || userDoc._id;
        await db.updateDocument('users', docId, {
          plan: 'pro',
          plan_expires_at: PRO_EXPIRY,
          trial_used: true,
          subscription_warning: false,
        });
        console.log("✅ Custom users collection doc also updated.");
      } else {
        // Create a new users doc
        await db.createDocument('users', {
          user_id: target.id,
          plan: 'pro',
          plan_expires_at: PRO_EXPIRY,
          trial_used: true,
          subscription_warning: false,
        });
        console.log("✅ Created new users collection doc.");
      }
    } catch (colErr: any) {
      console.warn("Could not update custom users collection:", colErr.message);
    }

    console.log("🎉 Successfully upgraded emmafund1984@gmail.com to Pro until 2032-12-31!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

upgradeUser();
