import React from 'react';
import type { SessionEntry } from '../game/session';

interface SessionHistoryProps {
  sessions: SessionEntry[];
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">
        📊 Session History
      </h2>

      {sessions.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          No rounds completed yet. Finish a game to see your results here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="w-full text-xs text-gray-700 dark:text-gray-300"
            aria-label="Session history"
          >
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                <th className="text-left py-1 pr-3 font-medium">Round</th>
                <th className="text-left py-1 pr-3 font-medium">Difficulty</th>
                <th className="text-left py-1 pr-3 font-medium">Moves</th>
                <th className="text-left py-1 pr-3 font-medium">Time</th>
                <th className="text-left py-1 font-medium">Next</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr
                  key={`${s.round}-${s.ts}`}
                  className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-1.5 pr-3">{s.round}</td>
                  <td className="py-1.5 pr-3">{s.difficulty}</td>
                  <td className="py-1.5 pr-3">{s.moves}</td>
                  <td className="py-1.5 pr-3">{formatTime(s.timeMs)}</td>
                  <td className="py-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        s.nextDifficulty === 'Easy'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                          : s.nextDifficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                      }`}
                    >
                      {s.nextDifficulty}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Show last round's reason */}
          {sessions.length > 0 && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
              Last: {sessions[sessions.length - 1].reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
