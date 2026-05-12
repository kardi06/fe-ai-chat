'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppContainer } from '@/components/providers/app-container-provider';

export const SESSIONS_QUERY_KEY = ['sessions'] as const;

export function useSessions() {
  const { listSessions } = useAppContainer();
  return useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: () => listSessions.execute(),
  });
}
