import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { z } from 'zod';

const TitleRequestSchema = z.object({
  userMessage: z.string().min(1).max(10000),
  assistantMessage: z.string().min(1).max(10000),
});

const SYSTEM_PROMPT =
  'You generate concise 3-5 word titles summarizing a brief exchange. Respond with ONLY the title text — no quotes, no punctuation, no commentary, no prefix.';

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not configured on the server' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = TitleRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.message }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: SYSTEM_PROMPT,
      prompt: `User: ${parsed.data.userMessage}\n\nAssistant: ${parsed.data.assistantMessage}\n\nTitle:`,
      maxOutputTokens: 32,
    });

    const title = text
      .trim()
      .replace(/^["'`]+|["'`]+$/g, '')
      .slice(0, 100);

    if (!title) {
      return Response.json({ error: 'Empty title generated' }, { status: 502 });
    }

    return Response.json({ title });
  } catch (err) {
    console.error('[/api/title] generation failed', err);
    return Response.json({ error: 'Failed to generate title' }, { status: 500 });
  }
}
