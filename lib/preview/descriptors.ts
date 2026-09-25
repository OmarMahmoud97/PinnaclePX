import { numberWord, SITE } from '@/lib/site'

// The arrangement a template's first screen takes, which its poster draws from the moment the
// select stage names it (app/_styles/design-poster.css, by data-layout): the same few shapes,
// placed as that template places them.
export type Layout =
  'centred' | 'cards' | 'pool' | 'split' | 'photo' | 'type' | 'airy' | 'editorial'

type Design = Readonly<{ words: string; layout: Layout }>

// How a visitor meets each design: by its place among the ones built for them, a few words for
// its layout, and the layout's own silhouette, never by its template's code name, which means
// nothing outside the studio (docs/start-page-journey-plan.md, OD12). Keyed by template id. A
// template with no entry, like one not yet ready, is named by its place alone and drawn as a
// plain page.
const DESIGNS: Readonly<Record<string, Design>> = {
  't01-aurora': { words: 'Glowing centre', layout: 'centred' },
  't02-monolith': { words: 'Card-led', layout: 'cards' },
  't03-meridian': { words: 'Colour pool', layout: 'pool' },
  't04-atlas': { words: 'Split layout', layout: 'split' },
  't05-ember': { words: 'Photo-led', layout: 'photo' },
  't06-harbor': { words: 'Type-led', layout: 'type' },
  't07-summit': { words: 'Quiet and airy', layout: 'airy' },
  't08-vector': { words: 'Bold and editorial', layout: 'editorial' },
}

// The words alone, by template id, for the copy corpus.
export const DESCRIPTORS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(DESIGNS).map(([id, design]) => [id, design.words]),
)

// The words for a design's layout, or null before its template is chosen or without an entry.
export function descriptorOf(templateId: string | null): string | null {
  return templateId === null ? null : (DESIGNS[templateId]?.words ?? null)
}

// The layout a design's poster draws, or null before its template is chosen or without an entry.
export function layoutOf(templateId: string | null): Layout | null {
  return templateId === null ? null : (DESIGNS[templateId]?.layout ?? null)
}

// "Design one": a design by its place in the list, counted from zero.
export function designName(index: number): string {
  return `Design ${numberWord(index + 1)}`
}

// What a design's link is announced by: which design opens, how it looks, and that it opens in a
// new tab. "Open design one: Glowing centre (opens in a new tab)".
export function designLinkName(index: number, templateId: string | null): string {
  const descriptor = descriptorOf(templateId)
  const open = `Open design ${numberWord(index + 1)}`
  return `${descriptor === null ? open : `${open}: ${descriptor}`} ${SITE.newTab}`
}
