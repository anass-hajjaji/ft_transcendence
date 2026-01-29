import { FastifyInstance } from "fastify";
import { db } from "../db";
import { validateQuery, GetStatsQuerySchema } from "../validation";

export default async function statsRoutes(fastify: FastifyInstance) {

  fastify.get("/", {
    preHandler: validateQuery(GetStatsQuerySchema)
  }, async (request, reply) => {
    const { username, limit, game_type } = request.query as {
      username: string;
      limit?: string;
      game_type?: string;
    };


    const queryLimit = limit === "all" ? 50 : parseInt(limit || "5", 10);

    try {
      const userPromise = new Promise((resolve, reject) => {
        db.get(
          "SELECT id_user, username, wins, losses FROM users WHERE username = ?",
          [username],
          (err, row: any) => {
            if (err) return reject(err);
            if (row) {
              resolve(row);
            } else {
              reject(new Error("User not found. Please login first."));
            }
          }
        );
      });

      const user: any = await userPromise;
      const allGamesPromise = new Promise<any[]>((resolve, reject) => {
        let query = `
          SELECT 
            g.game_id,
            g.win_score,
            g.lose_score,
            g.game_type,
            w.username as winner_name,
            l.username as loser_name
          FROM game g
          JOIN users w ON g.winner_id = w.id_user
          JOIN users l ON g.loser_id = l.id_user
          WHERE (g.winner_id = ? OR g.loser_id = ?)
        `;
        const params: any[] = [user.id_user, user.id_user];

        if (game_type) {
          query += ` AND g.game_type = ?`;
          params.push(game_type);
        }

        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      const historyPromise = new Promise<any[]>((resolve, reject) => {
        let query = `
          SELECT DISTINCT
            g.game_id,
            g.win_score,
            g.lose_score,
            g.create_date,
            g.game_type,
            w.username as winner_name,
            l.username as loser_name
          FROM game g
          JOIN users w ON g.winner_id = w.id_user
          JOIN users l ON g.loser_id = l.id_user
          WHERE (g.winner_id = ? OR g.loser_id = ?)
        `;
        const params: any[] = [user.id_user, user.id_user];

        if (game_type) {
          query += ` AND g.game_type = ?`;
          params.push(game_type);
        }

        query += ` ORDER BY g.create_date DESC LIMIT ?`;
        params.push(queryLimit + 10);

        db.all(
          query,
          params,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      const allGames = await allGamesPromise;
      const rawHistory = await historyPromise;

      const cleanHistory = rawHistory.filter((match, index, self) => {
        const duplicate = self.find((m, i) => {
          if (i === index) return false;
          const sameOpponent =
            (m.winner_name === match.winner_name &&
              m.loser_name === match.loser_name) ||
            (m.winner_name === match.loser_name &&
              m.loser_name === match.winner_name);
          const timeDiff = Math.abs(
            new Date(m.create_date).getTime() -
            new Date(match.create_date).getTime()
          );
          return sameOpponent && timeDiff < 2000;
        });

        if (duplicate) {
          if (match.winner_name === username) return true;
          if (duplicate.winner_name === username) return false;
          return match.game_id < duplicate.game_id;
        }
        return true;
      });

      const history = cleanHistory.slice(0, queryLimit);

      const actualWins = allGames.filter(
        (match) => match.winner_name === username && !(match.win_score === 0 && match.lose_score === 0)
      ).length;

      const actualLosses = allGames.filter(
        (match) => match.loser_name === username && !(match.win_score === 0 && match.lose_score === 0)
      ).length;

      const actualDraws = allGames.filter(
        (match) =>
          match.win_score === 0 &&
          match.lose_score === 0 &&
          (match.game_type === 'tic-tac-toe' || match.game_type === 'Tic-Tac-Toe' || match.game_type === 'tic-tac-toe')
      ).length;

      const total = actualWins + actualLosses + actualDraws;
      const winRate = total > 0 ? Math.round((actualWins / total) * 100) : 0;

      if (!game_type && total > 0) {
        await new Promise<void>((resolve, reject) => {
          db.run(
            "UPDATE users SET wins = ?, losses = ? WHERE id_user = ?",
            [actualWins, actualLosses, user.id_user],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      return {
        stats: {
          wins: actualWins,
          losses: actualLosses,
          total: total,
          winRate: winRate,
          draws: actualDraws
        },
        history,
      };
    } catch (err: any) {
      request.log.error(err);

      if (err.message && err.message.includes("User not found")) {
        return reply.code(404).send({ error: err.message });
      }

      return reply.code(500).send({ error: "Database error" });
    }
  });
}
