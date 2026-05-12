'use client';

import { ArrowUp, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function MessageInput({ value, onChange, onSend, onStop, isStreaming }: MessageInputProps) {
  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSend();
      }}
      className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 py-3"
    >
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (canSend) onSend();
          }
        }}
        rows={1}
        placeholder="Send a message…"
        disabled={isStreaming}
        className="max-h-50 min-h-10 resize-none"
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
