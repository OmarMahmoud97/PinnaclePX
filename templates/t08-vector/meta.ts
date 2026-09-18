import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't08-vector',
  name: 'Vector',
  description:
    'A near-black studio page in one sans with serif italic accents: two floating glass pills for a bar, one the name and one a menu that unfolds; a full-screen hero over sweeping coloured waves whose three headline lines rise out of clipped rows; a giant italic marquee that runs with the scroll over pill-shaped project pictures that open through a growing circle, follow the pointer and show an Open cursor; a pinned sentence that grows letter by letter with the scroll over a flowing menu whose rows flip to their inverse under the pointer; a wide pill picture over a statement; a bento of quiet cards; an FAQ; and an inverted footer that the page slides up to reveal, with a giant email. Works on a dark or a light surface.',
  ready: true,
  polarity: 'either',
  tones: ['bold', 'editorial', 'studio'],
} as const satisfies TemplateMeta
