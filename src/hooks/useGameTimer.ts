/**
 * useGameTimer
 *
 * Manages the elapsed-time ticker for the game.
 *
 * - Starts ticking when phase is PLAYING or CARD_FLIPPING.
 * - Stops (and records final time) when phase becomes WIN.
 * - Pauses while phase is CHECKING_MATCH (the reveal window).
 * - The intervalId ref is stable across re-renders; clearing it on
 *   unmount / restart prevents stale dispatches.
 */

import { useEffect, useRef } from 'react';
import type { GamePhase } from '../game/gameReducer';

interface UseGameTimerOptions {
  phase: GamePhase;
  startTime: number;
  dispatch: (action: { type: 'TICK'; elapsedMs: number }) => void;
}

export function useGameTimer({ phase, startTime, dispatch }: UseGameTimerOptions): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const shouldTick = phase === 'PLAYING' || phase === 'CARD_FLIPPING';

    if (shouldTick) {
      // Clear any pre-existing interval before starting a new one
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK', elapsedMs: Date.now() - startTime });
      }, 500);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount or when effect re-runs
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, startTime, dispatch]);
}
