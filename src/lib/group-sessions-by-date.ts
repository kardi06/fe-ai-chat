import { isAfter, isToday, isYesterday, subDays } from 'date-fns';
import type { Session } from '@/domain/entities/session';

export type SessionGroupLabel =
  | 'Today'
  | 'Yesterday'
  | 'Previous 7 days'
  | 'Previous 30 days'
  | 'Older';

export interface SessionGroup {
  label: SessionGroupLabel;
  sessions: readonly Session[];
}

const ORDER: SessionGroupLabel[] = [
  'Today',
  'Yesterday',
  'Previous 7 days',
  'Previous 30 days',
  'Older',
];

function bucketFor(date: Date, now: Date): SessionGroupLabel {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isAfter(date, subDays(now, 7))) return 'Previous 7 days';
  if (isAfter(date, subDays(now, 30))) return 'Previous 30 days';
  return 'Older';
}

export function groupSessionsByDate(
  sessions: readonly Session[],
  now: Date = new Date(),
): readonly SessionGroup[] {
  const buckets = new Map<SessionGroupLabel, Session[]>();
  for (const session of sessions) {
    const label = bucketFor(session.updatedAt, now);
    const list = buckets.get(label);
    if (list) {
      list.push(session);
    } else {
      buckets.set(label, [session]);
    }
  }
  return ORDER.flatMap((label) => {
    const list = buckets.get(label);
    return list && list.length > 0 ? [{ label, sessions: list }] : [];
  });
}
