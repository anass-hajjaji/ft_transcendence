
import { dbAll } from './db-utils';
import { db, initDb } from './index';

async function checkDatabase() {
  try {
    await initDb();

    console.log('--- Checking "users" table (Real Accounts & Stats) ---');
    const users = await dbAll('SELECT * FROM users');
    console.table(users);

    console.log('\n--- Checking "game" table ---');
    const games = await dbAll('SELECT * FROM game');
    console.table(games);
    
    console.log('\n--- Checking "tournament" table ---');
    const tournaments = await dbAll('SELECT * FROM tournament');
    console.table(tournaments);

  } catch (err) {
    console.error('Error checking database:', err);
  } finally {
    db.close((err) => {
      if (err) console.error('Error closing db:', err.message);
    });
  }
}

checkDatabase();