'use client';

import { use } from 'react';
import { AppShell } from '@/components/app-shell';
import { ChatPane } from '@/components/chat/chat-pane';

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AppShell>
      <ChatPane sessionId={id} />
    </AppShell>
  );
}
