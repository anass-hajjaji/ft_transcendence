import React from "react";
import { Trophy, Users, Gamepad2, Target, Clock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface MatchData {
  id: number;
  game: string;
  opponent: string;
  time: string;
  score: string;
  win: boolean;
  result?: 'win' | 'loss' | 'draw';
}

type MatchDetailsPopupProps = {
  showPopup: boolean;
  setShowPopup: React.Dispatch<React.SetStateAction<boolean>>;
  matchData: MatchData | null;
};

const MatchDetailsPopup: React.FC<MatchDetailsPopupProps> = ({
  showPopup,
  setShowPopup,
  matchData,
}) => {
  if (!showPopup || !matchData) return null;

  // Parse score to get individual scores
  const [winScore, loseScore] = matchData.score
    .split(/[–-]/)
    .map((s) => parseInt(s.trim()));
  
  const isDraw = matchData.result === 'draw';
  const isWin = matchData.result === 'win' || (matchData.result === undefined && matchData.win);
  
  const playerScore = isDraw ? winScore : (isWin ? winScore : loseScore);
  const opponentScore = isDraw ? loseScore : (isWin ? loseScore : winScore);
  const totalScore = playerScore + opponentScore;
  const { t } = useTranslation();
  const playerPercentage =
    totalScore > 0 ? (playerScore / totalScore) * 100 : 0;
  const opponentPercentage =
    totalScore > 0 ? (opponentScore / totalScore) * 100 : 0;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => setShowPopup(false)}
    >
      <div className="bg-[#111827] w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-emerald-500/20 relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
          onClick={() => setShowPopup(false)}
        >
          <i className="fas fa-times" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">{t("Dashboard.MatchDetails")}</h2>
        </div>

        {/* Win/Loss/Draw Badge */}
        <div className="w-fit mx-auto mb-6">
          <div
            className={`px-6 py-3 rounded-xl font-semibold ${
              isDraw
                ? "bg-yellow-700/20 border border-yellow-400/30 text-yellow-400"
                : isWin
                ? "bg-emerald-700/20 border border-emerald-400/30 text-emerald-400"
                : "bg-red-700/20 border border-red-400/30 text-red-400"
            }`}
          >
            {isDraw ? "DRAW" : isWin ? "WIN" : "LOSS"}
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="p-4 bg-[#182030] rounded-xl border border-white/5">
            <p className="text-gray-400 text-sm">{t("Dashboard.GameType")}</p>
            <p className="text-white flex items-center gap-2 mt-1">
              <Gamepad2 className="w-4 h-4 text-emerald-600" />
              {matchData.game}
            </p>
          </div>

          <div className="p-4 bg-[#182030] rounded-xl border border-white/5">
            <p className="text-gray-400 text-sm">{t("Dashboard.Opponent")}</p>
            <p className="text-white flex items-center gap-2 mt-1">
              <Users className="w-4 h-4 text-emerald-600" />
              {matchData.opponent}
            </p>
          </div>

          <div className="p-4 bg-[#182030] rounded-xl border border-white/5">
            <p className="text-gray-400 text-sm">{t("Dashboard.FinalScore")}</p>
            <p
              className={`text-xl font-semibold mt-1 ${
                isDraw
                  ? "text-yellow-400"
                  : isWin
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {matchData.score}
            </p>
          </div>

         
        </div>

        {/* Performance Breakdown */}
        <div className="bg-[#182030] p-4 rounded-xl border border-white/5 mb-4">
          <p className="text-gray-300 flex items-center gap-2 font-medium mb-3">
            <Target className="w-4 h-4" />
            {t("Dashboard.PerformanceBreakdown")}
          </p>

          {/* Points Scored */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>{t("Dashboard.YourScore")}</span>
              <span
                className={`font-medium ${
                  isDraw
                    ? "text-yellow-400"
                    : isWin
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {playerScore}
              </span>
            </div>

            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isDraw
                    ? "bg-yellow-400"
                    : isWin
                    ? "bg-emerald-400"
                    : "bg-red-400"
                }`}
                style={{ width: `${playerPercentage}%` }}
              />
            </div>
          </div>

          {/* Points Conceded */}
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>{t("Dashboard.OpponentScore")}</span>
              <span
                className={`font-medium ${
                  isDraw
                    ? "text-yellow-400"
                    : isWin
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                {opponentScore}
              </span>
            </div>

            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isDraw
                    ? "bg-yellow-400"
                    : isWin
                    ? "bg-red-400"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${opponentPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-gray-500 text-sm flex items-center justify-center gap-2 mt-3">
          <Clock className="w-4 h-4" />
          {t("Dashboard.Played")} {matchData.time}
        </div>
      </div>
    </div>
  );
};

export default MatchDetailsPopup;
