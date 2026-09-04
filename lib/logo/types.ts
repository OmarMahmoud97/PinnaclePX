import type { Artwork } from '@/lib/copy-slots/template-meta'

// What the logo stage learns about the visitor's file. `mixed` artwork has no strong polarity
// and sits on either surface; an opaque backdrop (a white box behind the mark) is reported so
// the surface can be chosen to hide the box's edge.
type LogoPolarity = Artwork | 'mixed'

export type LogoAnalysis = Readonly<{
  polarity: LogoPolarity
  // Alpha-weighted mean relative luminance of the artwork, 0 to 1.
  luminance: number
  opaqueBackdrop: boolean
  // The normalised raster on Blob, or null when the file could not be read and the template
  // shows the wordmark instead.
  image: Readonly<{ src: string; width: number; height: number }> | null
}>
