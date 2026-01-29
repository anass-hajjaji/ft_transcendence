
const sqlite3 = require('sqlite3');
import path from 'path';
import { open } from 'sqlite';


const dbPath = process.env.DATABASE_URL || path.resolve(process.cwd(), 'database.db');

const verboseSqlite = sqlite3.verbose();
export const db = new verboseSqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database at:', dbPath);
});

const schema = `

CREATE TABLE IF NOT EXISTS users (
  id_user INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  fullName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  alias_name TEXT UNIQUE,
  avatar TEXT,
  status TEXT DEFAULT 'offline',
  language TEXT DEFAULT 'en',
  twofa_enabled INTEGER NOT NULL DEFAULT 0 CHECK (twofa_enabled IN (0, 1)),
  twofa_secret TEXT ,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now', 'localtime')),
  date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tournament (
  tournament_id INTEGER PRIMARY KEY,
  players TEXT,
  winners TEXT,
  losers TEXT,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game (
  game_id INTEGER PRIMARY KEY,
  winner_id INTEGER,
  loser_id INTEGER,
  win_score INTEGER NOT NULL,
  lose_score INTEGER NOT NULL,
  game_type TEXT NOT NULL,
  tournament_id INTEGER,
  create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (winner_id) REFERENCES users(id_user),
  FOREIGN KEY (loser_id) REFERENCES users(id_user),
  FOREIGN KEY (tournament_id) REFERENCES tournament(tournament_id)
);

CREATE TABLE IF NOT EXISTS friends (
  id_friendship INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id_user),
  FOREIGN KEY (friend_id) REFERENCES users(id_user)
);

-- CHAT (The Conversation Link)
CREATE TABLE IF NOT EXISTS chat (
  conv_id INTEGER PRIMARY KEY,
  user1 INTEGER NOT NULL, 
  user2 INTEGER NOT NULL,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1) REFERENCES users(id_user),
  FOREIGN KEY (user2) REFERENCES users(id_user),
  UNIQUE(user1, user2) -- CONSTRAINT: anass & younes can only have 1 chat
);

--MESSAGE (The Content)
CREATE TABLE IF NOT EXISTS message (
  message_id INTEGER PRIMARY KEY,
  conv_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text', -- 'text', 'game_invite', 'system'
  is_seen BOOLEAN DEFAULT 0,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conv_id) REFERENCES chat(conv_id),
  FOREIGN KEY (sender_id) REFERENCES users(id_user)
);

-- BLOCKED USERS (For the "Block" requirement)
CREATE TABLE IF NOT EXISTS blocked_users (
  block_id INTEGER PRIMARY KEY,
  blocker_id INTEGER NOT NULL,
  blocked_id INTEGER NOT NULL,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blocker_id) REFERENCES users(id_user),
  FOREIGN KEY (blocked_id) REFERENCES users(id_user),
  UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS notification (
  notify_id INTEGER PRIMARY KEY,
  getter_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  notify_content TEXT,
  is_seen BOOLEAN DEFAULT 0,
  is_tournament_notify BOOLEAN DEFAULT 0,
  is_accepted BOOLEAN DEFAULT 0,
  create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (getter_id) REFERENCES users(id_user),
  FOREIGN KEY (sender_id) REFERENCES users(id_user)
);
`;

export function initDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.exec(schema, (err) => {
        if (err) {
          console.error('Error creating schema:', err.message);
          reject(err);
        } else {
          console.log('Database schema verified.');
          resolve();
        }
      });
    });
  });
}

export async function connectDB() {
	return open({
	  filename: process.env.DATABASE_URL || dbPath,
	  driver: sqlite3.Database
	});
  }
export default db;