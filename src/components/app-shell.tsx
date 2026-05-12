import type { ReactNode } from 'react';
import { Sidebar } from '@/components/sidebar/sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
