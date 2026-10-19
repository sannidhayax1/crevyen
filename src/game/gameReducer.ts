/**
 * Pure game state reducer.
 *
 * State machine:
 *   IDLE → PLAYING → CARD_FLIPPING → CHECKING_MATCH → PLAYING (loop)
 *                                                    ↘ WIN
 *   Any state → IDLE  (via RESTART action)
 *
 * All game-state transitions are pure functions (no side-effects).
 * Timer scheduling is done externally (App / hooks) and merely dispatches
 * RESOLVE_MATCH / RESOLVE_MISMATCH actions here.
 */

import { mulberry32 } from './prng';
import { shuffle } from './shuffle';
import type { DifficultyLevel } from './difficulty';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Card {
  /** Stable unique id across shuffles within a game. */
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

export type GamePhase =
  | 'IDLE'
  | 'PLAYING'
  | 'CARD_FLIPPING'     // one card is face-up, awaiting second click
  | 'CHECKING_MATCH'    // two cards face-up, timer running
  | 'WIN';

export interface GameState {
  phase: GamePhase;
  cards: Card[];
  /** Indices (into cards[]) of currently face-up, unresolved cards. */
  flippedIndices: number[];
  moves: number;
  completedPairs: number;
  totalPairs: number;
  difficultyLevel: DifficultyLevel;
  seed: number;
  /** ms elapsed (updated externally by the timer hook). */
  elapsedMs: number;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type GameAction =
  | { type: 'FLIP_CARD'; index: number }
  | { type: 'RESOLVE_MATCH' }
  | { type: 'RESOLVE_MISMATCH' }
  | { type: 'RESTART'; seed: number; difficultyLevel: DifficultyLevel }
  | { type: 'TICK'; elapsedMs: number };

// ─── Card symbols ─────────────────────────────────────────────────────────────

export const SYMBOLS = ['🐶', '🐱', '🐻', '🐼', '🦊', '🐸', '🐯', '🦁'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildCards(seed: number): Card[] {
  const rng = mulberry32(seed);
  const pairs: Card[] = SYMBOLS.flatMap((symbol, i) => [
    { id: i * 2,     symbol, flipped: false, matched: false },
    { id: i * 2 + 1, symbol, flipped: false, matched: false },
  ]);
  return shuffle(pairs, rng);
}

// ─── Initial state ────────────────────────────────────────────────────────────

export function createInitialState(
  seed: number,
  difficultyLevel: DifficultyLevel,
): GameState {
  return {
    phase: 'PLAYING',
    cards: buildCards(seed),
    flippedIndices: [],
    moves: 0,
    completedPairs: 0,
    totalPairs: SYMBOLS.length,
    difficultyLevel,
    seed,
    elapsedMs: 0,
  };
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'FLIP_CARD': {
      const { index } = action;
      const card = state.cards[index];

      // Guards — none of these should change state
      if (state.phase === 'WIN') return state;
      if (state.phase === 'CHECKING_MATCH') return state;   // 3rd-click guard
      if (!card) return state;
      if (card.matched) return state;                        // already matched
      if (card.flipped) return state;                        // repeat click

      const updatedCards = state.cards.map((c, i) =>
        i === index ? { ...c, flipped: true } : c,
      );
      const newFlipped = [...state.flippedIndices, index];

      if (newFlipped.length === 1) {
        return { ...state, phase: 'CARD_FLIPPING', cards: updatedCards, flippedIndices: newFlipped };
      }

      // Second card flipped → increment moves and transition to CHECKING_MATCH
      return {
        ...state,
        phase: 'CHECKING_MATCH',
        cards: updatedCards,
        flippedIndices: newFlipped,
        moves: state.moves + 1,
      };
    }

    case 'RESOLVE_MATCH': {
      if (state.phase !== 'CHECKING_MATCH') return state;
      const [a, b] = state.flippedIndices;
      const updatedCards = state.cards.map((c, i) =>
        i === a || i === b ? { ...c, matched: true } : c,
      );
      const completedPairs = state.completedPairs + 1;
      const phase: GamePhase = completedPairs >= state.totalPairs ? 'WIN' : 'PLAYING';
      return { ...state, phase, cards: updatedCards, flippedIndices: [], completedPairs };
    }

    case 'RESOLVE_MISMATCH': {
      if (state.phase !== 'CHECKING_MATCH') return state;
      const [a, b] = state.flippedIndices;
      const updatedCards = state.cards.map((c, i) =>
        i === a || i === b ? { ...c, flipped: false } : c,
      );
      return { ...state, phase: 'PLAYING', cards: updatedCards, flippedIndices: [] };
    }

    case 'RESTART': {
      return createInitialState(action.seed, action.difficultyLevel);
    }

    case 'TICK': {
      return { ...state, elapsedMs: action.elapsedMs };
    }

    default:
      return state;
  }
}
