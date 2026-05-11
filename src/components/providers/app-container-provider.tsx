'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { buildContainer, type AppContainer } from '@/infrastructure/composition';

const AppContainerContext = createContext<AppContainer | null>(null);

export function AppContainerProvider({ children }: { children: ReactNode }) {
  const container = useMemo(() => buildContainer(), []);
  return (
    <AppContainerContext.Provider value={container}>{children}</AppContainerContext.Provider>
  );
}

export function useAppContainer(): AppContainer {
  const container = useContext(AppContainerContext);
  if (!container) {
    throw new Error('useAppContainer must be called inside <AppContainerProvider>');
  }
  return container;
}
