'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { codeToHtml } from 'shiki';

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  return (
    <div className="text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
          h1: ({ children }) => <h1 className="my-3 text-lg font-semibold">{children}</h1>,
          h2: ({ children }) => <h2 className="my-3 text-base font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="my-2 text-sm font-semibold">{children}</h3>,
          ul: ({ children }) => <ul className="my-3 list-disc pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal pl-6">{children}</ol>,
          li: ({ children }) => <li className="my-1">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-border pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted px-2 py-1 text-left font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className ?? '');
            const lang = match?.[1];
            const text = String(children).replace(/\n$/, '');
            if (lang) {
              return <CodeBlock code={text} lang={lang} />;
            }
            if (text.includes('\n')) {
              return (
                <pre className="my-3 overflow-x-auto rounded-lg bg-zinc-900 p-3 font-mono text-xs text-zinc-50">
                  <code>{text}</code>
                </pre>
              );
            }
            return (
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    codeToHtml(code, { lang, theme: 'github-dark' })
      .then(setHtml)
      .catch(() => {
        setHtml(null);
      });
  }, [code, lang]);

  if (!html) {
    return (
      <pre className="my-3 overflow-x-auto rounded-lg bg-zinc-900 p-3 font-mono text-xs text-zinc-50">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="my-3 overflow-x-auto rounded-lg text-xs [&>pre]:overflow-x-auto [&>pre]:p-3"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
