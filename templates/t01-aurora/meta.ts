import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't01-aurora',
  name: 'Aurora',
  description:
    "Light on a field, with the look's display face on every heading. A sticky header that turns to glass, with the name, its links on wide screens and one button. A centred headline, a sentence, two round buttons and a reassuring line over a horizon of light in the brand hues, with a drawn panel rising out of it: the name at its head, the three points down its side on wider screens, a short heading over three short lines, and a picture beside the lines on wide screens or under them on narrow ones. Then one lit lead point with a drawn list of ticks, beside two quieter points under rules; three numbered steps on a line that draws itself as the page scrolls; one large sentence over a full-bleed statement picture; and a lit closing panel where every ask leads, its button opening a mail. Its structures need a drawn panel holding three short lines, three points, three steps, one sentence from the owner on why they do the work, and a full-bleed statement picture. Works on a dark or a light surface. Not yet judged for any kind of business.",
  ready: true,
  polarity: 'either',
  tones: ['luminous', 'sleek', 'confident'],
} as const satisfies TemplateMeta
