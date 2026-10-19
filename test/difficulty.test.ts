import { describe, it, expect } from 'vitest';
import { adaptDifficulty } from '../src/game/difficulty';

describe('adaptDifficulty', () => {
  // ── Easy (0) ────────────────────────────────────────────────────────────────

  describe('Easy → Medium promotion', () => {
    it('promotes when moves ≤ 12 AND time < 60 000 ms', () => {
      const result = adaptDifficulty(0, 12, 59_999);
      expect(result.nextLevel).toBe(1);
      expect(result.reason).toMatch(/Promoted to Medium/);
    });

    it('promotes at exactly 12 moves and just under 60 s', () => {
      const result = adaptDifficulty(0, 12, 59_000);
      expect(result.nextLevel).toBe(1);
    });

    it('does NOT promote when moves = 13 (over threshold)', () => {
      const result = adaptDifficulty(0, 13, 30_000);
      expect(result.nextLevel).toBe(0);
    });

    it('does NOT promote when time ≥ 60 000 ms', () => {
      const result = adaptDifficulty(0, 10, 60_000);
      expect(result.nextLevel).toBe(0);
    });

    it('stays at Easy when neither threshold is met', () => {
      const result = adaptDifficulty(0, 20, 90_000);
      expect(result.nextLevel).toBe(0);
      expect(result.reason).toMatch(/Staying on Easy/);
    });
  });

  // ── Medium (1) ───────────────────────────────────────────────────────────────

  describe('Medium → Hard promotion', () => {
    it('promotes when moves ≤ 16 AND time < 90 000 ms', () => {
      const result = adaptDifficulty(1, 16, 89_999);
      expect(result.nextLevel).toBe(2);
      expect(result.reason).toMatch(/Promoted to Hard/);
    });

    it('does NOT promote when moves = 17', () => {
      const result = adaptDifficulty(1, 17, 50_000);
      expect(result.nextLevel).toBe(1);
    });

    it('does NOT promote when time ≥ 90 000 ms', () => {
      const result = adaptDifficulty(1, 14, 90_000);
      expect(result.nextLevel).toBe(1);
    });
  });

  describe('Medium → Easy demotion', () => {
    it('demotes when moves > 24', () => {
      const result = adaptDifficulty(1, 25, 50_000);
      expect(result.nextLevel).toBe(0);
      expect(result.reason).toMatch(/Dropped to Easy/);
    });

    it('demotes when time > 120 000 ms', () => {
      const result = adaptDifficulty(1, 20, 120_001);
      expect(result.nextLevel).toBe(0);
      expect(result.reason).toMatch(/Dropped to Easy/);
    });

    it('stays at Medium when within all thresholds', () => {
      // moves 17–24, time 90 000–120 000 → neither promote nor demote
      const result = adaptDifficulty(1, 20, 100_000);
      expect(result.nextLevel).toBe(1);
      expect(result.reason).toMatch(/Staying on Medium/);
    });

    it('boundary: exactly 24 moves does NOT demote', () => {
      const result = adaptDifficulty(1, 24, 100_000);
      expect(result.nextLevel).toBe(1);
    });

    it('boundary: exactly 120 000 ms does NOT demote', () => {
      const result = adaptDifficulty(1, 20, 120_000);
      expect(result.nextLevel).toBe(1);
    });
  });

  // ── Hard (2) ─────────────────────────────────────────────────────────────────

  describe('Hard → Medium demotion', () => {
    it('demotes when moves > 22', () => {
      const result = adaptDifficulty(2, 23, 50_000);
      expect(result.nextLevel).toBe(1);
      expect(result.reason).toMatch(/Dropped to Medium/);
    });

    it('demotes when time > 110 000 ms', () => {
      const result = adaptDifficulty(2, 20, 110_001);
      expect(result.nextLevel).toBe(1);
    });

    it('stays at Hard when within thresholds', () => {
      const result = adaptDifficulty(2, 20, 90_000);
      expect(result.nextLevel).toBe(2);
      expect(result.reason).toMatch(/Staying on Hard/);
    });

    it('boundary: exactly 22 moves does NOT demote', () => {
      const result = adaptDifficulty(2, 22, 80_000);
      expect(result.nextLevel).toBe(2);
    });

    it('boundary: exactly 110 000 ms does NOT demote', () => {
      const result = adaptDifficulty(2, 20, 110_000);
      expect(result.nextLevel).toBe(2);
    });
  });

  // ── Reason string contains relevant numbers ───────────────────────────────

  it('includes move count in promotion reason', () => {
    const result = adaptDifficulty(0, 8, 30_000);
    expect(result.reason).toContain('8 moves');
  });

  it('includes time in promotion reason', () => {
    const result = adaptDifficulty(0, 8, 30_000);
    expect(result.reason).toContain('30.0 s');
  });
});
