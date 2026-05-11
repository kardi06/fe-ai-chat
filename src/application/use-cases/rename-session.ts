import { SessionNotFoundError } from '@/domain/errors';
import type { Session } from '@/domain/entities/session';
import type { Clock } from '@/domain/ports/clock';
import type { SessionRepository } from '@/domain/ports/session-repository';
import type { SessionId } from '@/domain/value-objects/session-id';

export interface RenameSessionInput {
  id: SessionId;
  newTitle: string;
}

export class RenameSession {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: RenameSessionInput): Promise<Session> {
    const session = await this.sessions.findById(input.id);
    if (!session) {
      throw new SessionNotFoundError(input.id);
    }
    const renamed = session.rename(input.newTitle, this.clock.now());
    await this.sessions.save(renamed);
    return renamed;
  }
}
