import { CONFIG } from '@/lib/config'

// The Taster's words. The lead renders the call's length from CONFIG.call.minutes, as every call
// button and the agenda already do, so the number can never drift between them. The third step
// is the seam into the build section: the three designs show what the visitor likes, and the real
// site is designed from scratch around that, never built from a template.
type TasterStep = Readonly<{ title: string; body: string; agenda?: true; buildLink?: true }>

const MINUTES = String(CONFIG.call.minutes)

export const TASTER = {
  heading: 'Five answers get you three designs. Imagine what an hour does.',
  lead: `Your three designs are a first look, made in five minutes from almost nothing. Give us ${MINUTES} minutes on a call. Then we spend our hours, not yours, building the real thing properly.`,
  doNothing: 'You can also keep the link and do nothing. The designs are free either way.',
  notStarted: 'Not started yet? Answer the five questions first.',
  buildLink: 'What the build includes',
} as const

export const TASTER_STEPS: readonly TasterStep[] = [
  {
    title: 'You look at your three designs',
    body: 'Open it on your phone, sleep on it, come back to it. Nobody chases you.',
  },
  {
    title: 'You book a call if you like one',
    body: `${MINUTES} minutes. We go through your designs together. You tell us what's wrong and what's missing.`,
    agenda: true,
  },
  {
    title: 'We build the site',
    body: 'You get a fixed quote and a timeline on the call. Then we design and build your real site around what you liked.',
    buildLink: true,
  },
]
