import { db } from '../db/cocobase.js';

async function upgradeUser() {
  try {
    console.log("Fetching users from auth...");
    // @ts-ignore
    const res = await db.auth.listUsers(); 
    const usersList = res.users || res.data || (Array.isArray(res) ? res : []);
    const target = usersList.find((u: any) => u.email === 'emmafund1984@gmail.com');
    if (!target) {
      console.log("User not found in listUsers. Trying get by email if supported...");
      return;
    }

    console.log("Found user:", target.id);
    
    console.log("Signing in as user to authenticate session...");
    await db.auth.login({ email: 'emmafund1984@gmail.com', password: 'bellofamily' });

    await db.auth.updateUser(target.id, {
      data: {
        ...target.data,
        plan: 'pro',
        plan_expires_at: '2099-12-31T23:59:59.000Z'
      }
    });

    console.log("Successfully upgraded user to Pro for life!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

upgradeUser();
