'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContainer } from '@/components/providers/app-container-provider';
import type { SessionId } from '@/domain/value-objects/session-id';
import { SESSIONS_QUERY_KEY } from './use-sessions';

export function useRenameSession() {
  const { renameSession } = useAppContainer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: SessionId; newTitle: string }) => renameSession.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });
}
