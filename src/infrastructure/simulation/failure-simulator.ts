import type { Rng } from './seedable-rng';

export class SimulatedFailureError extends Error {
  constructor(message = 'Simulated failure') {
    super(message);
    this.name = 'SimulatedFailureError';
  }
}

export class FailureSimulator {
  constructor(
    private readonly rng: Rng,
    private readonly rate: number,
  ) {
    if (rate < 0 || rate > 1) {
      throw new RangeError(`rate must be in [0, 1], got ${rate}`);
    }
  }

  maybeFail(): void {
    if (this.rng.next() < this.rate) {
      throw new SimulatedFailureError();
    }
  }
}
