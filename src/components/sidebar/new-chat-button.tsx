'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCreateSession } from '@/hooks/use-create-session';

export function NewChatButton() {
  const router = useRouter();
  const { mutate, isPending } = useCreateSession();

  const handleClick = () => {
    mutate(
      {},
      {
        onSuccess: (session) => {
          router.push(`/sessions/${session.id}`);
        },
        onError: (error) => {
          toast.error('Failed to create chat', {
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        },
      },
    );
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start gap-2"
      onClick={handleClick}
      disabled={isPending}
    >
      <Plus className="size-4" />
      New chat
    </Button>
  );
}
