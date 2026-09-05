import * as z from 'zod'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import { defineContract } from '@/lib/copy-slots/contract'
import { fitToSlot } from '@/lib/copy-slots/fit'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import {
  type Four,
  MERIDIAN_CONTRAST_PAIRS,
  MERIDIAN_SLOTS,
  type MeridianContent,
  meridianViolations,
  type Three,
} from './copy-slots'
import { meta } from './meta'

// Meridian's side of the pipeline contract: the copy the copy stage writes, the fallback when
// it cannot, and how copy and assets become the content object. Links are never written: the
// nav follows the page's sections in order, and every other link points at one of the page's
// own anchors. The optional sections (testimonials, team, pricing) are not in the copy: the
// brief holds no such facts, so they stay null.

const TARGETS = ['benefits', 'features', 'services', 'community', 'contact', 'faq', 'top'] as const
const HREF: Readonly<Record<(typeof TARGETS)[number], string>> = {
  benefits: '#benefits',
  features: '#features',
  services: '#services',
  community: '#community',
  contact: '#contact',
  faq: '#faq',
  top: '#top',
}
const NAV_HREFS = ['#benefits', '#services', '#contact', '#faq'] as const

const emphasised = z.object({ text: z.string(), emphasis: z.string() })
const titled = z.object({ title: z.string(), body: z.string() })
const headed = { eyebrow: z.string(), heading: z.string() }

export const meridianCopySchema = z.object({
  brand: z.object({ name: z.string(), legalName: z.string() }),
  nav: z.object({
    links: z.array(z.string()),
    cta: z.string(),
    menu: z.object({ label: z.string(), items: z.array(titled) }),
  }),
  hero: z.object({
    badge: z.object({ label: z.string(), text: z.string() }),
    headline: emphasised,
    subhead: z.string(),
    primary: z.string(),
    secondary: z.string(),
  }),
  sponsors: z.object({ heading: z.string(), items: z.array(z.string()) }),
  benefits: z.object({ ...headed, lead: z.string(), items: z.array(titled) }),
  features: z.object({ ...headed, lead: z.string(), items: z.array(titled) }),
  services: z.object({ ...headed, lead: z.string(), items: z.array(titled) }),
  community: z.object({ heading: emphasised, body: z.string(), action: z.string() }),
  contact: z.object({
    ...headed,
    lead: z.string(),
    rows: z.array(z.object({ title: z.string(), lines: z.array(z.string()) })),
    form: z.object({ subjects: z.array(z.string()), button: z.string() }),
  }),
  faq: z.object({
    ...headed,
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
  footer: z.object({
    groups: z.array(
      z.object({
        heading: z.string(),
        links: z.array(z.object({ label: z.string(), target: z.enum(TARGETS) })),
      }),
    ),
  }),
})

export type MeridianCopy = z.infer<typeof meridianCopySchema>

// The lists of a fixed length, and their paths in a violation.
const FIXED: readonly [
  path: string,
  size: number,
  pick: (copy: MeridianCopy) => readonly unknown[],
][] = [
  ['nav.menu.items', 3, (copy) => copy.nav.menu.items],
  ['benefits.items', 4, (copy) => copy.benefits.items],
  ['contact.rows', 3, (copy) => copy.contact.rows],
]

// Every count and slot outside its limits. Fixed counts first: a list of the wrong length
// cannot be assembled, so its violations are reported alone and the rest waits for the next
// attempt.
function meridianCopyViolations(copy: MeridianCopy): readonly SlotViolation[] {
  const counts = FIXED.flatMap(([path, size, pick]) => {
    const length = pick(copy).length
    return length === size ? [] : [{ slot: path, length, min: size, max: size }]
  })
  if (counts.length > 0) return counts
  return meridianViolations(assembleMeridian(copy, NO_ASSETS))
}

type Slot = keyof typeof MERIDIAN_SLOTS

// The slots the copy stage writes: every slot but those of the optional sections.
type ModelSlot = Exclude<Slot, `testimonials.${string}` | `team.${string}` | `pricing.${string}`>

// What each slot is for, beside its range, for the copy prompt.
const PURPOSE: Readonly<Record<ModelSlot, string>> = {
  'brand.name': 'the company name as given',
  'brand.legalName': 'the legal name for the footer, the company name if unknown',
  'nav.links[].label': 'two to four menu labels, in order: why them, services, contact, questions',
  'nav.cta.label': 'the small header button',
  'nav.menu.label': 'the label of the menu that opens onto three entries, such as What we do',
  'nav.menu.items[].title': 'exactly three short entry titles in that menu',
  'nav.menu.items[].body': 'exactly three one-line entry descriptions',
  'hero.badge.label': 'one word on the small badge above the headline, such as New',
  'hero.badge.text': 'a few words after that badge, such as a plain line about what they do',
  'hero.headline.text': 'the headline, a plain promise in their words',
  'hero.headline.emphasis':
    'one or two words copied exactly from the headline, set in the brand colour; empty for none',
  'hero.subhead': 'one or two sentences under the headline saying what they do and for whom',
  'hero.primary.label': 'the main button, the same as ctaLabel',
  'hero.secondary.label': 'a quieter button that leads to what they do',
  'sponsors.heading': 'a short heading over a sliding row of labels, such as What we cover',
  'sponsors.items[]': 'three to seven short labels for the areas or kinds of work they cover',
  'benefits.eyebrow': 'a small word over the benefits heading, such as Benefits',
  'benefits.heading': 'the benefits heading',
  'benefits.lead': 'two or three sentences under it',
  'benefits.items[].title': 'exactly four benefit titles, what the customer gets',
  'benefits.items[].body': 'exactly four benefit bodies',
  'features.eyebrow': 'a small word over the features heading, such as What we do',
  'features.heading': 'the heading of the section about what they do',
  'features.lead': 'one or two sentences under it',
  'features.items[].title': 'three to six feature titles',
  'features.items[].body': 'three to six feature bodies, one or two sentences each',
  'services.eyebrow': 'a small word over the services heading, such as Services',
  'services.heading': 'the services heading',
  'services.lead': 'one or two sentences under it',
  'services.items[].title': 'two to four service titles, different from the features',
  'services.items[].body': 'two to four service bodies, one sentence each',
  'community.heading.text': 'the large centred heading asking them to get in touch',
  'community.heading.emphasis':
    'the last word or two copied exactly from that heading; empty for none',
  'community.body': 'one or two sentences under it',
  'community.action.label': 'the button under it, the same as ctaLabel',
  'contact.eyebrow': 'a small word over the contact heading, such as Contact',
  'contact.heading': 'the contact heading',
  'contact.lead': 'one or two sentences under it',
  'contact.rows[].title': 'exactly three short step titles, in order, what happens after contact',
  'contact.rows[].lines[]': 'one line under each step title',
  'contact.form.subjects[]':
    'two to five subjects a customer could choose when writing, a few words each',
  'contact.form.button': 'the form button, such as Send message',
  'faq.eyebrow': 'a small word over the FAQ heading, such as FAQ',
  'faq.heading': 'the FAQ heading, such as Common questions',
  'faq.items[].question': 'three to five questions a customer would ask, from the brief',
  'faq.items[].answer': 'the answers, in their words, claiming nothing the owner did not say',
  'footer.groups[].heading': 'two to four footer column headings',
  'footer.groups[].links[].label':
    'two or three link labels per column; each link has a target of benefits, features, services, community, contact, faq or top',
}

const MERIDIAN_GUIDE = Object.entries(MERIDIAN_SLOTS)
  .filter(([slot]) => slot in PURPOSE)
  .map(
    ([slot, { min, max }]) =>
      `- ${slot}: ${String(min)} to ${String(max)} characters, ${PURPOSE[slot as ModelSlot]}`,
  )
  .join('\n')

// Validation needs only words, so the copy is assembled around a wordmark and no pictures.
const NO_ASSETS: TemplateAssets = { logo: { kind: 'wordmark' }, images: {}, email: null }

// The schema has already checked the lengths; these narrow the types for the content object.
function three<T>(items: readonly T[]): Three<T> {
  const [a, b, c] = items
  if (a === undefined || b === undefined || c === undefined || items.length !== 3) {
    throw new Error(`Expected three items, got ${String(items.length)}`)
  }
  return [a, b, c]
}

function four<T>(items: readonly T[]): Four<T> {
  const [a, b, c, d] = items
  if (a === undefined || b === undefined || c === undefined || d === undefined) {
    throw new Error(`Expected four items, got ${String(items.length)}`)
  }
  if (items.length !== 4) throw new Error(`Expected four items, got ${String(items.length)}`)
  return [a, b, c, d]
}

export function assembleMeridian(copy: MeridianCopy, assets: TemplateAssets): MeridianContent {
  const { hero, community, contact } = copy
  const heroImage = assets.images.hero ?? null
  return {
    brand: { ...copy.brand, logo: assets.logo },
    nav: {
      links: copy.nav.links.map((label, index) => ({
        label,
        href: NAV_HREFS[index] ?? HREF.top,
      })),
      cta: { label: copy.nav.cta, href: HREF.community },
      menu: { label: copy.nav.menu.label, items: three(copy.nav.menu.items), image: heroImage },
    },
    hero: {
      badge: hero.badge,
      headline: hero.headline,
      subhead: hero.subhead,
      primary: { label: hero.primary, href: HREF.community },
      secondary: { label: hero.secondary, href: HREF.features },
      image: heroImage,
    },
    sponsors: copy.sponsors,
    benefits: { ...copy.benefits, items: four(copy.benefits.items) },
    features: copy.features,
    services: {
      ...copy.services,
      items: copy.services.items.map((item) => ({ ...item, pro: false })),
    },
    testimonials: null,
    team: null,
    community: {
      heading: community.heading,
      body: community.body,
      action: { label: community.action, href: HREF.contact },
    },
    pricing: null,
    contact: {
      eyebrow: contact.eyebrow,
      heading: contact.heading,
      lead: contact.lead,
      rows: contact.rows,
      form: { subjects: contact.form.subjects, button: contact.form.button, email: assets.email },
    },
    faq: copy.faq,
    footer: {
      groups: copy.footer.groups.map((group) => ({
        heading: group.heading,
        links: group.links.map((link) => ({ label: link.label, href: HREF[link.target] })),
      })),
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
  return fitToSlot(text, MERIDIAN_SLOTS[slot], FILLERS)
}

// A label is used as given when it fits, else replaced by a plain one that does.
function label(slot: Slot, text: string, plain: string): string {
  return fits(text.trim(), MERIDIAN_SLOTS[slot]) ? text.trim() : plain
}

function fits(text: string, slot: CopySlot): boolean {
  return text.length >= slot.min && text.length <= slot.max
}

const PLAIN_TITLES = ['What we do', 'Who it is for', 'How to start', 'What happens next'] as const
const PLAIN_STEPS = ['Tell us what you need', 'We agree the details', 'We get to work'] as const

// Copy from the brief alone, with no model involved: the visitor's own sentences in the prose
// slots and plain labels everywhere else. Always passes meridianViolations, which the test
// proves over a corpus of briefs.
export function meridianFallbackCopy(brief: BrandBrief): MeridianCopy {
  const name = brief.company
  const positioning = brief.positioning
  const statement = brief.statement === '' ? positioning : brief.statement
  const cta = label('community.action.label', brief.ctaLabel, 'Get in touch')
  const props = brief.valueProps
  const steps = brief.steps
  const titles = PLAIN_TITLES.slice(0, 3).map((plain, index) =>
    label('nav.menu.items[].title', props[index]?.title ?? plain, plain),
  )
  const stepTitles = PLAIN_STEPS.map((plain, index) =>
    label('features.items[].title', steps[index]?.title ?? plain, plain),
  )
  return {
    brand: {
      name: fitToSlot(name, MERIDIAN_SLOTS['brand.name'], ['Ltd']),
      legalName: fitToSlot(name, MERIDIAN_SLOTS['brand.legalName'], ['Ltd']),
    },
    nav: {
      links: ['Why us', 'Services', 'Contact'],
      cta,
      menu: {
        label: 'What we do',
        items: titles.map((title, index) => ({
          title,
          body: prose('nav.menu.items[].body', props[index]?.body ?? positioning),
        })),
      },
    },
    hero: {
      badge: { label: 'Hello', text: prose('hero.badge.text', positioning) },
      headline: {
        text: prose('hero.headline.text', brief.headlines[0] ?? positioning),
        emphasis: '',
      },
      subhead: prose('hero.subhead', statement),
      primary: cta,
      secondary: 'See what we do',
    },
    sponsors: {
      heading: 'What we cover',
      items: titles.map((title, index) =>
        label('sponsors.items[]', title, PLAIN_TITLES[index] ?? 'What we do'),
      ),
    },
    benefits: {
      eyebrow: 'Why us',
      heading: 'What you get from working with us',
      lead: prose('benefits.lead', `${positioning} ${statement}`),
      items: PLAIN_TITLES.map((plain, index) => ({
        title: label('benefits.items[].title', props[index]?.title ?? plain, plain),
        body: prose('benefits.items[].body', props[index]?.body ?? steps[1]?.body ?? positioning),
      })),
    },
    features: {
      eyebrow: 'What we do',
      heading: 'How it works, step by step',
      lead: 'Three steps from first contact to getting started, so you always know what happens next.',
      items: stepTitles.map((title, index) => ({
        title,
        body: prose('features.items[].body', steps[index]?.body ?? ''),
      })),
    },
    services: {
      eyebrow: 'Services',
      heading: 'In their own words',
      lead: prose('services.lead', positioning),
      items: [
        { title: 'What we do', body: prose('services.items[].body', positioning) },
        { title: 'Why we do it', body: prose('services.items[].body', statement) },
      ],
    },
    community: {
      heading: {
        text: prose('community.heading.text', `Start a conversation with ${name}.`),
        emphasis: '',
      },
      body: prose('community.body', positioning),
      action: cta,
    },
    contact: {
      eyebrow: 'Contact',
      heading: 'What happens next',
      lead: prose('contact.lead', positioning),
      rows: PLAIN_STEPS.map((plain, index) => ({
        title: label('contact.rows[].title', steps[index]?.title ?? plain, plain),
        lines: [prose('contact.rows[].lines[]', steps[index]?.body ?? '')],
      })),
      form: {
        subjects: ['A general question', 'A quote', 'Something else'],
        button: 'Send message',
      },
    },
    faq: {
      eyebrow: 'FAQ',
      heading: 'Common questions',
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
    footer: {
      groups: [
        {
          heading: 'Explore',
          links: [
            { label: 'Why us', target: 'benefits' },
            { label: 'What we do', target: 'features' },
            { label: 'Common questions', target: 'faq' },
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
    },
  }
}

export const meridianContract = defineContract<MeridianCopy>({
  meta,
  contrastPairs: MERIDIAN_CONTRAST_PAIRS,
  imageSlots: ['hero'],
  copySchema: meridianCopySchema,
  guide: MERIDIAN_GUIDE,
  fallbackCopy: meridianFallbackCopy,
  copyViolations: meridianCopyViolations,
  headlineOf: (copy) => copy.hero.headline.text,
})
