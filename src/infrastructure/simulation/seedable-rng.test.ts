import { describe, expect, it } from 'vitest';
import { MulberryRng } from './seedable-rng';

describe('MulberryRng', () => {
  it('produces values in [0, 1)', () => {
    const rng = new MulberryRng(42);
    for (let i = 0; i < 100; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('produces the same sequence for the same seed', () => {
    const a = new MulberryRng(42);
    const b = new MulberryRng(42);
    for (let i = 0; i < 10; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it('produces different sequences for different seeds', () => {
    const a = new MulberryRng(42);
    const b = new MulberryRng(43);
    const aSeq = Array.from({ length: 10 }, () => a.next());
    const bSeq = Array.from({ length: 10 }, () => b.next());
    expect(aSeq).not.toEqual(bSeq);
  });
});
