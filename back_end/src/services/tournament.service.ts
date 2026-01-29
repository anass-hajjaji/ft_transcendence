import { dbRun, dbGet, dbAll } from '../db/db-utils';
import { NewTournamentPayload } from '../types/tournament-type';

export const createTournament = async (tournament: NewTournamentPayload) => {
  const playersJson = JSON.stringify(tournament.players);
  const sql = 'INSERT INTO tournament (players, winners, losers) VALUES (?, ?, ?)';
  const { lastID } = await dbRun(sql, [playersJson, '[]', '[]']);

  return {
    tournament_id: lastID,
    players: tournament.players,
  };
};

export const updateTournament = async (id: number, winnerName: string) => {
  const winnersJson = JSON.stringify([winnerName]);

  const sql = 'UPDATE tournament SET winners = ? WHERE tournament_id = ?';

  await dbRun(sql, [winnersJson, id]);

  return { tournament_id: id, winner: winnerName };
};

export const getTournamentById = async (id: number) => {
  const sql = 'SELECT * FROM tournament WHERE tournament_id = ?';
  const tournament = await dbGet(sql, [id]);

  if (tournament) {
    tournament.players = JSON.parse(tournament.players);
    tournament.winners = JSON.parse(tournament.winners);
    tournament.losers = JSON.parse(tournament.losers);
  }
  return tournament;
};

export const getTournamentPlayers = async (id: number) => {
  const tournament = await getTournamentById(id);
  if (!tournament) return null;

  return tournament.players.map((alias: string) => ({ alias, userId: null }));
};
