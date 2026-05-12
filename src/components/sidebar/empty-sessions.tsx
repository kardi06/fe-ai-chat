import { MessageSquare } from 'lucide-react';

export function EmptySessions() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
      <MessageSquare className="size-6 text-muted-foreground/60" />
      <p className="text-xs text-muted-foreground">No conversations yet.</p>
      <p className="text-xs text-muted-foreground/70">Start a new chat to begin.</p>
    </div>
  );
}
