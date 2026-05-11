import type { Session } from '@/domain/entities/session';
import type { SessionRepository } from '@/domain/ports/session-repository';

export class ListSessions {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(): Promise<readonly Session[]> {
    const sessions = await this.sessions.list();
    return [...sessions].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
}
