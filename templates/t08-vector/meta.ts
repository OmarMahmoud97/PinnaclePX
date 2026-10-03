import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't08-vector',
  name: 'Vector',
  description:
    'One sans with serif italic accents, on a dark or a light surface, led by type and motion. The bar is two floating glass pills: the name, and a menu that names the block on screen and unfolds. The first screen is a headline of two or three lines over sweeping coloured bands, with no picture and no button. A giant two-word marquee runs with the scroll over two to four named items, each a rounded picture in two tones with a number, a two-part title and a sentence, and each opening full screen. One sentence stays pinned while its letters grow, over three to six full-width rows that flip to their inverse under the pointer. Then a wide picture over a centred statement and a round button, questions, and an inverted footer that the page slides off, with the email address set huge as the only contact. Its structures need two to four things that can be named, each worth a full-screen picture and a title in two short parts; one short sentence and three to six offerings; and an email address. Not yet judged for any kind of business.',
  ready: true,
  polarity: 'either',
  tones: ['bold', 'editorial', 'cinematic'],
} as const satisfies TemplateMeta
