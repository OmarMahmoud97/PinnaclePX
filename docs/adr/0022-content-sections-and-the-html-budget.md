# The content sections, and the HTML budget they move

- Status: accepted
- Date: 5 September 2026
- Amends: the `/` HTML budget in `scripts/bundle-budget.mjs` (ADR 0006 set 25 KB)

## Context

The marketing and business review of 5 September 2026 found the home page proved its mechanism and then stopped: nothing said what a good site does for the owner, what a hired build includes, how the studio compares with a website builder, or what a not-ready visitor can do. `docs/home-page-content-plan.md` planned four sections and a set of copy changes. Three of the four ship in this change with what exists today: Four things your site has to do (`#outcomes`), If you like one, here is what happens next (`#real-build`) and Doing it yourself, or asking us (`#your-options`), plus a send-this-page control in the closing, a Taster that opens into the build section, twelve FAQ entries in place of eight, and every visitor sentence moved into exported constants so the copy test covers it. The examples band waits on a real render and the owner's decisions on the six client sites.

The owner corrected two facts during planning, and the copy follows them: the templates are never a client's final product, so nothing says "built from the design you chose"; a hired build is a whole site designed from scratch, with professional wording, pages Google and the chat assistants people now ask can read, integrations and analytics. Lines that would state a contract term (payment, ownership, a timeline in weeks, a care plan) are absent until the owner records the decision, and `CONFIG.build` and `CONFIG.care` are typed nullable so those numbers have one home when they arrive.

The budget script holds `/` to 210,000 B of initial script, 14,000 B of stylesheet and 25,000 B of HTML, gzipped. The plan's decision 30 said the HTML and stylesheet lines would move and must be measured, never guessed.

## Decision

1. **Measured on the production build of 5 September 2026, after the three sections:** scripts 208,248 B (was 207,527), stylesheets 13,611 B (was 13,451), HTML 26,794 B (was 21,809). The new sections reuse the page's existing recipes (Shape A grid, the Taster's step row, the call agenda's label column), so the stylesheet grew by 160 B and the script by 721 B, which is the share leaf.
2. **The HTML budget for `/` rises to 30,000 B.** The 3.2 KB above today's number is for the examples band (a brief card, two captures in the page's own frames, captions and a footnote), which is expected to land inside it. It is re-measured when the band ships, and this ADR is amended with the number.
3. **The script and stylesheet budgets do not move.** The band adds no client JavaScript beyond the share leaf already counted, and no `next/image` (a plain `<picture>` of committed files), so both lines are expected to hold.

## Consequences

- `pnpm build && pnpm budget` passes; the budget job in CI holds the new line.
- `e2e/mobile.spec.ts` carries a soft assertion that the added sections stay within seven phone screens together, so length is watched without a red build.
- `docs/claims-register.md` starts: every objective claim on the page, its evidence and its check date, which the CAP Code expects to be held before publication.
- Twelve FAQ entries made the tablet accessibility scan outrun its clicks; the scan now opens the entries directly and the click itself stays tested in `e2e/home.spec.ts`.
