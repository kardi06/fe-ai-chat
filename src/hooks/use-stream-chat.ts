'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { useAppContainer } from '@/components/providers/app-container-provider';
import { Message } from '@/domain/entities/message';
import { DEFAULT_TITLE } from '@/domain/entities/session';
import { makeMessageId } from '@/domain/value-objects/message-id';
import { makeSessionId } from '@/domain/value-objects/session-id';
import type { SessionDetail } from '@/application/use-cases/get-session';
import { sessionDetailQueryKey } from './use-session-detail';
import { SESSIONS_QUERY_KEY } from './use-sessions';

export interface UseStreamChatResult {
  streamingMessage: Message | null;
  isStreaming: boolean;
  send: (content: string) => Promise<void>;
  stop: () => void;
}

export function useStreamChat(sessionIdRaw: string): UseStreamChatResult {
  const { postMessage, finalizeAssistantMessage, generateTitle, llmStream } = useAppContainer();
  const queryClient = useQueryClient();
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (content: string) => {
      if (abortRef.current) return;

      const sessionId = makeSessionId(sessionIdRaw);
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      const cachedDetail = queryClient.getQueryData<SessionDetail | null>(
        sessionDetailQueryKey(sessionIdRaw),
      );
      const previousMessages = cachedDetail?.messages ?? [];
      const previousTitle = cachedDetail?.session.title ?? '';
      const isFirstExchange = previousMessages.length === 0;

      let placeholder: Message | null = null;

      try {
        const userMessage = await postMessage.execute({ sessionId, content });
        queryClient.invalidateQueries({ queryKey: sessionDetailQueryKey(sessionIdRaw) });
        queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });

        const history = [...previousMessages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        placeholder = Message.createAssistantPlaceholder({
          id: makeMessageId(crypto.randomUUID()),
          sessionId,
          createdAt: new Date(),
        });
        setStreamingMessage(placeholder);

        for await (const delta of llmStream.streamChat({
          messages: history,
          signal: controller.signal,
        })) {
          placeholder = placeholder.appendDelta(delta);
          setStreamingMessage(placeholder);
        }

        placeholder = placeholder.complete();
        if (placeholder.content.length > 0) {
          await finalizeAssistantMessage.execute({
            sessionId,
            content: placeholder.content,
          });
          queryClient.invalidateQueries({ queryKey: sessionDetailQueryKey(sessionIdRaw) });

          if (isFirstExchange && previousTitle === DEFAULT_TITLE) {
            const assistantContent = placeholder.content;
            void generateTitle
              .execute({
                sessionId,
                userMessage: content,
                assistantMessage: assistantContent,
              })
              .then(() => {
                queryClient.invalidateQueries({ queryKey: sessionDetailQueryKey(sessionIdRaw) });
                queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
              })
              .catch(() => {
                // title generation is nice-to-have; ignore failures
              });
          }
        }
      } catch (err) {
        if (controller.signal.aborted && placeholder && placeholder.content.length > 0) {
          try {
            await finalizeAssistantMessage.execute({
              sessionId,
              content: placeholder.content,
            });
            queryClient.invalidateQueries({ queryKey: sessionDetailQueryKey(sessionIdRaw) });
          } catch {
            // best effort
          }
        } else {
          throw err;
        }
      } finally {
        setStreamingMessage(null);
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [sessionIdRaw, postMessage, finalizeAssistantMessage, generateTitle, llmStream, queryClient],
  );

  return { streamingMessage, isStreaming, send, stop };
}
