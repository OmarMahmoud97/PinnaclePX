import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't02-monolith',
  name: 'Monolith',
  description:
    'Cards on a plain ground. A two-column hero whose headline sits beside four floating cards, an About panel with a row of highlights, three How-it-works cards, a badge row over three feature cards, three service cards beside a photograph, a muted call-to-action band, an FAQ and a four-column footer. Works on a dark or a light surface.',
  ready: true,
  polarity: 'either',
  tones: ['friendly', 'card', 'busy'],
} as const satisfies TemplateMeta
