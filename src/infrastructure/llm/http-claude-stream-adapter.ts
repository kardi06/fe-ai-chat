import type { LlmStreamInput, LlmStreamPort } from '@/domain/ports/llm-stream-port';

export class HttpClaudeStreamAdapter implements LlmStreamPort {
  constructor(private readonly endpoint: string = '/api/chat') {}

  async *streamChat(input: LlmStreamInput): AsyncIterable<string> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: input.messages }),
      signal: input.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Chat stream failed: HTTP ${response.status} ${detail}`.trim());
    }
    if (!response.body) {
      throw new Error('Chat stream response has no body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) yield chunk;
      }
      const tail = decoder.decode();
      if (tail) yield tail;
    } finally {
      reader.releaseLock();
    }
  }
}
