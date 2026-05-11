import { EmptyMessageContentError, MessageStateError } from '@/domain/errors';
import type { MessageId } from '@/domain/value-objects/message-id';
import type { SessionId } from '@/domain/value-objects/session-id';

export type Role = 'user' | 'assistant';
export type MessageStatus = 'streaming' | 'complete' | 'failed';

export class Message {
  private constructor(
    public readonly id: MessageId,
    public readonly sessionId: SessionId,
    public readonly role: Role,
    public readonly content: string,
    public readonly status: MessageStatus,
    public readonly createdAt: Date,
    public readonly error: string | null,
  ) {}

  static createUser(props: {
    id: MessageId;
    sessionId: SessionId;
    content: string;
    createdAt: Date;
  }): Message {
    const trimmed = props.content.trim();
    if (trimmed.length === 0) {
      throw new EmptyMessageContentError();
    }
    return new Message(
      props.id,
      props.sessionId,
      'user',
      trimmed,
      'complete',
      props.createdAt,
      null,
    );
  }

  static createAssistantPlaceholder(props: {
    id: MessageId;
    sessionId: SessionId;
    createdAt: Date;
  }): Message {
    return new Message(
      props.id,
      props.sessionId,
      'assistant',
      '',
      'streaming',
      props.createdAt,
      null,
    );
  }

  static reconstitute(props: {
    id: MessageId;
    sessionId: SessionId;
    role: Role;
    content: string;
    status: MessageStatus;
    createdAt: Date;
    error: string | null;
  }): Message {
    return new Message(
      props.id,
      props.sessionId,
      props.role,
      props.content,
      props.status,
      props.createdAt,
      props.error,
    );
  }

  appendDelta(delta: string): Message {
    if (this.role !== 'assistant') {
      throw new MessageStateError(this.role, 'append delta to');
    }
    if (this.status !== 'streaming') {
      throw new MessageStateError(this.status, 'append delta to');
    }
    return new Message(
      this.id,
      this.sessionId,
      this.role,
      this.content + delta,
      'streaming',
      this.createdAt,
      null,
    );
  }

  complete(): Message {
    if (this.status !== 'streaming') {
      throw new MessageStateError(this.status, 'complete');
    }
    return new Message(
      this.id,
      this.sessionId,
      this.role,
      this.content,
      'complete',
      this.createdAt,
      null,
    );
  }

  fail(error: string): Message {
    if (this.status !== 'streaming') {
      throw new MessageStateError(this.status, 'fail');
    }
    return new Message(
      this.id,
      this.sessionId,
      this.role,
      this.content,
      'failed',
      this.createdAt,
      error,
    );
  }
}
