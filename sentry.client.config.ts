// Sentry client initialization moved to `instrumentation-client.ts` for
// compatibility with Turbopack (Next.js 15+ default). Turbopack does not
// load this file via Sentry's webpack plugin; the new `instrumentation-client.ts`
// is loaded natively by Next.js regardless of bundler.
//
// This stub is intentionally empty to avoid duplicate `Sentry.init()` calls
// if a future webpack fallback discovers this file.
export {};
