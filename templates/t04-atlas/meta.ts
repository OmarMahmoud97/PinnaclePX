import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't04-atlas',
  name: 'Atlas',
  description:
    "A soft wash of the brand hues behind the top of the page, round buttons in the brand gradient and one typeface throughout. A split hero with an uppercase eyebrow, a capitalised headline with a lit phrase and a picture at the right that phones do not show; a card of three titled columns over its foot; the owner's statement in a bordered box; three ticked points; a rounded tinted band of three titled points; three ticked reasons; three numbered discs, joined by dashed arrows on wide screens; questions that open; and a ruled footer ending in a note and a button that opens a mail, where every ask leads. Six pictures sit whole beside the words. It needs three things the business does, three things a customer gets, three more points, three reasons, three steps, three to five questions, one sentence from the owner on why they do the work, and six photographs that read well shown whole. Works on a dark or a light surface. Not yet judged for any kind of business.",
  ready: true,
  polarity: 'either',
  tones: ['airy', 'rounded', 'editorial'],
} as const satisfies TemplateMeta
