'use client';

import * as Sentry from '@sentry/nextjs';
import { Bug } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function SentryDemoButton() {
  const handleClick = () => {
    const error = new Error(
      `Demo error from MyConnect.ai @ ${new Date().toISOString()}`,
    );
    Sentry.captureException(error, {
      tags: { source: 'demo-button' },
      level: 'info',
    });
    toast.success('Test error sent to Sentry', {
      description: 'Check your Sentry dashboard to verify the event arrived.',
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label="Send test error to Sentry"
      title="Send test error to Sentry"
    >
      <Bug className="size-4" />
    </Button>
  );
}
