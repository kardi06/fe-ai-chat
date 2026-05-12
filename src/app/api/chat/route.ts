import { anthropic } from '@ai-sdk/anthropic';
import * as Sentry from '@sentry/nextjs';
import { streamText } from 'ai';
import { z } from 'zod';

const ChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .min(1),
});

const SYSTEM_PROMPT =
  'You are a helpful AI assistant for the MyConnect.ai platform, focused on relationship-building and networking. Help users craft thoughtful intro messages, find common ground with new connections, and improve their networking conversations. Be warm, specific, and actionable.';

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

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.message }, { status: 400 });
  }

  try {
    const result = streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: SYSTEM_PROMPT,
      messages: parsed.data.messages,
    });
    return result.toTextStreamResponse();
  } catch (err) {
    Sentry.captureException(err, { tags: { route: '/api/chat' } });
    console.error('[/api/chat] stream initialization failed', err);
    return Response.json({ error: 'Failed to initialize chat stream' }, { status: 500 });
  }
}
