import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Board } from './components/Board';
import { HUD } from './components/HUD';
import { WinModal } from './components/WinModal';
import { Instructions } from './components/Instructions';
import { SessionHistory } from './components/SessionHistory';
import { gameReducer, createInitialState } from './game/gameReducer';
import { adaptDifficulty, DIFFICULTIES } from './game/difficulty';
import { loadSessions, saveSession } from './game/session';
import { useGameTimer } from './hooks/useGameTimer';
import type { DifficultyLevel } from './game/difficulty';
import type { AdaptationResult } from './game/difficulty';

const DEFAULT_SEED = 42;
const DEFAULT_DIFFICULTY: DifficultyLevel = 0;

export default function App() {
  // ── Core game state (pure reducer) ──────────────────────────────────────────
  const [gameState, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => createInitialState(DEFAULT_SEED, DEFAULT_DIFFICULTY),
  );

  // ── Stable start-time ref (updated on restart, not part of reducer) ─────────
  const startTimeRef = useRef<number>(Date.now());

  // ── Pending mismatch/match reveal timer ─────────────────────────────────────
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [showInstructions, setShowInstructions] = useState(false);
  const [winData, setWinData] = useState<{
    adaptation: AdaptationResult;
    moves: number;
    elapsedMs: number;
    currentLevel: DifficultyLevel;
  } | null>(null);
  const [sessions, setSessions] = useState(() => loadSessions());

  // ── Timer hook ─────────────────────────────────────────────────────────────
  const stableDispatch = useCallback(
    (action: { type: 'TICK'; elapsedMs: number }) => dispatch(action),
    [],
  );
  useGameTimer({ phase: gameState.phase, startTime: startTimeRef.current, dispatch: stableDispatch });

  // ── Handle WIN phase ────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState.phase !== 'WIN') return;
    const { moves, elapsedMs, difficultyLevel } = gameState;
    const adaptation = adaptDifficulty(difficultyLevel, moves, elapsedMs);

    const entry = saveSession({
      seed: gameState.seed,
      difficultyLevel,
      difficultyName: DIFFICULTIES[difficultyLevel].name,
      moves,
      timeMs: elapsedMs,
      nextDifficultyName: DIFFICULTIES[adaptation.nextLevel].name,
      reason: adaptation.reason,
    });

    setSessions((prev) => [...prev, entry]);
    setWinData({ adaptation, moves, elapsedMs, currentLevel: difficultyLevel });
  }, [gameState.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Card flip handler ───────────────────────────────────────────────────────
  const handleFlip = useCallback((index: number) => {
    const { phase, cards, flippedIndices } = gameState;
    if (phase === 'WIN') return;
    if (phase === 'CHECKING_MATCH') return; // 3rd-click guard (also in reducer)

    dispatch({ type: 'FLIP_CARD', index });

    // Schedule resolution after second flip
    const card = cards[index];
    if (
      !card.matched &&
      !card.flipped &&
      (phase === 'CARD_FLIPPING') &&
      flippedIndices.length === 1
    ) {
      const firstIdx = flippedIndices[0];
      const firstCard = cards[firstIdx];
      const isMatch = firstCard.symbol === card.symbol;
      const delay = isMatch ? 400 : DIFFICULTIES[gameState.difficultyLevel].revealMs;

      pendingTimerRef.current = setTimeout(() => {
        pendingTimerRef.current = null;
        dispatch({ type: isMatch ? 'RESOLVE_MATCH' : 'RESOLVE_MISMATCH' });
      }, delay);
    }
  }, [gameState]);

  // ── Restart handler — clears pending timer before creating new game ─────────
  const handleRestart = useCallback(
    (seed: number, difficultyLevel: DifficultyLevel) => {
      // Critical: cancel any in-flight timer so its dispatch cannot touch the new game
      if (pendingTimerRef.current !== null) {
        clearTimeout(pendingTimerRef.current);
        pendingTimerRef.current = null;
      }
      setWinData(null);
      startTimeRef.current = Date.now();
      dispatch({ type: 'RESTART', seed, difficultyLevel });
    },
    [],
  );

  const handleSetSeed = useCallback((seed: number) => {
    handleRestart(seed, gameState.difficultyLevel);
  }, [handleRestart, gameState.difficultyLevel]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold">🃏 Adaptive Memory Match</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Reveal pairs — the game adapts to your performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRestart(gameState.seed, gameState.difficultyLevel)}
              className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
              data-testid="btn-restart"
            >
              ↺ Restart
            </button>
            <button
              onClick={() => setShowInstructions(true)}
              className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
              data-testid="btn-instructions"
            >
              ? Help
            </button>
          </div>
        </div>

        {/* HUD */}
        <HUD
          moves={gameState.moves}
          completedPairs={gameState.completedPairs}
          totalPairs={gameState.totalPairs}
          elapsedMs={gameState.elapsedMs}
          difficultyLevel={gameState.difficultyLevel}
        />

        {/* Game Board */}
        <Board state={gameState} onFlip={handleFlip} />

        {/* Session History */}
        <SessionHistory sessions={sessions} />
      </div>

      {/* Win Modal */}
      {winData && (
        <WinModal
          moves={winData.moves}
          elapsedMs={winData.elapsedMs}
          adaptation={winData.adaptation}
          currentLevel={winData.currentLevel}
          onNextRound={() => {
            setWinData(null);
            handleRestart(gameState.seed + 1, winData.adaptation.nextLevel);
          }}
          onRestartEasy={() => {
            setWinData(null);
            handleRestart(DEFAULT_SEED, 0);
          }}
        />
      )}

      {/* Instructions Modal */}
      <Instructions
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        currentSeed={gameState.seed}
        onSetSeed={handleSetSeed}
      />
    </div>
  );
}
