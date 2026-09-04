import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't01-aurora',
  name: 'Aurora',
  description:
    'Light on a field. A centred hero whose product frame rises out of an aurora in the brand hues, one lead feature and two supporting ones, three numbered steps, a full-bleed statement over a photograph, and a lit closing ask. Works on a dark or a light surface.',
  ready: true,
  polarity: 'either',
  tones: ['luminous', 'product', 'confident'],
} as const satisfies TemplateMeta
