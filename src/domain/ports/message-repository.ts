import type { Message } from '@/domain/entities/message';
import type { SessionId } from '@/domain/value-objects/session-id';

export interface MessageRepository {
  listBySessionId(sessionId: SessionId): Promise<readonly Message[]>;
  append(message: Message): Promise<void>;
  update(message: Message): Promise<void>;
  deleteBySessionId(sessionId: SessionId): Promise<void>;
}
