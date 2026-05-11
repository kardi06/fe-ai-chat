import { InvalidTitleError } from '@/domain/errors';
import type { SessionId } from '@/domain/value-objects/session-id';

export const MAX_TITLE_LENGTH = 200;
export const DEFAULT_TITLE = 'New chat';

function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new InvalidTitleError('title is empty');
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new InvalidTitleError(`title exceeds ${MAX_TITLE_LENGTH} chars`);
  }
  return trimmed;
}

export class Session {
  private constructor(
    public readonly id: SessionId,
    public readonly title: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: { id: SessionId; createdAt: Date; title?: string }): Session {
    const title = validateTitle(props.title ?? DEFAULT_TITLE);
    return new Session(props.id, title, props.createdAt, props.createdAt);
  }

  static reconstitute(props: {
    id: SessionId;
    title: string;
    createdAt: Date;
    updatedAt: Date;
  }): Session {
    return new Session(props.id, props.title, props.createdAt, props.updatedAt);
  }

  rename(newTitle: string, now: Date): Session {
    const title = validateTitle(newTitle);
    return new Session(this.id, title, this.createdAt, now);
  }

  touch(now: Date): Session {
    return new Session(this.id, this.title, this.createdAt, now);
  }
}
