import type { Session } from '@/domain/entities/session';
import type { SessionId } from '@/domain/value-objects/session-id';

export interface SessionRepository {
  list(): Promise<readonly Session[]>;
  findById(id: SessionId): Promise<Session | null>;
  save(session: Session): Promise<void>;
  delete(id: SessionId): Promise<void>;
}
