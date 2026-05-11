import type { PostMessage, PostMessageInput } from '@/application/use-cases/post-message';
import type { Message } from '@/domain/entities/message';
import type { FailureSimulator } from './failure-simulator';
import type { LatencyInjector } from './latency-injector';

export interface PostMessageUseCase {
  execute(input: PostMessageInput): Promise<Message>;
}

export class SimulatedPostMessage implements PostMessageUseCase {
  constructor(
    private readonly inner: PostMessage,
    private readonly failureSimulator: FailureSimulator,
    private readonly latencyInjector: LatencyInjector,
  ) {}

  async execute(input: PostMessageInput): Promise<Message> {
    await this.latencyInjector.wait();
    this.failureSimulator.maybeFail();
    return this.inner.execute(input);
  }
}
