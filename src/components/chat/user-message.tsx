import type { Message } from '@/domain/entities/message';

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl bg-secondary px-4 py-2.5 text-sm text-secondary-foreground">
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
