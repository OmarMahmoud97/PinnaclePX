# drizzle.config.ts loads .env.local itself

- Status: accepted
- Date: 2026-09-04

## Context

The standards document's `drizzle.config.ts` imports the validated `env` from `lib/env.ts`. drizzle-kit runs outside Next.js, so nothing loads `.env.local` for it, and `lib/env.ts` validates every server variable. Locally, `pnpm db:generate` failed with "Invalid environment variables" before the first migration could be written, and a CI migration job would need every secret set just to read `DATABASE_URL`.

## Decision

`drizzle.config.ts` reads only `DATABASE_URL`. When it is unset and `.env.local` exists, the config loads that file with Node's built-in `process.loadEnvFile` (no dotenv dependency). It throws a clear error if the variable is still missing. `lib/env.ts` stays the single validated env for application code; `drizzle.config.ts` is already excluded from the `process.env` lint rule as a file that runs before env exists.

## Consequences

`pnpm db:generate` and `pnpm db:migrate` work from a fresh checkout with only `.env.local` present, and in CI with only `DATABASE_URL` exported. The Knip Drizzle plugin could be re-enabled now that loading the config no longer validates the full env (ADR 0002, item 9).
