'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          background: '#fafafa',
          color: '#171717',
        }}
      >
        <div
          style={{
            maxWidth: '32rem',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ margin: '0 0 1.5rem', color: '#525252', fontSize: '0.875rem' }}>
            {error.message || 'An unexpected application error occurred.'}
          </p>
          {error.digest && (
            <p
              style={{
                margin: '0 0 1.5rem',
                fontSize: '0.75rem',
                color: '#a3a3a3',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#fafafa',
              background: '#171717',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
