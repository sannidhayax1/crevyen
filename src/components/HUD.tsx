import React from 'react';
import { DIFFICULTIES } from '../game/difficulty';
import type { DifficultyLevel } from '../game/difficulty';

interface HUDProps {
  moves: number;
  completedPairs: number;
  totalPairs: number;
  elapsedMs: number;
  difficultyLevel: DifficultyLevel;
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const BADGE_CLASSES: Record<DifficultyLevel, string> = {
  0: 'bg-green-100 text-green-700 border border-green-300 dark:bg-green-900/40 dark:text-green-300',
  1: 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-300',
  2: 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/40 dark:text-red-300',
};

export const HUD: React.FC<HUDProps> = ({
  moves,
  completedPairs,
  totalPairs,
  elapsedMs,
  difficultyLevel,
}) => {
  const diff = DIFFICULTIES[difficultyLevel];
  const isTimerWarning = difficultyLevel === 2 && elapsedMs > 80_000;

  return (
    <div className="flex flex-col gap-2">
      {/* Difficulty badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${BADGE_CLASSES[difficultyLevel]}`}
          data-testid="difficulty-badge"
        >
          {diff.name}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{diff.description}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="moves-counter">
            {moves}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Moves</div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="pairs-counter">
            {completedPairs}
            <span className="text-sm text-gray-400">/{totalPairs}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Pairs</div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
          <div
            className={`text-2xl font-bold ${
              isTimerWarning
                ? 'text-red-500 animate-pulse'
                : 'text-gray-900 dark:text-gray-100'
            }`}
            data-testid="timer-display"
          >
            {formatTime(elapsedMs)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
        </div>
      </div>
    </div>
  );
};
