
import { db } from '../db';

export const saveGameResult = (winnerId: number, loserId: number, winScore: number, loseScore: number) => {
  const stmt = db.prepare(`
    INSERT INTO game (winner_id, loser_id, win_score, lose_score, game_type, create_date)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);
  stmt.run(winnerId, loserId, winScore, loseScore, 'ping-pong', (err: Error | null) => {
    if (err) console.error("DB Save Error:", err);
    else console.log("Game saved to database");
  });
  stmt.finalize();


  db.run('UPDATE users SET wins = wins + 1 WHERE id_user = ?', [winnerId]);
  db.run('UPDATE users SET losses = losses + 1 WHERE id_user = ?', [loserId]);
};

export const fetchUsername = async (userId: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT username FROM users WHERE id_user = ?', [userId], (err, row: { username: string } | undefined) => {
      if (err) reject(err);
      else resolve(row?.username || `Player ${userId}`);
    });
  });
};
