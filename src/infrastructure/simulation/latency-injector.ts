import type { Rng } from './seedable-rng';

export class LatencyInjector {
  constructor(
    private readonly rng: Rng,
    private readonly minMs: number,
    private readonly maxMs: number,
  ) {
    if (minMs < 0 || maxMs < minMs) {
      throw new RangeError(`invalid latency range: [${minMs}, ${maxMs}]`);
    }
  }

  async wait(): Promise<void> {
    const ms = this.minMs + this.rng.next() * (this.maxMs - this.minMs);
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
