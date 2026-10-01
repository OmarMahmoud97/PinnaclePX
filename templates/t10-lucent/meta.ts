import type { TemplateMeta } from '@/lib/copy-slots/template-meta'

export const meta = {
  id: 't10-lucent',
  name: 'Lucent',
  description:
    'A warm paper page with one vivid accent and soft grain, set in a plain grotesque at medium weight: a short splash where the brand name rises out of a blur; a floating glass pill of a bar that bends the page behind it; a big headline beside a phone whose screen holds the main picture, its lines sliding up out of a mask; a wide picture that grows as it nears the top; an overview with a parallax picture and ticked lines; a white card whose last line is in the accent; a notice that drops onto a picture as it scrolls by; three numbered pills that clear out of a blur; a rail of four snapping feature cards, the last one black with a headline that gathers out of a cloud of dots at a tap; a wide picture under a tint that warms the whole page; two tall pictures side by side; a statement that rises word by word; a pricing switch with rolling numbers; questions that ease open; a promise card of pills; a picture card with an email form on it; and a dark footer whose big ask slides up line by line. Works on a light or a dark surface.',
  // Not in rotation until the explicit visit cap the owner set on 1 October 2026 is built (ADR
  // 0043): the cap ADR 0038 derives from eight templates no longer holds with more.
  ready: false,
  polarity: 'either',
  tones: ['product', 'warm', 'glassy'],
} as const satisfies TemplateMeta
