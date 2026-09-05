# The content sections, and the HTML budget they move

- Status: accepted
- Date: 5 September 2026
- Amends: the `/` HTML budget in `scripts/bundle-budget.mjs` (ADR 0006 set 25 KB)

## Context

The marketing and business review of 5 September 2026 found the home page proved its mechanism and then stopped: nothing said what a good site does for the owner, what a hired build includes, how the studio compares with a website builder, or what a not-ready visitor can do. `docs/home-page-content-plan.md` planned four sections and a set of copy changes. Three of the four ship in this change with what exists today: Four things your site has to do (`#outcomes`), If you like one, here is what happens next (`#real-build`) and Doing it yourself, or asking us (`#your-options`), plus a send-this-page control in the closing, a Taster that opens into the build section, twelve FAQ entries in place of eight, and every visitor sentence moved into exported constants so the copy test covers it. The examples band waits on a real render and the owner's decisions on the six client sites.

The owner corrected two facts during planning, and the copy follows them: the templates are never a client's final product, so nothing says "built from the design you chose"; a hired build is a whole site designed from scratch, with professional wording, pages Google and the chat assistants people now ask can read, integrations and analytics. Lines that would state a contract term (payment, ownership, a timeline in weeks, a care plan) are absent until the owner records the decision, and `CONFIG.build` and `CONFIG.care` are typed nullable so those numbers have one home when they arrive.

The budget script holds `/` to 210,000 B of initial script, 14,000 B of stylesheet and 25,000 B of HTML, gzipped. The plan's decision 30 said the HTML and stylesheet lines would move and must be measured, never guessed.

## Decision

1. **Measured on the production build of 5 September 2026, after the three sections, the About reword and the caption set:** scripts 208,847 B (was 207,527), stylesheets 13,625 B (was 13,451), HTML 26,971 B (was 21,809). The new sections reuse the page's existing recipes (Shape A grid, the Taster's step row, the call agenda's label column), so the stylesheet grew by 174 B and the script by 1,320 B, most of it the share leaf.
2. **The HTML budget for `/` rises to 36,000 B.** It was first set at 30,000 B for the three sections. The work band added six cards, each carrying a phone capture and a desktop capture in AVIF and WebP at two widths (forty-eight hashed asset URLs), a phone-or-desktop toggle of two native radio inputs, and the clients' alt text and dated captions: 34,941 B measured the same evening. AVIF stays, because the bytes it saves every phone visitor outweigh a few kilobytes of HTML, and the desktop view stays because the owner asked for it. The journey band re-measures this line when it ships, and this ADR is amended with the number.
3. **The script and stylesheet budgets do not move.** The band adds no client JavaScript beyond the share leaf already counted, and no `next/image` (a plain `<picture>` of committed files), so both lines are expected to hold.

## Consequences

- `pnpm build && pnpm budget` passes; the budget job in CI holds the new line.
- `e2e/mobile.spec.ts` carries a soft assertion that the added sections stay within ten phone screens together, so length is watched without a red build.
- `docs/claims-register.md` starts: every objective claim on the page, its evidence and its check date, which the CAP Code expects to be held before publication.
- Twelve FAQ entries made the tablet accessibility scan outrun its clicks; the scan now opens the entries directly and the click itself stays tested in `e2e/home.spec.ts`.

## Amendment, 5 September 2026, evening

The copy review's conversion pass (`docs/copy-review.md`) added the "Everything your real site needs, built in." band (`#included`: a heading, a lead, eight hairline cells on the What you get recipe, a mono caption and two text-link asks) between Our work and the real build, and one small ask line with a text link at the end of the work, real-build and options bands. It removed the How it works legend and its two icons. Measured on the production build: HTML 36,576 B gzipped (was 35,011), scripts 208,824 B (was 208,868: the legend's icons left). **The HTML budget for `/` rises to 38,000 B.** The stylesheet line is over at 17,497 B for reasons outside this page (templates t02 to t04 and later ones marked ready in the same working tree compile their utilities into the one stylesheet); the band itself uses only classes the page already had, and that line belongs to the template work's own record.

## Amendment, 5 September 2026, night: the AVIF captures leave the bundle

`next build` (Turbopack) warned once per AVIF import, twenty-four times, that "this version of Turbopack does not support AVIF images" and emitted each file unprocessed. The build still passed, and the pictures still served, but a build that warns on every run hides the next real warning. The twenty-four AVIF files now live in `public/work/` and are served as they are; the WebP fallbacks stay imported from `app/_images/work/`, where the static import supplies width and height. Each AVIF address carries the manifest's capture date as a version (`?v=2026-09-05`), so a re-capture busts the cache, and `next.config.ts` marks `/work/*` immutable for a year, which is the header the hashed files already get. `scripts/capture-work.mjs` writes each format to its own folder and `tests/integration/work-manifest.test.ts` checks that every AVIF address the band writes names a committed file at the manifest's version. The HTML line moves by the difference between a hashed asset path and a versioned public path, which is within the 36,000 B budget; the number is re-measured with the journey band.
