import { Message } from '@/domain/entities/message';
import { SessionNotFoundError } from '@/domain/errors';
import type { Clock } from '@/domain/ports/clock';
import type { IdGenerator } from '@/domain/ports/id-generator';
import type { MessageRepository } from '@/domain/ports/message-repository';
import type { SessionRepository } from '@/domain/ports/session-repository';
import { makeMessageId } from '@/domain/value-objects/message-id';
import type { SessionId } from '@/domain/value-objects/session-id';

export interface PostMessageInput {
  sessionId: SessionId;
  content: string;
}

export class PostMessage {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly messages: MessageRepository,
    private readonly clock: Clock,
    private readonly idGen: IdGenerator,
  ) {}

  async execute(input: PostMessageInput): Promise<Message> {
    const session = await this.sessions.findById(input.sessionId);
    if (!session) {
      throw new SessionNotFoundError(input.sessionId);
    }

    const now = this.clock.now();
    const message = Message.createUser({
      id: makeMessageId(this.idGen.generate()),
      sessionId: input.sessionId,
      content: input.content,
      createdAt: now,
    });

    await this.messages.append(message);
    await this.sessions.save(session.touch(now));
    return message;
  }
}
