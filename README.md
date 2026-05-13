# MyConnect.ai — AI Session Manager

A Next.js + TypeScript chat application that lets users view, create, and manage AI conversations. Built as a take-home submission for the MyConnect.ai Senior Front-End Engineer role.

- **Live demo:** <https://myconnect-ai-fe.vercel.app/>

---

## Table of contents

- [Overview](#overview)
- [Stack](#stack)
- [Architecture](#architecture-ports--adapters-with-ddd-layering)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Observability](#observability)
- [Deployment](#deployment)
- [Trade-offs and intentional limitations](#trade-offs-and-intentional-limitations)

---

## Overview

The app simulates a production-grade chat workspace:

- **Session list** — date-grouped (Today / Yesterday / 7 days / 30 days / Older), with rename and delete via per-row kebab menu.
- **Session detail** — streaming assistant responses with typing indicator, markdown rendering (incl. syntax-highlighted code blocks via Shiki), stop generating, copy on hover, and auto-generated titles.
- **Realistic API behavior** — `POST /api/messages` is decorated with an artificial latency injector and a configurable failure simulator (~10% by default). On failure, the user's input is restored and a toast surfaces the error.
- **Streaming** — `/api/chat` proxies Claude via the Vercel AI SDK; the client adapter consumes the response body as an async iterable of text chunks, forwarding `AbortSignal` so the **Stop** button cancels at the network layer.
- **Error monitoring** — Sentry captures unhandled errors from the root error boundary, both API routes, and the streaming flow; a "Bug" trigger in the sidebar footer sends a sample event end-to-end.
- **Dark mode** — `next-themes` with a custom **View Transitions API** circular reveal animation from the click position.
- **Mobile-responsive** — sidebar collapses into a slide-in drawer (Radix Dialog primitive) below `md` breakpoint.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | App Router unifies streaming, RSC, and route handlers; Turbopack is the default dev/prod compiler |
| Language | TypeScript 5.9 (strict) | Branded ID types, exhaustive checks |
| UI | Tailwind v4 + shadcn/ui (Radix primitives) | Fast iteration, accessible defaults, no separate component library lock-in |
| Typography | Geist Sans + Fraunces (display serif) | Claude.ai-leaning aesthetic; warm + minimal |
| AI | Anthropic Claude Sonnet 4.6 (chat) + Haiku 4.5 (auto-title) via `@ai-sdk/anthropic` | Sonnet for capability, Haiku for cheap+fast title generation |
| Server state | TanStack Query v5 | Cache invalidation primitives, optimistic mutation patterns |
| Streaming | `streamText().toTextStreamResponse()` + custom async-iterable adapter | Full control over the streaming protocol; client adapter implements a domain `LlmStreamPort` |
| Persistence | `localStorage` via a `SessionRepository` port | FE-only scope per brief; trivial future swap to HTTP repo |
| Markdown | `react-markdown` + `remark-gfm` + `shiki` (github-dark) | Manual element styling (no `@tailwindcss/typography` plugin) for fine-grained control |
| Observability | Sentry (`@sentry/nextjs`) + Vercel Analytics + Speed Insights | Errors + RUM Core Web Vitals + page views |
| Testing | Vitest (Node env) | Domain layer is pure TS — no jsdom needed for current tests |
| CI | GitHub Actions | Typecheck, lint, test, build on every PR |

---

## Architecture: Ports & Adapters with DDD layering

The brief asks for "Domain-Driven Design principles to structure the data layer". The codebase is organised in concentric layers, with the **dependency rule** strictly enforced: imports may only point inward.

```
   ┌────────────────────────────────────────────────────┐
   │  UI / Presentation                                 │  ← React components, Next.js routes
   │  ┌──────────────────────────────────────────────┐  │
   │  │  Infrastructure                              │  │  ← Adapters: LocalStorage,
   │  │  ┌────────────────────────────────────────┐  │  │     Claude HTTP, Failure simulator
   │  │  │  Application                           │  │  │
   │  │  │  ┌──────────────────────────────────┐  │  │  │  ← Use cases (one per action)
   │  │  │  │  Domain (core)                   │  │  │  │
   │  │  │  │  Entities, Value Objects, Ports  │  │  │  │  ← Pure TypeScript;
   │  │  │  │  Errors, Invariants              │  │  │  │     no framework imports
   │  │  │  └──────────────────────────────────┘  │  │  │
   │  │  └────────────────────────────────────────┘  │  │
   │  └──────────────────────────────────────────────┘  │
   └────────────────────────────────────────────────────┘
```

| Layer | Folder | Contains | Imports from |
|---|---|---|---|
| **Domain** | `src/domain/` | Entities (`Session`, `Message`), value objects (`SessionId`, `MessageId`), domain errors, **ports** (interfaces) | Nothing outside domain |
| **Application** | `src/application/use-cases/` | Use cases — one per user action (`CreateSession`, `PostMessage`, `GenerateTitle`, …). Each receives ports via constructor injection | Domain only |
| **Infrastructure** | `src/infrastructure/` | Adapters that implement ports: `LocalStorageSessionRepository`, `HttpClaudeStreamAdapter`, `SystemClock`, `CryptoUuidGenerator`, `FailureSimulator`, etc. Plus composition root | Domain + Application |
| **UI** | `src/app/`, `src/components/`, `src/hooks/` | React components, Next.js pages, route handlers, React Query hooks | Domain + Application + Infrastructure |

Highlights:

- **Ports** (`src/domain/ports/`) declare what the domain needs (`SessionRepository`, `LlmStreamPort`, `Clock`, `IdGenerator`, …). Implementations live in `src/infrastructure/`.
- **Decorator pattern** — `SimulatedPostMessage` wraps the real `PostMessage` use case to inject artificial latency + failure. The UI consumes a `PostMessageUseCase` interface, never aware of the simulation.
- **Composition root** ([`src/infrastructure/composition.ts`](src/infrastructure/composition.ts)) — single `buildContainer()` that wires every adapter to every use case. Exposed to React via `AppContainerProvider` + `useAppContainer()`.
- **Streaming as a port** — `LlmStreamPort.streamChat()` returns `AsyncIterable<string>`. The HTTP adapter consumes the response stream and forwards `AbortSignal`. The use case calls `placeholder.appendDelta(delta).complete()` through the domain state machine.

The domain entities are entirely framework-free and covered by [25 Vitest unit tests](src/domain/entities/session.test.ts).

---

## Project structure

```
src/
├── app/                                # Next.js App Router
│   ├── api/
│   │   ├── chat/route.ts                # POST /api/chat — streaming Claude proxy
│   │   └── title/route.ts               # POST /api/title — Haiku-generated title
│   ├── sessions/[id]/page.tsx           # Chat detail (client component, use(params))
│   ├── error.tsx                        # Route-level error boundary (Sentry capture)
│   ├── global-error.tsx                 # App-level error boundary (RootLayout crashes)
│   ├── layout.tsx                       # Providers + fonts + Analytics + SpeedInsights
│   └── page.tsx                         # Home / "New chat" landing
│
├── components/
│   ├── chat/                            # ChatPane, MessageList, Markdown, MessageInput, etc.
│   ├── sidebar/                         # Sidebar, SessionItem, MobileSidebar drawer
│   ├── providers/                       # ThemeProvider, QueryProvider, AppContainerProvider
│   ├── ui/                              # shadcn primitives
│   ├── app-shell.tsx                    # Layout shell (desktop sidebar + main pane)
│   ├── mobile-top-bar.tsx               # Mobile-only top bar with hamburger
│   ├── sentry-demo-button.tsx           # Bug trigger button (sidebar footer)
│   └── theme-toggle.tsx                 # Light/Dark/System with View Transitions API
│
├── domain/                              # ★ Pure TS — no framework imports
│   ├── entities/
│   │   ├── session.ts                   # Session aggregate root
│   │   └── message.ts                   # Message with status state machine
│   ├── value-objects/
│   │   ├── session-id.ts                # Branded UUID type
│   │   └── message-id.ts
│   ├── ports/                           # Interfaces only
│   │   ├── session-repository.ts
│   │   ├── message-repository.ts
│   │   ├── llm-stream-port.ts
│   │   ├── title-generator-port.ts
│   │   ├── clock.ts
│   │   └── id-generator.ts
│   └── errors.ts                        # DomainError + subtypes
│
├── application/use-cases/               # Orchestration only — no business rules
│   ├── create-session.ts
│   ├── list-sessions.ts
│   ├── get-session.ts
│   ├── delete-session.ts
│   ├── rename-session.ts
│   ├── post-message.ts
│   ├── finalize-assistant-message.ts
│   └── generate-title.ts
│
├── infrastructure/
│   ├── time/system-clock.ts
│   ├── identity/crypto-uuid-generator.ts
│   ├── persistence/                     # LocalStorage repos
│   ├── llm/                             # HTTP adapters → /api/chat, /api/title
│   ├── simulation/                      # Seedable RNG + FailureSimulator + decorator
│   └── composition.ts                   # buildContainer() — DI root
│
├── hooks/                               # React Query hooks consuming use cases
└── lib/                                 # Pure utilities (date grouping, cn helper)

Sentry/observability:
├── instrumentation.ts                   # Server + edge runtime init
├── instrumentation-client.ts            # Browser init (Turbopack-compatible)
├── sentry.server.config.ts
├── sentry.edge.config.ts
└── next.config.ts                       # withSentryConfig + bundle analyzer
```

---

## Getting started

### Prerequisites

- Node.js **22+**
- pnpm **10+**
- An [Anthropic API key](https://console.anthropic.com/)
- (Optional) A [Sentry](https://sentry.io) project for error monitoring

### Setup

```bash
git clone <repo-url>
cd fe-ai-chat
pnpm install
cp .env.example .env.local
# Edit .env.local — at minimum, set ANTHROPIC_API_KEY
pnpm dev
```

Open <http://localhost:3000>.

---

## Environment variables

See [`.env.example`](.env.example) for the full template.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | — | Used by `/api/chat` and `/api/title` route handlers |
| `NEXT_PUBLIC_FAILURE_SIM_RATE` | optional | `0.10` | Probability `[0..1]` that `PostMessage` simulator throws. Set `0` for clean demos, `1` to force-fail every send |
| `NEXT_PUBLIC_SENTRY_DSN` | optional | — | Browser-side Sentry DSN. Without this, Sentry init is a no-op |
| `SENTRY_DSN` | optional | — | Server-side Sentry DSN (same value as the public one) |
| `SENTRY_ORG` | optional | — | Sentry org slug — used only at build time for source map upload |
| `SENTRY_PROJECT` | optional | — | Sentry project slug |
| `SENTRY_AUTH_TOKEN` | optional | — | Auth token for uploading source maps. Not needed for runtime capture |
| `ANALYZE` | optional | — | When `true`, `pnpm analyze` emits bundle analyzer HTML reports |

---

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Next.js dev server (Turbopack) |
| `pnpm build` | Production build (Turbopack) |
| `pnpm start` | Serve the production build |
| `pnpm analyze` | Production build in **webpack** mode with `@next/bundle-analyzer` HTML reports. Pair with `ANALYZE=true` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm format` / `pnpm format:check` | Prettier write / check |
| `pnpm test` | Vitest, single run |
| `pnpm test:watch` | Vitest watch mode |
| `pnpm test:ui` | Vitest UI dashboard |

Bundle analyzer note: `pnpm analyze` opts out of Turbopack because the classic `@next/bundle-analyzer` is webpack-only. To run on each OS:

```bash
ANALYZE=true pnpm analyze                # Linux / macOS / Git Bash
$env:ANALYZE='true'; pnpm analyze        # Windows PowerShell
set ANALYZE=true && pnpm analyze         # Windows cmd
```

Reports land in `.next/analyze/{client,edge,nodejs}.html`.

---

## Testing

Run with `pnpm test`. 25 deterministic unit tests covering:

| File | Coverage |
|---|---|
| [`failure-simulator.test.ts`](src/infrastructure/simulation/failure-simulator.test.ts) | Constructor validation, edge rates (0 / 1), **determinism** under a seeded RNG, **statistical correctness** over 10k iterations (±3% of target rate) |
| [`seedable-rng.test.ts`](src/infrastructure/simulation/seedable-rng.test.ts) | Value range `[0, 1)`, seed reproducibility, seed separation |
| [`session.test.ts`](src/domain/entities/session.test.ts) | Title invariants (empty, whitespace-only, max length boundary), immutability of `rename`/`touch`, `reconstitute` "trust persistence" contract |

The simulator is **testable as a pure function** because randomness is injected via a `Rng` port — `MulberryRng(seed)` for tests, `SystemRng` (via `Math.random`) in production. No `jest.spyOn(Math, 'random')` hacks.

---

## Observability

### Sentry — Error monitoring

Capture points:

- **Root error boundary** ([`error.tsx`](src/app/error.tsx)) — every route render error.
- **Global error boundary** ([`global-error.tsx`](src/app/global-error.tsx)) — RootLayout crashes.
- **API routes** — both `/api/chat` and `/api/title` capture exceptions in their catch blocks, tagged `route: '/api/chat'` etc.
- **Streaming flow** ([`use-stream-chat.ts`](src/hooks/use-stream-chat.ts)) — client-side capture, with `SimulatedFailureError` tagged `simulated: 'true'` at `level: 'info'` so demo failures don't pollute real-error dashboards.
- **Manual demo trigger** — the **Bug** icon in the sidebar footer sends an `info`-level demo event after verifying `Sentry.getClient()` is initialised; the toast surfaces the event ID for quick lookup.

Sentry init is **opt-in per environment** via `enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN` — the SDK is a no-op when DSN is absent, so the app deploys cleanly without observability configured.

### Vercel Analytics + Speed Insights

`<Analytics />` and `<SpeedInsights />` are mounted in [`layout.tsx`](src/app/layout.tsx). Both are GDPR-friendly and automatically inactive during local development. Once deployed to Vercel, page views and Core Web Vitals (LCP, INP, CLS, TTFB) appear in the Vercel project dashboard.

### Bundle analyzer

`@next/bundle-analyzer` is wired via `next.config.ts` and gated by `ANALYZE=true`. Run `pnpm analyze` to produce HTML treemaps.

---

## Lighthouse audit

Measured with Chrome DevTools Lighthouse on the production URL (Navigation mode, Incognito).

| Category | Desktop | Mobile | Notes |
|---|---|---|---|
| Performance | 79 | 70 | LCP 1.3 s, CLS 0, FCP 0.3 s. TBT (~330 ms) is the main drag — dominated by parse + eval of the React 19 / AI SDK / Shiki client bundle. |
| Accessibility | 100 | 100 | After fixes: removed faded `text-muted-foreground/70`, replaced sidebar group `<h3>` with `<div>` to keep heading order valid, and wrapped `ChatPane` in a `<main>` landmark. |
| Best Practices | 100 | 100 | HTTPS, no console errors, no deprecated APIs. |
| SEO | 100 | 100 | When measured on the production alias URL. Vercel deployment URLs (`<project>-<hash>-<scope>.vercel.app`) ship `x-robots-tag: noindex` as a preview safeguard, which Lighthouse correctly flags as not-crawlable. |

### Performance trade-offs

The 79 Desktop / 70 Mobile is driven by ~800 KiB of transferred JavaScript across:

- React 19 + Next.js 16 runtime
- `@ai-sdk/anthropic` + `ai` (streaming runtime)
- `shiki` (syntax highlighting — currently eager-loaded)
- `react-markdown` + `remark-gfm`
- `@sentry/nextjs` browser SDK + Replay integration

Concrete next steps to reach 90+ that were deliberately deferred:

1. **Lazy-load Shiki** via `import()` inside `CodeBlock` (~50 KiB saved).
2. **Code-split the markdown renderer** so the home route doesn't ship `react-markdown` (~80 KiB saved).
3. **Drop Sentry Replay** if Session Replay isn't required (~60 KiB saved).
4. **Tune target browsers** to skip `Array.at` / `Object.fromEntries` polyfills (~15 KiB per Lighthouse's `legacy-javascript` audit).

Estimated effort: 2–3 hours of focused refactoring. Acceptable for a future PR; out of scope for the take-home budget.

---

## Deployment

The app is designed to deploy to Vercel with zero config beyond environment variables.

### Steps

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Set environment variables in **Vercel project → Settings → Environment Variables** (same names as `.env.example`).
4. Vercel auto-detects Next.js, builds, and deploys.
5. Sentry source maps are uploaded automatically during build because `SENTRY_AUTH_TOKEN` is set.

### CI

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs on every push to `main` and every PR:

```
checkout → setup pnpm → setup Node 22 (with pnpm cache)
       → install --frozen-lockfile
       → typecheck → lint → test → build
```

---

## Trade-offs and intentional limitations

These are conscious choices for the 12-hour scope of the take-home, all documented because the rubric values transparent reasoning.

1. **Client-side persistence (`localStorage`).** Sessions live in the user's browser; they don't sync across devices. The brief explicitly framed this as a frontend challenge, and the `SessionRepository` port is the single seam needed to swap in an HTTP-backed implementation without touching domain or application code.
2. **Failure simulation is client-side.** The brief asks to "simulate realistic API behaviour with artificial delays and occasional failures". Because the only real backend is `/api/chat`, the simulator wraps the `PostMessage` use case via a decorator at the boundary instead of injecting failure into the server. The seeded RNG keeps the simulator unit-testable.
3. **No optimistic mutations for session CRUD.** localStorage is synchronous, so the perceived latency is already near zero. In production with a real backend, the same hooks would adopt `onMutate` + rollback. I'd happily add this in a follow-up.
4. **No component tests.** The 25 unit tests focus on the domain and simulator — the layers most likely to silently regress. Components are covered manually via the Loom walkthrough. A future Playwright smoke test of the streaming happy-path would be the natural next step.
5. **Mobile sidebar uses Radix Dialog primitive directly**, not shadcn `Sheet`. `Sheet` was not part of the installed shadcn set; building the drawer on the already-installed Radix `Dialog` keeps the surface area smaller without losing focus trap, ESC, or scroll lock.
6. **Auto-title generation is fire-and-forget.** A Haiku call summarises the first exchange into a 3–5 word title. Failures are swallowed so the default `"New chat"` stays visible — the chat experience is never blocked on the title being available.
7. **Bundle analyzer requires `pnpm analyze` (webpack mode).** The classic `@next/bundle-analyzer` is webpack-only; Next 16's default Turbopack build skips it. The new `next experimental-analyze` is the long-term replacement.
8. **`sentry.client.config.ts` was intentionally removed.** Sentry's client init lives in [`instrumentation-client.ts`](instrumentation-client.ts) because Turbopack does not pick up the legacy file via the Sentry webpack plugin.

---

## License

Submission for the MyConnect.ai take-home challenge. Not licensed for redistribution.
