import { AppShell } from '@/components/app-shell';

export default function Home() {
  return (
    <AppShell>
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Welcome to MyConnect.ai
          </h2>
          <p className="text-sm text-muted-foreground">
            Click <span className="font-medium text-foreground">New chat</span> in the sidebar to
            start a conversation, or pick one from your history.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
