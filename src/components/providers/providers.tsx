'use client';

import type { ReactNode } from 'react';
import { AppContainerProvider } from './app-container-provider';
import { QueryProvider } from './query-client-provider';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AppContainerProvider>
        <QueryProvider>{children}</QueryProvider>
      </AppContainerProvider>
    </ThemeProvider>
  );
}
