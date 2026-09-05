# Porting a template from provided code

How to turn a landing page the owner provides, as a GitHub repository or as pasted code, into one of the ten templates so that it looks exactly like the original and every word, picture and colour on it comes from the visitor's form. Written after `t02` to `t04` (ADR 0023), whose first attempt was rejected for looking nothing like its sources and whose second attempt was accepted after being checked against the sources section by section. Follow this in order; the checks at the end are the definition of done.

The two rules, in tension, that every decision serves:

1. **Identical to the source.** The owner judges a port by putting the example page beside the original. Any visible difference reads as wrong: a colour, a font, a missing section, a missing picture, a badge a few pixels smaller, a card whose portrait sits inside it instead of overlapping its edge. "Close" is a failure.
2. **Everything from the form.** A template holds no copy, no colour and no picture of its own (ADR 0008). It paints with the fourteen tokens, sets type through the two font variables, and renders a content object that the copy stage, the imagery stage and the logo stage fill. Nothing on a visitor's page may be invented (`lib/copy-slots/rules.ts` rejects numbers, superlatives and claims the owner did not make).

---

## 1. Intake

Before writing anything, know the source completely.

- **Licence.** A repository must carry MIT, Apache 2.0, BSD or an equivalent that allows use in a product that is sold. Copy the licence text and the copyright line into `THIRD_PARTY_NOTICES.md`. Pasted code with no licence stated is the owner's to clear; ask where it came from. "Free for personal use" and any non-commercial licence stop the port.
- **Clone or save it.** A repository: `git clone --depth 1` into the scratchpad. Pasted code: save it file by file under the scratchpad with the paths the pasting implies, so it can be run.
- **Read every file.** The page or pages, every component, every UI primitive (the `components/ui` folder in a shadcn source), the global stylesheet, the Tailwind config, the layout or root file that sets the font and the theme, `package.json`. Do not skim: the badge in a shadcn source is `text-xs` in `ui/badge.tsx` and `text-sm` at every use; the container's breakpoints live in `tailwind.config`; the hero's glow lives in a `.css` file, not a component.
- **Write the inventory.** Framework and version; Tailwind version (3 or 4 matters, see section 5); the theme block (every CSS variable, light and dark); the font and where it is set; the container config; every section in page order with its component file; every image with its path and size; every icon library and every icon used, by name; every script-driven behaviour (theme toggle, menu, carousel, marquee, accordion, scroll animations, forms and where they post); every third-party package that renders anything.
- **Sort the sections.** For each one, decide whether the brief (`lib/copy-slots/brief.ts`) can fill it honestly:
  - _Required_ when its content is words about the business, its steps, its value propositions, its statement, pictures the imagery stage can find, or labels the copy stage can write from the brief (a row of "sponsor" names becomes a row of the areas the business covers).
  - _Optional_ (`| null` in the content object) when it needs facts the brief does not hold: testimonials, team members, prices, a newsletter, market data, partner logos, contact details. The copy stage never writes these, `assemble` sets them null, the template omits them (or draws the stand-in the source's shape allows), and the example content fills them from the source's own placeholder copy so the layout can be reviewed whole.
  - Never invent a stand-in that claims something: no numbers in a statistics row unless they come from the owner, no "trusted by", no fabricated reviews on a visitor's page.
- **Ask early.** If a section cannot be honest either way, say so before building, with the options. Do not quietly drop it.

## 2. Run the source

The port is compared with the source running, not with a screenshot from memory.

- shadcn on Vite: `npm install` then `npx vite --port 5173 --strictPort`.
- Next.js: `npm install` then `npx next dev -p 3002`.
- Nuxt 2 on a current Node: `npm install` then `NODE_OPTIONS=--openssl-legacy-provider npx nuxt --port 3003`.
- Pasted code with no build: wrap it in the smallest Vite project that renders it, with the same Tailwind version and config it names.

The owner's own dev server usually holds port 3000; use 3001 for this project if it is free, or the owner's. Run the sources in the background and stop them when the port is done.

## 3. Design the content object

`templates/tNN-name/copy-slots.ts` declares the whole page as data. Work from the inventory.

- One field per piece of text, picture and link in the source, in the source's own structure (a hero card with a name, a handle and a comment is an object with those three fields). Keep the source's names where they read well; never rename a section to something the owner would not recognise ("Community" stays `community`).
- **Headings with a coloured word.** The sources colour a word or two of most headings with a gradient span. Model it as `{ text, emphasis }` (or two phrases when the source colours two), have the model copy the phrase from the text, and let the component find and wrap it; a phrase not found renders plain, and the fallback never guesses which word to colour.
- **Character ranges** for every text slot, taken from the source's own copy: measure the longest and shortest example the source shows in that slot and give the model a range around it. The example content must sit inside every range, so the source's lorem lengths are the ranges' floor and ceiling.
- **List counts** where the layout has room for so many and no more (a header's links, a footer's columns, a grid that wraps).
- **Lists of a fixed length** (three feature cards, four benefit cards) are tuples (`Three<T>`, `Four<T>`) and the contract checks the count before anything else, so a wrong count is reported alone.
- **Images** are `SlotImage | null`, one per picture the source shows, with a slot name; the first slot in `imageSlots` takes the brief's hero queries and the rest its detail queries (`lib/images/plan.ts`). A section must draw acceptably with its picture null.
- **Links** are never written by the model. Each points at one of the page's own anchors: the nav follows the sections in order, buttons go to the ask, footer links choose from a fixed list of targets (`z.enum(TARGETS)`).
- **Forms.** A source's contact or newsletter form posts to the owner's email as a mail message (`TemplateAssets.email`, the lead's address, read by the concept page); without an address the form leads to the page's ask. Never render a form that posts nowhere.
- **Optional sections** are `Readonly<{...}> | null`, checked in `violations` only when present, absent from the copy schema, set null in `assemble`, and listed in the contract's `ModelSlot` exclusion so the guide never asks the model for them.

The violations function uses `slotChecks` from `lib/copy-slots/checks.ts`. The contract (`contract.ts`) follows Aurora's shape: the zod schema (no lengths, the API takes none), the guide built from `PURPOSE` for the slots the model writes, `assemble`, the deterministic fallback proven over the corpus of briefs, and `defineContract`. Register the template in `templates/registry.ts` and `templates/render.tsx`, and move the registry test's "no contract" case to the next placeholder.

## 4. Build the sections, class for class

Each section of the source becomes a server component under `sections/`, and the port copies the source's markup and classes rather than reinterpreting them.

- **Keep the source's element tree.** The same nesting, the same wrappers, the same `div` that only carries a class. A section whose height differs from the source's by eight pixels usually lost a wrapper's padding somewhere.
- **Translate every class, never approximate.** The token map for a shadcn source:

  | Source class                                 | Port class                                                   |
  | -------------------------------------------- | ------------------------------------------------------------ |
  | `bg-background`, `bg-popover`                | `bg-surface`                                                 |
  | `text-foreground`                            | `text-on-surface`                                            |
  | `bg-card`                                    | `bg-accent` (the card surface, hand-set on examples)         |
  | `bg-muted`, `bg-secondary`, `bg-accent`      | `bg-surface-muted`                                           |
  | `text-muted-foreground`                      | `text-on-surface-muted`                                      |
  | `border`, `border-input`, `border-secondary` | `border-border`                                              |
  | `bg-primary`, `text-primary`, `fill-primary` | `bg-brand-deeper`, `text-brand-deeper`, `fill-brand-deeper`  |
  | `text-primary-foreground`                    | `text-on-brand`                                              |
  | `hover:bg-primary/90`                        | `hover:bg-brand-deeper/90` (the same alpha)                  |
  | `ring-ring`, `ring-offset-background`        | `ring-brand-deepest`, `ring-offset-surface`                  |
  | `bg-black/80`, `shadow-black/10`             | `bg-scrim/80`, `shadow-scrim/10`                             |
  | a fixed accent hex in a gradient             | `glow` or `glow-secondary`, set to that hex on the example   |
  | `text-green-500` beside a green primary      | `text-brand-deeper` (the source's two greens are one colour) |

  For a source with fixed hex colours (Nefa), write the same map from its palette: its page white is `surface`, its faint grey `surface-muted`, its hover grey `accent`, its headline black `on-surface`, its body grey `on-surface-muted`, its rule grey `border`, its gradient's two blues `brand` and `brand-deeper`, and its accent gradient's other hues the two glows.

- **Write the primitives out in `styles.ts`.** A shadcn source composes `cn(base, override)` and lets `tailwind-merge` resolve conflicts. This project cannot rely on that, because Tailwind 4 orders conflicting utilities by name, not by position in the class string (section 5). So every variant the source reaches by overriding is its own literal string: `badge.secondary` at `text-sm` because every badge in the source is overridden to `text-sm`; `cardTitleLg` for the title at `text-lg`; `cardDescriptionBrand` for the description in the brand colour; `button.outlineRound` for the carousel arrow; `cardHeaderBare` for a header without padding. Never append a class that conflicts with one already in the string.
- **The container.** Tailwind 3's `container` with `theme.container.screens` set replaces the breakpoints: `{ '2xl': '1400px' }` means full width up to 1400px and 1400px after, at every screen. Port it as `mx-auto w-full px-6 min-[1400px]:max-w-[1400px]` (with the source's padding), not as the per-breakpoint widths.
- **Icons.** lucide by name (`lucide-react` is installed; check the installed version exports the name, brand marks were removed and `LineChart` is `ChartLine`); a source's own SVG files ported verbatim with their fills mapped to tokens; Material Design Icons by path at the pixel size the source passes. Place by position when the source lists icons by name in data.
- **Pictures.** `next/image` with the slot's width and height, the source's classes for size and fit, and `sizes` for the width the layout gives it. The example imports the source's own image files from `example/` so the review renders the same pictures; Pexels pictures carry their credit, printed in the footer.
- **Scripts become CSS.** The phone menu is the one client component (or the whole header when the source toggles it by state). Everything else the source drove with a library is CSS in the template's scoped stylesheet: a marquee is two copies of the row and a keyframe; a hover menu is `:hover` and `:focus-within`; an accordion is `<details>` with a grid-rows transition at the source's duration and its icon rotated with `group-open:`; a carousel is a snapping scroll track with two buttons that scroll it; scroll-animation libraries (AOS) become scroll-driven keyframes on `[data-fade]` with the source's directions and delays; a glow that slides is its keyframe with the source's values at each breakpoint. All of it is off under reduced motion and absent without support, and the page is complete either way.
- **The source's own stylesheet rules** (a `.shadow` slab, a `.text-gradient`, a cover wash, a `.paragraph` recipe) go into the scoped `.css` file with their values mapped to tokens through `color-mix` where they used alpha.
- **Things a business page cannot have** are left out and written down in the ADR: a theme toggle, a repository link, a Discord logo. Put the ask's button where the source had its GitHub button, at the same size and variant, so the header's shape holds.

## 5. Tailwind 4 and tailwind-merge: the traps

The sources are Tailwind 3 with `tailwind-merge`; this project is Tailwind 4 without it. These are the differences that produced every mismatch in the first ports.

| Trap                                                                                                                                                        | What happens                                                                                                                                                   | Do this                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two utilities for one property in a class string (`text-xs` then `text-sm`, `p-6` then `p-0`, `rounded-md` then `rounded-full`, `relative` then `absolute`) | Tailwind 4 emits them in name order, so whichever sorts later wins, regardless of where it sits in the string.                                                 | Never combine them. Make a named variant with only the winning class (section 4).                                                                    |
| `space-y-*` / `space-x-*`                                                                                                                                   | Tailwind 4 puts the margin on every child but the last; Tailwind 3 put it on every child but the first. A row's children shift.                                | Write `[&>*+*]:mt-*` / `[&>*+*]:ml-*`, with breakpoint variants as the source had them.                                                              |
| `text-lg` applied over shadcn's `CardTitle` (`text-2xl leading-none`)                                                                                       | `tailwind-merge` removes `leading-none` when a font size is added, so the source's title has `text-lg`'s own line height (28px).                               | A `cardTitleLg` recipe without `leading-none`. In Tailwind 4 `leading-none` would win through `--tw-leading` and make the card 10px shorter.         |
| `text-md`, a class that does not exist                                                                                                                      | `tailwind-merge` still treats it as a font size and removes `text-sm`; the text renders at the base size.                                                      | Use `text-base` where the source wrote `text-md`.                                                                                                    |
| `shadow-sm`, `rounded-sm`, `drop-shadow`                                                                                                                    | Renamed between versions: Tailwind 3's `shadow-sm` is Tailwind 4's `shadow-xs`; 3's `rounded-sm` (2px) is 4's `rounded-xs`; 3's `rounded` is 4's `rounded-sm`. | Translate by value, not by name.                                                                                                                     |
| `bg-gradient-to-r`                                                                                                                                          | Tailwind 4's name is `bg-linear-to-r`.                                                                                                                         | Use the new name; `from-brand-deeper/60 to-brand-deeper` alpha stops work the same.                                                                  |
| `max-w-screen-xl`                                                                                                                                           | Tailwind 4 has no `screen-*` widths.                                                                                                                           | `max-w-(--breakpoint-xl)`.                                                                                                                           |
| An absolutely placed child inside a component whose root class says `relative`                                                                              | The root's `relative` sorts after `absolute` and wins.                                                                                                         | Let the caller pass the position (`relative h-10 w-10` by default, `absolute -top-12 ...` when overlapping), never bake `relative` into the wrapper. |
| JSX whitespace around a padded span (`the` newline `<span class="px-2">word</span>`)                                                                        | JSX trims the newline, so the source has no space and the padding stands in for it. Adding a space doubles the gap.                                            | Trim the space beside the phrase when the span carries padding.                                                                                      |
| A glow at `z-index: -1` on the page                                                                                                                         | Above the body's canvas in the source; under the template root's own background here.                                                                          | Make the template root `relative isolate` so a negative z-index sits above its background.                                                           |

When in doubt, measure (section 7): the box tree shows the line height or margin that differs.

## 6. The example page

`app/examples/<name>/page.tsx` is what the owner compares with the source. It must render the source's look exactly.

- **The token set is written by hand from the source's theme.** Convert each CSS variable of the source's theme (both blocks, light and dark, for a shadcn source) to hex with `culori` and place it under the token map of section 4. The card colour goes in `accent`. The accent gradients' hexes go in `glow` and `glow-secondary`. Do not derive the set from a brand hex; the derived set is for real brands and looks like a different page.
- **The font is the source's.** Tailwind's default sans stack when the source sets none, otherwise the font the source loads (`next/font/google`, not preloaded, as the Aurora example does).
- **The example content is the source's own copy and pictures**, with the product name swapped for Kestrel, including the optional sections. Every string must sit inside its slot's range, so the ranges were set from these strings in the first place. Copy the source's image files into `example/` (and fetch the ones it loads at run time, such as placeholder portraits, into `example/` too) so the review renders offline; record their origins in `THIRD_PARTY_NOTICES.md`.
- Dark by default when the source's screenshots are dark, with `?scheme=` for the other; light only when the source has no dark theme.

## 7. Verify, section by section

Nothing is done on the strength of a full-page screenshot. Run the source and the port, then:

```
pnpm template:compare http://localhost:5173/ http://localhost:3000/examples/<name> \
  'hero=section:first-of-type' about 'steps=#howItWorks::#how-it-works' 'services=section:has(img[alt="About services"])::#services' faq footer
```

- Every section's rendered height must match the source's at the comparison width (1535px, the owner's laptop) to the pixel. A difference of any size is a class that was not translated: find it with `--measure '<selector>'` on the element and read the box tree side by side (a `lh=28px` against `lh=18px` is the `leading-none` trap; a `pb=` that differs is a padding override that did not win).
- Open every pair of screenshots and compare them: colours, the coloured word in each heading, badge sizes, portraits overlapping edges, icons, the marquee, the hover menu, the accordion's icon and open state.
- Then the whole page at 1920 and 390 through Playwright with reduced motion, an axe scan and console errors: no horizontal overflow, no errors, and axe clean apart from findings the source itself has (record those in the ADR; a real brand's derived tokens solve the contrast pairs the template declares).
- `pnpm test` (the slot tests on the example content, the fallback over the corpus, the guide test), `pnpm lint`, `pnpm typecheck`, `pnpm knip`, `pnpm format:check`.

Screenshots taken by the comparison script land in `.compare/`, which git ignores.

## 8. Write it down

- An ADR entry (amend `docs/adr/0023-...` or add one for a new batch): the source, the licence, every deviation from the source and why, the axe findings inherited from the source, and the verification date.
- `THIRD_PARTY_NOTICES.md`: the licence and copyright line, and which files under `example/` came from the source or from where the source loads them.
- `docs/claims-register.md` if a template changes what the home page may claim.

## 9. The mistakes that were made once

Kept here so they are not made twice.

- Building from memory of the code instead of the code: sections merged, renamed, redesigned or dropped. The owner's words were "do not ruin the layout the templates already have".
- Deriving the example's colours from a brand hex the source never used, and choosing fonts the source never loaded, so the example looked like another site.
- Leaving pictures out of the example (feature cards with no illustration) when the source ships them.
- Dropping sections with awkward content instead of making them optional and filling them on the example.
- Trusting class order (`${cardTitle} text-lg`) in Tailwind 4, and trusting `space-y` to mean what it meant in Tailwind 3.
- Comparing whole pages by eye at one width instead of measuring each section against the running source.
- Writing files through the shell on Windows: a heredoc past a few thousand characters fails with "unexpected EOF", and the shell collapses doubled backslashes and expands backticks inside a command. Write files with the Write tool and edit them with the Edit tool.
