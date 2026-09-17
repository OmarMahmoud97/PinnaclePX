import type { CSSProperties } from 'react'

// The source's own utility and its repeated recipes, class for class, painted with the tokens.
// Class strings stay literal so Tailwind can see them.
//
// Token map from the source's fixed palette: its white page and cards are surface, its slate-50
// hover and rings surface-muted, its black on-surface, its zinc-600 body grey on-surface-muted,
// its zinc-800, 700, 500 and 400 the same black at 85, 75, 55 and 37 percent, its slate-200 rule
// border, its slate-300 ring on-surface at 20 percent, its orange-500 brand-deeper and its
// orange-600 brand-deepest, and white on orange on-brand.

// The source's `px-auto` utility, from its own stylesheet: 1.5rem of horizontal padding, 3rem
// from md, 6rem from lg and 10rem from xl.
export const pad = 'px-6 md:px-12 lg:px-24 xl:px-40'

// Every section with an anchor sits 120px below the top when a link leads to it, as the
// source's smooth-scroll instance offset its anchors.
export const anchored = 'scroll-mt-30'

// The round orange button the header, the hero and the card of opening times share.
export const pill =
  'rounded-full bg-brand-deeper px-6 py-3 text-on-brand transition hover:bg-brand-deepest'

// The dark square button that opens and closes the phone sheet.
export const menuButton = 'aspect-square rounded-md bg-on-surface/85 p-2 text-surface'

// The coloured uppercase line over a section's heading, and the heading under it.
export const eyebrow = 'font-medium text-brand-deeper uppercase'
export const heading = 'text-4xl md:text-5xl'

// The footer's links: the body grey, a shade lighter under the pointer.
export const footerLink = 'text-on-surface-muted hover:text-on-surface/55'

// The wait before an animated part arrives, in seconds, as the source's delays ran (ember.css).
export function delay(seconds: number): CSSProperties {
  return { '--delay': String(seconds) } as CSSProperties
}
