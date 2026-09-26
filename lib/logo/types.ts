import type { Artwork } from '@/lib/copy-slots/template-meta'

// What the logo stage learns about the visitor's file. `mixed` artwork has no strong polarity
// and sits on either surface; an opaque backdrop (a white box behind the mark) is reported so
// the surface can be chosen to hide the box's edge.
export type LogoPolarity = Artwork | 'mixed'

// Every polarity, for a schema that stores one (lib/brief/schema.ts).
export const LOGO_POLARITIES = [
  'dark-artwork',
  'light-artwork',
  'mixed',
] as const satisfies readonly LogoPolarity[]

export type LogoAnalysis = Readonly<{
  polarity: LogoPolarity
  // The normalised raster on Blob.
  image: Readonly<{ src: string; width: number; height: number }> | null
}>
