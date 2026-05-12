'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error('[app] route error', error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/70">Error ID: {error.digest}</p>
          )}
        </div>
        <Button onClick={reset} size="sm">
          <RotateCcw className="size-4" />
          Try again
        </Button>
        {isDev && error.stack && (
          <details className="w-full text-left">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              Stack trace (dev only)
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted p-3 text-[10px] leading-relaxed">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
