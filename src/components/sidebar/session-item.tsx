'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Session } from '@/domain/entities/session';
import { useSidebarClose } from './sidebar-context';
import { SessionItemActions } from './session-item-actions';

interface SessionItemProps {
  session: Session;
}

export function SessionItem({ session }: SessionItemProps) {
  const pathname = usePathname();
  const closeSidebar = useSidebarClose();
  const href = `/sessions/${session.id}`;
  const active = pathname === href;

  return (
    <div
      className={cn(
        'group/session-item relative flex items-center rounded-lg transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
      )}
    >
      <Link
        href={href}
        title={session.title}
        onClick={closeSidebar}
        className="min-w-0 flex-1 truncate px-3 py-2 text-sm"
      >
        {session.title}
      </Link>
      <div className="shrink-0 pr-1.5">
        <SessionItemActions session={session} />
      </div>
    </div>
  );
}
