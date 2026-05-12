import { AppShell } from '@/components/app-shell';

export default function Home() {
  return (
    <AppShell>
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="flex max-w-md flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-medium tracking-tight">Start a new conversation</h2>
          <p className="text-sm text-muted-foreground">
            Click <span className="font-medium">New chat</span> in the sidebar to begin. The chat
            pane mounts in Phase 5.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
