# Code Structure and Maintainability Standards — Lead-Gen Tool

## TL;DR
- The stack and philosophy are sound and buildable as specified; the proposed repository layout is correct with three refinements: promote `lib/inngest/` to a first-class folder (client plus functions), keep the preview page fully dynamic (no `use cache`), and enforce the import boundaries with the built-in ESLint `no-restricted-imports` rule plus one CI grep, which is the simplest mechanism that works on ESLint 9 flat config.
- Nearly every tooling claim was CONFIRMED against primary docs as of September 2026: `next lint` is removed in Next.js 16 (use the ESLint CLI with `eslint-config-next` flat config), pnpm 10 blocks dependency build scripts by default (allowlist `sharp` via `pnpm.onlyBuiltDependencies`), Corepack is removed from Node 25 and later (pin pnpm in CI explicitly), and Inngest v4 replaces `EventSchemas` with `eventType()`.
- A few items are opinion, not convention (kebab-case files, `type Props`, no barrel files, ADRs); these are marked. Two items require the maintainer to VERIFY at build time because primary docs did not fully settle them: Tailwind v4 support in class-name ESLint plugins, and the exact interaction of `@t3-oss/env-nextjs` with Next 16 build-time validation.

## Key Findings
Verification legend: CONFIRMED = verified against official docs, changelog, or npm with source. UNCONFIRMED = could not verify from a primary source within budget. OPINION = a defensible best practice, not a documented framework convention.

### Area 1 — Next.js 16 App Router organisation
- **Project structure and colocation — CONFIRMED.** The official page (`nextjs.org/docs/app/getting-started/project-structure`, which self-reports `version: 16.3.4`, `lastUpdated: 2026-07-21`) states Next.js is "unopinionated about how you organize and colocate your project files," that files in `app` "can be safely colocated by default," and that "a route is not publicly accessible until a page.js or route.js file is added to a route segment." Private folders use the `_folder` prefix; route groups use `(folder)` and are "omitted from URL."
- **Three official strategies — CONFIRMED.** The docs describe storing project files outside `app`, storing them in top-level folders inside `app`, or splitting by feature or route. For this project the correct fit is **top-level folders** (`lib/`, `templates/`, `components/`, `db/`) with route-only files inside `app/`. This matches the maintainer's "one way to do things" philosophy: shared logic lives in `lib/`, routes stay thin.
- **Special file conventions — CONFIRMED.** `layout`, `page`, `loading`, `error`, `global-error`, `not-found`, `route`, `template`, `default`, plus the metadata files including `opengraph-image` (with a `.tsx` "Generated Open Graph image" variant) are all listed on the official structure page. Arbitrary (non-convention) files are safe inside `app/` because a segment only becomes routable when `page` or `route` is present.
- **Server vs Client Components and `server-only`/`client-only` — CONFIRMED.** The official Next.js docs (`nextjs.org/docs/app/getting-started/server-and-client-components`) recommend the `server-only` package: "if you try to import the module into a Client Component, there will be a build-time error. The corresponding client-only package can be used to mark modules that contain client-only logic." A precise caveat from that same page: "The contents of these packages from NPM are not used by Next.js" — Next.js reimplements the check internally and ships its own type declarations. The `server-only` npm package's latest version is 0.0.1 (published by React core member sebmarkbage). The rule for keeping the client bundle small: only serialisable props may cross the `"use client"` boundary, so pass plain data, not functions or class instances.
- **Route handlers and segment config — CONFIRMED.** `route.ts` exports named HTTP-method functions (`GET`, `POST`). Route Segment Config exports `runtime` (`'nodejs' | 'edge'`), `maxDuration`, `dynamic`, `dynamicParams`, `revalidate`, `preferredRegion`, and "need [to] be statically analyzable" — for example `maxDuration = 5` is valid, `60 * 10` is not (`nextjs.org/docs/app/api-reference/file-conventions/route-segment-config`).
- **Server Actions — CONFIRMED direction.** Place them in a file marked `"use server"` (an `actions.ts` colocated with the form route). Validate input with zod inside the action (the official forms guide states server validation is the source of truth); keep business logic in `lib/`, not in the action body.
- **next.config.ts and serverExternalPackages — CONFIRMED.** `serverExternalPackages` opts a package out of server bundling and forces native `require`; `sharp` is a documented example (`nextjs.org/docs/app/guides/package-bundling`). `typedRoutes` and `next.config.ts` TypeScript config are supported in 16.
- **Cache Components / `use cache` — CONFIRMED.** In Next.js 16, `cacheComponents: true` enables `use cache`, `cacheLife`, and `cacheTag` together and makes data dynamic by default (`.../config/next-config-js/cacheComponents` and `.../directives/use-cache`). **Guidance:** this app is per-visitor and mostly dynamic (form input, one-off generated previews), so leave Cache Components off and do not put `use cache` on the preview page. This aligns with "simple beats complex" — no cache means no cache-invalidation surface area.

### Area 2 — TypeScript strictness and code-level conventions
- **tsconfig — CONFIRMED (mixed authority).** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `verbatimModuleSyntax`, `isolatedModules`, and `moduleResolution: "bundler"` are all standard TypeScript compiler options (TypeScript handbook). Next.js generates `strict`, `moduleResolution: "bundler"`, the `@/*` path alias, and `isolatedModules` in its default `tsconfig.json`, and manages `next-env.d.ts`. The additional strict flags beyond what Next generates are OPINION (popularised by Matt Pocock's tsconfig cheat sheet); they remain current and are appropriate for a solo greenfield project because they push error detection to compile time, operationalising "let TypeScript catch errors instead of excessive runtime checks." Note: `@t3-oss/env-nextjs` requires a module resolution that reads `package.json#exports` — Bundler satisfies this.
- **type vs interface, discriminated unions, branded types, `as const`, unions over enums.** Discriminated result unions (`{ ok: true, value } | { ok: false, reason }`), `readonly`, and `as const` are documented TypeScript features (CONFIRMED). "Prefer `type` over `interface`" and "avoid `enum` in favour of union types" are OPINION but widely held and consistent with "one way to do things."
- **Zod at the boundary — CONFIRMED.** Validate every external input exactly once at the edge — the five-step form, the `/api/upload` and `/api/status` routes, LLM output from Anthropic, and Pexels API responses — with zod 3.25.x, then trust `z.infer` types internally. This directly implements "fail fast, throw when preconditions are not met" at the trust boundary while keeping the interior free of defensive checks.
- **Function design — rule.** Pure functions live in `lib/select`, `lib/tokens`, `lib/copy-slots`; all IO (Anthropic, Pexels, Blob, Postgres) lives in `lib/ai`, `lib/images`, `lib/db`. Rule: **throw for programmer errors and precondition violations (fail fast); return a discriminated result only where the caller must branch on an expected, recoverable outcome** (for example a template-selection tie or an LLM slot-validation failure). Keep the custom error hierarchy tiny — one `AppError` base is enough; do not build a taxonomy you will not branch on.
- **Logging on Vercel — CONFIRMED.** Vercel Function Logs docs: "Functions have full support for the `console` API, including `time`, `debug`, `timeEnd`, and more"; runtime logs capture "the console.log output," and "Each action of writing to standard output, such as using console.log, results in a separate log entry." Vercel's structured-logging guide confirms JSON fields "become filterable and searchable" and that the dashboard level filter "reads the level inferred from the console method used, not the JSON body." **Decision:** a tiny `console` wrapper emitting structured JSON with a stable key set is correct for a solo maintainer; pino is not warranted. Never log personal data (name, email, company).

### Area 3 — Linting, formatting, and mechanical enforcement
- **`next lint` removed in Next 16 — CONFIRMED.** The official upgrade guide states: "The next lint command has been removed. Use Biome or ESLint directly. next build no longer runs linting." The `eslint` key in `next.config` is also removed. Deprecation began in Next.js 15.5 (August 2025) with a warning advising migration; removal landed in Next.js 16, which requires Node.js 20.9 or later. Use `eslint-config-next/core-web-vitals` (and `/typescript`) in `eslint.config.mjs` and run `eslint .` from an npm script. A codemod exists: `npx @next/codemod@canary next-lint-to-eslint-cli .`.
- **typescript-eslint v8 — CONFIRMED.** v8 "ships with full support for ESLint v9"; the config sets `recommendedTypeChecked`, `strictTypeChecked`, and `stylisticTypeChecked` exist, enabled via `parserOptions.projectService: true` and `tsconfigRootDir`. Type-aware linting "incur[s] the performance penalty of asking TypeScript to do a build" — acceptable for this project's size, and IDE caching hides most of it. typescript-eslint's own guidance is to adopt `strictTypeChecked` "only if a nontrivial percentage of its developers are highly proficient" — for a single proficient maintainer this is a good fit.
- **Import boundaries — CONFIRMED options; one recommended.** Three viable mechanisms: the ESLint built-in `no-restricted-imports` (`patterns` with `group` globs, per-`files` overrides), `eslint-plugin-import`'s `no-restricted-paths` (zones with `target`/`from`/`except`), and `eslint-plugin-boundaries`. **Recommend the built-in `no-restricted-imports` with `files`-scoped config blocks** — zero extra dependency, flat-config native, and expressive enough for every rule required. The exact config is in the Standards draft.
- **No hex literals and no Tailwind palette classes in `templates/` — grep is the most reliable.** Recommend a CI grep script plus an ESLint `no-restricted-syntax` regex on string literals. Rationale: `eslint-plugin-tailwindcss` and `eslint-plugin-better-tailwindcss` v4 support is still stabilising (the better-tailwindcss v4 line is beta), so a regex-based grep is the dependable primary mechanism today. VERIFY plugin v4 stability before relying on `no-custom-classname` to whitelist semantic classes.
- **Prettier plus Tailwind v4 — CONFIRMED.** `prettier-plugin-tailwindcss` sorts classes and supports Tailwind v4 via the `tailwindStylesheet` option pointing at your CSS entry point; it must be loaded last among Prettier plugins. Use `eslint-config-prettier` to switch off ESLint's formatting rules so the two do not fight. `tailwindFunctions: ["cn", "clsx", "cva"]` makes the sorter cover class strings inside those helpers.
- **tailwind-merge v3 — CONFIRMED.** The dcastil/tailwind-merge README (main) states: "Supports Tailwind v4.0 up to v4.3 (if you use Tailwind v3, use tailwind-merge v2.6.0)." The `cn()` helper (clsx plus tailwind-merge) remains valid under v4. Note: templates must not use `cn()` to smuggle palette classes — the grep still applies inside `templates/`.
- **Knip — worth adding (OPINION).** Detects unused files, exports, and dependencies; cheap, high-signal value for a solo project that wants to avoid dead code. Prefer Knip over the older ts-prune.
- **Git hooks — CONFIRMED landscape; one recommended.** husky has 36,059,449 weekly downloads (v9.1.7, per npmjs.com) and is "used in over 1.5M projects on GitHub, including: vercel/next.js" (typicode.github.io/husky); lefthook is a Go binary that runs hooks in parallel with a single YAML config. For a solo maintainer **recommend lefthook**: one checked-in `lefthook.yml`, no `prepare`-script reinstall pitfalls, parallel execution. Rule: pre-commit runs format and ESLint on staged files; pre-push runs `tsc --noEmit` on the whole project plus unit tests. tsc cannot run on staged files alone because the type graph spans the project.
- **Conventional Commits and commitlint — OPINION.** Optional for a solo maintainer. If adopted, use the current Conventional Commits 1.0.0 spec with `@commitlint/config-conventional`. Given "simple beats complex," this is skippable unless you want an auto-generated CHANGELOG.

### Area 4 — React component and styling organisation
- **Component organisation — OPINION (with one CONFIRMED constraint).** Shared primitives in `components/ui`, form steps in `app/(form)/_components` (private folder, colocated), template components in `templates/`. One component per file. Next.js **requires default exports for `page`, `layout`, `route`, and the other file conventions** (CONFIRMED); everywhere else prefer named exports (OPINION, and it makes barrel-free imports explicit). Type props with `type Props = {...}`; do not use `React.FC` (OPINION).
- **Server-first — CONFIRMED.** Components are Server Components by default in the App Router; add `"use client"` only at interactive leaves (the form reducer, the upload widget, the colour picker) and keep those components small so the client bundle stays lean.
- **Tailwind v4 — CONFIRMED.** Single `globals.css` with `@import "tailwindcss";` and an `@theme { ... }` block that defines semantic tokens as CSS variables (for example `--color-brand`, `--color-surface`). Templates consume semantic utility classes generated from those variables, never raw palette classes or hex. Avoid `@apply`. Class ordering is handled by the Prettier plugin.
- **The ten templates and the registry — CONFIRMED TS features.** Structure each template as a self-describing module: `index.tsx` (the component), `meta.ts` (exports a `TemplateMeta`), `copy-slots.ts` (slot types and validators), and a `sections/` folder. A single `templates/registry.ts` exports a `readonly` tuple typed with `satisfies readonly TemplateMeta[]`, and a compile-time assertion enforces exactly ten entries and unique ids. `as const`, `satisfies`, and readonly tuples are all documented TypeScript features. Pattern in the Standards draft.
- **Forms — CONFIRMED.** A single `useReducer` holds the five-step state with a discriminated-union action type; no form library. React 19.2 `useActionState` returns `[state, formAction, isPending]` and the action has signature `(previousState, formData) => newState` (React 19 blog and Next.js forms guide). `useFormStatus` (imported from `react-dom`) returns `{ pending, data, method, action }` and must be read from a child of the `<form>`. Server Actions for steps 1 and 2 give progressive enhancement; steps 3 and 4 (logo upload, imagery) use client-direct upload to Vercel Blob via the `/api/upload` token route.

### Area 5 — Data, pipeline, and configuration organisation
- **Drizzle — CONFIRMED.** `drizzle.config.ts` uses `defineConfig` with `dialect: "postgresql"`, `schema`, `out`, and `dbCredentials`. A single `schema.ts` or a schema folder are both supported (Drizzle docs). **Workflow rule for a solo project on Neon branches:** use `generate` then `migrate`, and commit the generated SQL to Git; use `push` only against a throwaway local or a Neon dev branch. Third-party and Drizzle guidance both warn: "Never use drizzle-kit push in production. It applies changes immediately with no confirmation, has no migration history, and can silently drop columns." Set `out: "./db"` so migrations land in the `db/` folder.
- **Inngest v4 — CONFIRMED.** The v3-to-v4 migration guide states the "centralized schemas option on the Inngest client (EventSchemas class) has been removed. Instead, use the eventType() function." Define event types with `eventType("brief/created", { schema: z.object({...}) })` for optional runtime validation, and pass them as `createFunction({ id, triggers: [eventType] }, handler)`. Keep one client in `lib/inngest/client.ts` and one function per file under `lib/inngest/functions/`. Event-name convention: `namespace/verb.past-tense` (for example `pipeline/brief.completed`). The serve handler lives at `app/api/inngest/route.ts`.
- **Configuration and constants — CONFIRMED pattern.** A single `lib/config.ts` holds every tunable (stage budgets, rate limits, logo-luminance cut-offs, contrast thresholds), typed and frozen with `as const`. Rule: **no magic numbers anywhere else** — a value that tunes behaviour must be named in `config.ts`.
- **Feature flags — OPINION.** Recommend none for a solo project. If one is ever needed, use a single env-driven boolean validated in `lib/env.ts`, not a flag service.

### Area 6 — Testing organisation
- **Vitest — CONFIRMED.** The official Next.js Vitest guide gives `vitest.config.mts` with `@vitejs/plugin-react` and `vite-tsconfig-paths` (for the `@/*` alias) and `environment: 'jsdom'`. Use `node` for pure `lib/` logic (fastest) and `jsdom` for component tests; a per-file `// @vitest-environment jsdom` docblock overrides the default. The `projects` field replaces the deprecated `environmentMatchGlobs`. Add `"vitest/globals"` to `tsconfig` `types` if using `globals: true`. **Placement:** colocate `*.test.ts` next to source for unit tests; keep integration tests under `tests/integration`.
- **Playwright — CONFIRMED.** `playwright.config.ts` supports `testDir` and a `webServer` object with `command`, `url`, `reuseExistingServer`, and `timeout` (`playwright.dev/docs/test-webserver`; TestConfig API). Playwright 1.62.1 is the latest stable (published 30 July 2026, per npmjs.com), on the single 1.x major line, and requires Node.js 22.x, 24.x, or 26.x (`playwright.dev/docs/intro`). Put e2e specs in `e2e/`. In CI, point `webServer.url` at the started dev/preview server, or run against a Vercel preview URL via `baseURL`.
- **What must have tests — rule.** Every pure function in `lib/` (select, tokens, contrast solver, copy-slot validators), every zod validator, and the exclusivity transaction in `lib/db` under simulated concurrency. What should NOT be unit-tested: thin route handlers and presentational template markup — cover those through one Playwright happy-path instead. Structure: `describe`/`it`, arrange-act-assert, with a `tests/fixtures/` folder for logo images and hex corpora; `scripts/` holds the adversarial corpus runner.

### Area 7 — Git, GitHub, and VS Code
- **.gitignore — CONFIRMED.** The Next.js top-level file list marks `.env`, `.env.local`, `.env.production`, `.env.development`, and `next-env.d.ts` as "should not be tracked by version control." Ignore `.next/`, `node_modules/`, `.vercel`, and all `.env*` except a committed `.env.example`.
- **Rulesets vs branch protection — CONFIRMED.** GitHub docs: rulesets are the newer, layerable mechanism — "Multiple rulesets can apply to the same branch at the same time, while only one branch protection rule applies," you can "change a ruleset's enforcement status without deleting the ruleset," and "Anyone with read access to a repository can view its active rulesets." **Recommend a single ruleset on `main`** requiring status checks to pass, linear history, and conversation resolution, with a short-lived-branch, PR-to-`main` trunk-based flow.
- **GitHub Actions — CONFIRMED.** Minimal pnpm plus Node workflow: `actions/checkout`, `pnpm/action-setup` (v4; for pnpm 11 and later the newer `pnpm/setup` bundles Node too), and `actions/setup-node@v4` with `cache: 'pnpm'`, followed by `pnpm install --frozen-lockfile`. Add a `concurrency` block keyed on the ref with `cancel-in-progress: true`. **Vercel's Git integration builds the deploy previews**, so CI does not need to duplicate the production build — CI runs typecheck, lint, unit tests, and optionally Playwright against the preview.
- **Dependabot — CONFIRMED.** `.github/dependabot.yml` with grouped `npm` updates is the simplest choice for a solo repo (versus Renovate's greater configurability). Add a `github-actions` ecosystem entry to keep action versions current.
- **Secret scanning, push protection, CodeQL — CONFIRMED availability.** Secret scanning and push protection are available on public repositories at no cost; enable push protection. CodeQL default setup is available for private repositories on paid plans — enable if the repo is private and covered.
- **pnpm — CONFIRMED.** Commit `pnpm-lock.yaml`; set the `packageManager` field. pnpm 10.0.0 changelog: "Lifecycle scripts of dependencies are not executed during installation by default! This is a breaking change aimed at increasing security. In order to allow lifecycle scripts of specific dependencies, they should be listed in the pnpm.onlyBuiltDependencies field of package.json." **You must allowlist `sharp`** — the lovell/sharp issue tracker confirms that without it "any command reports an error 'Cannot find module ../build/Release/sharp-darwin-arm64v8.node'"; the fix is `{ "pnpm": { "onlyBuiltDependencies": ["sharp"] } }`. Corepack is "distributed with Node.js from version 14.19.0 up to (but not including) 25.0.0" — so it is bundled through Node 24 but removed from Node 25 and later; therefore **pin pnpm explicitly in CI** rather than relying on Corepack.
- **VS Code — CONFIRMED direction.** `.vscode/settings.json`: format on save with Prettier as default formatter, ESLint validating the JS/TS/React file set. For ESLint 9 flat config the `eslint.useFlatConfig` toggle is now the automatic default in the current extension, so it need not be set. Recommend extensions in `.vscode/extensions.json`: `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`, `bradlc.vscode-tailwindcss`, `ms-playwright.playwright`, and `vitest.explorer`. Add `.editorconfig`. VERIFY the exact `tailwindCSS.experimental.classRegex` entry for `cn()` against the current Tailwind IntelliSense docs before relying on class hints inside `cn()`.
- **Secrets — CONFIRMED.** Never commit `.env.local`. Use `vercel env pull <file>` locally — Vercel CLI docs: "This will export your Project's environment variables to that file." Store CI secrets as GitHub Actions secrets. Rotate `HMAC_SECRET` by adding a new secret in Vercel, deploying so the new value is live, then removing the old value; the identity HMAC in `lib/identity/` should read only from `lib/env.ts`.
- **README, CONTRIBUTING, ADRs — OPINION.** Keep a README and a short CONTRIBUTING even solo. Record architecture decisions as MADR or Nygard-format ADRs in `docs/adr/`. A CHANGELOG is optional unless you adopt Conventional Commits.

### Area 8 — Anti-patterns to prohibit (each with its mechanical check)
- **Internal barrel files (`index.ts` re-exports).** Hurt tree-shaking and inflate Next.js dev memory; `optimizePackageImports` exists precisely to unwind third-party barrels (Vercel engineering blog, "How we optimized package imports in Next.js"). Check: ESLint `no-restricted-imports` pattern banning `*/index` deep imports, plus code review; do not create `index.ts` re-export files inside `lib/` or `templates/`.
- **Default exports outside Next file conventions.** Check: `import/no-default-export` scoped to everything except `app/**/{page,layout,route,template,default,loading,error,not-found,opengraph-image}.tsx`.
- **`any` and non-null assertions.** Check: `@typescript-eslint/no-explicit-any` and `@typescript-eslint/no-non-null-assertion` as errors.
- **Catch-and-swallow.** Check: `no-empty` (with `allowEmptyCatch: false`) and code review; rethrow or handle explicitly.
- **Leftover `console.log`.** Check: `no-console` allowing only the logging wrapper's module; everything else routes through `lib/log.ts`.
- **Env access outside `lib/env.ts`.** Check: `no-restricted-syntax` / `no-restricted-properties` banning `process.env` outside `lib/env.ts`.
- **Direct third-party fetch outside `lib/images` or `lib/ai`.** Check: `no-restricted-imports`/`no-restricted-syntax` forbidding Anthropic and Pexels SDK imports and raw `fetch` to those hosts outside those folders.
- **Hex literals and palette classes in `templates/`.** Check: CI grep plus `no-restricted-syntax` regex (see Standards draft).
- **`useEffect` for data fetching where a Server Component would do.** Check: code review; prefer Server Components and Server Actions.
- **Non-serialisable props across the client boundary.** Check: the Next.js build itself errors on this; code review reinforces.
- **Business logic in route handlers or Server Actions.** Check: keep handlers and actions to validate-delegate-respond; logic lives in `lib/`. Enforced by `no-restricted-imports` (handlers may import `lib/*` but templates and pure modules stay pure) and review.

## Details

### Refinements to the proposed layout
1. **Add `lib/inngest/`** with `client.ts` (the single Inngest client) and `functions/` (one function per file: `brief.ts`, `select.ts`, `copy.ts`, `imagery.ts`, `tokens.ts`, `deadline-sweeper.ts`). This is the Inngest-recommended shape and keeps the durable five-stage pipeline discoverable.
2. **Keep `db/` for migration output** (`out: "./db"`) and `lib/db/` for schema, queries, and the exclusivity transaction. Point `drizzle.config.ts` `schema` at `lib/db/schema.ts`.
3. **The preview page stays dynamic.** Do not enable Cache Components or add `use cache` to `app/preview/[slug]/`. The result is fetched per request by slug from Postgres.
4. **OG image** at `app/preview/[slug]/opengraph-image.tsx` so shared preview links render a social card.
5. **`templates/registry.ts`** is the single source of truth for the ten templates and is the only file `lib/select` imports from the template layer.

### The import-boundary decision, stated exactly
Enforce with built-in `no-restricted-imports`:
- `templates/**` may import only from `lib/tokens/**` and `lib/copy-slots/**`.
- `lib/**` may not import from `app/**` or `templates/**`.
- The pure modules `lib/select/**` and `lib/tokens/**` may not import the IO modules `lib/ai/**`, `lib/images/**`, or `lib/db/**`.

## Recommendations
1. **Now (day one):** create every config file in the Standards draft below; add the `.github/workflows/ci.yml` workflow and `dependabot.yml`; set `pnpm.onlyBuiltDependencies: ["sharp"]`; create the `main` ruleset requiring status checks, linear history, and conversation resolution; enable push protection.
2. **Before the first template ships:** land `templates/registry.ts` with the compile-time exactly-ten and unique-id checks; add the boundary `no-restricted-imports` blocks; wire the hex/palette grep into CI as a required check.
3. **Before first production deploy:** switch the Drizzle workflow to `generate` plus `migrate` with committed SQL; confirm `sharp` builds in CI with `--frozen-lockfile`; run `vercel env pull` locally to mirror production env.
4. **Thresholds that would change the plan:** if `eslint-plugin-better-tailwindcss` reaches stable Tailwind v4 support, add `no-custom-classname` to whitelist semantic classes and retire the grep. If the product later adds static marketing pages, revisit `use cache` and Cache Components at that point and not before. If you migrate to pnpm 11, move the allowlist from `pnpm.onlyBuiltDependencies` to the `allowBuilds` setting.

## Caveats
- Playwright releases frequently; 1.62.1 was latest at access — pin the installed version and let Dependabot propose bumps.
- `@t3-oss/env-nextjs` build-time validation with Next 16 works by importing `env` in `next.config.ts`, but a known open issue exists where vars dynamically set in `next.config.ts` can be `undefined` at runtime; VERIFY your specific env wiring in a preview build.
- Tailwind v4 class-name ESLint plugins are still stabilising; the grep is the dependable primary mechanism until you VERIFY plugin v4 support.
- The Vercel structured-logging specifics come from a Vercel Knowledge Base guide (official domain, but a guide rather than core reference); the `console` API support and log-capture behaviour are confirmed in core Vercel Function Logs docs.

---

## Standards document draft (hand to the maintainer)

**Principles (non-negotiable):** simple beats complex; one way to do a thing; clarity over backward compatibility; fail fast at boundaries; trust the primary mechanism, no backups; one responsibility per function; surgical minimal diffs; evidence-based debugging with minimal targeted logs; fix root causes; let TypeScript catch errors; verify, do not fabricate; flag uncertainty; match existing conventions; read context before editing. No em dashes in code comments or docs.

### `tsconfig.json`
```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "allowJs": false,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "incremental": true,

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    "skipLibCheck": true,
    "noEmit": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] },
    "types": ["vitest/globals"]
  },
  "include": ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "next-env.d.ts"],
  "exclude": ["node_modules"]
}
```
Note: Next.js manages `next-env.d.ts`; do not edit it. `paths` mirrors what `create-next-app` generates.

### `eslint.config.mjs`
```js
// @ts-check
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Type-aware strict rules for our own code.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-console': ['error', { allow: [] }], // only lib/log.ts may console; see override
      'no-empty': ['error', { allowEmptyCatch: false }],
    },
  },

  // The logging wrapper is the only place console is allowed.
  { files: ['lib/log.ts'], rules: { 'no-console': 'off' } },

  // process.env only inside lib/env.ts.
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['lib/env.ts', 'next.config.ts', 'drizzle.config.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'process', property: 'env', message: 'Read env only from lib/env.ts.' },
      ],
    },
  },

  // BOUNDARY 1: templates may import only lib/tokens and lib/copy-slots.
  {
    files: ['templates/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@/lib/*', '@/app/*'], message: 'Templates may import only @/lib/tokens/* and @/lib/copy-slots/*.' },
          { group: ['!@/lib/tokens/*', '!@/lib/copy-slots/*'] }, // negations re-allow; keep last
        ],
      }],
      // BOUNDARY 4: no hex literals or Tailwind palette classes in templates.
      'no-restricted-syntax': ['error',
        { selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]", message: 'No hex colour literals in templates; use semantic CSS-variable classes.' },
        { selector: "Literal[value=/\\b(bg|text|border|from|via|to|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\\b/]", message: 'No Tailwind palette classes in templates; use semantic classes.' },
      ],
    },
  },

  // BOUNDARY 2: lib must not import app or templates.
  {
    files: ['lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['@/app/*', '@/templates/*'], message: 'lib must not depend on app or templates.' }],
      }],
    },
  },

  // BOUNDARY 3: pure modules must not import IO modules.
  {
    files: ['lib/select/**/*.ts', 'lib/tokens/**/*.ts', 'lib/copy-slots/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['@/lib/ai/*', '@/lib/images/*', '@/lib/db/*', '@/lib/inngest/*'], message: 'Pure modules must not import IO modules.' }],
      }],
    },
  },

  // No default exports except Next file conventions.
  {
    files: ['**/*.{ts,tsx}'],
    ignores: [
      'app/**/page.tsx', 'app/**/layout.tsx', 'app/**/template.tsx', 'app/**/default.tsx',
      'app/**/loading.tsx', 'app/**/error.tsx', 'app/**/not-found.tsx', 'app/**/global-error.tsx',
      'app/**/route.ts', 'app/**/opengraph-image.tsx', 'next.config.ts', 'drizzle.config.ts',
      'vitest.config.mts', 'playwright.config.ts',
    ],
    rules: { 'import/no-default-export': 'error' }, // VERIFY: requires eslint-plugin-import(-x); or use a review rule instead
  },

  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'db/**']),
])
```
`import/no-default-export` is marked VERIFY because it needs `eslint-plugin-import` (or `eslint-plugin-import-x`) added and confirmed on flat config; if you prefer zero extra plugins, drop that block and enforce by review.

### `.prettierrc`
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tailwindStylesheet": "./app/globals.css",
  "tailwindFunctions": ["cn", "clsx", "cva"],
  "plugins": ["prettier-plugin-tailwindcss"]
}
```
`tailwindStylesheet` is required for Tailwind v4 class sorting; `prettier-plugin-tailwindcss` must be last if other Prettier plugins are added.

### `.vscode/settings.json`
```jsonc
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  // VERIFY exact regex against current Tailwind CSS IntelliSense docs before relying on cn() hints:
  "tailwindCSS.experimental.classRegex": [["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"]]
}
```
`eslint.useFlatConfig` is omitted because the current ESLint extension defaults to flat config for ESLint 9.

### `.vscode/extensions.json`
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "vitest.explorer"
  ]
}
```

### `.editorconfig`
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
```

### `.gitignore` additions
```gitignore
# dependencies / build
node_modules/
.next/
out/
build/
next-env.d.ts

# env (commit .env.example only)
.env
.env.*
!.env.example

# vercel
.vercel

# test / coverage
coverage/
playwright-report/
test-results/
```

### `package.json` scripts and pnpm block
```jsonc
{
  "packageManager": "pnpm@10.15.0", // VERIFY exact installed pnpm 10.x version
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "knip": "knip",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["sharp"]
  }
}
```

### `lefthook.yml`
```yaml
pre-commit:
  parallel: true
  commands:
    format:
      glob: "*.{ts,tsx,js,jsx,json,css,md}"
      run: pnpm prettier --write {staged_files}
      stage_fixed: true
    lint:
      glob: "*.{ts,tsx}"
      run: pnpm eslint {staged_files}

pre-push:
  parallel: true
  commands:
    typecheck:
      run: pnpm typecheck
    unit:
      run: pnpm test
```
If you prefer husky plus lint-staged instead, mirror the pre-commit block in a `lint-staged` config:
```jsonc
// lint-staged.config.js (alternative to lefthook)
export default {
  '*.{ts,tsx,js,jsx,json,css,md}': ['prettier --write'],
  '*.{ts,tsx}': ['eslint --fix'],
}
```

### `.github/workflows/ci.yml`
```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: {}
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10   # VERIFY: pin to your pnpm 10.x; Corepack is absent from Node 25+
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm format:check
      - name: Forbid hex/palette in templates
        run: |
          if grep -rEn "#[0-9a-fA-F]{3,8}\b" templates/ --include="*.tsx" --include="*.ts"; then
            echo "Hex literal found in templates/"; exit 1
          fi
      - run: pnpm test
```
Vercel's Git integration produces deploy previews, so no `next build` step is needed here. Add a Playwright job against the preview URL later if desired.

### `dependabot.yml` (`.github/dependabot.yml`)
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule: { interval: weekly }
    groups:
      all-minor-patch:
        update-types: [minor, patch]
  - package-ecosystem: github-actions
    directory: "/"
    schedule: { interval: weekly }
```

### `drizzle.config.ts`
```ts
import { defineConfig } from 'drizzle-kit'
import { env } from '@/lib/env'

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './db',
  dbCredentials: { url: env.DATABASE_URL },
})
```
Workflow: `pnpm db:generate` then review the SQL in `db/`, then `pnpm db:migrate`. Never `push` to production.

### `vitest.config.mts`
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: 'node', // default; component tests override with a per-file docblock
    include: ['**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
  },
})
```
Component test files start with `// @vitest-environment jsdom`.

### `playwright.config.ts`
```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000' },
})
```
Set `PLAYWRIGHT_BASE_URL` to a Vercel preview URL to run e2e against a deployed preview.

### Templates registry pattern (`templates/registry.ts`)
```ts
import type { TemplateMeta } from '@/lib/copy-slots'
import { meta as t01 } from './t01-aurora/meta'
import { meta as t02 } from './t02-monolith/meta'
// ...import all ten metas

export const TEMPLATES = [
  t01, t02, /* ...t10 */,
] as const satisfies readonly TemplateMeta[]

// Compile-time: exactly ten templates.
type AssertLen<T extends { length: 10 }> = T
type _len = AssertLen<typeof TEMPLATES>

// Compile-time-ish: unique ids (runtime check, thrown at module load = fail fast).
const ids = new Set(TEMPLATES.map((t) => t.id))
if (ids.size !== TEMPLATES.length) {
  throw new Error('Template ids must be unique')
}

export type TemplateId = (typeof TEMPLATES)[number]['id']
```

### `lib/env.ts` pattern
```ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    ANTHROPIC_API_KEY: z.string().min(1),
    PEXELS_API_KEY: z.string().min(1),
    HMAC_SECRET: z.string().min(32),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
    INNGEST_EVENT_KEY: z.string().min(1),
    INNGEST_SIGNING_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
})
```
To fail fast at build time, import `env` in `next.config.ts`. VERIFY behaviour of any vars you set dynamically in `next.config.ts` (known open issue). `@t3-oss/env-nextjs` is ESM-only and needs `moduleResolution: "bundler"`, which the tsconfig above uses.

### `lib/config.ts` pattern
```ts
export const CONFIG = {
  stageBudgetMs: { brief: 15_000, select: 5_000, copy: 60_000, imagery: 45_000, tokens: 5_000 },
  deadline: { totalMs: 300_000 }, // five minutes end to end
  rateLimit: { windowSec: 60, max: 5 },
  logo: { luminanceCutoff: 0.5 },
  contrast: { minRatio: 4.5 }, // WCAG AA body text
  templates: { count: 10, conceptsShown: 3 },
} as const

export type Config = typeof CONFIG
```
Rule: any behaviour-tuning number must be named here, nowhere else.

### Error and result pattern
```ts
// lib/errors.ts
export class AppError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = 'AppError'
  }
}

// Discriminated result for expected, recoverable branches only.
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; reason: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const err = <E>(reason: E): Result<never, E> => ({ ok: false, reason })
```
Use `Result` for outcomes a caller must branch on (a selection tie, an LLM slot validation miss). Throw `AppError` for precondition and programmer errors — fail fast, no swallowing, no backup path.

### Logging wrapper (`lib/log.ts`)
```ts
type Level = 'info' | 'warn' | 'error'
type Fields = Record<string, string | number | boolean | null>

function emit(level: Level, event: string, fields: Fields = {}): void {
  // Vercel captures console output as structured JSON; level derives from the console method.
  const line = JSON.stringify({ event, ...fields })
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const log = {
  info: (event: string, fields?: Fields) => emit('info', event, fields),
  warn: (event: string, fields?: Fields) => emit('warn', event, fields),
  error: (event: string, fields?: Fields) => emit('error', event, fields),
}
```
Never pass personal data (name, email, company) into `fields`. Keep a stable key set (`event`, `slug`, `stage`, `durationMs`) so logs are filterable in the Vercel dashboard. Minimal, targeted, evidence-based — no debug noise left behind.