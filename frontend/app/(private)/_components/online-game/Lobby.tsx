import React from "react";
import { Loader2 } from "lucide-react";

interface Props {
  status: string;
  isQueuing: boolean;
  onJoinQueue: () => void;
  onBack: () => void;
  onCancelQueue?: () => void;
}

export default function Lobby({
  isQueuing,
  onJoinQueue,
  onBack,
  onCancelQueue,
}: Props) {
  return (
    <div className="text-center space-y-4">

      {isQueuing ? (
        <div className="flex flex-col items-center animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin mb-2" />
          <span>Searching for opponent...</span>
          {onCancelQueue && (
            <button
              onClick={onCancelQueue}
              className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Cancel Search
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={onJoinQueue}
          className="px-8 py-4 bg-emerald-600 rounded-xl font-bold text-xl hover:scale-105 transition"
        >
          FIND MATCH
        </button>
      )}

      <button
        onClick={onBack}
        className="text-slate-400 hover:text-emerald-600 mt-4 text-sm block mx-auto"
      >
        ← Back to Map Selection
      </button>
    </div>
  );
}
