
import { dbRun } from './db-utils';
import { db, initDb } from './index';

async function seed() {
  try {
    await initDb();
    console.log('Database schema verified.');

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    db.close((err) => {
      if (err) console.error('Error closing db:', err.message);
    });
  }
}

seed();