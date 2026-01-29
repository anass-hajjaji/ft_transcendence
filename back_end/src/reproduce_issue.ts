
import { initDb, db } from './db/index';
import { createUserModel } from './models/user';

async function run() {
  try {
    await initDb();
    console.log("DB Initialized");

    console.log("Attempting Mass Assignment on 'wins'...");
    const maliciousPayload = {
      username: 'hacker_mass_assign_' + Date.now(),
      fullName: 'Hacker',
      email: 'hacker' + Date.now() + '@example.com',
      password: '123',
      wins: 9999
    };

    try {
        const user = await createUserModel(maliciousPayload);
        console.log("Created user:", user);
        
        await new Promise<void>((resolve, reject) => {
            db.get("SELECT wins FROM users WHERE id_user = ?", [user.id_user], (err, row: any) => {
                if (err) reject(err);
                if (row && row.wins === 9999) {
                    console.log("SUCCESS: Mass Assignment Vulnerability confirmed! Wins set to 9999.");
                } else {
                    console.log("FAILED: Mass Assignment did not work (or wins was sanitized). Row:", row);
                }
                resolve();
            });
        });

    } catch (e: any) {
        console.error("Mass assign error:", e.message);
    }

    // 2. Test SQL Injection via key
    console.log("\nAttempting SQL Injection via Key...");

    const sqlInjectionPayload = {
      "username) --": "value" // This should break the query
    };
    
    try {
        await createUserModel(sqlInjectionPayload);
    } catch (e: any) {
        console.log("Captured expected SQL error:", e.message);
        if (e.message.includes("syntax") || e.message.includes("near")) {
             console.log("SUCCESS: SQL Injection confirmed via syntax error!");
        }
    }

  } catch (err: any) {
    console.error("Global Error:", err);
  } finally {
      process.exit(0);
  }
}

run();
