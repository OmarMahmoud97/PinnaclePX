import * as z from 'zod'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import { defineContract } from '@/lib/copy-slots/contract'
import { fitToSlot } from '@/lib/copy-slots/fit'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import {
  type Four,
  SUMMIT_CONTRAST_PAIRS,
  SUMMIT_SLOTS,
  type SummitContent,
  summitViolations,
} from './copy-slots'
import { meta } from './meta'

// Summit's side of the pipeline contract: the copy the copy stage writes, the fallback when
// it cannot, and how copy and assets become the content object. Links are never written: the
// nav follows the page's blocks in the source's order, the bar's and the hero's buttons lead
// to the steps and the closing band's to the form, as the source's do, the hero's quieter
// button to the services, a facility's link to the form (the source's led nowhere), and footer
// links point at one of the page's own anchors. The optional pieces (the rating line, the
// articles, the form's list of people) are not in the copy: the brief holds no such facts, so
// they stay null; the form's list of departments is the page's own services.

const TARGETS = [
  'top',
  'home',
  'why-choose-us',
  'our-services',
  'booking-process',
  'facilities',
  'faq',
  'book-appointment',
  'cta',
] as const
const HREF: Readonly<Record<(typeof TARGETS)[number], string>> = {
  top: '#top',
  home: '#home',
  'why-choose-us': '#why-choose-us',
  'our-services': '#our-services',
  'booking-process': '#booking-process',
  facilities: '#facilities',
  faq: '#faq',
  'book-appointment': '#book-appointment',
  cta: '#cta',
}
const NAV_HREFS = ['#home', '#why-choose-us', '#our-services', '#facilities'] as const

const headed = { eyebrow: z.string(), heading: z.string() }
const titled = z.object({ title: z.string(), body: z.string() })
const field = z.object({ label: z.string(), placeholder: z.string() })
const link = z.object({ label: z.string(), target: z.enum(TARGETS) })

export const summitCopySchema = z.object({
  brand: z.object({ name: z.string(), legalName: z.string() }),
  nav: z.object({ links: z.array(z.string()), cta: z.string() }),
  hero: z.object({
    badge: z.object({ tag: z.string(), text: z.string() }),
    headline: z.string(),
    subhead: z.string(),
    primary: z.string(),
    secondary: z.string(),
  }),
  why: z.object({ ...headed, cards: z.array(titled) }),
  services: z.object({
    ...headed,
    items: z.array(
      z.object({
        tag: z.string(),
        title: z.string(),
        body: z.string(),
        checklist: z.array(z.string()),
      }),
    ),
  }),
  steps: z.object({ ...headed, body: z.string(), items: z.array(titled) }),
  facilities: z.object({ ...headed, items: z.array(titled), link: z.string() }),
  faq: z.object({
    ...headed,
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
  booking: z.object({
    ...headed,
    form: z.object({
      name: field,
      email: field,
      phone: field,
      doctor: field,
      department: field,
      date: z.string(),
      button: z.string(),
    }),
  }),
  cta: z.object({ heading: z.string(), body: z.string(), button: z.string() }),
  footer: z.object({
    description: z.string(),
    columns: z.array(z.object({ heading: z.string(), links: z.array(link) })),
    contact: z.string(),
    smallLinks: z.array(link),
  }),
})

export type SummitCopy = z.infer<typeof summitCopySchema>

// The lists of a fixed length, and their paths in a violation.
const FIXED: readonly [
  path: string,
  size: number,
  pick: (copy: SummitCopy) => readonly unknown[],
][] = [
  ['why.cards', 4, (copy) => copy.why.cards],
  ['facilities.items', 4, (copy) => copy.facilities.items],
]

// Every count and slot outside its limits. Fixed counts first: a list of the wrong length
// cannot be assembled, so its violations are reported alone and the rest waits for the next
// attempt.
function summitCopyViolations(copy: SummitCopy): readonly SlotViolation[] {
  const counts = FIXED.flatMap(([path, size, pick]) => {
    const length = pick(copy).length
    return length === size ? [] : [{ slot: path, length, min: size, max: size }]
  })
  if (counts.length > 0) return counts
  return summitViolations(assembleSummit(copy, NO_ASSETS))
}

type Slot = keyof typeof SUMMIT_SLOTS

// The slots the copy stage writes: every slot but those of the optional pieces, and the
// department list, which is the services' own tags.
type ModelSlot = Exclude<
  Slot,
  | `hero.proof.${string}`
  | `articles.${string}`
  | 'booking.form.doctor.options[]'
  | 'booking.form.department.options[]'
  | 'footer.contact.address'
>

// What each slot is for, beside its range, for the copy prompt.
const PURPOSE: Readonly<Record<ModelSlot, string>> = {
  'brand.name': 'the company name as given',
  'brand.legalName': 'the legal name for the footer, the company name if unknown',
  'nav.links[].label':
    'two to four short menu labels, in order: home, about, what they offer, what they have',
  'nav.cta.label': 'the header button, the same as ctaLabel',
  'hero.badge.tag': 'one word in a small ring at the start of the pill over the headline',
  'hero.badge.text': 'a short line beside it, such as Open every day of the week',
  'hero.headline': 'the headline, a plain promise in their words',
  'hero.subhead': 'one or two sentences under the headline saying what they do and for whom',
  'hero.primary.label': 'the main button, the same as ctaLabel',
  'hero.secondary.label': 'a quieter button that leads to what they offer, such as See what we do',
  'why.eyebrow': 'a short line over the four reasons, such as Why choose us',
  'why.heading': 'the heading over them, such as Why people choose the company',
  'why.cards[].title': 'exactly four short reasons to choose them, in order',
  'why.cards[].body': 'exactly four sentences, one under each',
  'services.eyebrow': 'a short line over what they offer, such as What we do',
  'services.heading': 'the heading over what they offer',
  'services.items[].tag': 'three to six short names of what they offer, one card each',
  'services.items[].title': 'a fuller title for each, a promise in a few words',
  'services.items[].body': 'one or two sentences under each title',
  'services.items[].checklist[]': 'two to five short lines under each, each one thing it includes',
  'steps.eyebrow': 'a short line over the steps, such as How it works',
  'steps.heading': 'the heading of the steps, such as Three simple steps',
  'steps.body': 'one or two sentences under that heading',
  'steps.items[].title': 'three or four step titles, in order',
  'steps.items[].body': 'one sentence under each',
  'facilities.eyebrow': 'a short line over the four photographs, such as What you get',
  'facilities.heading': 'the heading over them',
  'facilities.items[].title':
    'exactly four short titles, one per photograph, different from the four reasons',
  'facilities.items[].body': 'exactly four sentences, one under each',
  'facilities.link.label': 'the link on each photograph, such as Find out more',
  'faq.eyebrow': 'a short line over the questions, such as FAQs',
  'faq.heading': 'the FAQ heading, such as Frequently asked questions',
  'faq.items[].question': 'three to six questions a customer would ask, from the brief',
  'faq.items[].answer': 'the answers, in their words, claiming nothing the owner did not say',
  'booking.eyebrow': 'a short line over the form, such as Get in touch',
  'booking.heading': 'the heading beside the form, an invitation in their words',
  'booking.form.name.label': 'the label of the name field, such as Your name',
  'booking.form.name.placeholder': 'the hint inside it',
  'booking.form.email.label': 'the label of the email field',
  'booking.form.email.placeholder': 'the hint inside it',
  'booking.form.phone.label': 'the label of the phone field',
  'booking.form.phone.placeholder': 'the hint inside it',
  'booking.form.doctor.label':
    'the label of the field for who they would like to deal with, such as Who to ask for',
  'booking.form.doctor.placeholder': 'the hint inside it, such as A name, if you have one',
  'booking.form.department.label':
    'the label of the list of what they offer, such as What you need',
  'booking.form.department.placeholder': 'the hint on that list, such as Choose one',
  'booking.form.date.label': 'the label of the date field, such as Preferred date',
  'booking.form.button': 'the form button, the same as ctaLabel',
  'cta.heading': 'the closing heading asking them to get in touch',
  'cta.body': 'one sentence under it',
  'cta.button.label': 'the closing button, the same as ctaLabel',
  'footer.description': 'one sentence about the company for the footer',
  'footer.columns[].heading': 'one to three footer column headings',
  'footer.columns[].links[].label':
    'two to five link labels per column; each link has a target of top, home, why-choose-us, our-services, booking-process, facilities, faq, book-appointment or cta',
  'footer.contact.heading': 'the heading of the footer column with the email, such as Get in touch',
  'footer.smallLinks[].label':
    'up to four short labels for the small links after the legal line, with the same targets; none is fine',
}

const SUMMIT_GUIDE = Object.entries(SUMMIT_SLOTS)
  .filter(([slot]) => slot in PURPOSE)
  .map(
    ([slot, { min, max }]) =>
      `- ${slot}: ${String(min)} to ${String(max)} characters, ${PURPOSE[slot as ModelSlot]}`,
  )
  .join('\n')

// Validation needs only words, so the copy is assembled around a wordmark and no pictures.
const NO_ASSETS: TemplateAssets = { logo: { kind: 'wordmark' }, images: {}, email: null }

// The schema has already checked the lengths; this narrows the type for the content object.
function four<T>(items: readonly T[]): Four<T> {
  const [a, b, c, d] = items
  if (
    a === undefined ||
    b === undefined ||
    c === undefined ||
    d === undefined ||
    items.length !== 4
  ) {
    throw new Error(`Expected four items, got ${String(items.length)}`)
  }
  return [a, b, c, d]
}

export function assembleSummit(copy: SummitCopy, assets: TemplateAssets): SummitContent {
  const { hero, why, services, facilities, booking, cta, footer } = copy
  const image = (slot: string) => assets.images[slot] ?? null
  const links = (items: readonly { label: string; target: (typeof TARGETS)[number] }[]) =>
    items.map((item) => ({ label: item.label, href: HREF[item.target] }))
  return {
    brand: { ...copy.brand, logo: assets.logo },
    nav: {
      links: copy.nav.links.map((label, index) => ({
        label,
        href: NAV_HREFS[index] ?? HREF.top,
      })),
      cta: { label: copy.nav.cta, href: HREF['booking-process'] },
    },
    hero: {
      badge: hero.badge,
      headline: hero.headline,
      subhead: hero.subhead,
      primary: { label: hero.primary, href: HREF['booking-process'] },
      secondary: { label: hero.secondary, href: HREF['our-services'] },
      proof: null,
      background: image('hero'),
    },
    why: {
      eyebrow: why.eyebrow,
      heading: why.heading,
      cards: four(why.cards),
      image: image('why'),
    },
    services: {
      eyebrow: services.eyebrow,
      heading: services.heading,
      items: services.items.map((item, index) => ({
        ...item,
        image: image(`service-${String(index + 1)}`),
      })),
    },
    steps: copy.steps,
    facilities: {
      eyebrow: facilities.eyebrow,
      heading: facilities.heading,
      items: four(
        facilities.items.map((item, index) => ({
          ...item,
          image: image(`facility-${String(index + 1)}`),
        })),
      ),
      link: { label: facilities.link, href: HREF['book-appointment'] },
    },
    faq: copy.faq,
    articles: null,
    booking: {
      eyebrow: booking.eyebrow,
      heading: booking.heading,
      form: {
        name: booking.form.name,
        email: booking.form.email,
        phone: booking.form.phone,
        doctor: { ...booking.form.doctor, options: null },
        department: {
          ...booking.form.department,
          options: services.items.map((item) => item.tag),
        },
        date: { label: booking.form.date },
        button: booking.form.button,
        sendTo: assets.email,
      },
    },
    cta: {
      heading: cta.heading,
      body: cta.body,
      button: { label: cta.button, href: HREF['book-appointment'] },
      image: image('cta'),
    },
    footer: {
      description: footer.description,
      columns: footer.columns.map((column) => ({
        heading: column.heading,
        links: links(column.links),
      })),
      contact: { heading: footer.contact, email: assets.email, phone: null, address: null },
      smallLinks: links(footer.smallLinks),
    },
  }
}

// Sentences that claim nothing, appended to a visitor's words that come up short of a slot.
const FILLERS = [
  'Get in touch to find out more.',
  'Everything starts with a conversation.',
  'Tell us what you need and we will take it from there.',
  'You can ask as many questions as you like before deciding anything.',
] as const

function prose(slot: Slot, text: string): string {
  return fitToSlot(text, SUMMIT_SLOTS[slot], FILLERS)
}

// A label is used as given when it fits, else replaced by a plain one that does.
function label(slot: Slot, text: string, plain: string): string {
  return fits(text.trim(), SUMMIT_SLOTS[slot]) ? text.trim() : plain
}

function fits(text: string, slot: CopySlot): boolean {
  return text.length >= slot.min && text.length <= slot.max
}

const PLAIN_TITLES = ['What we do', 'Who it is for', 'How to start', 'What happens next'] as const
const PLAIN_SERVICE_TITLES = [
  'What we do for you',
  'Who we do it for',
  'How we get started',
] as const
const PLAIN_STEPS = ['Tell us what you need', 'We agree the details', 'We get to work'] as const

// Copy from the brief alone, with no model involved: the visitor's own sentences in the prose
// slots and plain labels everywhere else. Always passes summitViolations, which the test
// proves over a corpus of briefs.
export function summitFallbackCopy(brief: BrandBrief): SummitCopy {
  const name = brief.company
  const positioning = brief.positioning
  const statement = brief.statement === '' ? positioning : brief.statement
  const cta = label('cta.button.label', brief.ctaLabel, 'Get in touch')
  const props = brief.valueProps
  const steps = brief.steps
  const titles = PLAIN_TITLES.map((fallback, index) =>
    label('why.cards[].title', props[index]?.title ?? fallback, fallback),
  )
  const stepTitles = PLAIN_STEPS.map((fallback, index) =>
    label('steps.items[].title', steps[index]?.title ?? fallback, fallback),
  )
  const bodies = [
    ...props.map((prop) => prop.body),
    ...steps.map((step) => step.body),
    statement,
    positioning,
  ]
  return {
    brand: {
      name: fitToSlot(name, SUMMIT_SLOTS['brand.name'], ['Ltd']),
      legalName: fitToSlot(name, SUMMIT_SLOTS['brand.legalName'], ['Ltd']),
    },
    nav: { links: ['Home', 'About', 'What we do', 'What you get'], cta },
    hero: {
      badge: {
        tag: 'Hello',
        text: label('hero.badge.text', brief.audience, 'In our own words'),
      },
      headline: prose('hero.headline', brief.headlines[0] ?? positioning),
      subhead: prose('hero.subhead', statement),
      primary: cta,
      secondary: 'See what we do',
    },
    why: {
      eyebrow: 'Why choose us',
      heading: prose('why.heading', `Why people choose ${name}`),
      cards: titles.map((title, index) => ({
        title,
        body: prose('why.cards[].body', bodies[index] ?? positioning),
      })),
    },
    services: {
      eyebrow: 'What we do',
      heading: 'Everything we do, and how we do it.',
      items: PLAIN_SERVICE_TITLES.map((fallback, index) => ({
        tag: label(
          'services.items[].tag',
          props[index]?.title ?? '',
          PLAIN_TITLES[index] ?? fallback,
        ),
        title: label('services.items[].title', props[index]?.title ?? '', fallback),
        body: prose('services.items[].body', props[index]?.body ?? positioning),
        checklist: stepTitles.map((title) =>
          label('services.items[].checklist[]', title, 'Ask us anything'),
        ),
      })),
    },
    steps: {
      eyebrow: 'How it works',
      heading: 'Three simple steps from first contact to getting started.',
      body: prose('steps.body', positioning),
      items: stepTitles.map((title, index) => ({
        title,
        body: prose('steps.items[].body', steps[index]?.body ?? positioning),
      })),
    },
    facilities: {
      eyebrow: 'What you get',
      heading: 'What working with us looks like.',
      items: PLAIN_TITLES.map((title, index) => ({
        title,
        body: prose('facilities.items[].body', bodies[index + 3] ?? statement),
      })),
      link: 'Find out more',
    },
    faq: {
      eyebrow: 'FAQs',
      heading: 'Frequently asked questions',
      items: [
        { question: 'How do we start?', answer: prose('faq.items[].answer', steps[0]?.body ?? '') },
        {
          question: 'What happens next?',
          answer: prose('faq.items[].answer', steps[1]?.body ?? ''),
        },
        {
          question: 'When does the work begin?',
          answer: prose('faq.items[].answer', steps[2]?.body ?? ''),
        },
      ],
    },
    booking: {
      eyebrow: 'Get in touch',
      heading: prose('booking.heading', `Take the first step with ${name}.`),
      form: {
        name: { label: 'Your name', placeholder: 'Enter your full name' },
        email: { label: 'Email address', placeholder: 'Enter your email' },
        phone: { label: 'Phone number', placeholder: 'Enter your phone number' },
        doctor: { label: 'Who to ask for', placeholder: 'A name, if you have one' },
        department: { label: 'What you need', placeholder: 'Choose one' },
        date: 'Preferred date',
        button: cta,
      },
    },
    cta: {
      heading: prose('cta.heading', `Ready to talk to ${name}?`),
      body: prose('cta.body', positioning),
      button: cta,
    },
    footer: {
      description: prose('footer.description', statement),
      columns: [
        {
          heading: 'Explore',
          links: [
            { label: 'About', target: 'why-choose-us' },
            { label: 'What we do', target: 'our-services' },
            { label: 'How it works', target: 'booking-process' },
          ],
        },
        {
          heading: 'Company',
          links: [
            { label: cta, target: 'book-appointment' },
            { label: 'Back to top', target: 'top' },
          ],
        },
      ],
      contact: 'Get in touch',
      smallLinks: [],
    },
  }
}

export const summitContract = defineContract<SummitCopy>({
  meta,
  contrastPairs: SUMMIT_CONTRAST_PAIRS,
  imageSlots: [
    'hero',
    'why',
    'cta',
    'service-1',
    'service-2',
    'service-3',
    'service-4',
    'service-5',
    'service-6',
    'facility-1',
    'facility-2',
    'facility-3',
    'facility-4',
  ],
  copySchema: summitCopySchema,
  guide: SUMMIT_GUIDE,
  fallbackCopy: summitFallbackCopy,
  copyViolations: summitCopyViolations,
  headlineOf: (copy) => copy.hero.headline,
})
