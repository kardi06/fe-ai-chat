'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  content: string;
  align?: 'start' | 'end';
}

export function MessageActions({ content, align = 'start' }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // clipboard not available; silently ignore
    }
  };

  return (
    <div
      className={cn(
        'flex opacity-0 transition-opacity group-hover/message:opacity-100',
        align === 'end' && 'justify-end',
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={handleCopy}
        aria-label="Copy message"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      </Button>
    </div>
  );
}
