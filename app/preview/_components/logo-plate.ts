import type { LogoPolarity } from '@/lib/logo/types'
import { deriveTokens } from '@/lib/tokens/derive'
import type { Scheme } from '@/lib/tokens/types'

// The plate a visitor's image logo sits on when its artwork is the page's own shade (decision
// 23, docs/template-fit-decisions.md): dark artwork on a dark page, which the dark look gives
// whatever the artwork (lib/tokens/scheme.ts), sits on the light scheme's surface; light artwork
// on a light page, which no look gives today, would sit on the dark scheme's. The surface is the
// brand's own, from the same colour engine as the page, so the plate carries the brand's tint.
// Mixed artwork, and artwork the page already suits, get none.
export function logoPlate(polarity: LogoPolarity, scheme: Scheme, hex: string): string | undefined {
  const clash =
    (polarity === 'dark-artwork' && scheme === 'dark') ||
    (polarity === 'light-artwork' && scheme === 'light')
  if (!clash) return undefined
  return deriveTokens(hex, scheme === 'dark' ? 'light' : 'dark', []).surface
}
