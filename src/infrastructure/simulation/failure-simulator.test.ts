import { describe, expect, it } from 'vitest';
import { FailureSimulator, SimulatedFailureError } from './failure-simulator';
import { MulberryRng } from './seedable-rng';

function countFailures(sim: FailureSimulator, iterations: number): number {
  let failures = 0;
  for (let i = 0; i < iterations; i++) {
    try {
      sim.maybeFail();
    } catch (err) {
      if (err instanceof SimulatedFailureError) failures++;
    }
  }
  return failures;
}

describe('FailureSimulator', () => {
  describe('constructor validation', () => {
    it('rejects rate below 0', () => {
      expect(() => new FailureSimulator(new MulberryRng(1), -0.1)).toThrow(RangeError);
    });

    it('rejects rate above 1', () => {
      expect(() => new FailureSimulator(new MulberryRng(1), 1.1)).toThrow(RangeError);
    });

    it('accepts rate of 0 (never fail)', () => {
      expect(() => new FailureSimulator(new MulberryRng(1), 0)).not.toThrow();
    });

    it('accepts rate of 1 (always fail)', () => {
      expect(() => new FailureSimulator(new MulberryRng(1), 1)).not.toThrow();
    });
  });

  describe('maybeFail behavior', () => {
    it('never throws when rate is 0', () => {
      const sim = new FailureSimulator(new MulberryRng(42), 0);
      for (let i = 0; i < 100; i++) {
        expect(() => sim.maybeFail()).not.toThrow();
      }
    });

    it('always throws SimulatedFailureError when rate is 1', () => {
      const sim = new FailureSimulator(new MulberryRng(42), 1);
      for (let i = 0; i < 10; i++) {
        expect(() => sim.maybeFail()).toThrow(SimulatedFailureError);
      }
    });

    it('produces deterministic outcomes for the same seed', () => {
      const seed = 12345;
      const rate = 0.5;
      const iterations = 100;

      const first = countFailures(new FailureSimulator(new MulberryRng(seed), rate), iterations);
      const second = countFailures(new FailureSimulator(new MulberryRng(seed), rate), iterations);

      expect(first).toBe(second);
    });

    it('approximates the configured failure rate over many iterations', () => {
      const rate = 0.3;
      const iterations = 10_000;
      const sim = new FailureSimulator(new MulberryRng(42), rate);

      const failures = countFailures(sim, iterations);
      const observed = failures / iterations;

      // ±3% tolerance for statistical noise at this sample size
      expect(observed).toBeGreaterThan(rate - 0.03);
      expect(observed).toBeLessThan(rate + 0.03);
    });
  });
});
