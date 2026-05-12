'use client';

import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useSessionDetail } from '@/hooks/use-session-detail';
import { useStreamChat } from '@/hooks/use-stream-chat';
import { MessageInput } from './message-input';
import { MessageList } from './message-list';

interface ChatPaneProps {
  sessionId: string;
}

export function ChatPane({ sessionId }: ChatPaneProps) {
  const { data, isPending, isError } = useSessionDetail(sessionId);
  const { streamingMessage, isStreaming, send, stop } = useStreamChat(sessionId);

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex h-12 items-center border-b border-border px-6">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
          <Skeleton className="ml-auto h-12 w-2/3 rounded-2xl" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Conversation not found.</p>
      </div>
    );
  }

  const allMessages = streamingMessage ? [...data.messages, streamingMessage] : data.messages;

  const handleSend = (content: string) => {
    send(content).catch((err: unknown) => {
      toast.error('Failed to send message', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-12 items-center border-b border-border px-6">
        <h2 className="truncate text-sm font-medium">{data.session.title}</h2>
      </header>
      <MessageList messages={allMessages} />
      <div className="border-t border-border">
        <MessageInput onSend={handleSend} onStop={stop} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
