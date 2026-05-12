'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Session } from '@/domain/entities/session';
import { useRenameSession } from '@/hooks/use-rename-session';

interface RenameSessionDialogProps {
  session: Session;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameSessionDialog({ session, open, onOpenChange }: RenameSessionDialogProps) {
  const [title, setTitle] = useState(session.title);
  const { mutate, isPending } = useRenameSession();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || trimmed === session.title) {
      onOpenChange(false);
      return;
    }
    mutate(
      { id: session.id, newTitle: trimmed },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error('Failed to rename', {
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
            <DialogDescription>Choose a new title for this conversation.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            placeholder="Conversation title"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
