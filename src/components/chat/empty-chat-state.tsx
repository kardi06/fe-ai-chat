'use client';

import { Mail, MessageCircleQuestion, Sparkles, Users } from 'lucide-react';

interface EmptyChatStateProps {
  onPromptSelect: (prompt: string) => void;
}

const SUGGESTED_PROMPTS = [
  {
    icon: Mail,
    title: 'Draft an intro message',
    prompt: 'Help me draft an intro message to a new connection I met at a conference.',
  },
  {
    icon: MessageCircleQuestion,
    title: 'Networking questions',
    prompt: 'What are good questions to deepen a casual networking conversation?',
  },
  {
    icon: Users,
    title: 'Find common ground',
    prompt:
      'Suggest ways to find common ground with someone from a different industry than mine.',
  },
  {
    icon: Sparkles,
    title: 'Follow-up after coffee chat',
    prompt:
      'Help me write a thoughtful follow-up message after a coffee chat with someone I met today.',
  },
];

export function EmptyChatState({ onPromptSelect }: EmptyChatStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <h2 className="text-2xl font-medium tracking-tight">How can I help you connect today?</h2>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.title}
              type="button"
              onClick={() => onPromptSelect(p.prompt)}
              className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/20 hover:bg-muted/40"
            >
              <Icon className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{p.title}</span>
              <span className="line-clamp-2 text-xs text-muted-foreground">{p.prompt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
