import { CONFIG } from '@/lib/config'

// Marketing site identity, and the lines more than one page, or a page and the email, repeat.
export const SITE = {
  name: 'PinnaclePX',
  legalName: 'Pinnacle PX',
  // The person behind the studio, as the booking page shows it (docs/claims-register.md).
  owner: 'Omar Mahmoud',
  tagline: 'See your new website before you hire.',
  // Under the H1. Thirty words, so the 390 by 844 fold still holds the button and its trigger.
  // It opens with who the page is for: the five-second test asks for the outcome and the
  // audience in the first screen, and the headline carries only the outcome.
  subhead:
    "Answer five short questions. About five minutes later, you'll see three homepage designs in your logo and colours. Free, before you talk to anyone. That's what we can do in five minutes, imagine what we can do in a 20 minute chat.",
  // The search snippet, and the line the social card and the structured data carry. It names
  // what the studio sells before what it gives away, because most people who meet this sentence
  // are deciding whether a web designer is worth a click, not whether a free sample is.
  description:
    'A UK web design studio. Websites designed by hand, written for you and tested on a phone before launch. Three designs in your colours first, free.',
  reassurance: 'Free. No sign-up. Nobody calls you unless you book.',
  // The same under the last ask, where the email has just been given: no longer "No sign-up",
  // which would read as a promise the address breaks.
  reassuranceSend: 'Free. Nobody calls you unless you book.',
  // What the call ends with is the agenda's last line, said here so the button's caption carries
  // the risk reversal: the quote is the visitor's to walk away from.
  callPromise:
    'No pitch. We look at your designs together, and you leave with a fixed quote. Go ahead only if you want to.',
  // One promise about colour, shared by the home page and the colour question.
  colourPromise: 'Your colour stays. We only adjust it if text would be hard to read on it.',
  // A build the deadline sweeper finished with a fallback (a headline set from the sentence, a
  // photo space left plain) still opens and is still emailed; the done page and the email both
  // say so in these words.
  partialNote: 'A few parts were set simply, to finish on time.',
  // Said after the name of every link that opens a new tab, for a screen reader, so leaving the
  // page is never a surprise.
  newTab: '(opens in a new tab)',
  // The studio's place and inbox. Null until the owner supplies them, and nothing names a place
  // until then.
  town: null as string | null,
  contactEmail: null as string | null,
  // The studio's real booking page, confirmed by the owner on 5 September 2026. The event's length
  // is set by hand on Cal.com to match CONFIG.call.minutes.
  bookingUrl: 'https://cal.com/pinnaclepx/quick-chat',
} as const

// A price as the page prints it: "£4,750" while the studio is not VAT registered; the gross
// figure with "including VAT" once it is, because the audience is mixed and mostly cannot
// recover VAT, so an ex-VAT figure would mislead (CAP 3.18). Rounded to the pound.
type VatState = Readonly<{ vatRegistered: boolean; vatRate: number }>

export function printedPrice(net: number, price: VatState = CONFIG.price): string {
  const amount = price.vatRegistered ? Math.round(net * (1 + price.vatRate)) : net
  const figure = `£${amount.toLocaleString('en-GB')}`
  return price.vatRegistered ? `${figure} including VAT` : figure
}

const NUMBER_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

// A small count in words, "five-page" or "Design two", as the site writes its counts; figures
// from ten.
export function numberWord(count: number): string {
  return NUMBER_WORDS[count - 1] ?? String(count)
}

// A count word that opens a sentence.
export function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// The scope a worked total is shown for, so a reader who needs more than one page is not left
// to multiply a rate card themselves: four buyers in five never do (Greenleaf et al. 2016), and
// at this scope the extras cost more than the base.
const EXAMPLE_PAGES = 5

// The price, said the same way everywhere it appears: the cost FAQ, the "How you pay" row, the
// designs page and the email above the call button. Scope and basis sit in the same sentence as
// the figure, as prominent as it is (DMCC Act 2024 s.230; CMA209 4.23), and the taster is set
// apart from the build before the number lands, so the reader prices the site, not the designs.
// Every figure is derived from CONFIG.price, so one edit moves all of them, and the count of
// pages in a sentence moves with the figure it describes.
export const PRICE = {
  scope: `A ${numberWord(CONFIG.price.pages)}-page site with a contact form is ${printedPrice(CONFIG.price.from)}.`,
  basis: 'One fixed quote on the call, worked out from pages and what has to connect.',
  extras: `Extra pages are ${printedPrice(CONFIG.price.perPage)} each. Bookings, payments and other tools are quoted by what they are.`,
  worked: `${capitalise(numberWord(EXAMPLE_PAGES))} pages, for example, come to ${printedPrice(CONFIG.price.from + Math.max(0, EXAMPLE_PAGES - CONFIG.price.pages) * CONFIG.price.perPage)}.`,
  // The qualification the law wants in the same breath as the figure (CRA 2015 s.50), and what
  // the figure does not include, said where the figure is rather than left to be discovered.
  cra: 'It does not change unless you ask for more, and then we quote that in writing first.',
  hosting: 'Hosting and care after launch are optional, priced on their own.',
  taster: 'Your designs are a first look, made in five minutes.',
  build: 'Your real site is designed by hand from scratch, with the wording written for you.',
} as const

type CallAgendaItem = Readonly<{ from: number; to: number; what: string }>

// What the call's minutes are spent on, in order, so the feared sales call has a known shape.
// The page renders the three lines without their minutes, under the step that asks for the call;
// the ranges stay here because the booking page and the email still describe the shape.
export const CALL_AGENDA: readonly CallAgendaItem[] = [
  { from: 0, to: 5, what: 'You say what is wrong with the designs.' },
  {
    from: 5,
    to: 15,
    what: 'What you sell, who you want more of, and what customers ask before they book.',
  },
  { from: 15, to: CONFIG.call.minutes, what: 'A fixed quote and a timeline.' },
]

// What /start says where the questions would be to a visitor without JavaScript (plan 4.6). It
// offers an inbox only once the studio has one (SITE.contactEmail); until then it promises
// nothing it cannot keep and says only how to go on.
export function noScriptLine(contactEmail: string | null = SITE.contactEmail): string {
  return contactEmail === null
    ? 'The five questions need JavaScript. Turn it on to see your three designs.'
    : `The five questions need JavaScript. Turn it on, or email us at ${contactEmail}.`
}

// The other way on, beside the inbox: a link to the booking page.
export const NO_SCRIPT_CALL = `You can also book a ${String(CONFIG.call.minutes)}-minute call.`
