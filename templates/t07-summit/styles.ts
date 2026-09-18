import type { CSSProperties } from 'react'

// The source's repeated recipes, class for class, painted with the tokens. Class strings stay
// literal so Tailwind can see them.
//
// Token map from the source's fixed palette: its white page is surface; its slate-50 cards,
// bands and hover washes surface-muted; its purple-100, the tint of every other service card,
// accent; its slate-200 hairlines border and its zinc-200 ones the same black at 11 percent
// (each within a few units of the other on white); its slate-100 (a card under the pointer,
// the footer's rule, the watermark's outline) the border at half strength; its black buttons
// brand-deeper and their zinc-800 hover brand-deepest, with white on them on-brand; its zinc-600
// body grey on-surface-muted; its zinc-800, 700, 500, 400 and 300 the same black at 85, 75, 55,
// 37 and 17 percent; its orange stars glow and the green dot before a reading time
// glow-secondary; the black wash under a facility's caption scrim and the white on it on-scrim.

// The source's container padding: 1.5rem, 3rem from md, 4rem from lg and 6rem from xl.
export const pad = 'px-6 md:px-12 lg:px-16 xl:px-24'

// Every block below the hero sits 9rem down from the one before, 11rem from md.
export const gap = 'mt-36 md:mt-44'

// Every section with an anchor sits 120px below the top when a link leads to it, as the
// source's smooth-scroll instance offset its anchors.
export const anchored = 'scroll-mt-30'

// The small grey line over a block's heading, and the face of the heading under it, in the
// display family as the source set every big heading (its stylesheet gave each h1 Urbanist);
// each heading names its own size, width and alignment, since the source varies them.
export const eyebrow = 'text-on-surface/75'
export const title = 'font-display font-medium leading-tight tracking-tight text-on-surface/85'

// The arrow at the end of a button, nudging right under the pointer.
export const arrow = 'transition group-hover:translate-x-1'

// The dark square button that opens and closes the phone sheet.
export const menuButton =
  'aspect-square rounded-md bg-on-surface/85 p-2 font-medium text-surface transition hover:bg-on-surface/75 md:hidden'

// A text field of the appointment form, and the label over it.
export const field =
  'w-full rounded-sm border border-on-surface/11 bg-transparent px-3 py-3 text-sm text-on-surface/75 transition focus:border-on-surface/37 focus:outline-none'
export const label = 'mb-2 block text-sm text-on-surface/75 uppercase'

// The wait before an animated part arrives, in seconds, as the source's delays ran
// (summit.css).
export function delay(seconds: number): CSSProperties {
  return { '--delay': String(seconds) } as CSSProperties
}
