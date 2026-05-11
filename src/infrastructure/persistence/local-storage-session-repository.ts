import { Session } from '@/domain/entities/session';
import type { SessionRepository } from '@/domain/ports/session-repository';
import type { SessionId } from '@/domain/value-objects/session-id';

interface SessionDto {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'myconnect:sessions';

function toDto(session: Session): SessionDto {
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

function toEntity(dto: SessionDto): Session {
  return Session.reconstitute({
    id: dto.id as SessionId,
    title: dto.title,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  });
}

export class LocalStorageSessionRepository implements SessionRepository {
  constructor(private readonly storage: Storage = globalThis.localStorage) {}

  async list(): Promise<readonly Session[]> {
    return this.readDtos().map(toEntity);
  }

  async findById(id: SessionId): Promise<Session | null> {
    const dto = this.readDtos().find((d) => d.id === id);
    return dto ? toEntity(dto) : null;
  }

  async save(session: Session): Promise<void> {
    const dtos = this.readDtos();
    const idx = dtos.findIndex((d) => d.id === session.id);
    const dto = toDto(session);
    if (idx >= 0) {
      dtos[idx] = dto;
    } else {
      dtos.push(dto);
    }
    this.writeDtos(dtos);
  }

  async delete(id: SessionId): Promise<void> {
    const filtered = this.readDtos().filter((d) => d.id !== id);
    this.writeDtos(filtered);
  }

  private readDtos(): SessionDto[] {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as SessionDto[]) : [];
    } catch {
      return [];
    }
  }

  private writeDtos(dtos: SessionDto[]): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(dtos));
  }
}
