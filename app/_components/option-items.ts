import { CONFIG } from '@/lib/config'
import { PRICE } from '@/lib/site'

// The two ways of getting a site, compared on how the work is split. A table headed "a website
// builder" is a comparison with identifiable competitors even though none is named (CAP Code
// section 3; docs/research/home-page-content/compliance-honesty.md), so every builder cell is a
// plain statement of how builders work, checkable on their own help pages, and no cell carries a
// quality word about either route. Four rows, not six: the two that were cut said nothing rows
// one and two and the Connected cell do not. The rows about ownership, care and staged payment
// join once the owner has recorded those decisions (docs/home-page-content-plan.md, 3.9).
export type OptionRow = Readonly<{ question: string; builder: string; studio: string }>

export const YOUR_OPTIONS = {
  heading: 'Doing it yourself, or asking us.',
  lead: 'Here is who does what, so you can choose.',
  builderHead: 'You build it with a builder',
  studioHead: 'We build it with you',
  builderLabel: 'With a builder',
  studioLabel: 'With us',
  // Not "the left column": on a phone the rows stack under "With a builder" and "With us".
  signpost: 'What we say about builders comes from their own help pages, if you want to check.',
  generous:
    'If you enjoy building things, a builder may suit you. Many good sites started that way.',
  agency:
    'Hired an agency before? What changes here is the order: you see designs first, then decide, then pay.',
} as const

// What the visitor sees before paying: the count is a promise only once that many templates are
// ready, so below that the row makes the same point without the number.
export const BEFORE_YOU_PAY = {
  counted: 'Three designs in your logo and colours, before you spend anything.',
  uncounted: 'Designs in your logo and colours, before you pay anything.',
} as const

export function optionRows(readyCount: number): readonly OptionRow[] {
  return [
    {
      question: 'Who designs the layout',
      builder: 'You pick a template and change it yourself.',
      studio: 'We design it for you.',
    },
    {
      question: 'Who writes the words',
      builder: 'You write them, or fill in the blanks.',
      studio: 'A professional writes every page with you.',
    },
    {
      question: 'What you see before you pay',
      builder: 'A template gallery. Your own site appears as you build it.',
      studio:
        readyCount >= CONFIG.templates.conceptsShown
          ? BEFORE_YOU_PAY.counted
          : BEFORE_YOU_PAY.uncounted,
    },
    {
      // The contrast is the shape of the payment, so the builder's recurring figure is read
      // first and the studio's is the rate card said exactly as the cost answer says it: the
      // scope in the same sentence as the figure, never a bare "from £679" (CAP 3.17; DMCC
      // s.230). What hosting and care cost, and that the web address is separate, belong with
      // the full answer in the FAQ rather than split across two homes.
      question: 'How you pay',
      builder: 'Usually a subscription, paid every month the site is up.',
      studio: `${PRICE.scope} ${PRICE.extras}`,
    },
  ]
}
