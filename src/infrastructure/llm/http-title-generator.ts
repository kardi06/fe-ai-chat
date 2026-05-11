import { z } from 'zod';
import type {
  TitleGenerationInput,
  TitleGeneratorPort,
} from '@/domain/ports/title-generator-port';

const TitleResponseSchema = z.object({
  title: z.string().min(1),
});

export class HttpTitleGenerator implements TitleGeneratorPort {
  constructor(private readonly endpoint: string = '/api/title') {}

  async generate(input: TitleGenerationInput): Promise<string> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Title API failed: HTTP ${response.status} ${detail}`.trim());
    }

    const json = (await response.json()) as unknown;
    return TitleResponseSchema.parse(json).title;
  }
}
