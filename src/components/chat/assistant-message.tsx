import type { Message } from '@/domain/entities/message';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';

interface AssistantMessageProps {
  message: Message;
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  if (message.status === 'streaming' && message.content.length === 0) {
    return <TypingIndicator />;
  }

  if (message.status === 'failed') {
    return (
      <div className="text-sm text-destructive">
        Failed to generate response{message.error ? `: ${message.error}` : '.'}
      </div>
    );
  }

  return (
    <div className="group/message flex flex-col gap-1">
      <Markdown content={message.content} />
      {message.status === 'complete' && <MessageActions content={message.content} />}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2" aria-label="Assistant is typing">
      <span className="size-2 animate-pulse rounded-full bg-foreground/60" />
      <span className="size-2 animate-pulse rounded-full bg-foreground/60 [animation-delay:0.2s]" />
      <span className="size-2 animate-pulse rounded-full bg-foreground/60 [animation-delay:0.4s]" />
    </div>
  );
}
