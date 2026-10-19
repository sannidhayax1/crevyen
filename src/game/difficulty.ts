/**
 * Difficulty system for the Adaptive Memory Matching Game.
 *
 * Three levels: Easy (0), Medium (1), Hard (2).
 *
 * Promotion / demotion thresholds (documented):
 *
 * Easy → Medium:   moves ≤ 12  AND  time < 60 000 ms
 * Medium → Hard:   moves ≤ 16  AND  time < 90 000 ms
 * Medium → Easy:   moves > 24  OR   time > 120 000 ms
 * Hard → Medium:   moves > 22  OR   time > 110 000 ms
 */

export type DifficultyLevel = 0 | 1 | 2;

export interface DifficultyConfig {
  readonly name: string;
  /** How long (ms) a mismatched pair stays face-up before flipping back. */
  readonly revealMs: number;
  readonly description: string;
}

export const DIFFICULTIES: Record<DifficultyLevel, DifficultyConfig> = {
  0: {
    name: 'Easy',
    revealMs: 2000,
    description: '2 s to memorise a mismatch',
  },
  1: {
    name: 'Medium',
    revealMs: 1500,
    description: '1.5 s to memorise a mismatch',
  },
  2: {
    name: 'Hard',
    revealMs: 1000,
    description: '1 s to memorise a mismatch',
  },
};

export interface AdaptationResult {
  nextLevel: DifficultyLevel;
  /** Human-readable explanation of why the difficulty changed (or stayed). */
  reason: string;
}

interface Threshold {
  promoteMovesMax: number | null;
  promoteTimeMaxMs: number | null;
  demoteMovesMin: number | null;
  demoteTimeMinMs: number | null;
}

const THRESHOLDS: Record<DifficultyLevel, Threshold> = {
  0: {
    promoteMovesMax: 12,
    promoteTimeMaxMs: 60_000,
    demoteMovesMin: null,
    demoteTimeMinMs: null,
  },
  1: {
    promoteMovesMax: 16,
    promoteTimeMaxMs: 90_000,
    demoteMovesMin: 24,
    demoteTimeMinMs: 120_000,
  },
  2: {
    promoteMovesMax: null,
    promoteTimeMaxMs: null,
    demoteMovesMin: 22,
    demoteTimeMinMs: 110_000,
  },
};

/**
 * Given the round result, decide the next difficulty and explain why.
 */
export function adaptDifficulty(
  level: DifficultyLevel,
  moves: number,
  timeMs: number,
): AdaptationResult {
  const t = THRESHOLDS[level];

  // Check promotion
  if (
    t.promoteMovesMax !== null &&
    t.promoteTimeMaxMs !== null &&
    moves <= t.promoteMovesMax &&
    timeMs < t.promoteTimeMaxMs
  ) {
    const nextLevel = (level + 1) as DifficultyLevel;
    return {
      nextLevel,
      reason:
        `🎉 Promoted to ${DIFFICULTIES[nextLevel].name}! ` +
        `You finished in ${moves} moves in ${(timeMs / 1000).toFixed(1)} s ` +
        `(threshold: ≤${t.promoteMovesMax} moves & <${t.promoteTimeMaxMs / 1000} s).`,
    };
  }

  // Check demotion
  if (t.demoteMovesMin !== null && t.demoteTimeMinMs !== null) {
    if (moves > t.demoteMovesMin || timeMs > t.demoteTimeMinMs) {
      const nextLevel = (level - 1) as DifficultyLevel;
      const reason =
        moves > t.demoteMovesMin
          ? `You needed ${moves} moves (threshold: >${t.demoteMovesMin}).`
          : `You took ${(timeMs / 1000).toFixed(1)} s (threshold: >${t.demoteTimeMinMs / 1000} s).`;
      return {
        nextLevel,
        reason: `📉 Dropped to ${DIFFICULTIES[nextLevel].name} — ${reason}`,
      };
    }
  }

  // No change
  return {
    nextLevel: level,
    reason: `👍 Staying on ${DIFFICULTIES[level].name} — solid performance!`,
  };
}
