'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppContainer } from '@/components/providers/app-container-provider';
import { makeSessionId } from '@/domain/value-objects/session-id';

export function sessionDetailQueryKey(id: string) {
  return ['sessions', id, 'detail'] as const;
}

export function useSessionDetail(id: string) {
  const { getSession } = useAppContainer();
  return useQuery({
    queryKey: sessionDetailQueryKey(id),
    queryFn: async () => {
      const sessionId = makeSessionId(id);
      return getSession.execute(sessionId);
    },
  });
}
