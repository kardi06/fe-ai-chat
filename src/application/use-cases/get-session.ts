import type { Message } from '@/domain/entities/message';
import type { Session } from '@/domain/entities/session';
import type { MessageRepository } from '@/domain/ports/message-repository';
import type { SessionRepository } from '@/domain/ports/session-repository';
import type { SessionId } from '@/domain/value-objects/session-id';

export interface SessionDetail {
  session: Session;
  messages: readonly Message[];
}

export class GetSession {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly messages: MessageRepository,
  ) {}

  async execute(id: SessionId): Promise<SessionDetail | null> {
    const session = await this.sessions.findById(id);
    if (!session) return null;
    const messages = await this.messages.listBySessionId(id);
    return { session, messages };
  }
}
