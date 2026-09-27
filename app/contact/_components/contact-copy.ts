import type { ContactRefusal } from '@/app/contact/_components/actions'
import { firstNameFrom } from '@/lib/brief/names'
import { CONFIG } from '@/lib/config'
import { capitalise, numberWord, SITE } from '@/lib/site'

// Every word a visitor reads on /contact (ADR 0040), except a field's error, which the Server
// Action words too and so lives in lib (lib/contact/messages.ts). The page's client parts import
// this deck, so it never imports /start's: that deck brings the questionnaire's palettes, styles
// and uploads with it. A phrase the two pages share is copied here instead, and
// contact-copy.test.ts keeps each copy equal to its source. The call's length is rendered from
// CONFIG, never typed, and so is the message's longest.

const MINUTES = String(CONFIG.call.minutes)

// The tab's title, "Contact | PinnaclePX" through the layout's template, and the search snippet.
export const CONTACT_META = {
  title: 'Contact',
  description: `Write to ${SITE.name}, a UK web design studio, or book a ${MINUTES}-minute call. No pitch, and nobody calls you unless you book.`,
} as const

// The H1, whose payoff falls on a time word as the hero's "before" does. The emphasis names the
// word the serif italic takes (words.tsx); it is not a sentence of its own.
export const CONTACT_HERO = { heading: 'Ask first, decide later.', emphasis: 'later' } as const

// The form's card. Its lead does the page lead's job, since no small text sits on the ink. The
// name, email and privacy link are the questionnaire's own words; the reassurance joins the
// Straight answers promise to the last sentence of the site's.
export const WRITE = {
  heading: 'Send a message',
  lead: 'A question, a site you have in mind, or one you want replaced. It goes to the person who runs the studio.',
  // On a phone, before the booking link, so the call is one tap from the first screen.
  ratherTalk: 'Rather talk?',
  messageLabel: 'What do you need?',
  messageHint: 'Say what your business does and what you want from a site.',
  name: 'Your name',
  email: 'Email',
  emailNote: 'We never add you to a mailing list.',
  // Said only once the owner confirms that every message is answered by email (SITE.contactReplies).
  emailNoteReplies: 'We only use your email to reply.',
  detailsLink: 'How we use your details',
  send: 'Send my message',
  reassurance: 'No newsletter, no chasing. Nobody calls you unless you book.',
} as const

// The line under the email field: the privacy page's own promise, until a reply is promised.
export const emailNote = (): string =>
  SITE.contactReplies ? WRITE.emailNoteReplies : WRITE.emailNote

// The envelope under the fields and the receipt once the message has gone, whose rows read
// "Subject | Message from Sam Patel" and "From | sam@example.com" (lib/contact/subject.ts).
export const ENVELOPE = { subject: 'Subject', from: 'From' } as const

// A count as the site writes it: in words under ten, in figures from ten.
const count = (n: number): string =>
  n < 10 ? capitalise(numberWord(n)) : n.toLocaleString('en-GB')
const characters = (n: number): string => (n === 1 ? 'character' : 'characters')

// The message's meter, empty until only `countdownChars` are left, so a short question never
// meets a countdown. It counts what the check counts: the words without the space around them.
export function meterLine(value: string): string {
  const { maxChars, countdownChars } = CONFIG.contact.message
  const left = maxChars - value.trim().length
  if (left > countdownChars) return ''
  if (left === 0) return 'No characters left.'
  if (left < 0) return `${count(-left)} ${characters(-left)} over.`
  return `${count(left)} ${characters(left)} left.`
}

// What stands in the card for a visitor without JavaScript, whose form would send nothing: the
// lead, then the booking link as "book a 20-minute call", then the tail.
export const NO_SCRIPT = { lead: 'The form needs JavaScript. Turn it on, or', tail: '.' } as const

// The send. The ask's word and the words on the ink are /start's.
export const SENDING = {
  ask: 'Sending',
  status: 'Sending your message.',
  ink: 'Off it goes.',
} as const

// The card once the message has gone: the status line, the tab's title, the way back to fix the
// address and the way to write again. The reply line waits on SITE.contactReplies.
export const SENT = {
  status: 'Your message has been sent.',
  docTitle: 'Message sent',
  fixLead: 'Wrong address?',
  fix: 'Change it and send again',
  again: 'Send another message',
  replyTo: (email: string) => `The reply comes to ${email}.`,
} as const

// The sent card's heading, by the visitor's first name where there is one.
export function sentHeading(name: string): string {
  const first = firstNameFrom(name)
  return first === ''
    ? 'Your message is with the studio.'
    : `${first}, your message is with the studio.`
}

// Why a message did not go, for each refusal the Server Action gives. A day's sends spent
// offers the call, as the booking link after these words. The retry is /start's own line.
export const REFUSED = {
  retry: 'Something went wrong on our side. Give it a moment and try again.',
  too_many: 'That is a lot of messages for now. Try again later, or book a call.',
  rejected: 'Something in the form did not look right. Check it and send it again.',
} as const satisfies Record<ContactRefusal, string>

// A request that never reached the server.
export const FAILED = 'Your message did not reach us. Check your connection and try again.'

// Said after a failure a second try may clear, so the visitor knows nothing was lost.
export const KEPT = 'Your words are still here.'

// A second such failure in a row offers the call: the lead, the booking link, then the tail.
export const STUCK = { lead: 'Still stuck?', tail: ', and bring your message with you.' } as const

// The call's card. Its heading is the first sentence of the build's first step, and the promise
// under it is SITE.callPromise; the first sentence of `free` is the pricing answer's last.
export const CALL = {
  eyebrow: 'Or talk it through',
  heading: 'You talk to the person who runs the studio.',
  free: 'The three designs and the call cost nothing. So does a message.',
  ownPage: 'Or open the booking page',
  noDesigns: 'No designs yet? Bring your questions instead.',
  booked: 'Your call is booked.',
  // Said only once the owner confirms Cal.com emails the details (SITE.calConfirms).
  bookedNote: 'Cal.com emails you the details.',
} as const

// The calendar's sheet. Its heading is the booking link's own label; its retry is /start's.
export const SHEET = {
  lead: 'Pick a time that suits you.',
  loading: 'Opening the calendar.',
  ready: 'The calendar is open.',
  failed: 'The calendar did not open here.',
  retry: 'Try again',
  // The round close button's name, which has no words of its own.
  close: 'Close the calendar',
  closeShort: 'Close',
} as const

// The white band under the ink: what happens to a message, in the reader's own questions. The
// second answer ends in the Straight answers sentences, and the third is that band's promise;
// `listReplies` replaces it once SITE.contactReplies is true.
export const ANSWERS = {
  heading: 'What happens to your message.',
  lead: 'Not sure what to ask yet? See three designs for your business first. Five answers, then about five minutes.',
  items: [
    {
      question: 'Who reads it?',
      answer: 'The person who runs the studio, the same person you meet on the call.',
    },
    {
      question: 'Will you ring me?',
      answer: "No. You book a call if you want one. We don't ring you.",
    },
    { question: 'Will I end up on a list?', answer: 'No newsletter, no chasing.' },
  ],
  listReplies: 'No newsletter, no chasing. We use your email to reply, and for nothing else.',
} as const
