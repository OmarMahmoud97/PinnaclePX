import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't03-meridian',
  name: 'Meridian',
  description:
    'A floating header over a centred hero. A badge, a headline with one lit phrase, then a picture rising from a pool of the brand colour. Benefits beside a two-by-two of numbered cards, a grid of icon features, paired service cards, a large centred ask, a contact split with a card, an FAQ and a boxed footer. Works on a dark or a light surface.',
  ready: true,
  polarity: 'either',
  tones: ['polished', 'card', 'spacious'],
} as const satisfies TemplateMeta
