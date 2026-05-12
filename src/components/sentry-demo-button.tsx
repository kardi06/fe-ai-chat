'use client';

import * as Sentry from '@sentry/nextjs';
import { Bug } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function SentryDemoButton() {
  const handleClick = () => {
    if (!Sentry.getClient()) {
      toast.warning('Sentry not configured', {
        description:
          'Set NEXT_PUBLIC_SENTRY_DSN in .env.local and restart the dev server.',
      });
      return;
    }

    const error = new Error(
      `Demo error from MyConnect.ai @ ${new Date().toISOString()}`,
    );
    const eventId = Sentry.captureException(error, {
      tags: { source: 'demo-button' },
      level: 'info',
    });

    toast.success('Test error sent to Sentry', {
      description: `Event ID: ${eventId.slice(0, 8)}… — check your dashboard.`,
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
