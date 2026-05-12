'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Session } from '@/domain/entities/session';
import { SessionItemActions } from './session-item-actions';

interface SessionItemProps {
  session: Session;
}

export function SessionItem({ session }: SessionItemProps) {
  const pathname = usePathname();
  const href = `/sessions/${session.id}`;
  const active = pathname === href;

  return (
    <div
      className={cn(
        'group/session-item relative flex items-center rounded-md transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-foreground/80 hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <Link
        href={href}
        title={session.title}
        className="flex min-w-0 flex-1 items-center px-2.5 py-1.5 text-sm"
      >
        <span className="truncate">{session.title}</span>
      </Link>
      <div className="pr-1">
        <SessionItemActions session={session} />
      </div>
    </div>
  );
}
