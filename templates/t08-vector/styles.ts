import type { CSSProperties } from 'react'

// The source's repeated recipes, class for class, painted with the tokens. Class strings stay
// literal so Tailwind can see them.
//
// Token map from the source's two themes, which are the same six variables on each: its
// background is surface, its foreground on-surface, its muted (the cards' fill, at half
// strength) surface-muted, its muted-foreground on-surface-muted, and every alpha of the
// foreground or the background the same alpha on the token. Its buttons, its lit menu rows,
// its cursor and its whole footer are the page inverted: the surface on the ink. Its two
// floating pills are a dark glass whatever the theme (neutral-900 at 70 percent with white on
// it): the scrim and on-scrim. The three colours of its wave background are the glow, the
// second glow and the brand; the duotone on its project pictures runs from the scrim to the
// glow.

// The source's container: 1440px at most, 1800px from 2xl and 2200px from 3xl, centred.
export const container = 'mx-auto max-w-360 2xl:max-w-450 3xl:max-w-550'

// The source's horizontal padding: 1.5rem, 3rem from sm and 6rem from lg.
export const pad = 'px-6 sm:px-12 lg:px-24'

// Every block with an anchor sits 100px below the top when a link leads to it, as the
// source's smooth-scroll click handler offset its anchors.
export const anchored = 'scroll-mt-25'

// The round inverted button.
export const pill =
  'inline-flex items-center justify-center rounded-full bg-on-surface font-medium text-surface transition-opacity hover:opacity-80'

// The wait before an animated part arrives, in seconds (vector.css).
export function delay(seconds: number): CSSProperties {
  return { '--delay': String(seconds) } as CSSProperties
}
