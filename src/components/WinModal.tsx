import React from 'react';
import { DIFFICULTIES } from '../game/difficulty';
import type { DifficultyLevel } from '../game/difficulty';
import type { AdaptationResult } from '../game/difficulty';

interface WinModalProps {
  moves: number;
  elapsedMs: number;
  adaptation: AdaptationResult;
  currentLevel: DifficultyLevel;
  onNextRound: () => void;
  onRestartEasy: () => void;
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export const WinModal: React.FC<WinModalProps> = ({
  moves,
  elapsedMs,
  adaptation,
  onNextRound,
  onRestartEasy,
}) => {
  const nextDiff = DIFFICULTIES[adaptation.nextLevel];

  return (
    /* Overlay backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-title"
      data-testid="win-modal"
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col gap-4 text-center">
        {/* Trophy */}
        <div className="text-6xl" role="img" aria-label="Celebration">🎊</div>

        <h2
          id="win-title"
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          You Won!
        </h2>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{moves}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Moves</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatTime(elapsedMs)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
          </div>
        </div>

        {/* Adaptation reason — the documented explanation */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-left">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">
            Next round adjustment
          </p>
          <p
            className="text-sm text-gray-800 dark:text-gray-200"
            data-testid="adaptation-reason"
          >
            {adaptation.reason}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            onClick={onNextRound}
            data-testid="btn-next-round"
          >
            Next Round ({nextDiff.name})
          </button>
          <button
            className="flex-1 min-w-[120px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            onClick={onRestartEasy}
            data-testid="btn-restart-easy"
          >
            Restart (Easy)
          </button>
        </div>
      </div>
    </div>
  );
};
