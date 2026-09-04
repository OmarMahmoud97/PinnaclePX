import type { Artwork } from '@/lib/copy-slots/template-meta'

// What the logo stage learns about the visitor's file. `mixed` artwork has no strong polarity
// and sits on either surface; an opaque backdrop (a white box behind the mark) is reported so
// the surface can be chosen to hide the box's edge.
export type LogoPolarity = Artwork | 'mixed'

export type LogoAnalysis = Readonly<{
  polarity: LogoPolarity
  // Alpha-weighted mean perceptual lightness (CIE L*, 0 to 1) of the visible artwork.
  lightness: number
  opaqueBackdrop: boolean
  // The normalised raster on Blob, or null when the file could not be read and the template
  // shows the wordmark instead.
  image: Readonly<{ src: string; width: number; height: number }> | null
}>
