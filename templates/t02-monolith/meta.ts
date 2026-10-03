import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't02-monolith',
  name: 'Monolith',
  description:
    "Cards on a plain ground, in one typeface throughout. A sticky header with the name standing alone; a hero whose bold headline lights one or two phrases in the brand colours, with four cards over a sliding glow under it from 1024 px and beside it from 1440 px (phones do not show them): a line from the owner and who the business serves, each beside a circle of its initials or the owner's own photograph, three things included with a button, and the first thing it does; a small heading over a row of short labels; a bordered panel with a picture, a paragraph and four large short phrases; three numbered steps; a row of badges over three cards, each with a picture; three ticked services beside a large picture; a muted closing band where every ask leads; questions that open; and a ruled footer of two to four link columns. The five larger pictures sit whole at their own shape; a photograph in a circle is cropped to fill it. It needs about six different things the business does (three shown with pictures and three more as services), four to nine short badges, three to six short labels for areas or kinds of work, three things a customer gets, a paragraph about the business, four short phrases with no numbers, one sentence from the owner, who it serves in a few words, three steps, three to five questions, and five photographs that read well shown whole. Works on a dark or a light surface. Not yet judged for any kind of business.",
  ready: true,
  polarity: 'either',
  tones: ['friendly', 'card', 'busy'],
} as const satisfies TemplateMeta
