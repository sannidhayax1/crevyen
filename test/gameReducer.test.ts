import { describe, it, expect } from 'vitest';
import { gameReducer, createInitialState, SYMBOLS } from '../src/game/gameReducer';
import type { GameState, GameAction } from '../src/game/gameReducer';

// Helper: find two cards with the same symbol
function findMatchingPair(state: GameState): [number, number] {
  const seen = new Map<string, number>();
  for (let i = 0; i < state.cards.length; i++) {
    const sym = state.cards[i].symbol;
    if (seen.has(sym)) return [seen.get(sym)!, i];
    seen.set(sym, i);
  }
  throw new Error('No matching pair found — this should never happen');
}

// Helper: find two cards with different symbols
function findMismatchingPair(state: GameState): [number, number] {
  const firstIdx = 0;
  const firstSym = state.cards[0].symbol;
  const secondIdx = state.cards.findIndex((c, i) => i !== firstIdx && c.symbol !== firstSym);
  return [firstIdx, secondIdx];
}

// Dispatch a sequence of actions, returning final state
function applyActions(initial: GameState, actions: GameAction[]): GameState {
  return actions.reduce(gameReducer, initial);
}

describe('gameReducer', () => {
  describe('createInitialState', () => {
    it('creates 16 cards (8 pairs)', () => {
      const state = createInitialState(42, 0);
      expect(state.cards).toHaveLength(16);
    });

    it('contains exactly 2 of each symbol', () => {
      const state = createInitialState(42, 0);
      for (const sym of SYMBOLS) {
        const count = state.cards.filter((c) => c.symbol === sym).length;
        expect(count).toBe(2);
      }
    });

    it('starts in PLAYING phase', () => {
      const state = createInitialState(42, 0);
      expect(state.phase).toBe('PLAYING');
    });

    it('starts with 0 moves and 0 completed pairs', () => {
      const state = createInitialState(42, 0);
      expect(state.moves).toBe(0);
      expect(state.completedPairs).toBe(0);
    });

    it('is reproducible: same seed produces same card order', () => {
      const s1 = createInitialState(42, 0);
      const s2 = createInitialState(42, 0);
      expect(s1.cards.map((c) => c.symbol)).toEqual(s2.cards.map((c) => c.symbol));
    });

    it('different seeds produce different layouts', () => {
      const s1 = createInitialState(1, 0);
      const s2 = createInitialState(2, 0);
      expect(s1.cards.map((c) => c.symbol)).not.toEqual(s2.cards.map((c) => c.symbol));
    });
  });

  describe('FLIP_CARD', () => {
    it('flips a card to face-up', () => {
      const s = createInitialState(42, 0);
      const next = gameReducer(s, { type: 'FLIP_CARD', index: 0 });
      expect(next.cards[0].flipped).toBe(true);
    });

    it('transitions to CARD_FLIPPING after first flip', () => {
      const s = createInitialState(42, 0);
      const next = gameReducer(s, { type: 'FLIP_CARD', index: 0 });
      expect(next.phase).toBe('CARD_FLIPPING');
    });

    it('transitions to CHECKING_MATCH after second flip', () => {
      const s = createInitialState(42, 0);
      const s2 = gameReducer(s, { type: 'FLIP_CARD', index: 0 });
      const s3 = gameReducer(s2, { type: 'FLIP_CARD', index: 1 });
      expect(s3.phase).toBe('CHECKING_MATCH');
    });

    it('increments moves only on the second flip', () => {
      const s = createInitialState(42, 0);
      const s2 = gameReducer(s, { type: 'FLIP_CARD', index: 0 });
      expect(s2.moves).toBe(0);
      const s3 = gameReducer(s2, { type: 'FLIP_CARD', index: 1 });
      expect(s3.moves).toBe(1);
    });

    it('ignores clicks on already-matched cards', () => {
      let s = createInitialState(42, 0);
      const [a, b] = findMatchingPair(s);
      s = applyActions(s, [
        { type: 'FLIP_CARD', index: a },
        { type: 'FLIP_CARD', index: b },
        { type: 'RESOLVE_MATCH' },
      ]);
      const before = s.moves;
      const next = gameReducer(s, { type: 'FLIP_CARD', index: a });
      expect(next.moves).toBe(before);
      expect(next.cards[a].flipped).toBe(true); // still face-up (matched)
    });

    it('ignores repeat clicks on the same face-up card', () => {
      const s = createInitialState(42, 0);
      const s2 = gameReducer(s, { type: 'FLIP_CARD', index: 0 });
      const s3 = gameReducer(s2, { type: 'FLIP_CARD', index: 0 }); // repeat
      expect(s3.phase).toBe('CARD_FLIPPING'); // still waiting for second card
      expect(s3.flippedIndices).toHaveLength(1);
    });

    it('3rd-click guard: ignores clicks while CHECKING_MATCH', () => {
      const s = createInitialState(42, 0);
      const s2 = gameReducer(s, { type: 'FLIP_CARD', index: 0 });
      const s3 = gameReducer(s2, { type: 'FLIP_CARD', index: 1 });
      expect(s3.phase).toBe('CHECKING_MATCH');

      // Find an unflipped card
      const thirdIdx = s3.cards.findIndex((c) => !c.flipped && !c.matched);
      const s4 = gameReducer(s3, { type: 'FLIP_CARD', index: thirdIdx });
      expect(s4).toBe(s3); // state reference unchanged (guard returned early)
    });

    it('ignores clicks in WIN phase', () => {
      const s = { ...createInitialState(42, 0), phase: 'WIN' as const };
      const next = gameReducer(s, { type: 'FLIP_CARD', index: 0 });
      expect(next).toBe(s);
    });
  });

  describe('RESOLVE_MATCH', () => {
    it('marks both cards as matched', () => {
      let s = createInitialState(42, 0);
      const [a, b] = findMatchingPair(s);
      s = applyActions(s, [
        { type: 'FLIP_CARD', index: a },
        { type: 'FLIP_CARD', index: b },
        { type: 'RESOLVE_MATCH' },
      ]);
      expect(s.cards[a].matched).toBe(true);
      expect(s.cards[b].matched).toBe(true);
    });

    it('increments completedPairs', () => {
      let s = createInitialState(42, 0);
      const [a, b] = findMatchingPair(s);
      s = applyActions(s, [
        { type: 'FLIP_CARD', index: a },
        { type: 'FLIP_CARD', index: b },
        { type: 'RESOLVE_MATCH' },
      ]);
      expect(s.completedPairs).toBe(1);
    });

    it('clears flippedIndices', () => {
      let s = createInitialState(42, 0);
      const [a, b] = findMatchingPair(s);
      s = applyActions(s, [
        { type: 'FLIP_CARD', index: a },
        { type: 'FLIP_CARD', index: b },
        { type: 'RESOLVE_MATCH' },
      ]);
      expect(s.flippedIndices).toHaveLength(0);
    });

    it('transitions to WIN when all pairs matched', () => {
      let s = createInitialState(42, 0);
      // Match all 8 pairs
      const usedIndices = new Set<number>();
      for (let p = 0; p < 8; p++) {
        // Find next unmatched pair
        let a = -1, b = -1;
        const seen = new Map<string, number>();
        for (let i = 0; i < s.cards.length; i++) {
          if (s.cards[i].matched || usedIndices.has(i)) continue;
          const sym = s.cards[i].symbol;
          if (seen.has(sym)) {
            a = seen.get(sym)!;
            b = i;
            break;
          }
          seen.set(sym, i);
        }
        usedIndices.add(a);
        usedIndices.add(b);
        s = applyActions(s, [
          { type: 'FLIP_CARD', index: a },
          { type: 'FLIP_CARD', index: b },
          { type: 'RESOLVE_MATCH' },
        ]);
      }
      expect(s.phase).toBe('WIN');
      expect(s.completedPairs).toBe(8);
    });
  });

  describe('RESOLVE_MISMATCH', () => {
    it('flips both cards back to face-down', () => {
      let s = createInitialState(42, 0);
      const [a, b] = findMismatchingPair(s);
      s = applyActions(s, [
        { type: 'FLIP_CARD', index: a },
        { type: 'FLIP_CARD', index: b },
        { type: 'RESOLVE_MISMATCH' },
      ]);
      expect(s.cards[a].flipped).toBe(false);
      expect(s.cards[b].flipped).toBe(false);
    });

    it('does NOT mark cards as matched', () => {
      let s = createInitialState(42, 0);
      const [a, b] = findMismatchingPair(s);
      s = applyActions(s, [
        { type: 'FLIP_CARD', index: a },
        { type: 'FLIP_CARD', index: b },
        { type: 'RESOLVE_MISMATCH' },
      ]);
      expect(s.cards[a].matched).toBe(false);
      expect(s.cards[b].matched).toBe(false);
    });

    it('returns to PLAYING phase', () => {
      let s = createInitialState(42, 0);
      const [a, b] = findMismatchingPair(s);
      s = applyActions(s, [
        { type: 'FLIP_CARD', index: a },
        { type: 'FLIP_CARD', index: b },
        { type: 'RESOLVE_MISMATCH' },
      ]);
      expect(s.phase).toBe('PLAYING');
    });

    it('does not increment moves on mismatch resolution (moves counted at flip-2)', () => {
      let s = createInitialState(42, 0);
      const [a, b] = findMismatchingPair(s);
      s = applyActions(s, [
        { type: 'FLIP_CARD', index: a },
        { type: 'FLIP_CARD', index: b },
        { type: 'RESOLVE_MISMATCH' },
      ]);
      expect(s.moves).toBe(1); // counted when second card was flipped
    });
  });

  describe('RESTART', () => {
    it('resets to a fresh PLAYING state', () => {
      let s = createInitialState(42, 0);
      // Make some progress
      s = applyActions(s, [
        { type: 'FLIP_CARD', index: 0 },
        { type: 'FLIP_CARD', index: 1 },
      ]);
      const restarted = gameReducer(s, { type: 'RESTART', seed: 42, difficultyLevel: 0 });
      expect(restarted.phase).toBe('PLAYING');
      expect(restarted.moves).toBe(0);
      expect(restarted.completedPairs).toBe(0);
      expect(restarted.flippedIndices).toHaveLength(0);
      expect(restarted.cards.every((c) => !c.flipped && !c.matched)).toBe(true);
    });

    it('can change difficulty on restart', () => {
      const s = createInitialState(42, 0);
      const restarted = gameReducer(s, { type: 'RESTART', seed: 42, difficultyLevel: 2 });
      expect(restarted.difficultyLevel).toBe(2);
    });

    it('restart during CHECKING_MATCH: any subsequent RESOLVE_MISMATCH is ignored (stale)', () => {
      // Simulate: game reaches CHECKING_MATCH, then RESTART happens,
      // then a stale RESOLVE_MISMATCH fires. The reducer should be in PLAYING
      // (not CHECKING_MATCH), so RESOLVE_MISMATCH is a no-op.
      let s = createInitialState(42, 0);
      const [a, b] = findMismatchingPair(s);
      s = applyActions(s, [
        { type: 'FLIP_CARD', index: a },
        { type: 'FLIP_CARD', index: b },
      ]);
      expect(s.phase).toBe('CHECKING_MATCH');

      // Restart
      s = gameReducer(s, { type: 'RESTART', seed: 42, difficultyLevel: 0 });
      expect(s.phase).toBe('PLAYING');

      // Stale timer fires
      const stale = gameReducer(s, { type: 'RESOLVE_MISMATCH' });
      expect(stale.phase).toBe('PLAYING'); // guard: only processes in CHECKING_MATCH
      expect(stale).toBe(s);              // state reference unchanged
    });
  });

  describe('TICK', () => {
    it('updates elapsedMs', () => {
      const s = createInitialState(42, 0);
      const next = gameReducer(s, { type: 'TICK', elapsedMs: 5000 });
      expect(next.elapsedMs).toBe(5000);
    });
  });
});
