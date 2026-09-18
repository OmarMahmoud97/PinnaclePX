import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't05-ember',
  name: 'Ember',
  description:
    'A full-screen photograph behind a centred hero with an uppercase eyebrow, a floating header that turns to glass as the page scrolls, a split About with a picture and an ornamented eyebrow, three numbered points, a grid of pictured items, three icon features beside a portrait, a three-step process, a card of rows on a photograph, an FAQ of disclosure rows, a coloured closing band with pictures at its corners, and a footer under a giant watermark of the name. Round buttons filled with the brand colour. Works on a dark or a light surface.',
  ready: true,
  polarity: 'either',
  tones: ['warm', 'photographic', 'hospitable'],
} as const satisfies TemplateMeta
