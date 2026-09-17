import * as z from 'zod'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import { defineContract } from '@/lib/copy-slots/contract'
import { fitToSlot } from '@/lib/copy-slots/fit'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import {
  HARBOR_CONTRAST_PAIRS,
  HARBOR_SLOTS,
  type HarborContent,
  harborViolations,
  type Three,
} from './copy-slots'
import { meta } from './meta'

// Harbor's side of the pipeline contract: the copy the copy stage writes, the fallback when
// it cannot, and how copy and assets become the content object. Links are never written: the
// nav follows the page's blocks in the source's order, the main buttons lead to the contact
// form (the source's led to its plans, which a visitor's page does not have), the quieter ones
// to About, and footer links point at one of the page's own anchors. The optional pieces are
// not in the copy: the brief holds no such facts, so they stay null.

const TARGETS = ['top', 'about', 'services', 'metrics', 'contact', 'cta'] as const
const HREF: Readonly<Record<(typeof TARGETS)[number], string>> = {
  top: '#top',
  about: '#about',
  services: '#services',
  metrics: '#metrics',
  contact: '#contact',
  cta: '#cta',
}
const NAV_HREFS = ['#hero', '#about', '#services', '#contact', '#cta'] as const

const lines = z.object({ lines: z.array(z.string()), emphasis: z.string() })
const headed = { eyebrow: z.string(), heading: lines }

export const harborCopySchema = z.object({
  brand: z.object({ name: z.string(), legalName: z.string() }),
  nav: z.object({ links: z.array(z.string()), cta: z.string() }),
  hero: z.object({
    badge: z.string(),
    headline: z.array(z.string()),
    subhead: z.string(),
    primary: z.string(),
    secondary: z.string(),
    stats: z.array(z.object({ value: z.string(), label: z.string() })),
  }),
  about: z.object({ ...headed, paragraphs: z.array(z.string()), tags: z.array(z.string()) }),
  services: z.object({
    ...headed,
    lead: z.string(),
    items: z.array(z.object({ tag: z.string(), title: z.string(), body: z.string() })),
    more: z.string(),
  }),
  metrics: z.object({
    ...headed,
    watermark: z.string(),
    items: z.array(z.object({ value: z.string(), label: z.string(), description: z.string() })),
  }),
  contact: z.object({
    ...headed,
    faq: z.array(z.object({ question: z.string(), answer: z.string() })),
    form: z.object({
      eyebrow: z.string(),
      heading: lines,
      lead: z.string(),
      labels: z.object({ name: z.string(), email: z.string(), message: z.string() }),
      placeholder: z.string(),
      button: z.string(),
    }),
  }),
  cta: z.object({ ...headed, body: z.string(), primary: z.string(), secondary: z.string() }),
  footer: z.object({
    description: z.string(),
    newsletter: z.object({ label: z.string(), placeholder: z.string() }),
    columns: z.array(
      z.object({
        heading: z.string(),
        links: z.array(z.object({ label: z.string(), target: z.enum(TARGETS) })),
      }),
    ),
    note: z.string(),
    smallPrint: z.string(),
  }),
})

export type HarborCopy = z.infer<typeof harborCopySchema>

// The lists of a fixed length, and their paths in a violation.
const FIXED: readonly [
  path: string,
  size: number,
  pick: (copy: HarborCopy) => readonly unknown[],
][] = [
  ['hero.headline', 3, (copy) => copy.hero.headline],
  ['hero.stats', 3, (copy) => copy.hero.stats],
]

// Every count and slot outside its limits. Fixed counts first: a list of the wrong length
// cannot be assembled, so its violations are reported alone and the rest waits for the next
// attempt.
function harborCopyViolations(copy: HarborCopy): readonly SlotViolation[] {
  const counts = FIXED.flatMap(([path, size, pick]) => {
    const length = pick(copy).length
    return length === size ? [] : [{ slot: path, length, min: size, max: size }]
  })
  if (counts.length > 0) return counts
  return harborViolations(assembleHarbor(copy, NO_ASSETS))
}

type Slot = keyof typeof HARBOR_SLOTS

// The slots the copy stage writes: every slot but those of the optional pieces.
type ModelSlot = Exclude<
  Slot,
  | `about.badge.${string}`
  | `about.quotes[].${string}`
  | `gallery.${string}`
  | `pricing.${string}`
  | `testimonials.${string}`
  | `partners.${string}`
  | `blog.${string}`
>

const LINES = 'one to three short lines in capitals, each a few words'
const EMPHASIS =
  'one phrase copied exactly from one of those lines, set in the accent; empty for none'

// What each slot is for, beside its range, for the copy prompt.
const PURPOSE: Readonly<Record<ModelSlot, string>> = {
  'brand.name': 'the company name as given',
  'brand.legalName': 'the legal name for the footer, the company name if unknown',
  'nav.links[].label':
    'two to five short menu labels, in order: home, about, what they offer, contact, the closing ask',
  'nav.cta.label': 'the header button, the same as ctaLabel',
  'hero.badge': 'a short line in a pill over the headline, such as Made for people who train',
  'hero.headline[]': 'exactly three short lines of the headline in capitals; the second is lit',
  'hero.subhead': 'one or two short sentences under the headline',
  'hero.primary.label': 'the main button, the same as ctaLabel',
  'hero.secondary.label': 'a quieter button that leads to About, such as Who we are',
  'hero.stats[].value':
    'exactly three short phrases set large, a few words each with no numbers, such as Open late',
  'hero.stats[].label': 'exactly three labels under those phrases, such as every weekday',
  'about.eyebrow': 'a short line over the About heading, such as Our ethos',
  'about.heading.lines[]': `the About heading, ${LINES}`,
  'about.heading.emphasis': EMPHASIS,
  'about.paragraphs[]': 'one or two paragraphs about the company in their words',
  'about.tags[]': 'three to five short pills naming what they offer, a few words each',
  'services.eyebrow': 'a short line over the capabilities, such as What we do',
  'services.heading.lines[]': `the heading of the capabilities, ${LINES}`,
  'services.heading.emphasis': EMPHASIS,
  'services.lead': 'one sentence beside that heading',
  'services.items[].tag': 'three to six short tags, one word each, over each capability',
  'services.items[].title': 'the capability titles',
  'services.items[].body': 'one or two sentences under each',
  'services.more': 'the link shown under a capability under the pointer, such as Find out more',
  'metrics.eyebrow': 'a short line over the grid of figures, such as What matters',
  'metrics.heading.lines[]': `the heading over the grid, ${LINES}`,
  'metrics.heading.emphasis': EMPHASIS,
  'metrics.watermark': 'one word set huge behind the grid, such as PROOF',
  'metrics.items[].value':
    'three to six short phrases set large, a few words each with no numbers, such as Same week',
  'metrics.items[].label': 'a label under each phrase',
  'metrics.items[].description': 'a few words under each label',
  'contact.eyebrow': 'a short line over the questions, such as FAQ',
  'contact.heading.lines[]': `the FAQ heading, ${LINES}`,
  'contact.heading.emphasis': EMPHASIS,
  'contact.faq[].question': 'three to six questions a customer would ask, from the brief',
  'contact.faq[].answer': 'the answers, in their words, claiming nothing the owner did not say',
  'contact.form.eyebrow': 'a short line over the form, such as Get in touch',
  'contact.form.heading.lines[]': `the form heading, ${LINES}`,
  'contact.form.heading.emphasis': EMPHASIS,
  'contact.form.lead': 'one sentence inviting a message, promising nothing',
  'contact.form.labels.name': 'the label of the name field',
  'contact.form.labels.email': 'the label of the email field',
  'contact.form.labels.message': 'the label of the message field',
  'contact.form.placeholder': 'the hint inside the message field',
  'contact.form.button': 'the form button, such as Send message',
  'cta.eyebrow': 'a short line over the closing heading',
  'cta.heading.lines[]': `the closing heading, ${LINES}`,
  'cta.heading.emphasis': EMPHASIS,
  'cta.body': 'two or three sentences under it',
  'cta.primary.label': 'the closing button, the same as ctaLabel',
  'cta.secondary.label': 'a quieter button that leads back to About',
  'footer.description': 'one or two sentences about the company for the footer',
  'footer.newsletter.label': 'a short line over the footer email field, such as Hear from us',
  'footer.newsletter.placeholder': 'the hint inside that field, such as your@email.com',
  'footer.columns[].heading': 'one to three footer column headings',
  'footer.columns[].links[].label':
    'two to six link labels per column; each link has a target of top, about, services, metrics, contact or cta',
  'footer.note': 'a few words after the legal line, or empty',
  'footer.smallPrint': 'a short line of small print for the footer, such as Privacy · Terms',
}

const HARBOR_GUIDE = Object.entries(HARBOR_SLOTS)
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

export function assembleHarbor(copy: HarborCopy, assets: TemplateAssets): HarborContent {
  const { hero, contact, cta, footer } = copy
  const image = (slot: string) => assets.images[slot] ?? null
  return {
    brand: { ...copy.brand, logo: assets.logo },
    nav: {
      links: copy.nav.links.map((label, index) => ({
        label,
        href: NAV_HREFS[index] ?? HREF.top,
      })),
      cta: { label: copy.nav.cta, href: HREF.contact },
    },
    hero: {
      badge: hero.badge,
      headline: three(hero.headline),
      subhead: hero.subhead,
      primary: { label: hero.primary, href: HREF.contact },
      secondary: { label: hero.secondary, href: HREF.about },
      stats: three(hero.stats),
      image: image('hero'),
    },
    about: { ...copy.about, image: image('about'), badge: null, quotes: null },
    services: copy.services,
    metrics: copy.metrics,
    gallery: null,
    pricing: null,
    testimonials: null,
    partners: null,
    contact: {
      eyebrow: contact.eyebrow,
      heading: contact.heading,
      faq: contact.faq,
      form: { ...contact.form, email: assets.email },
    },
    cta: {
      eyebrow: cta.eyebrow,
      heading: cta.heading,
      body: cta.body,
      primary: { label: cta.primary, href: HREF.contact },
      secondary: { label: cta.secondary, href: HREF.about },
      image: image('cta'),
    },
    blog: null,
    footer: {
      description: footer.description,
      newsletter: { ...footer.newsletter, email: assets.email },
      columns: footer.columns.map((column) => ({
        heading: column.heading,
        links: column.links.map((link) => ({ label: link.label, href: HREF[link.target] })),
      })),
      note: footer.note,
      smallPrint: footer.smallPrint,
      socials: null,
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
  return fitToSlot(text, HARBOR_SLOTS[slot], FILLERS)
}

// A label is used as given when it fits, else replaced by a plain one that does.
function label(slot: Slot, text: string, plain: string): string {
  return fits(text.trim(), HARBOR_SLOTS[slot]) ? text.trim() : plain
}

function fits(text: string, slot: CopySlot): boolean {
  return text.length >= slot.min && text.length <= slot.max
}

// A heading in capitals over the given lines, with no lit phrase: the fallback never guesses
// which words to colour.
function plain(...words: string[]): HarborCopy['about']['heading'] {
  return { lines: words.map((word) => word.toUpperCase()), emphasis: '' }
}

// The company name as a heading line when it fits one, else nothing: a one-letter name is too
// short for a line and a long legal name too long.
function nameLine(name: string, slot: Slot, prefix = ''): string | null {
  const line = `${prefix}${name}`.toUpperCase()
  return fits(line, HARBOR_SLOTS[slot]) ? line : null
}

const PLAIN_TITLES = ['What we do', 'Who it is for', 'How to start'] as const
const PLAIN_STEPS = ['Tell us what you need', 'We agree the details', 'We get to work'] as const
const PLAIN_TAGS = ['Start', 'Plan', 'Work'] as const

// Copy from the brief alone, with no model involved: the visitor's own sentences in the prose
// slots and plain labels everywhere else. Always passes harborViolations, which the test
// proves over a corpus of briefs.
export function harborFallbackCopy(brief: BrandBrief): HarborCopy {
  const name = brief.company
  const positioning = brief.positioning
  const statement = brief.statement === '' ? positioning : brief.statement
  const cta = label('cta.primary.label', brief.ctaLabel, 'Get in touch')
  const props = brief.valueProps
  const steps = brief.steps
  const titles = PLAIN_TITLES.map((fallback, index) =>
    label('services.items[].title', props[index]?.title ?? fallback, fallback),
  )
  const stepTitles = PLAIN_STEPS.map((fallback, index) =>
    label('metrics.items[].label', steps[index]?.title ?? fallback, fallback),
  )
  const aboutName = nameLine(name, 'about.heading.lines[]')
  const ctaName = nameLine(name, 'cta.heading.lines[]', 'with ')
  return {
    brand: {
      name: fitToSlot(name, HARBOR_SLOTS['brand.name'], ['Ltd']),
      legalName: fitToSlot(name, HARBOR_SLOTS['brand.legalName'], ['Ltd']),
    },
    nav: { links: ['Home', 'About', 'What we do', 'Contact'], cta },
    hero: {
      badge: label('hero.badge', brief.audience, 'In our own words'),
      headline: ['WHAT WE DO,', 'AND WHO', 'IT IS FOR'],
      subhead: prose('hero.subhead', brief.headlines[0] ?? positioning),
      primary: cta,
      secondary: 'Who we are',
      stats: [
        { value: 'Listen', label: 'first, always' },
        { value: 'Agree', label: 'the plan with you' },
        { value: 'Deliver', label: 'what was agreed' },
      ],
    },
    about: {
      eyebrow: 'Our ethos',
      heading:
        aboutName === null ? plain('Who we are,', 'and what we do') : plain('About', aboutName),
      paragraphs: [prose('about.paragraphs[]', `${positioning} ${statement}`)],
      tags: titles.map((title, index) =>
        label('about.tags[]', title, PLAIN_TITLES[index] ?? 'What we do'),
      ),
    },
    services: {
      eyebrow: 'What we do',
      heading: plain('What we do,', 'in three parts'),
      lead: prose('services.lead', positioning),
      items: titles.map((title, index) => ({
        tag: PLAIN_TAGS[index] ?? 'More',
        title,
        body: prose('services.items[].body', props[index]?.body ?? positioning),
      })),
      more: 'Find out more',
    },
    metrics: {
      eyebrow: 'How it works',
      heading: plain('Three steps', 'from first contact'),
      watermark: 'STEPS',
      items: stepTitles.map((title, index) => ({
        value: label('metrics.items[].value', PLAIN_TAGS[index] ?? 'Next', 'Next'),
        label: title,
        description: label(
          'metrics.items[].description',
          `Step ${String(index + 1)} of three`,
          'One of three steps',
        ),
      })),
    },
    contact: {
      eyebrow: 'FAQ',
      heading: plain('Common', 'questions'),
      faq: [
        {
          question: 'How do we start?',
          answer: prose('contact.faq[].answer', steps[0]?.body ?? ''),
        },
        {
          question: 'What happens next?',
          answer: prose('contact.faq[].answer', steps[1]?.body ?? ''),
        },
        {
          question: 'When does the work begin?',
          answer: prose('contact.faq[].answer', steps[2]?.body ?? ''),
        },
      ],
      form: {
        eyebrow: 'Get in touch',
        heading: plain('Start a', 'conversation'),
        lead: 'Send us a message and we will get back to you.',
        labels: { name: 'Name', email: 'Email', message: 'Message' },
        placeholder: 'Tell us what you need',
        button: 'Send message',
      },
    },
    cta: {
      eyebrow: 'Get in touch',
      heading:
        ctaName === null
          ? plain('Start a', 'conversation')
          : plain('Start a', 'conversation', ctaName),
      body: prose('cta.body', `${positioning} ${statement}`),
      primary: cta,
      secondary: 'Who we are',
    },
    footer: {
      description: prose('footer.description', statement),
      newsletter: { label: 'Hear from us', placeholder: 'your@email.com' },
      columns: [
        {
          heading: 'Explore',
          links: [
            { label: 'About', target: 'about' },
            { label: 'What we do', target: 'services' },
            { label: 'How it works', target: 'metrics' },
          ],
        },
        {
          heading: 'Company',
          links: [
            { label: cta, target: 'contact' },
            { label: 'Back to top', target: 'top' },
          ],
        },
      ],
      note: '',
      smallPrint: 'Privacy · Terms',
    },
  }
}

export const harborContract = defineContract<HarborCopy>({
  meta,
  contrastPairs: HARBOR_CONTRAST_PAIRS,
  imageSlots: ['hero', 'about', 'cta'],
  copySchema: harborCopySchema,
  guide: HARBOR_GUIDE,
  fallbackCopy: harborFallbackCopy,
  copyViolations: harborCopyViolations,
  headlineOf: (copy) => copy.hero.headline.join(' '),
})
