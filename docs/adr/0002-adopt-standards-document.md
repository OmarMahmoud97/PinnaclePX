# Adopt the code structure and maintainability standards

- Status: accepted
- Date: 2026-09-02

## Context

The project starts greenfield with a verified standards document covering Next.js 16 organisation, TypeScript strictness, linting, styling, data, testing, and repository hygiene.

## Decision

Adopt the standards document in full. Deviations made during initial setup, each for a verified reason:

1. `tsconfig.json` `types` includes `node` alongside `vitest/globals`. Setting `types` disables automatic `@types/*` inclusion, so Node globals would otherwise be missing.
2. Import boundaries use `no-restricted-imports` with `regex` patterns rather than gitignore-style `group` globs. A negated group cannot re-include a path whose parent was excluded, so the doc's negation form cannot express "all of lib except tokens and copy-slots".
3. The template hex and palette rules also match template literals, not only string literals.
4. `import/no-default-export` uses the `eslint-plugin-import` instance bundled with `eslint-config-next`, so no extra plugin is added.
5. Lefthook hooks install through a `prepare` script because pnpm 10 blocks dependency lifecycle scripts by default, and only `sharp` is allowlisted.
6. `templates/registry.ts` landed with ten placeholder templates (t01-aurora through t10-orbit) so the compile-time count and unique-id checks are live from day one. The exactly-ten check is a ten-element tuple type in `lib/copy-slots/template-meta.ts` used via `satisfies`, because an unused type alias would trip `noUnusedLocals`. Rename the placeholders as real templates are designed.
7. `tsconfig.json` has `jsx: "react-jsx"` and includes `.next/dev/types/**/*.ts`. Next.js 16 rewrites these on build and treats the first as mandatory.
8. Vitest resolves the `@/*` alias natively through `resolve.tsconfigPaths`, so `vite-tsconfig-paths` is not installed.
9. Knip is configured in `knip.jsonc`: the Drizzle plugin is disabled because loading `drizzle.config.ts` validates env, and scaffold modules with no consumer yet are listed as entries until the pipeline imports them.
10. ESLint stays on the 9.x line even though npm marks it end of life. The `import`, `react`, and `jsx-a11y` plugins bundled by `eslint-config-next` 16.3.4 do not yet declare ESLint 10 support. Revisit when eslint-config-next does.

## Consequences

Tooling matches the document's intent with the mechanisms verified to work on the installed versions. Future deviations get their own ADR.
