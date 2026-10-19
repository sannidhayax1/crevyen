import React from 'react';

interface InstructionsProps {
  isOpen: boolean;
  onClose: () => void;
  currentSeed: number;
  onSetSeed: (seed: number) => void;
}

export const Instructions: React.FC<InstructionsProps> = ({
  isOpen,
  onClose,
  currentSeed,
  onSetSeed,
}) => {
  const [seedInput, setSeedInput] = React.useState(String(currentSeed));

  if (!isOpen) return null;

  const handleSetSeed = () => {
    const v = parseInt(seedInput, 10);
    if (!isNaN(v)) {
      onSetSeed(v);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructions-title"
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col gap-4">
        <h2
          id="instructions-title"
          className="text-lg font-bold text-gray-900 dark:text-gray-100"
        >
          📖 How to Play
        </h2>

        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
          <li>🖱️ <strong>Click</strong> a card to reveal it.</li>
          <li>🃏 Click a <strong>second card</strong> to try to match the pair.</li>
          <li>✅ A <strong>match</strong> keeps both cards face-up permanently.</li>
          <li>❌ A <strong>mismatch</strong> flips both back after a short delay.</li>
          <li>⏸️ While two cards are showing, extra clicks are <strong>ignored</strong>.</li>
          <li>🏆 Match all 8 pairs to <strong>win the round</strong>.</li>
          <li>↺ Use <strong>Restart</strong> any time to reset (timers are safely cleared).</li>
        </ul>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Difficulty Adaptation Rules
          </p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
            <li>⬆️ <strong>Easy → Medium</strong>: ≤ 12 moves &amp; &lt; 60 s</li>
            <li>⬆️ <strong>Medium → Hard</strong>: ≤ 16 moves &amp; &lt; 90 s</li>
            <li>⬇️ <strong>Medium → Easy</strong>: &gt; 24 moves <em>or</em> &gt; 120 s</li>
            <li>⬇️ <strong>Hard → Medium</strong>: &gt; 22 moves <em>or</em> &gt; 110 s</li>
          </ul>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Reproducible Seed
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100 w-24"
              aria-label="Random seed"
            />
            <button
              onClick={handleSetSeed}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Set Seed
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Same seed = same card layout for reproducible test sessions.
          </p>
        </div>

        <button
          onClick={onClose}
          className="border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
