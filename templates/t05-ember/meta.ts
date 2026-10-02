import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't05-ember',
  name: 'Ember',
  description:
    'A full-screen photograph behind the centred headline, under a floating header that turns to glass as the page scrolls. Below it: a split About with a picture and an ornamented eyebrow, three numbered points, a grid of offerings over small square pictures, three features marked with a brand-colour dot beside a tall picture, three numbered steps, a card with a line and a button on a wide photograph, questions that open in place, a closing band in the brand colour with the first four pictures at its corners, and a footer under a giant watermark of the name. Most section headings carry an eyebrow in capitals, the buttons are round and filled with the brand colour, and the sections have wide space between them; works on a light or a dark surface. It needs a full-screen photograph behind the headline and a grid of four to eight named offerings, each over a small square picture. Not yet judged for any kind of business.',
  ready: true,
  polarity: 'either',
  tones: ['warm', 'photographic', 'welcoming'],
} as const satisfies TemplateMeta
