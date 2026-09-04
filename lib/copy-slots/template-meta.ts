// Which logo artwork a template's header surface can carry. A dark surface shows light
// artwork, a light surface shows dark artwork, and a template whose chrome is plain `surface`
// takes either, because the token set decides the surface per brand.
export type Artwork = 'dark-artwork' | 'light-artwork'

export type TemplateMeta = Readonly<{
  id: string
  name: string
  description: string
  // False for a placeholder. The selector never chooses an unready template.
  ready: boolean
  polarity: Artwork | 'either'
  // Words for how the template feels, so the selector can pick three that feel different.
  tones: readonly string[]
}>

// Exactly ten templates. The registry satisfies this tuple, so the count is checked at compile time.
export type TemplateTuple = readonly [
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
  TemplateMeta,
]
