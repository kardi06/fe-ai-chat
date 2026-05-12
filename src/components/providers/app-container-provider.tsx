'use client';

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { buildContainer, type AppContainer } from '@/infrastructure/composition';

const AppContainerContext = createContext<AppContainer | null>(null);

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

export function AppContainerProvider({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  const container = useMemo(() => (isClient ? buildContainer() : null), [isClient]);

  if (!container) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

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
