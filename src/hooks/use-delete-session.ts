'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContainer } from '@/components/providers/app-container-provider';
import type { SessionId } from '@/domain/value-objects/session-id';
import { SESSIONS_QUERY_KEY } from './use-sessions';

export function useDeleteSession() {
  const { deleteSession } = useAppContainer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: SessionId) => deleteSession.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });
}
