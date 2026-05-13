'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useSessionDetail } from '@/hooks/use-session-detail';
import { useStreamChat } from '@/hooks/use-stream-chat';
import { EmptyChatState } from './empty-chat-state';
import { MessageInput } from './message-input';
import { MessageList } from './message-list';

interface ChatPaneProps {
  sessionId: string;
}

export function ChatPane({ sessionId }: ChatPaneProps) {
  const [input, setInput] = useState('');
  const { data, isPending, isError } = useSessionDetail(sessionId);
  const { streamingMessage, isStreaming, send, stop } = useStreamChat(sessionId);

  if (isPending) {
    return (
      <main className="flex flex-1 flex-col">
        <div className="flex h-12 items-center border-b border-border px-6">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
          <Skeleton className="ml-auto h-12 w-2/3 rounded-2xl" />
          <Skeleton className="h-20 w-full" />
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Conversation not found.</p>
      </main>
    );
  }

  const allMessages = streamingMessage ? [...data.messages, streamingMessage] : data.messages;
  const showEmptyState = allMessages.length === 0;

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    setInput('');
    send(content).catch((err: unknown) => {
      toast.error('Failed to send message', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
      setInput(content);
    });
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 items-center border-b border-border px-6">
        <h2 className="font-display truncate text-base font-medium">{data.session.title}</h2>
      </header>
      {showEmptyState ? (
        <EmptyChatState onPromptSelect={setInput} />
      ) : (
        <MessageList messages={allMessages} />
      )}
      <div className="border-t border-border">
        <MessageInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onStop={stop}
          isStreaming={isStreaming}
        />
      </div>
    </main>
  );
}
