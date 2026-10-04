import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't03-meridian',
  name: 'Meridian',
  description:
    'A floating header over a centred hero, on a dark or a light surface. A badge, a headline with one lit phrase, then one wide picture rising from a pool of the brand colour. A row of sliding labels, benefits beside numbered cards, a grid of ticked features, paired service cards, a large centred ask, three steps beside a form card, questions that open and a boxed footer. Its structures need three to seven short labels, exactly three reasons, three to six features, two to four services, three steps, two to five form subjects, three to five questions, one wide photograph that reads well shown whole, and an email address for the form. Not yet judged for any kind of business.',

  ready: true,
  polarity: 'either',
  tones: ['polished', 'card', 'spacious'],
} as const satisfies TemplateMeta
