'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Session } from '@/domain/entities/session';

interface SessionItemProps {
  session: Session;
}

export function SessionItem({ session }: SessionItemProps) {
  const pathname = usePathname();
  const href = `/sessions/${session.id}`;
  const active = pathname === href;

  return (
    <Link
      href={href}
      title={session.title}
      className={cn(
        'flex items-center rounded-md px-2.5 py-1.5 text-sm transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-foreground/80 hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <span className="truncate">{session.title}</span>
    </Link>
  );
}
