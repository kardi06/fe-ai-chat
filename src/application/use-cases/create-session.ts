import { Session } from '@/domain/entities/session';
import type { Clock } from '@/domain/ports/clock';
import type { IdGenerator } from '@/domain/ports/id-generator';
import type { SessionRepository } from '@/domain/ports/session-repository';
import { makeSessionId } from '@/domain/value-objects/session-id';

export interface CreateSessionInput {
  title?: string;
}

export class CreateSession {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly clock: Clock,
    private readonly idGen: IdGenerator,
  ) {}

  async execute(input: CreateSessionInput = {}): Promise<Session> {
    const session = Session.create({
      id: makeSessionId(this.idGen.generate()),
      createdAt: this.clock.now(),
      title: input.title,
    });
    await this.sessions.save(session);
    return session;
  }
}
