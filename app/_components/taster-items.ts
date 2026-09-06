import { CONFIG } from '@/lib/config'

// The Taster's words. The lead renders the call's length from CONFIG.call.minutes, as every call
// button and the agenda already do, so the number can never drift between them. The third step
// is the seam into the build section: the three designs show what the visitor likes, and the real
// site is designed from scratch around that, never built from a template.
type TasterStep = Readonly<{ title: string; body: string; agenda?: true; buildLink?: true }>

const MINUTES = String(CONFIG.call.minutes)

export const TASTER = {
  // Not "Imagine what an hour does.": the sites a conversation produced sit one hairline down
  // once the work band ships, and "an hour" beside a finished site reads as the price of the work
  // (docs/home-page-content-plan.md, decision 51).
  heading: 'Five answers get you three designs. A conversation starts your real site.',
  lead: `Your three designs are a first look, made in five minutes from almost nothing. Give us ${MINUTES} minutes on a call. Then we spend our hours, not yours, building the real thing properly.`,
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
    body: 'With the quote agreed, we design and build your real site. It is shaped by which design you liked, and why.',
    buildLink: true,
  },
]
