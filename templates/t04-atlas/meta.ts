import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't04-atlas',
  name: 'Atlas',
  description:
    'A soft wash of the brand hues behind the top of the page. A split hero with an uppercase eyebrow and a lit phrase, a three-column card overlapping its foot, a split pitch with a boxed line, a tinted band of three steps joined by arrows, a checklist beside a photograph, an FAQ beside another, a four-column footer and a back-to-top link. Round buttons filled with the brand gradient. Works on a dark or a light surface.',
  ready: true,
  polarity: 'either',
  tones: ['airy', 'rounded', 'editorial'],
} as const satisfies TemplateMeta
