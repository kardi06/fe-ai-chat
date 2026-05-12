'use client';

import { ArrowUp, Square } from 'lucide-react';
import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function MessageInput({ onSend, onStop, isStreaming }: MessageInputProps) {
  const [content, setContent] = useState('');
  const canSend = content.trim().length > 0 && !isStreaming;

  const submit = () => {
    if (!canSend) return;
    onSend(content.trim());
    setContent('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 py-3"
    >
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Send a message…"
        disabled={isStreaming}
        className="max-h-[200px] min-h-10 resize-none"
      />
      {isStreaming ? (
        <Button
          type="button"
          size="icon"
          variant="destructive"
          onClick={onStop}
          aria-label="Stop generating"
        >
          <Square className="size-4" />
        </Button>
      ) : (
        <Button type="submit" size="icon" disabled={!canSend} aria-label="Send message">
          <ArrowUp className="size-4" />
        </Button>
      )}
    </form>
  );
}
