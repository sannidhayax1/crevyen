import { describe, it, expect } from 'vitest';
import { mulberry32 } from '../src/game/prng';

describe('mulberry32 PRNG', () => {
  it('returns numbers in [0, 1)', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('produces the same sequence for the same seed', () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = mulberry32(1);
    const rng2 = mulberry32(2);
    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());
    expect(seq1).not.toEqual(seq2);
  });

  it('each instance holds independent internal state', () => {
    // Two instances with the same seed produce the identical sequence —
    // that is the whole point of seeding. What we verify here is that
    // advancing one instance further than the other puts them at
    // different positions in the sequence so they yield different values.
    const rng1 = mulberry32(100);
    const rng2 = mulberry32(100);

    // Both at position 0: first values are identical.
    expect(rng1()).toBe(rng2());

    // Advance rng1 one extra step (position 2); rng2 stays at position 1.
    rng1();
    // Now rng1 is at position 2, rng2 at position 1 → next values differ.
    expect(rng1()).not.toBe(rng2());
  });
});
