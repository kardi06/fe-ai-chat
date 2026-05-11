import { Message, type MessageStatus, type Role } from '@/domain/entities/message';
import type { MessageRepository } from '@/domain/ports/message-repository';
import type { MessageId } from '@/domain/value-objects/message-id';
import type { SessionId } from '@/domain/value-objects/session-id';

interface MessageDto {
  id: string;
  sessionId: string;
  role: Role;
  content: string;
  status: MessageStatus;
  createdAt: string;
  error: string | null;
}

const STORAGE_KEY_PREFIX = 'myconnect:messages:';

function keyFor(sessionId: SessionId): string {
  return `${STORAGE_KEY_PREFIX}${sessionId}`;
}

function toDto(message: Message): MessageDto {
  return {
    id: message.id,
    sessionId: message.sessionId,
    role: message.role,
    content: message.content,
    status: message.status,
    createdAt: message.createdAt.toISOString(),
    error: message.error,
  };
}

function toEntity(dto: MessageDto): Message {
  return Message.reconstitute({
    id: dto.id as MessageId,
    sessionId: dto.sessionId as SessionId,
    role: dto.role,
    content: dto.content,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    error: dto.error,
  });
}

export class LocalStorageMessageRepository implements MessageRepository {
  constructor(private readonly storage: Storage = globalThis.localStorage) {}

  async listBySessionId(sessionId: SessionId): Promise<readonly Message[]> {
    return this.readDtos(sessionId).map(toEntity);
  }

  async append(message: Message): Promise<void> {
    const dtos = this.readDtos(message.sessionId);
    dtos.push(toDto(message));
    this.writeDtos(message.sessionId, dtos);
  }

  async update(message: Message): Promise<void> {
    const dtos = this.readDtos(message.sessionId);
    const idx = dtos.findIndex((d) => d.id === message.id);
    if (idx >= 0) {
      dtos[idx] = toDto(message);
    } else {
      dtos.push(toDto(message));
    }
    this.writeDtos(message.sessionId, dtos);
  }

  async deleteBySessionId(sessionId: SessionId): Promise<void> {
    this.storage.removeItem(keyFor(sessionId));
  }

  private readDtos(sessionId: SessionId): MessageDto[] {
    const raw = this.storage.getItem(keyFor(sessionId));
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as MessageDto[]) : [];
    } catch {
      return [];
    }
  }

  private writeDtos(sessionId: SessionId, dtos: MessageDto[]): void {
    this.storage.setItem(keyFor(sessionId), JSON.stringify(dtos));
  }
}
