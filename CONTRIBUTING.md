# Contributing

## Principles

Simple beats complex. One way to do a thing. Fail fast at boundaries. Trust the primary mechanism, no backups. One responsibility per function. Surgical minimal diffs. Fix root causes. Let TypeScript catch errors. Verify, do not fabricate. Read context before editing. No em dashes in code comments or docs.

## Workflow

1. Branch from `main`, keep the branch short-lived.
2. Commit. The pre-commit hook formats and lints staged files; the pre-push hook typechecks and runs unit tests.
3. Open a PR to `main`. CI must pass: typecheck, lint, format check, template hex and palette grep, knip, unit tests.
4. Squash or rebase; `main` requires linear history.

## Rules enforced mechanically

- No `any`, no non-null assertions, no empty catch blocks.
- `console` only inside `lib/log.ts`; everything else uses `log`.
- `process.env` only inside `lib/env.ts`.
- No default exports outside Next.js file conventions.
- No barrel `index.ts` files inside `lib/`, `templates/`, or `components/`.
- Templates import only `@/lib/tokens/*` and `@/lib/copy-slots/*`, and contain no hex literals or Tailwind palette classes.
- `lib/` never imports `app/` or `templates/`; pure modules never import IO modules.
- The Anthropic SDK and host are used only in `lib/ai`; the Pexels SDK and host only in `lib/images`.

## Rules enforced by review

- Validate every external input once with zod at the boundary, then trust the inferred types.
- Throw `AppError` for programmer errors and precondition failures. Return `Result` only where the caller must branch on an expected outcome.
- Every tunable number is named in `lib/config.ts`.
- Business logic lives in `lib/`; route handlers and Server Actions validate, delegate, and respond.
- Prefer Server Components. Add `"use client"` only at small interactive leaves.
- Never log personal data.

## Database

Use `pnpm db:generate`, review the SQL in `db/`, then `pnpm db:migrate`. Never run `drizzle-kit push` against production.

## Decisions

Record architecture decisions in `docs/adr/` using the MADR format.
