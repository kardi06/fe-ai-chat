'use client';

import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AppContainerProvider } from './app-container-provider';
import { QueryProvider } from './query-client-provider';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AppContainerProvider>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </AppContainerProvider>
    </ThemeProvider>
  );
}
