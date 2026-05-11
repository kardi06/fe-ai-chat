import type { MessageRepository } from '@/domain/ports/message-repository';
import type { SessionRepository } from '@/domain/ports/session-repository';
import type { SessionId } from '@/domain/value-objects/session-id';

export class DeleteSession {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly messages: MessageRepository,
  ) {}

  async execute(id: SessionId): Promise<void> {
    await this.messages.deleteBySessionId(id);
    await this.sessions.delete(id);
  }
}
