import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't07-summit',
  name: 'Summit',
  description:
    'A calm clinical page in grey on white, its headings in the display face: a fixed bar that turns to glass, a full-screen hero over a soft photograph with a ringed pill, a left-set headline and a row of portraits, four quiet cards around a picture, a deck of service cards that stack under one another as the page scrolls (every other one tinted), a hairline of steps, a seven-five grid of photographs whose captions slide up under the pointer, an FAQ of rows that open one at a time, three article cards, a six-field appointment form beside its heading, a closing band with a picture rising from its edge, and a footer over the name drawn as an outline. Square dark buttons with an arrow that nudges right. Works on a dark or a light surface.',
  ready: true,
  polarity: 'either',
  tones: ['calm', 'clinical', 'orderly'],
} as const satisfies TemplateMeta
