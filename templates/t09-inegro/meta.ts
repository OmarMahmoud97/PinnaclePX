import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't09-inegro',
  name: 'Inegro',
  description:
    'A deep night-violet page set in a wide geometric display face over a plain sans: a bar that hides on the way down and returns as glass, with two dropdowns that open white panels of links and picture cards over a blurred page; a full-screen hero whose five coloured ribbons draw themselves out of one line while the view pans and a light runs along each; three frosted glass cards over photographs whose long paragraphs light up letter by letter with the scroll, each sliding over the block before it; a list of big names whose letters roll on hover and which opens one at a time onto a picture card; quote cards that travel along two ribbons in turn; a rotating gradient ring that cycles through three numbered lines; three boxes washed from a colour into the dark; an email form; a band washed from white through the brand into the dark with a big button; and a white footer. Works on a dark or a light surface.',
  // Not in rotation until an explicit visit cap replaces the one that follows from eight
  // templates at three a visit (ADR 0038, ADR 0041).
  ready: false,
  polarity: 'either',
  tones: ['luminous', 'thoughtful', 'editorial'],
} as const satisfies TemplateMeta
