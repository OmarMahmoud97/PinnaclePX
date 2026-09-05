# Two stylesheets, so the templates stay off the site's own pages

- Status: accepted
- Date: 5 September 2026
- Builds on: ADR 0008 (the template contract), ADR 0022 (the content sections and the byte budgets)

## Context

Tailwind scans the whole project and writes one stylesheet. `app/globals.css` is that sheet, it is
imported by the root layout, and every page of the site loads it. The templates live under
`templates/` and render on two routes only: `/preview/[slug]/[templateId]`, which a lead sees after
the pipeline runs, and the four `/examples/*` pages, which exist so a template can be compared with
the source it was ported from.

Until this change the templates' classes went into that one sheet, so the home page and `/start`
downloaded the styling of pages they never render. With Aurora alone the cost was small enough to
miss. When t02 to t04 landed (ADR 0023) the shared sheet measured **17,732 B gzipped against a
14,000 B budget**, and the CI budget job failed. Six more templates are planned, so the line would
have had to move again with each one, and the marketing page's stylesheet would have grown in
proportion to work that never appears on it.

Raising the budget was the cheap answer and was rejected: the number is a guardrail, ADR 0022 had
just said the stylesheet line would not move, and the page sells the studio partly on speed.

## Decision

1. **`templates/` has its own stylesheet.** `templates/tailwind.css` generates the utilities for
   the classes used under that directory (`@import 'tailwindcss/utilities.css' source('.')`), and
   each template's `index.tsx` imports it beside its own scoped file. It therefore loads on the
   preview and example routes and nowhere else.
2. **`app/globals.css` no longer scans that directory** (`@source not '../templates'`). It stays
   the site's sheet: the tokens on `:root`, preflight, the base rules and the utilities for
   `app/`, `components/` and `lib/`.
3. **The theme lives in `app/tokens.css`, which both sheets use.** `globals.css` imports it and
   emits it once for every page; `templates/tailwind.css` takes it, and the default theme, by
   reference (`theme(reference)`), so a utility generated for a template resolves to exactly the
   variables the site defines and nothing is emitted twice. A brand's generated set still
   overrides those variables per preview at runtime, as before.

`@reference '../app/globals.css'` was tried first and is the wrong tool here: the referenced sheet
brings its source configuration with it, `@source not '../templates'` included, so the templates'
own `source('.')` was cancelled and the sheet compiled to 66 B. Referencing the theme alone avoids
that entirely.

## Consequences

- Measured on the production build of 5 September 2026: `/` and `/start` stylesheets **13,103 B
  gzipped** (14,000 B budget), down from 17,732 B, and below the 13,611 B of ADR 0022 because
  Aurora's classes leave the sheet too. The budgets in `scripts/bundle-budget.mjs` do not move.
- The preview and example routes carry a second stylesheet of about 80 KB uncompressed. That is
  the cost of the split, and it falls on the pages that actually render a template.
- Verified by rendering each of the four example pages against the production server and checking
  every class in the markup against the stylesheets the page links: 290, 342, 318 and 280 classes,
  none missing. The same check on `/`, `/start` and `/privacy` shows nothing lost from the site's
  own sheet.
- A new template needs no stylesheet wiring beyond the import in its `index.tsx`, and adds nothing
  to the pages that sell the work.
