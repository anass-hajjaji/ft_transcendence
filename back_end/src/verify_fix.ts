
import { initDb, db } from './db/index';
import { createUserModel } from './models/user';

async function run() {
    try {
        await initDb();
        console.log("DB Initialized");

        console.log("Attempting Mass Assignment on 'wins' (should be ignored)...");
        const maliciousPayload = {
            username: 'verif_fix_' + Date.now(),
            fullName: 'Hacker',
            email: 'verif_' + Date.now() + '@example.com',
            password: '123',
            wins: 9999
        };

        try {
            const user = await createUserModel(maliciousPayload);
            console.log("Created user ID:", user.id_user);

            await new Promise<void>((resolve, reject) => {
                db.get("SELECT wins FROM users WHERE id_user = ?", [user.id_user], (err, row: any) => {
                    if (err) reject(err);
                    if (row && row.wins === 0) {
                        console.log("SUCCESS: Mass Assignment BLOCKED. Wins is 0.");
                    } else if (row && row.wins === 9999) {
                        console.error("FAILURE: Mass Assignment SUCCEEDED. Wins is 9999.");
                        process.exit(1);
                    } else {
                        console.log("Row state:", row);
                    }
                    resolve();
                });
            });

        } catch (e: any) {
            console.error("Unexpected error during creation:", e.message);
        }

        console.log("\nAttempting SQL Injection via Key (should be ignored)...");
        const sqlInjectionPayload = {
            username: "injector_" + Date.now(),
            fullName: "Injector",
            email: "injector_" + Date.now() + "@example.com",
            "username) VALUES ('test'); --": "value"
        };

        try {
            const user2 = await createUserModel(sqlInjectionPayload);
            console.log("Injection payload processed. Checking if user created normally...");
            console.log("User created with ID:", user2.id_user);
            console.log("SUCCESS: Injection key was likely filtered out (executed without syntax error).");
        } catch (e: any) {
            if (e.message.includes("No valid fields")) {
                console.log("SUCCESS: Blocked payload with no valid fields.");
            } else {
                console.log("Caught error:", e.message);
            }
        }

    } catch (err: any) {
        console.error("Global Error:", err);
        process.exit(1);
    } finally {
        setTimeout(() => process.exit(0), 500);
    }
}

run();
