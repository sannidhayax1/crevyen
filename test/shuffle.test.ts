import { describe, it, expect } from 'vitest';
import { shuffle } from '../src/game/shuffle';
import { mulberry32 } from '../src/game/prng';

describe('shuffle', () => {
  const original = [1, 2, 3, 4, 5, 6, 7, 8];

  it('returns an array with the same elements', () => {
    const rng = mulberry32(42);
    const result = shuffle(original, rng);
    expect(result.slice().sort((a, b) => a - b)).toEqual(original.slice().sort((a, b) => a - b));
  });

  it('does not mutate the original array', () => {
    const copy = [...original];
    const rng = mulberry32(42);
    shuffle(original, rng);
    expect(original).toEqual(copy);
  });

  it('produces a different order from the input for a large array (statistical)', () => {
    const arr = Array.from({ length: 16 }, (_, i) => i);
    const rng = mulberry32(99);
    const result = shuffle(arr, rng);
    // With 16 elements the chance of being identical is ~1/16! ≈ 0
    expect(result).not.toEqual(arr);
  });

  it('is reproducible with the same seed', () => {
    const rng1 = mulberry32(7);
    const rng2 = mulberry32(7);
    expect(shuffle(original, rng1)).toEqual(shuffle(original, rng2));
  });

  it('produces different orders with different seeds', () => {
    const rng1 = mulberry32(1);
    const rng2 = mulberry32(2);
    // Very unlikely to collide with 8 elements
    const s1 = shuffle(original, rng1);
    const s2 = shuffle(original, rng2);
    expect(s1).not.toEqual(s2);
  });

  it('handles a single-element array', () => {
    const rng = mulberry32(42);
    expect(shuffle([42], rng)).toEqual([42]);
  });

  it('handles an empty array', () => {
    const rng = mulberry32(42);
    expect(shuffle([], rng)).toEqual([]);
  });
});
