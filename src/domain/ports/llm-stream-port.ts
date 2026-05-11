import type { Role } from '@/domain/entities/message';

export interface LlmChatMessage {
  role: Role;
  content: string;
}

export interface LlmStreamInput {
  messages: readonly LlmChatMessage[];
  signal?: AbortSignal;
}

export interface LlmStreamPort {
  streamChat(input: LlmStreamInput): AsyncIterable<string>;
}
