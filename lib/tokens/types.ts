// The semantic colour tokens a template may paint with. Each is a CSS variable on :root
// (app/globals.css) and a utility class family (bg-surface, text-on-brand, ...). The generated
// brand token set overrides the variables per preview, so a template never knows its colours.
//
// Meaning, whatever the polarity of the surface:
// - surface / surface-muted: the page and its quieter panels; on-surface(-muted) is text on them.
// - brand: decoration only, never text. brand-deeper is the fill and the coloured text that
//   carries on-brand; brand-deepest is its hover.
// - glow / glow-secondary: the two hues of light a template may spread; never behind text.
// - scrim: the dark wash under text over a photograph; on-scrim is the text on it.
export const TOKEN_NAMES = [
  'surface',
  'surface-muted',
  'on-surface',
  'on-surface-muted',
  'border',
  'accent',
  'brand',
  'brand-deeper',
  'brand-deepest',
  'on-brand',
  'glow',
  'glow-secondary',
  'scrim',
  'on-scrim',
] as const

type TokenName = (typeof TOKEN_NAMES)[number]

// A text token painted on a background token. Every template declares the pairs it uses, so
// the contrast solver knows which pairs it must bring to WCAG AA.
export type ContrastPair = Readonly<{ text: TokenName; background: TokenName }>
