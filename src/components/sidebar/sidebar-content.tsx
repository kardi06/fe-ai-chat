'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSessions } from '@/hooks/use-sessions';
import { groupSessionsByDate } from '@/lib/group-sessions-by-date';
import { EmptySessions } from './empty-sessions';
import { NewChatButton } from './new-chat-button';
import { SessionGroup } from './session-group';

export function SidebarContent() {
  return (
    <>
      <header className="flex h-14 items-center px-5">
        <h1 className="font-display text-lg font-medium tracking-tight">MyConnect.ai</h1>
      </header>
      <div className="px-3 pb-3">
        <NewChatButton />
      </div>
      <nav className="scrollbar-thin min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 pb-2">
        <SessionList />
      </nav>
      <footer className="flex h-12 items-center justify-end border-t border-sidebar-border px-3">
        <ThemeToggle />
      </footer>
    </>
  );
}

function SessionList() {
  const { data: sessions, isPending, isError } = useSessions();

  if (isPending) {
    return (
      <div className="flex flex-col gap-2 px-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="px-2 py-2 text-xs text-destructive">Failed to load conversations.</p>;
  }

  if (!sessions || sessions.length === 0) {
    return <EmptySessions />;
  }

  const groups = groupSessionsByDate(sessions);
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <SessionGroup key={group.label} group={group} />
      ))}
    </div>
  );
}
