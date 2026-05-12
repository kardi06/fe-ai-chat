'use client';

import { Menu } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SidebarContent } from './sidebar-content';
import { SidebarCloseContext } from './sidebar-context';

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open sidebar">
          <Menu className="size-4" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />
        <DialogPrimitive.Content
          className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar shadow-xl duration-200 data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left"
        >
          <DialogPrimitive.Title className="sr-only">Conversation sidebar</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Browse your conversations, start a new chat, or toggle theme.
          </DialogPrimitive.Description>
          <SidebarCloseContext.Provider value={() => setOpen(false)}>
            <SidebarContent />
          </SidebarCloseContext.Provider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
