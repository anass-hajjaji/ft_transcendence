import { MatchHistory } from "../types";

export function MatchRow({ match, currentUser }: { match: MatchHistory; currentUser: string }) {
  const isDraw = match.win_score === 0 && match.lose_score === 0;
  const isWinner = !isDraw && match.winner_name === currentUser;

  const opponentName = isDraw
    ? match.winner_name === currentUser
      ? match.loser_name
      : match.winner_name
    : isWinner
      ? match.loser_name
      : match.winner_name;

  console.log(
    `Match ID ${match.game_id}: isDraw=${isDraw}, currentUser=${currentUser}, opponent=${opponentName}`
  );

  return (
    <div className="flex items-center justify-between bg-[#0f1220] p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`w-1.5 h-10 rounded-full ${
            isDraw ? "bg-gray-500" : isWinner ? "bg-emerald-500" : "bg-red-500"
          }`}
        ></div>
        <div>
          <p className="font-semibold text-sm text-slate-200">
            vs {opponentName || "Opponent"}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(match.create_date + 'Z').toLocaleDateString()} •{" "}
            {new Date(match.create_date + 'Z').toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-bold ${
            isDraw ? "text-gray-400" : isWinner ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isDraw ? "DRAW" : isWinner ? "VICTORY" : "DEFEAT"}
        </p>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{match.game_type}</p>
      </div>
    </div>
  );
}
