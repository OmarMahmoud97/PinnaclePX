import { CONFIG } from '@/lib/config'

// Marketing site identity, and the lines the home page and the five questions both repeat.
export const SITE = {
  name: 'PinnaclePX',
  legalName: 'Pinnacle PX',
  tagline: 'See your new website before you hire.',
  description:
    'Answer five questions and get three homepage designs with your logo, your colours and wording written for you. Free, in about five minutes.',
  reassurance: 'Free. No sign-up. Nobody calls you unless you book.',
  callPromise: 'No pitch. We look at your designs together.',
  // One promise about colour, shared by the home page and question five.
  colourPromise: 'We keep your colour and only adjust it if text would be hard to read on it.',
  // The studio's place and inbox. Null until the owner supplies them, and nothing names a place
  // until then.
  town: null as string | null,
  contactEmail: null as string | null,
  // Replace with the real Cal.com booking link before launch.
  bookingUrl: 'https://cal.com/pinnaclepx',
} as const

export type CallAgendaItem = Readonly<{ from: number; to: number; what: string }>

// What the call's minutes are spent on, in order, so the feared sales call has a known shape.
export const CALL_AGENDA: readonly CallAgendaItem[] = [
  { from: 0, to: 5, what: 'You say what is wrong with the three designs.' },
  {
    from: 5,
    to: 15,
    what: 'What you sell, who you want more of, and what customers ask before they book.',
  },
  { from: 15, to: CONFIG.call.minutes, what: 'A fixed quote and a timeline.' },
]
