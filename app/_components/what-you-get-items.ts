import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

export type Glyph = 'layouts' | 'colours' | 'wording' | 'link'

type WhatYouGetItem = Readonly<{ title: string; detail: string; glyph: Glyph }>

// What the visitor will have in five minutes, in their words. Deliverables, not product facts.
export const WHAT_YOU_GET_ITEMS: readonly WhatYouGetItem[] = [
  {
    title: 'Three designs, not one',
    detail: 'Different layouts, so you can see what suits you.',
    glyph: 'layouts',
  },
  {
    title: 'Your logo and your colours',
    detail: `On every design. ${SITE.colourPromise}`,
    glyph: 'colours',
  },
  {
    title: 'Wording written for you',
    // Not "your area": nothing in the brief stage extracts a place (lib/ai/prompts.ts).
    detail: 'From your own sentence: your services and your words.',
    glyph: 'wording',
  },
  {
    title: 'A link you can share',
    detail: `Send it to whoever helps you decide. It stays live for ${String(CONFIG.retention.days)} days.`,
    glyph: 'link',
  },
]
