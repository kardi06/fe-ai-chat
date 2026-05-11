import { SessionNotFoundError } from '@/domain/errors';
import type { Session } from '@/domain/entities/session';
import type { Clock } from '@/domain/ports/clock';
import type { SessionRepository } from '@/domain/ports/session-repository';
import type { TitleGeneratorPort } from '@/domain/ports/title-generator-port';
import type { SessionId } from '@/domain/value-objects/session-id';

export interface GenerateTitleInput {
  sessionId: SessionId;
  userMessage: string;
  assistantMessage: string;
}

export class GenerateTitle {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly titleGen: TitleGeneratorPort,
    private readonly clock: Clock,
  ) {}

  async execute(input: GenerateTitleInput): Promise<Session> {
    const session = await this.sessions.findById(input.sessionId);
    if (!session) {
      throw new SessionNotFoundError(input.sessionId);
    }

    const title = await this.titleGen.generate({
      userMessage: input.userMessage,
      assistantMessage: input.assistantMessage,
    });

    const renamed = session.rename(title, this.clock.now());
    await this.sessions.save(renamed);
    return renamed;
  }
}
