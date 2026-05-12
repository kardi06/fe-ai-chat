import type { Message } from '@/domain/entities/message';
import { MessageActions } from './message-actions';

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="group/message flex flex-col items-end gap-1">
      <div className="max-w-[85%] rounded-2xl bg-secondary px-4 py-2.5 text-sm text-secondary-foreground">
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      <MessageActions content={message.content} align="end" />
    </div>
  );
}
