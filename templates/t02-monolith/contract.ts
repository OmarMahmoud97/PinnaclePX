import * as z from 'zod'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import { defineContract } from '@/lib/copy-slots/contract'
import { fitToSlot } from '@/lib/copy-slots/fit'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import {
  type Four,
  MONOLITH_CONTRAST_PAIRS,
  MONOLITH_SLOTS,
  type MonolithContent,
  monolithViolations,
  type Three,
} from './copy-slots'
import { meta } from './meta'

// Monolith's side of the pipeline contract: the copy the copy stage writes, the fallback when
// it cannot, and how copy and assets become the content object. Links are never written: the
// nav follows the page's sections in order, and every other link points at one of the page's
// own anchors. The optional sections (testimonials, team, pricing, newsletter) and the plan's
// price are not in the copy: the brief holds no such facts, so they stay null.

const TARGETS = ['features', 'about', 'how-it-works', 'services', 'cta', 'faq', 'top'] as const
const HREF: Readonly<Record<(typeof TARGETS)[number], string>> = {
  features: '#features',
  about: '#about',
  'how-it-works': '#how-it-works',
  services: '#services',
  cta: '#cta',
  faq: '#faq',
  top: '#top',
}
const NAV_HREFS = ['#features', '#about', '#how-it-works', '#faq'] as const

const emphasised = z.object({ text: z.string(), emphasis: z.string() })
const titled = z.object({ title: z.string(), body: z.string() })

export const monolithCopySchema = z.object({
  brand: z.object({ name: z.string(), legalName: z.string() }),
  nav: z.object({ links: z.array(z.string()), cta: z.string() }),
  hero: z.object({
    headline: z.object({ text: z.string(), first: z.string(), second: z.string() }),
    subhead: z.string(),
    primary: z.string(),
    secondary: z.string(),
    cards: z.object({
      quote: z.object({ text: z.string(), role: z.string() }),
      profile: z.object({ role: z.string(), body: z.string() }),
      plan: z.object({
        title: z.string(),
        badge: z.string(),
        body: z.string(),
        action: z.string(),
        points: z.array(z.string()),
      }),
      service: titled,
    }),
  }),
  sponsors: z.object({ heading: z.string(), items: z.array(z.string()) }),
  about: z.object({
    heading: emphasised,
    body: z.string(),
    highlights: z.array(z.object({ value: z.string(), label: z.string() })),
  }),
  steps: z.object({ heading: emphasised, lead: z.string(), items: z.array(titled) }),
  features: z.object({ heading: emphasised, tags: z.array(z.string()), items: z.array(titled) }),
  services: z.object({ heading: emphasised, lead: z.string(), items: z.array(titled) }),
  cta: z.object({
    heading: emphasised,
    body: z.string(),
    primary: z.string(),
    secondary: z.string(),
  }),
  faq: z.object({
    heading: emphasised,
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
    prompt: z.string(),
    link: z.string(),
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

export type MonolithCopy = z.infer<typeof monolithCopySchema>

// The lists of a fixed length, and their paths in a violation.
const FIXED: readonly [
  path: string,
  size: number,
  pick: (copy: MonolithCopy) => readonly unknown[],
][] = [
  ['hero.cards.plan.points', 3, (copy) => copy.hero.cards.plan.points],
  ['about.highlights', 4, (copy) => copy.about.highlights],
  ['steps.items', 4, (copy) => copy.steps.items],
  ['features.items', 3, (copy) => copy.features.items],
  ['services.items', 3, (copy) => copy.services.items],
]

// Every count and slot outside its limits. Fixed counts first: a list of the wrong length
// cannot be assembled, so its violations are reported alone and the rest waits for the next
// attempt.
function monolithCopyViolations(copy: MonolithCopy): readonly SlotViolation[] {
  const counts = FIXED.flatMap(([path, size, pick]) => {
    const length = pick(copy).length
    return length === size ? [] : [{ slot: path, length, min: size, max: size }]
  })
  if (counts.length > 0) return counts
  return monolithViolations(assembleMonolith(copy, NO_ASSETS))
}

type Slot = keyof typeof MONOLITH_SLOTS

// The slots the copy stage writes: every slot but those of the optional sections and the price.
type ModelSlot = Exclude<
  Slot,
  | `testimonials.${string}`
  | `team.${string}`
  | `pricing.${string}`
  | `newsletter.${string}`
  | `hero.cards.plan.price.${string}`
>

// What each slot is for, beside its range, for the copy prompt.
const PURPOSE: Readonly<Record<ModelSlot, string>> = {
  'brand.name': 'the company name as given',
  'brand.legalName': 'the legal name for the footer, the company name if unknown',
  'nav.links[].label':
    'two to four menu labels, in order: what they do, about, how it works, questions',
  'nav.cta.label': 'the header button',
  'hero.headline.text': 'the headline, a plain promise in their words',
  'hero.headline.first':
    'one or two words copied exactly from the headline, set in the first accent colour; empty for none',
  'hero.headline.second':
    'one or two later words copied exactly from the headline, set in the second accent colour; empty for none',
  'hero.subhead': 'one or two sentences under the headline saying what they do and for whom',
  'hero.primary.label': 'the main button, the same as ctaLabel',
  'hero.secondary.label': 'a quieter button that leads to how it works',
  'hero.cards.quote.text': "a short card quoting the owner's statement, first person plural",
  'hero.cards.quote.role':
    'a short line under the company name on that card, such as Why we started',
  'hero.cards.profile.role':
    'a short line under the company name on the profile card, who they serve',
  'hero.cards.profile.body':
    'one sentence on the profile card that lowers the risk of getting in touch',
  'hero.cards.plan.title': 'the title of the card listing what is included, such as What you get',
  'hero.cards.plan.badge': 'a short badge on that card, such as Included',
  'hero.cards.plan.body': 'one sentence under that title',
  'hero.cards.plan.action.label': 'the button on that card, the same as ctaLabel',
  'hero.cards.plan.points[]': 'exactly three short things included, each a few words',
  'hero.cards.service.title': 'the title of the service card, their first value proposition',
  'hero.cards.service.body': 'one sentence under it',
  'sponsors.heading': 'a short heading over a row of labels, such as What we cover',
  'sponsors.items[]': 'three to six short labels for the areas or kinds of work they cover',
  'about.heading.text': 'the About heading, such as About the company name',
  'about.heading.emphasis': 'one word copied exactly from that heading; empty for none',
  'about.body': 'two to four sentences about the company in their words',
  'about.highlights[].value':
    'exactly four short phrases set large, a few words each with no numbers, such as Same week',
  'about.highlights[].label': 'exactly four labels under those phrases, such as appointments',
  'steps.heading.text': 'the heading of the how it works section',
  'steps.heading.emphasis': 'one or two words copied exactly from that heading; empty for none',
  'steps.lead': 'one or two sentences under that heading',
  'steps.items[].title': 'exactly four step titles, in order',
  'steps.items[].body': 'exactly four step bodies',
  'features.heading.text': 'the heading of the section about what they do',
  'features.heading.emphasis': 'one or two words copied exactly from that heading; empty for none',
  'features.tags[]': 'four to nine short badges naming things they offer, a few words each',
  'features.items[].title': 'exactly three feature titles',
  'features.items[].body': 'exactly three feature bodies',
  'services.heading.text': 'the heading of the services section',
  'services.heading.emphasis': 'one or two words copied exactly from that heading; empty for none',
  'services.lead': 'one or two sentences under that heading',
  'services.items[].title': 'exactly three service titles, different from the features',
  'services.items[].body': 'exactly three service bodies',
  'cta.heading.text': 'the closing heading asking them to get in touch',
  'cta.heading.emphasis': 'one or two words copied exactly from that heading; empty for none',
  'cta.body': 'one or two sentences under it',
  'cta.primary.label': 'the closing button, the same as ctaLabel',
  'cta.secondary.label': 'a quieter button that leads back to what they do',
  'faq.heading.text': 'the FAQ heading, such as Frequently asked questions',
  'faq.heading.emphasis': 'one word copied exactly from that heading; empty for none',
  'faq.items[].question': 'three to five questions a customer would ask, from the brief',
  'faq.items[].answer': 'the answers, in their words, claiming nothing the owner did not say',
  'faq.prompt': 'a line under the questions, such as Still have questions?',
  'faq.link.label': 'the link after that line, such as Contact us',
  'footer.groups[].heading': 'two to four footer column headings',
  'footer.groups[].links[].label':
    'two or three link labels per column; each link has a target of features, about, how-it-works, services, cta, faq or top',
}

const MONOLITH_GUIDE = Object.entries(MONOLITH_SLOTS)
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

export function assembleMonolith(copy: MonolithCopy, assets: TemplateAssets): MonolithContent {
  const { hero, about, features, services, cta, faq } = copy
  const image = (slot: string) => assets.images[slot] ?? null
  const [f1, f2, f3] = three(features.items)
  return {
    brand: { ...copy.brand, logo: assets.logo },
    nav: {
      links: copy.nav.links.map((label, index) => ({
        label,
        href: NAV_HREFS[index] ?? HREF.top,
      })),
      cta: { label: copy.nav.cta, href: HREF.cta },
    },
    hero: {
      headline: hero.headline,
      subhead: hero.subhead,
      primary: { label: hero.primary, href: HREF.cta },
      secondary: { label: hero.secondary, href: HREF['how-it-works'] },
      cards: {
        quote: { ...hero.cards.quote, image: image('quote') },
        profile: { ...hero.cards.profile, image: image('profile') },
        plan: {
          title: hero.cards.plan.title,
          badge: hero.cards.plan.badge,
          price: null,
          body: hero.cards.plan.body,
          action: { label: hero.cards.plan.action, href: HREF.cta },
          points: three(hero.cards.plan.points),
        },
        service: hero.cards.service,
      },
    },
    sponsors: copy.sponsors,
    about: {
      heading: about.heading,
      body: about.body,
      highlights: four(about.highlights),
      image: image('about'),
    },
    steps: { ...copy.steps, items: four(copy.steps.items) },
    features: {
      heading: features.heading,
      tags: features.tags,
      items: [
        { ...f1, image: image('feature-1') },
        { ...f2, image: image('feature-2') },
        { ...f3, image: image('feature-3') },
      ],
    },
    services: {
      heading: services.heading,
      lead: services.lead,
      items: three(services.items),
      image: image('services'),
    },
    cta: {
      heading: cta.heading,
      body: cta.body,
      primary: { label: cta.primary, href: HREF.cta },
      secondary: { label: cta.secondary, href: HREF.features },
    },
    testimonials: null,
    team: null,
    pricing: null,
    newsletter: null,
    faq: {
      heading: faq.heading,
      items: faq.items,
      prompt: faq.prompt,
      link: { label: faq.link, href: HREF.cta },
    },
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
  return fitToSlot(text, MONOLITH_SLOTS[slot], FILLERS)
}

// A label is used as given when it fits, else replaced by a plain one that does.
function label(slot: Slot, text: string, plain: string): string {
  return fits(text.trim(), MONOLITH_SLOTS[slot]) ? text.trim() : plain
}

function fits(text: string, slot: CopySlot): boolean {
  return text.length >= slot.min && text.length <= slot.max
}

// A heading with no emphasis: the fallback never guesses which word to colour.
function plain(slot: Slot, text: string): MonolithCopy['about']['heading'] {
  return { text: prose(slot, text), emphasis: '' }
}

const PLAIN_TITLES = ['What we do', 'Who it is for', 'How to start', 'What happens next'] as const
const PLAIN_STEPS = [
  'Tell us what you need',
  'We agree the details',
  'We get to work',
  'You hear from us',
] as const

// Copy from the brief alone, with no model involved: the visitor's own sentences in the prose
// slots and plain labels everywhere else. Always passes monolithViolations, which the test
// proves over a corpus of briefs.
export function monolithFallbackCopy(brief: BrandBrief): MonolithCopy {
  const name = brief.company
  const positioning = brief.positioning
  const statement = brief.statement === '' ? positioning : brief.statement
  const cta = label('cta.primary.label', brief.ctaLabel, 'Get in touch')
  const props = brief.valueProps
  const steps = brief.steps
  const titles = PLAIN_TITLES.slice(0, 3).map((fallback, index) =>
    label('features.items[].title', props[index]?.title ?? fallback, fallback),
  )
  const stepTitles = PLAIN_STEPS.map((fallback, index) =>
    label('steps.items[].title', steps[index]?.title ?? fallback, fallback),
  )
  const tags = [...titles, ...stepTitles].map((tag, index) =>
    label('features.tags[]', tag, PLAIN_TITLES[index % PLAIN_TITLES.length] ?? 'What we do'),
  )
  return {
    brand: {
      name: fitToSlot(name, MONOLITH_SLOTS['brand.name'], ['Ltd']),
      legalName: fitToSlot(name, MONOLITH_SLOTS['brand.legalName'], ['Ltd']),
    },
    nav: { links: ['What we do', 'About', 'How it works'], cta },
    hero: {
      headline: {
        text: prose('hero.headline.text', brief.headlines[0] ?? positioning),
        first: '',
        second: '',
      },
      subhead: prose('hero.subhead', statement),
      primary: cta,
      secondary: 'See how it works',
      cards: {
        quote: { text: prose('hero.cards.quote.text', statement), role: 'Why we do this' },
        profile: {
          role: label('hero.cards.profile.role', brief.audience, 'In our own words'),
          body: 'Ask us anything. There is no obligation.',
        },
        plan: {
          title: 'What you get',
          badge: 'Included',
          body: prose('hero.cards.plan.body', positioning),
          action: cta,
          points: PLAIN_TITLES.slice(0, 3).map((fallback, index) =>
            label('hero.cards.plan.points[]', titles[index] ?? fallback, fallback),
          ),
        },
        service: {
          title: titles[0] ?? PLAIN_TITLES[0],
          body: prose('hero.cards.service.body', props[0]?.body ?? positioning),
        },
      },
    },
    sponsors: {
      heading: 'What we cover',
      items: titles.map((title, index) =>
        label('sponsors.items[]', title, PLAIN_TITLES[index] ?? 'What we do'),
      ),
    },
    about: {
      heading: plain('about.heading.text', `About ${name}`),
      body: prose('about.body', `${positioning} ${statement}`),
      highlights: [
        { value: 'Listen', label: 'first, always' },
        { value: 'Agree', label: 'the plan with you' },
        { value: 'Deliver', label: 'what was agreed' },
        { value: 'Stay', label: 'in touch after' },
      ],
    },
    steps: {
      heading: plain('steps.heading.text', 'How it works, step by step.'),
      lead: 'Four steps from first contact to getting started, so you always know what happens next.',
      items: stepTitles.map((title, index) => ({
        title,
        body: prose('steps.items[].body', steps[index]?.body ?? ''),
      })),
    },
    features: {
      heading: plain('features.heading.text', 'What we do, in three parts.'),
      tags: [...new Set(tags)],
      items: titles.map((title, index) => ({
        title,
        body: prose('features.items[].body', props[index]?.body ?? positioning),
      })),
    },
    services: {
      heading: plain('services.heading.text', 'How we work with you.'),
      lead: prose('services.lead', positioning),
      items: stepTitles.slice(0, 3).map((title, index) => ({
        title,
        body: prose('services.items[].body', steps[index]?.body ?? ''),
      })),
    },
    cta: {
      heading: plain('cta.heading.text', `Start a conversation with ${name}.`),
      body: prose('cta.body', positioning),
      primary: cta,
      secondary: 'See what we do',
    },
    faq: {
      heading: plain('faq.heading.text', 'Frequently asked questions'),
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
      prompt: 'Still have questions?',
      link: cta,
    },
    footer: {
      groups: [
        {
          heading: 'Explore',
          links: [
            { label: 'What we do', target: 'features' },
            { label: 'About', target: 'about' },
            { label: 'How it works', target: 'how-it-works' },
          ],
        },
        {
          heading: 'Company',
          links: [
            { label: cta, target: 'cta' },
            { label: 'Back to top', target: 'top' },
          ],
        },
      ],
    },
  }
}

export const monolithContract = defineContract<MonolithCopy>({
  meta,
  contrastPairs: MONOLITH_CONTRAST_PAIRS,
  imageSlots: ['about', 'services', 'feature-1', 'feature-2', 'feature-3', 'quote', 'profile'],
  copySchema: monolithCopySchema,
  guide: MONOLITH_GUIDE,
  fallbackCopy: monolithFallbackCopy,
  copyViolations: monolithCopyViolations,
  headlineOf: (copy) => copy.hero.headline.text,
})
