import { Message } from '@/domain/entities/message';
import { SessionNotFoundError } from '@/domain/errors';
import type { Clock } from '@/domain/ports/clock';
import type { IdGenerator } from '@/domain/ports/id-generator';
import type { MessageRepository } from '@/domain/ports/message-repository';
import type { SessionRepository } from '@/domain/ports/session-repository';
import { makeMessageId } from '@/domain/value-objects/message-id';
import type { SessionId } from '@/domain/value-objects/session-id';

export interface FinalizeAssistantMessageInput {
  sessionId: SessionId;
  content: string;
}

export class FinalizeAssistantMessage {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly messages: MessageRepository,
    private readonly clock: Clock,
    private readonly idGen: IdGenerator,
  ) {}

  async execute(input: FinalizeAssistantMessageInput): Promise<Message> {
    const session = await this.sessions.findById(input.sessionId);
    if (!session) {
      throw new SessionNotFoundError(input.sessionId);
    }

    const now = this.clock.now();
    const finalized = Message.createAssistantPlaceholder({
      id: makeMessageId(this.idGen.generate()),
      sessionId: input.sessionId,
      createdAt: now,
    })
      .appendDelta(input.content)
      .complete();

    await this.messages.append(finalized);
    await this.sessions.save(session.touch(now));
    return finalized;
  }
}
