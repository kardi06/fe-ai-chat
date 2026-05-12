import type { SessionGroup as SessionGroupData } from '@/lib/group-sessions-by-date';
import { SessionItem } from './session-item';

interface SessionGroupProps {
  group: SessionGroupData;
}

export function SessionGroup({ group }: SessionGroupProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <h3 className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {group.label}
      </h3>
      <div className="flex flex-col gap-px">
        {group.sessions.map((session) => (
          <SessionItem key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
