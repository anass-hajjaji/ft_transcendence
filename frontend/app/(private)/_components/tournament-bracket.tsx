"use client";

import React, { useMemo } from "react";
import { Trophy, Play, Home } from "lucide-react";

interface TournamentBracketProps {
    players: string[];
    matches: [string, string][];
    winners: string[];
    onStartTournament?: () => void;
    tournamentWinner?: string | null;
}

interface MatchNodeData {
    roundName: string;
    roundIndex: number;
    matchIndex: number;
    p1: string;
    p2: string;
    winner?: string | null;
}

export default function TournamentBracket({
    players,
    matches,
    winners,
    onStartTournament,
    tournamentWinner,
}: TournamentBracketProps) {
    const rounds = useMemo(() => {
        const totalSlots = Math.pow(2, Math.ceil(Math.log2(players.length)));
        const r: MatchNodeData[][] = [];

        let globalMatchIndex = 0;

        const round1: MatchNodeData[] = [];
        const round1Count = totalSlots / 2;

        for (let i = 0; i < round1Count; i++) {
            const p1 = players[i * 2] || "Bye";
            const p2 = players[i * 2 + 1] || "Bye";
            let winner = (p2 === "Bye") ? p1 : null;


            round1.push({
                roundName: "Round 1",
                roundIndex: 0,
                matchIndex: i,
                p1,
                p2,
                winner 
            });
            globalMatchIndex++;
        }
        r.push(round1);

        let currentRound = round1;
        let roundNum = 2;
        while (currentRound.length > 1) {
            const nextRound: MatchNodeData[] = [];
            const nextRoundCount = currentRound.length / 2;

            for (let i = 0; i < nextRoundCount; i++) {

                let p1 = "TBD";
                let p2 = "TBD";

                if (globalMatchIndex < matches.length) {
                    const m = matches[globalMatchIndex];
                    p1 = m[0];
                    p2 = m[1];
                }

                nextRound.push({
                    roundName: currentRound.length === 2 ? "Finals" : `Round ${roundNum}`,
                    roundIndex: roundNum - 1,
                    matchIndex: i,
                    p1,
                    p2,
                    winner: null
                });
                globalMatchIndex++;
            }
            r.push(nextRound);
            currentRound = nextRound;
            roundNum++;
        }

        for (let rd = 0; rd < r.length; rd++) {
            for (let m = 0; m < r[rd].length; m++) {
                const match = r[rd][m];

                if (match.p2 === "Bye") {
                    match.winner = match.p1;
                    continue;
                }

                if (match.p1 === "TBD" || match.p2 === "TBD") continue;
                if (rd < r.length - 1) {
                    const nextRoundMatchIdx = Math.floor(m / 2);
                    const nextRoundMatch = r[rd + 1][nextRoundMatchIdx];

                    if (nextRoundMatch.p1 === match.p1 || nextRoundMatch.p2 === match.p1) {
                        match.winner = match.p1;
                    } else if (nextRoundMatch.p1 === match.p2 || nextRoundMatch.p2 === match.p2) {
                        match.winner = match.p2;
                    }
                } else {
                    if (tournamentWinner) {
                        if (tournamentWinner === match.p1) match.winner = match.p1;
                        if (tournamentWinner === match.p2) match.winner = match.p2;
                    }
                }
            }
        }

        return r;
    }, [players, matches, tournamentWinner]);

    const TreeNode = ({ roundIdx, matchIdx }: { roundIdx: number; matchIdx: number }) => {
        const matchData = rounds[roundIdx][matchIdx];
        const isFirstRound = roundIdx === 0;

        const p1 = matchData.p1;
        const p2 = matchData.p2;
        const winner = matchData.winner;

        const isWinnerP1 = winner === p1 && p1 !== "TBD";
        const isWinnerP2 = winner === p2 && p2 !== "TBD";

        const isEliminatedP1 = winner && winner !== p1 && p1 !== "Bye" && p1 !== "TBD";
        const isEliminatedP2 = winner && winner !== p2 && p2 !== "Bye" && p2 !== "TBD";

        return (
            <div className="flex flex-col items-center">
                {!isFirstRound && (
                    <div className="flex gap-8 mb-2">
                        <TreeNode roundIdx={roundIdx - 1} matchIdx={matchIdx * 2} />
                        <TreeNode roundIdx={roundIdx - 1} matchIdx={matchIdx * 2 + 1} />
                    </div>
                )}
                {!isFirstRound && (
                    <div className="w-full h-8 relative mb-2">
                        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-emerald-500/50 shadow-[0_0_10px_#10b981]"></div>
                        <div className="absolute top-0 left-1/4 h-4 w-[2px] bg-emerald-500/50 -translate-y-full shadow-[0_0_10px_#10b981]"></div>
                        <div className="absolute top-0 right-1/4 h-4 w-[2px] bg-emerald-500/50 -translate-y-full shadow-[0_0_10px_#10b981]"></div>
                        <div className="absolute top-0 left-1/2 h-full w-[2px] bg-emerald-500/50 -translate-x-1/2 shadow-[0_0_10px_#10b981]"></div>
                    </div>
                )}

                <div
                    className="relative flex flex-col items-center justify-center p-1 z-10 
                     bg-black/90 border-2 border-emerald-500/30 rounded-2xl 
                     shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md
                     min-w-[240px] transition-all hover:scale-110 hover:border-emerald-400"
                >
                    <div className="absolute -inset-1 bg-emerald-500/10 rounded-2xl blur-md -z-10 animate-pulse"></div>

                    <div className={`w-full text-center px-8 py-3 rounded-t-xl font-black text-xl tracking-wider truncate border-b border-zinc-800
                          ${isWinnerP1 ? 'bg-emerald-600/30 text-emerald-300 shadow-[inset_0_0_15px_rgba(16,185,129,0.3)]' : ''}
                          ${isEliminatedP1 ? 'text-red-500/60 line-through decoration-2 decoration-red-500/60 grayscale' : 'text-slate-300'}
                          `}>
                        {p1}
                    </div>

                    <div className={`w-full text-center px-8 py-3 rounded-b-xl font-black text-xl tracking-wider truncate
                          ${isWinnerP2 ? 'bg-emerald-600/30 text-emerald-300 shadow-[inset_0_0_15px_rgba(16,185,129,0.3)]' : ''}
                          ${isEliminatedP2 ? 'text-red-500/60 line-through decoration-2 decoration-red-500/60 grayscale' : 'text-slate-300'}
                          `}>
                        {p2}
                    </div>

                    <div className="absolute -right-4 -top-4 bg-black border border-emerald-500 text-emerald-500 text-xs uppercase font-extrabold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transform rotate-12">
                        {matchData.roundName}
                    </div>
                </div>
            </div>
        );
    };

    const finalRoundIdx = rounds.length - 1;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 relative overflow-y-auto">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-black to-black pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center mt-8 mb-12 animate-in fade-in zoom-in duration-700">
                <Trophy className="w-16 h-16 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)] mb-4" />
                <h1 className="text-5xl font-black text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] uppercase">
                    Tournament
                </h1>
                <div className="h-1 w-32 bg-emerald-500 shadow-[0_0_15px_#10b981] mt-2 rounded-full"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-start w-full overflow-auto pb-20 relative z-10 pt-10">
                {tournamentWinner && (
                    <div className="flex flex-col items-center mb-12 animate-in slide-in-from-top-10 fade-in duration-1000">
                        <Trophy className="w-12 h-12 text-yellow-400 mb-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)] animate-bounce" />
                        <div className="relative flex flex-col items-center justify-center p-1 z-20 
                                      bg-yellow-900/20 border-2 border-yellow-400/50 rounded-2xl 
                                      shadow-[0_0_40px_rgba(250,204,21,0.3)] backdrop-blur-md
                                      min-w-[280px] scale-110">
                            <div className="absolute -inset-1 bg-yellow-400/20 rounded-2xl blur-xl -z-10 animate-pulse"></div>
                            <div className="text-yellow-400 text-xs font-black tracking-[0.3em] uppercase mb-1 mt-2">
                                Tournament Champion
                            </div>
                            <div className="text-3xl font-black text-white px-8 py-4 tracking-widest drop-shadow-md">
                                {tournamentWinner}
                            </div>
                        </div>

                        <div className="h-8 w-[2px] bg-yellow-400/50 mt-2 shadow-[0_0_10px_#facc15]"></div>
                    </div>
                )}

                {rounds.length > 0 && (
                    <TreeNode roundIdx={finalRoundIdx} matchIdx={0} />
                )}
            </div>

            {onStartTournament && (
                <button
                    onClick={onStartTournament}
                    className="fixed bottom-10 z-50 px-12 py-5 bg-black border-2 border-emerald-500 text-emerald-500 font-black text-xl 
                           rounded-none uppercase tracking-[0.2em] 
                           hover:bg-emerald-500 hover:text-black transition-all duration-300
                           shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-4 group"
                >
                    {tournamentWinner ? "Back to Dashboard" : "Start Combat"}
                    {tournamentWinner ? (
                        <Home className="w-6 h-6 fill-current group-hover:fill-black transition-colors" />
                    ) : (
                        <Play className="w-6 h-6 fill-current group-hover:fill-black transition-colors" />
                    )}
                </button>
            )}
        </div>
    );
}
