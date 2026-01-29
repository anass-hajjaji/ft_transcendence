import { dbRun, dbAll } from '../db/db-utils';
import { NewGamePayload } from '../types/game-type';
import { findPlayerByName } from './player.service';


export const createGame = async (game: NewGamePayload) => {
  try {
    const winner = await findPlayerByName(game.winnerName);
    const loser = await findPlayerByName(game.loserName);

    if (game.tournamentId) {
      console.log(`Skipping game save for tournament match: ${game.winnerName} vs ${game.loserName}`);
      return { id: -1, ...game };
    }

    if (!winner || !loser) {
      console.log(`Skipping game save for alias/guest players: ${game.winnerName} vs ${game.loserName}`);
      return { id: -1, ...game };
    }

    await dbRun("BEGIN TRANSACTION");

    const { lastID } = await dbRun(
      'INSERT INTO game (winner_id, loser_id, win_score, lose_score, game_type, tournament_id) VALUES (?, ?, ?, ?, ?, ?)',
      [
        winner.id_user,
        loser.id_user,
        game.winScore,
        game.loseScore,
        game.gameType,
        game.tournamentId
      ]
    );

    await dbRun(
      'UPDATE users SET wins = wins + 1 WHERE id_user = ?',
      [winner.id_user]
    );

    await dbRun(
      'UPDATE users SET losses = losses + 1 WHERE id_user = ?',
      [loser.id_user]
    );
    await dbRun("COMMIT");

    return { id: lastID, ...game };

  } catch (error) {
    await dbRun("ROLLBACK");
    throw error;
  }
};

export const getGamesByTournamentId = async (tournamentId: number) => {
  const sql = `
    SELECT 
      g.game_id, 
      g.win_score, 
      g.lose_score, 
      g.game_type, 
      g.create_date,
      winner.alias_name as winner_name,
      loser.alias_name as loser_name
    FROM game g
    JOIN users winner ON g.winner_id = winner.id_user
    JOIN users loser ON g.loser_id = loser.id_user
    WHERE g.tournament_id = ?
    ORDER BY g.create_date ASC
  `;
  const games = await dbAll(sql, [tournamentId]);
  return games;
};

export const getAllGames = async () => {
  const sql = `
    SELECT 
      g.game_id, g.win_score, g.lose_score, g.game_type, g.create_date,
      winner.alias_name as winner_name,
      loser.alias_name as loser_name
    FROM game g
    JOIN users winner ON g.winner_id = winner.id_user
    JOIN users loser ON g.loser_id = loser.id_user
    ORDER BY g.create_date ASC
  `;
  const games = await dbAll(sql);
  return games;
};

export const getAllPlayers = async () => {
  const sql = `
    SELECT id_user, username, alias_name, wins, losses
    FROM users
    ORDER BY wins DESC, losses ASC
  `;
  const players = await dbAll(sql);
  return players;
}

export const getGamesByUserId = async (userId: number) => {
  const sql = `
    SELECT 
      g.game_id, g.win_score, g.lose_score, g.game_type, g.create_date,
      winner.username as winner_name,
      loser.username as loser_name
    FROM game g
    JOIN users winner ON g.winner_id = winner.id_user
    JOIN users loser ON g.loser_id = loser.id_user
    WHERE g.winner_id = ? OR g.loser_id = ?
    ORDER BY g.create_date DESC
  `;
  const games = await dbAll(sql, [userId, userId]);
  return games;
};
