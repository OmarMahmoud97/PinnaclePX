import { z } from 'zod/v4'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import { defineContract } from '@/lib/copy-slots/contract'
import { fitToSlot } from '@/lib/copy-slots/fit'
import { type CopySlot, type SlotViolation } from '@/lib/copy-slots/validate'
import {
  AURORA_CONTRAST_PAIRS,
  AURORA_SLOTS,
  type AuroraContent,
  auroraViolations,
  type Three,
} from './copy-slots'
import { meta } from './meta'

// Aurora's side of the pipeline contract: the copy the copy stage writes, the fallback when it
// cannot, and how copy and assets become the content object the component renders. Links are
// never written: the nav follows the page's sections in order, and every other link points at
// one of the page's own anchors.

// Where a link may point. The model chooses one of these names for a footer link; code owns
// the anchor, so a template link never leaves the page.
const TARGETS = ['features', 'how-it-works', 'why', 'start', 'top'] as const
const HREF: Readonly<Record<(typeof TARGETS)[number], string>> = {
  features: '#features',
  'how-it-works': '#how-it-works',
  why: '#why',
  start: '#start',
  top: '#top',
}
// The nav's links, in order, are the page's sections.
const NAV_HREFS = ['#features', '#how-it-works', '#why', '#start'] as const

// The shape only: the structured output API takes no length or count limits, so every one of
// them is checked by auroraCopyViolations after the model has answered.
const titled = z.object({ title: z.string(), body: z.string() })

export const auroraCopySchema = z.object({
  brand: z.object({ name: z.string(), legalName: z.string(), tagline: z.string() }),
  nav: z.object({ links: z.array(z.string()), cta: z.string() }),
  hero: z.object({
    headline: z.string(),
    subhead: z.string(),
    primary: z.string(),
    secondary: z.string(),
    reassurance: z.string(),
    frame: z.object({ title: z.string(), rows: z.array(z.string()) }),
  }),
  features: z.object({ title: z.string(), lead: z.string(), items: z.array(titled) }),
  steps: z.object({ title: z.string(), lead: z.string(), items: z.array(titled) }),
  statement: z.string(),
  cta: z.object({
    headline: z.string(),
    body: z.string(),
    action: z.string(),
    reassurance: z.string(),
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

// The lists that must be exactly three, and their paths in a violation.
const TRIPLES: readonly [path: string, pick: (copy: AuroraCopy) => readonly unknown[]][] = [
  ['hero.frame.rows', (copy) => copy.hero.frame.rows],
  ['features.items', (copy) => copy.features.items],
  ['steps.items', (copy) => copy.steps.items],
]

// Every count and slot outside its limits. Counts first: a list of the wrong length cannot be
// assembled, so its violations are reported alone and the rest waits for the next attempt.
function auroraCopyViolations(copy: AuroraCopy): readonly SlotViolation[] {
  const counts = TRIPLES.flatMap(([path, pick]) => {
    const length = pick(copy).length
    return length === 3 ? [] : [{ slot: path, length, min: 3, max: 3 }]
  })
  if (counts.length > 0) return counts
  return auroraViolations(assembleAurora(copy, NO_ASSETS))
}

// What each slot is for, beside its range, for the copy prompt.
const PURPOSE: Readonly<Record<keyof typeof AURORA_SLOTS, string>> = {
  'brand.name': 'the company name as given',
  'brand.legalName': 'the legal name for the footer, the company name if unknown',
  'brand.tagline': 'one line under the logo in the footer saying what they do',
  'nav.links[].label': 'two to four menu labels, in order: what they do, how it works, why them',
  'nav.cta.label': 'the header button',
  'hero.headline': 'the headline, a plain promise in their words',
  'hero.subhead': 'one or two sentences under the headline saying what they do and for whom',
  'hero.primary.label': 'the main button, the same as ctaLabel',
  'hero.secondary.label': 'a quieter button that leads to how it works',
  'hero.reassurance': 'a line under the buttons that lowers the risk of getting in touch',
  'hero.frame.title': 'a short screen title inside an illustration of their work',
  'hero.frame.rows[]': 'exactly three short rows inside that illustration, things they do',
  'features.title': 'the heading of the section about what they do',
  'features.lead': 'one or two sentences under that heading',
  'features.items[].title': 'exactly three feature titles',
  'features.items[].body': 'exactly three feature bodies',
  'steps.title': 'the heading of the how it works section',
  'steps.lead': 'one or two sentences under that heading',
  'steps.items[].title': 'exactly three step titles, in order',
  'steps.items[].body': 'exactly three step bodies',
  'statement.text': "one sentence in the owner's voice about why they do this, set large",
  'cta.headline': 'the closing heading asking them to get in touch',
  'cta.body': 'one or two sentences under it',
  'cta.action.label': 'the closing button, the same as ctaLabel',
  'cta.reassurance': 'a line under the closing button',
  'footer.groups[].heading': 'one or two footer column headings',
  'footer.groups[].links[].label':
    'two to five link labels per column; each link has a target of features, how-it-works, why, start or top',
}

const AURORA_GUIDE = Object.entries(AURORA_SLOTS)
  .map(
    ([slot, { min, max }]) =>
      `- ${slot}: ${String(min)} to ${String(max)} characters, ${PURPOSE[slot as keyof typeof AURORA_SLOTS]}`,
  )
  .join('\n')

export type AuroraCopy = z.infer<typeof auroraCopySchema>

// Validation needs only words, so the copy is assembled around a wordmark and no pictures.
const NO_ASSETS: TemplateAssets = { logo: { kind: 'wordmark' }, images: {} }

// The schema has already checked the length; this narrows the type for the content object.
function triple<T>(items: readonly T[]): Three<T> {
  const [a, b, c] = items
  if (a === undefined || b === undefined || c === undefined || items.length !== 3) {
    throw new Error(`Expected three items, got ${String(items.length)}`)
  }
  return [a, b, c]
}

export function assembleAurora(copy: AuroraCopy, assets: TemplateAssets): AuroraContent {
  return {
    brand: { ...copy.brand, logo: assets.logo },
    nav: {
      links: copy.nav.links.map((label, index) => ({
        label,
        href: NAV_HREFS[index] ?? HREF.top,
      })),
      cta: { label: copy.nav.cta, href: HREF.start },
    },
    hero: {
      headline: copy.hero.headline,
      subhead: copy.hero.subhead,
      primary: { label: copy.hero.primary, href: HREF.start },
      secondary: { label: copy.hero.secondary, href: HREF['how-it-works'] },
      reassurance: copy.hero.reassurance,
      frame: { title: copy.hero.frame.title, rows: triple(copy.hero.frame.rows) },
      image: assets.images.hero ?? null,
    },
    features: { ...copy.features, items: triple(copy.features.items) },
    steps: { ...copy.steps, items: triple(copy.steps.items) },
    statement: { text: copy.statement, image: assets.images.statement ?? null },
    cta: {
      headline: copy.cta.headline,
      body: copy.cta.body,
      action: { label: copy.cta.action, href: HREF.start },
      reassurance: copy.cta.reassurance,
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
] as const

function prose(slot: keyof typeof AURORA_SLOTS, text: string): string {
  return fitToSlot(text, AURORA_SLOTS[slot], FILLERS)
}

// A label is used as given when it fits, else replaced by a plain one that does. Labels are too
// short to shorten or pad without reading oddly.
function label(slot: keyof typeof AURORA_SLOTS, text: string, plain: string): string {
  return fits(text.trim(), AURORA_SLOTS[slot]) ? text.trim() : plain
}

function fits(text: string, slot: CopySlot): boolean {
  return text.length >= slot.min && text.length <= slot.max
}

// Copy from the brief alone, with no model involved: the visitor's own sentences in the prose
// slots and plain labels everywhere else. Always passes auroraViolations, which the test proves
// over a corpus of briefs.
export function auroraFallbackCopy(brief: BrandBrief): AuroraCopy {
  const name = brief.company
  const positioning = brief.positioning
  const statement = brief.statement === '' ? positioning : brief.statement
  const cta = label('cta.action.label', brief.ctaLabel, 'Get in touch')
  const props = brief.valueProps
  const steps = brief.steps
  const plainTitles = ['What we do', 'Who it is for', 'How to start']
  const plainSteps = ['Tell us what you need', 'We agree the details', 'We get to work']
  return {
    brand: {
      name: fitToSlot(name, AURORA_SLOTS['brand.name'], ['Ltd']),
      legalName: fitToSlot(name, AURORA_SLOTS['brand.legalName'], ['Ltd']),
      tagline: prose('brand.tagline', positioning),
    },
    nav: { links: ['What we do', 'How it works', 'Why us'], cta },
    hero: {
      headline: prose('hero.headline', brief.headlines[0] ?? positioning),
      subhead: prose('hero.subhead', statement),
      primary: cta,
      secondary: 'See how it works',
      reassurance: 'Ask us anything. There is no obligation.',
      frame: {
        title: 'Overview',
        rows: plainTitles.map((plain, index) =>
          fitToSlot(props[index]?.title ?? plain, AURORA_SLOTS['hero.frame.rows[]'], ['in detail']),
        ),
      },
    },
    features: {
      title: 'What we do, in three parts.',
      lead: prose('features.lead', positioning),
      items: plainTitles.map((plain, index) => ({
        title: label('features.items[].title', props[index]?.title ?? plain, plain),
        body: prose('features.items[].body', props[index]?.body ?? positioning),
      })),
    },
    steps: {
      title: 'How it works, step by step.',
      lead: 'Three steps from first contact to getting started, so you always know what happens next.',
      items: plainSteps.map((plain, index) => ({
        title: label('steps.items[].title', steps[index]?.title ?? plain, plain),
        body: prose('steps.items[].body', steps[index]?.body ?? ''),
      })),
    },
    statement: prose('statement.text', statement),
    cta: {
      headline: prose('cta.headline', `Start a conversation with ${name}.`),
      body: prose('cta.body', positioning),
      action: cta,
      reassurance: 'No obligation, and no hard sell.',
    },
    footer: {
      groups: [
        {
          heading: 'Explore',
          links: [
            { label: 'What we do', target: 'features' },
            { label: 'How it works', target: 'how-it-works' },
            { label: 'Why us', target: 'why' },
          ],
        },
        {
          heading: 'Company',
          links: [
            { label: cta, target: 'start' },
            { label: 'Back to top', target: 'top' },
          ],
        },
      ],
    },
  }
}

export const auroraContract = defineContract<AuroraCopy>({
  meta,
  contrastPairs: AURORA_CONTRAST_PAIRS,
  imageSlots: ['hero', 'statement'],
  copySchema: auroraCopySchema,
  guide: AURORA_GUIDE,
  fallbackCopy: auroraFallbackCopy,
  copyViolations: auroraCopyViolations,
})
