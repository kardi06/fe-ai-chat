'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContainer } from '@/components/providers/app-container-provider';
import { SESSIONS_QUERY_KEY } from './use-sessions';

export function useCreateSession() {
  const { createSession } = useAppContainer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title?: string } = {}) => createSession.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });
}
