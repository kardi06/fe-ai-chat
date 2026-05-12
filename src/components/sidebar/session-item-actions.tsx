'use client';

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Session } from '@/domain/entities/session';
import { useDeleteSession } from '@/hooks/use-delete-session';
import { RenameSessionDialog } from './rename-session-dialog';

interface SessionItemActionsProps {
  session: Session;
}

export function SessionItemActions({ session }: SessionItemActionsProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: deleteMutate } = useDeleteSession();

  const handleDelete = () => {
    deleteMutate(session.id, {
      onSuccess: () => {
        if (pathname === `/sessions/${session.id}`) {
          router.push('/');
        }
        toast.success('Conversation deleted');
      },
      onError: (error) => {
        toast.error('Failed to delete', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="opacity-0 transition-opacity group-hover/session-item:opacity-100 data-[state=open]:opacity-100"
            aria-label="Conversation actions"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenameOpen(true)}>
            <Pencil className="mr-2 size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <RenameSessionDialog
        session={session}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
    </>
  );
}
