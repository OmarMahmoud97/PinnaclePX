import { CONFIG } from '@/lib/config'
import { numberWord } from '@/lib/site'

// The privacy page's lists, the lines the questionnaire's first release added to it (ADR 0014,
// amended by docs/start-page-journey-plan.md, D30) and the contact page's (ADR 0040), kept here
// so the copy tests read them (app/_components/copy-corpus.ts): a page module may export nothing
// but the page.

// Who processes the visitor's answers and messages on the studio's behalf, named plainly. Resend
// also carries the owner's notices: a brief's answers and a message from the contact page. The
// inbox a message lands in is the studio's own, described rather than named until the owner
// names its provider (ADR 0040).
export const PROCESSORS = [
  ['Vercel', 'hosts the site, stores your pictures and runs the pipeline'],
  ['Neon', 'holds the database'],
  ['Inngest', 'runs the steps that build your designs'],
  ['Anthropic', 'writes the wording from your sentence, and judges stock photographs'],
  ['Pexels', 'supplies stock photographs when you add none of your own'],
  ['Resend', 'sends the email with your link, and sends us your answers and any message you write'],
  ['Our email provider', 'holds our inbox, where your message arrives'],
  [
    'Cal.com',
    "shows the contact page's calendar when you open it, and takes your booking if you choose a time. It tells us when you book, so we can note the time against your brief",
  ],
] as const

// What happens to a message sent from /contact, in the notice's own plain words: what is kept,
// why, where it goes and for how long, the calendar that loads only on a click and what opening
// it lets Cal.com set (the cookies seen on 27 September 2026, ADR 0040), and how to use
// the rights while the studio has no inbox of its own. The lawful basis and the keeping are
// defaults the owner may change (ADR 0040). The page links rightsRoute's middle words,
// RIGHTS_LINK, to /contact.
export const CONTACT_PRIVACY = {
  intro:
    'This page says what happens to the five answers, and to a message you send us, in plain words.',
  heading: 'A message from the contact page',
  collect:
    'If you write to us from the contact page, we keep your name, your email and your message.',
  use: 'We use them only to deal with your message. Our lawful basis is legitimate interests: you wrote to us, and we need your details to deal with it.',
  where:
    'Your message reaches us as one email. The site does not store it, and it sends you nothing back.',
  keep: 'We keep it in our inbox only while we need it to deal with your message, then delete it.',
  calendar:
    'The Cal.com calendar on the contact page loads only when you open it. Opening it connects you to Cal.com, which sets three cookies of its own for security and sign-in, none for tracking. Cal.com also sends its own error reports. If you book a call, Cal.com tells us. We note the time against your brief if you booked with the same address. If you did not, we keep only the time, with nothing that names you, until the call has passed.',
  rightsRoute: 'Write to us through the contact page, and we will do it within a few days.',
} as const

// Set apart the way an emphasis word is (app/_components/words.tsx): not a sentence of its own,
// so it stays out of the copy tests' list, which reads it inside rightsRoute.
export const RIGHTS_LINK = 'the contact page'

const HOURS_A_DAY = 24

// A picture that is never sent goes in the first nightly sweep after it is unsentHours old
// (lib/inngest/functions/orphan-upload-sweep.ts), so it can wait up to one more day than that.
const UNSENT_DAYS = numberWord(Math.ceil(CONFIG.retention.unsentHours / HOURS_A_DAY) + 1)

// What the browser keeps (plan 7.3), and why. Each piece only makes what the visitor asked for
// work as they expect, a refresh that loses nothing, so none needs consent (PECR regulation
// 6(4)); the page says what each holds and when it goes.
export const DEVICE_STORAGE = [
  'While you answer, this tab keeps your answers, so a refresh does not lose them.',
  'They are cleared when you send them or close the tab.',
  'After you send, this tab keeps your first name, business name and email until you close it.',
  `This browser also keeps your page's address until ${String(CONFIG.start.done.restoreHours)} hours after your designs are due.`,
  'That way a refresh brings your designs back.',
  'It also counts the briefs sent from it today, so it can tell you when you reach the limit.',
  'None of this is used to track you, and nothing that names you stays once the tab is closed.',
] as const

export const UNSENT_PICTURES = `If you add pictures but never send your answers, we delete them within ${UNSENT_DAYS} days.`
