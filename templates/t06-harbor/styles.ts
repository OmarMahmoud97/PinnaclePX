import type { CSSProperties } from 'react'

// The source's own utilities and its repeated recipes, class for class, painted with the
// tokens. Class strings stay literal so Tailwind can see them.
//
// Token map from the source's fixed dark palette: its near-black page (#0b0b0b) is surface,
// its slightly lighter bands (#0f0f0f) surface-muted, its cards (#111) accent, its hairlines
// and tag fills (#1a1a1a) border, its lime (#d7ff2f) brand-deeper and the lime's hover
// (#c8f020) brand-deepest, the near-black set on lime on-brand, and white on-surface, with
// every alpha the source used kept as the same alpha on the token. Its two other greys are
// white at an alpha: #222 is on-surface/10, #333 on-surface/16 and #555 on-surface/30. Its
// footer, three units darker than the page, is the page.

// The source's `container-gym`: 1440px at most, centred, 2rem of padding, 4rem from md and
// 6rem from xl.
export const container = 'mx-auto max-w-[1440px] px-8 md:px-16 xl:px-24'

// The source's `section-spacing`: 7.5rem above and below.
export const section = 'py-30'

// The small tracked line in the accent over every heading.
export const eyebrow =
  'mb-4 block text-xs font-semibold tracking-[0.25em] text-brand-deeper uppercase'

// The block heading: black capitals in the display face.
export const heading = 'font-display text-5xl font-black text-on-surface uppercase'

// The curves the source's entrances ran on: its wrappers' own, which is CSS's `ease`, its
// motion library's default for a plain tween, which is `ease-out`, and the expo curve of the
// headline's lines, which is the site's own entrance curve.
const EASES = { out: 'ease-out', expo: 'var(--ease-enter)' } as const

// The wait before an animated part arrives, in seconds, how far it travels, how long it takes
// and on which curve, as the source's wrappers were configured (harbor.css).
export function motion(
  delay: number,
  travel?: string,
  duration?: number,
  ease?: keyof typeof EASES,
): CSSProperties {
  const style: Record<string, string> = { '--delay': String(delay) }
  if (travel !== undefined) style['--travel'] = travel
  if (duration !== undefined) style['--dur'] = `${String(duration)}s`
  if (ease !== undefined) style['--ease'] = EASES[ease]
  return style
}
