import * as z from 'zod'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import { defineContract } from '@/lib/copy-slots/contract'
import { fitToSlot } from '@/lib/copy-slots/fit'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import {
  EMBER_CONTRAST_PAIRS,
  EMBER_SLOTS,
  type EmberContent,
  emberViolations,
  type Three,
} from './copy-slots'
import { meta } from './meta'

// Ember's side of the pipeline contract: the copy the copy stage writes, the fallback when it
// cannot, and how copy and assets become the content object. Links are never written: the nav
// follows the page's sections in the source's order, every button leads to the booking steps as
// the source's do, and footer links point at one of the page's own anchors. The optional
// pieces (the rating line, the location card, the booking testimonial, the opening times, the
// testimonials and the social links) are not in the copy: the brief holds no such facts, so
// they stay null.

const TARGETS = [
  'top',
  'about',
  'dishes',
  'features',
  'booking-process',
  'timing',
  'faq',
  'cta',
] as const
const HREF: Readonly<Record<(typeof TARGETS)[number], string>> = {
  top: '#top',
  about: '#about',
  dishes: '#dishes',
  features: '#features',
  'booking-process': '#booking-process',
  timing: '#timing',
  faq: '#faq',
  cta: '#cta',
}
const NAV_HREFS = ['#about', '#dishes', '#timing', '#faq'] as const

const headed = { eyebrow: z.string(), heading: z.string() }
const titled = z.object({ title: z.string(), body: z.string() })

export const emberCopySchema = z.object({
  brand: z.object({ name: z.string(), legalName: z.string() }),
  nav: z.object({ links: z.array(z.string()), cta: z.string() }),
  hero: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    subhead: z.string(),
    cta: z.string(),
  }),
  about: z.object({ ...headed, body: z.string() }),
  stats: z.array(titled),
  dishes: z.object({
    ...headed,
    items: z.array(z.object({ title: z.string(), note: z.string() })),
  }),
  features: z.object({ ...headed, items: z.array(titled) }),
  booking: z.object({ ...headed, steps: z.array(titled) }),
  timing: z.object({ title: z.string(), body: z.string(), cta: z.string() }),
  faq: z.object({
    ...headed,
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
  cta: z.object({ heading: z.string(), body: z.string(), button: z.string() }),
  footer: z.object({
    description: z.string(),
    groups: z.array(
      z.object({
        heading: z.string(),
        links: z.array(z.object({ label: z.string(), target: z.enum(TARGETS) })),
      }),
    ),
    contact: z.string(),
  }),
})

export type EmberCopy = z.infer<typeof emberCopySchema>

// The lists of a fixed length, and their paths in a violation.
const FIXED: readonly [
  path: string,
  size: number,
  pick: (copy: EmberCopy) => readonly unknown[],
][] = [
  ['stats', 3, (copy) => copy.stats],
  ['features.items', 3, (copy) => copy.features.items],
  ['booking.steps', 3, (copy) => copy.booking.steps],
]

// Every count and slot outside its limits. Fixed counts first: a list of the wrong length
// cannot be assembled, so its violations are reported alone and the rest waits for the next
// attempt.
function emberCopyViolations(copy: EmberCopy): readonly SlotViolation[] {
  const counts = FIXED.flatMap(([path, size, pick]) => {
    const length = pick(copy).length
    return length === size ? [] : [{ slot: path, length, min: size, max: size }]
  })
  if (counts.length > 0) return counts
  return emberViolations(assembleEmber(copy, NO_ASSETS))
}

type Slot = keyof typeof EMBER_SLOTS

// The slots the copy stage writes: every slot but those of the optional pieces.
type ModelSlot = Exclude<
  Slot,
  | `hero.proof.${string}`
  | `about.location.${string}`
  | `booking.testimonial.${string}`
  | `timing.rows[].${string}`
  | `testimonials.${string}`
>

// What each slot is for, beside its range, for the copy prompt.
const PURPOSE: Readonly<Record<ModelSlot, string>> = {
  'brand.name': 'the company name as given',
  'brand.legalName': 'the legal name for the footer, the company name if unknown',
  'nav.links[].label':
    'two to four short menu labels, in order: about, what they offer, where to find them, questions',
  'nav.cta.label': 'the header button, the same as ctaLabel',
  'hero.eyebrow':
    'a short line over the headline, set in capitals, such as Where flavour meets care',
  'hero.headline': 'the headline, a plain promise in their words',
  'hero.subhead': 'one or two sentences under the headline saying what they do and for whom',
  'hero.cta.label': 'the main button, the same as ctaLabel',
  'about.eyebrow': 'a short line over the About heading, such as Made with care',
  'about.heading': 'the About heading, a sentence about the experience they give',
  'about.body': 'one or two sentences about the company in their words',
  'stats[].title': 'exactly three short titles for what matters most to them, in order',
  'stats[].body': 'exactly three sentences, one under each title',
  'dishes.eyebrow': 'a short line over the grid of what they offer, such as What we make',
  'dishes.heading': 'the heading over that grid',
  'dishes.items[].title': 'four or eight names of things they offer, a few words each',
  'dishes.items[].note':
    'a short note under each, such as who it is for or what it includes; never a price',
  'features.eyebrow': 'a short line over the features, such as What sets us apart',
  'features.heading': 'the heading of the features section',
  'features.items[].title': 'exactly three feature titles, different from the three titles above',
  'features.items[].body': 'exactly three feature bodies',
  'booking.eyebrow': 'a short line over the steps, such as How it works',
  'booking.heading': 'the heading of the steps, such as Three simple steps',
  'booking.steps[].title': 'exactly three step titles, in order',
  'booking.steps[].body': 'exactly three step bodies',
  'timing.title': 'the title of the card on the photograph, such as Where to find us',
  'timing.body': 'one or two sentences in that card inviting them to get in touch',
  'timing.cta.label': 'the button in that card, the same as ctaLabel',
  'faq.eyebrow': 'a short line over the questions, such as FAQs',
  'faq.heading': 'the FAQ heading, such as Frequently asked questions',
  'faq.items[].question': 'three to six questions a customer would ask, from the brief',
  'faq.items[].answer': 'the answers, in their words, claiming nothing the owner did not say',
  'cta.heading': 'the closing heading asking them to get in touch',
  'cta.body': 'one sentence under it',
  'cta.button.label': 'the closing button, the same as ctaLabel',
  'footer.description': 'one sentence about the company for the footer',
  'footer.groups[].heading': 'one to three footer column headings',
  'footer.groups[].links[].label':
    'two to five link labels per column; each link has a target of top, about, dishes, features, booking-process, timing, faq or cta',
  'footer.contact.heading': 'the heading of the footer column with the email, such as Get in touch',
}

const EMBER_GUIDE = Object.entries(EMBER_SLOTS)
  .filter(([slot]) => slot in PURPOSE)
  .map(
    ([slot, { min, max }]) =>
      `- ${slot}: ${String(min)} to ${String(max)} characters, ${PURPOSE[slot as ModelSlot]}`,
  )
  .join('\n')

// Validation needs only words, so the copy is assembled around a wordmark and no pictures.
const NO_ASSETS: TemplateAssets = { logo: { kind: 'wordmark' }, images: {}, email: null }

// The schema has already checked the lengths; this narrows the type for the content object.
function three<T>(items: readonly T[]): Three<T> {
  const [a, b, c] = items
  if (a === undefined || b === undefined || c === undefined || items.length !== 3) {
    throw new Error(`Expected three items, got ${String(items.length)}`)
  }
  return [a, b, c]
}

export function assembleEmber(copy: EmberCopy, assets: TemplateAssets): EmberContent {
  const { hero, dishes, features, booking, timing, cta, footer } = copy
  const image = (slot: string) => assets.images[slot] ?? null
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
      eyebrow: hero.eyebrow,
      headline: hero.headline,
      subhead: hero.subhead,
      cta: { label: hero.cta, href: HREF['booking-process'] },
      background: image('hero'),
      proof: null,
    },
    about: { ...copy.about, image: image('about'), location: null },
    stats: three(copy.stats),
    dishes: {
      eyebrow: dishes.eyebrow,
      heading: dishes.heading,
      items: dishes.items.map((item, index) => ({
        ...item,
        image: image(`dish-${String(index + 1)}`),
      })),
    },
    features: {
      eyebrow: features.eyebrow,
      heading: features.heading,
      items: three(features.items),
      image: image('features'),
    },
    booking: {
      eyebrow: booking.eyebrow,
      heading: booking.heading,
      testimonial: null,
      steps: three(booking.steps),
    },
    timing: {
      image: image('timing'),
      title: timing.title,
      rows: null,
      body: timing.body,
      cta: { label: timing.cta, href: HREF['booking-process'] },
    },
    testimonials: null,
    faq: copy.faq,
    cta: {
      heading: cta.heading,
      body: cta.body,
      button: { label: cta.button, href: HREF['booking-process'] },
    },
    footer: {
      description: footer.description,
      socials: null,
      groups: footer.groups.map((group) => ({
        heading: group.heading,
        links: group.links.map((link) => ({ label: link.label, href: HREF[link.target] })),
      })),
      contact: { heading: footer.contact, email: assets.email, phone: null },
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
  return fitToSlot(text, EMBER_SLOTS[slot], FILLERS)
}

// A label is used as given when it fits, else replaced by a plain one that does.
function label(slot: Slot, text: string, plain: string): string {
  return fits(text.trim(), EMBER_SLOTS[slot]) ? text.trim() : plain
}

function fits(text: string, slot: CopySlot): boolean {
  return text.length >= slot.min && text.length <= slot.max
}

const PLAIN_TITLES = ['What we do', 'Who it is for', 'How to start', 'What happens next'] as const
const PLAIN_STEPS = ['Tell us what you need', 'We agree the details', 'We get to work'] as const

// Copy from the brief alone, with no model involved: the visitor's own sentences in the prose
// slots and plain labels everywhere else. Always passes emberViolations, which the test proves
// over a corpus of briefs.
export function emberFallbackCopy(brief: BrandBrief): EmberCopy {
  const name = brief.company
  const positioning = brief.positioning
  const statement = brief.statement === '' ? positioning : brief.statement
  const cta = label('cta.button.label', brief.ctaLabel, 'Get in touch')
  const props = brief.valueProps
  const steps = brief.steps
  const titles = PLAIN_TITLES.slice(0, 3).map((fallback, index) =>
    label('stats[].title', props[index]?.title ?? fallback, fallback),
  )
  const stepTitles = PLAIN_STEPS.map((fallback, index) =>
    label('booking.steps[].title', steps[index]?.title ?? fallback, fallback),
  )
  const offered = [...titles, ...stepTitles]
    .filter((title, index, all) => all.indexOf(title) === index)
    .slice(0, 4)
  while (offered.length < 4) offered.push(PLAIN_TITLES[offered.length] ?? 'What we do')
  return {
    brand: {
      name: fitToSlot(name, EMBER_SLOTS['brand.name'], ['Ltd']),
      legalName: fitToSlot(name, EMBER_SLOTS['brand.legalName'], ['Ltd']),
    },
    nav: { links: ['About', 'What we do', 'Find us', 'Questions'], cta },
    hero: {
      eyebrow: label('hero.eyebrow', brief.audience, 'In our own words'),
      headline: prose('hero.headline', brief.headlines[0] ?? positioning),
      subhead: prose('hero.subhead', statement),
      cta,
    },
    about: {
      eyebrow: 'About us',
      heading: prose('about.heading', `About ${name}`),
      body: prose('about.body', `${positioning} ${statement}`),
    },
    stats: titles.map((title, index) => ({
      title,
      body: prose('stats[].body', props[index]?.body ?? positioning),
    })),
    dishes: {
      eyebrow: 'What we offer',
      heading: 'What we do, at a glance.',
      items: offered.map((title) => ({
        title: label('dishes.items[].title', title, 'What we do'),
        note: 'Ask us for details',
      })),
    },
    features: {
      eyebrow: 'How we work',
      heading: 'How we work with you.',
      items: stepTitles.map((title, index) => ({
        title: label('features.items[].title', title, PLAIN_STEPS[index] ?? 'We get to work'),
        body: prose('features.items[].body', steps[index]?.body ?? positioning),
      })),
    },
    booking: {
      eyebrow: 'How it works',
      heading: 'Three simple steps from first contact to getting started.',
      steps: stepTitles.map((title, index) => ({
        title,
        body: prose('booking.steps[].body', steps[index]?.body ?? positioning),
      })),
    },
    timing: {
      title: 'Get in touch',
      body: prose('timing.body', positioning),
      cta,
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
    cta: {
      heading: prose('cta.heading', `Start a conversation with ${name}.`),
      body: prose('cta.body', positioning),
      button: cta,
    },
    footer: {
      description: prose('footer.description', statement),
      groups: [
        {
          heading: 'Explore',
          links: [
            { label: 'About', target: 'about' },
            { label: 'What we do', target: 'dishes' },
            { label: 'How it works', target: 'booking-process' },
          ],
        },
        {
          heading: 'Company',
          links: [
            { label: 'Questions', target: 'faq' },
            { label: 'Back to top', target: 'top' },
          ],
        },
      ],
      contact: 'Get in touch',
    },
  }
}

export const emberContract = defineContract<EmberCopy>({
  meta,
  contrastPairs: EMBER_CONTRAST_PAIRS,
  imageSlots: [
    'hero',
    'about',
    'features',
    'timing',
    'dish-1',
    'dish-2',
    'dish-3',
    'dish-4',
    'dish-5',
    'dish-6',
    'dish-7',
    'dish-8',
  ],
  copySchema: emberCopySchema,
  guide: EMBER_GUIDE,
  fallbackCopy: emberFallbackCopy,
  copyViolations: emberCopyViolations,
  headlineOf: (copy) => copy.hero.headline,
})
