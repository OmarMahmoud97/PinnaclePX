import * as z from 'zod'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import { defineContract } from '@/lib/copy-slots/contract'
import { fitToSlot } from '@/lib/copy-slots/fit'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import {
  ATLAS_CONTRAST_PAIRS,
  ATLAS_SLOTS,
  type AtlasContent,
  atlasViolations,
  type Three,
} from './copy-slots'
import { meta } from './meta'

// Atlas's side of the pipeline contract: the copy the copy stage writes, the fallback when it
// cannot, and how copy and assets become the content object. Links are never written: the nav
// follows the page's sections in order, and every other link points at one of the page's own
// anchors. The optional parts (the market tables, the exchange rows, the partner logos, the
// newsletter and the steps' pictures) are not in the copy: the brief holds no such facts, so
// they stay null and the template draws their stand-ins.

const TARGETS = ['start', 'offer', 'tools', 'why', 'how-it-works', 'faq', 'top'] as const
const HREF: Readonly<Record<(typeof TARGETS)[number], string>> = {
  start: '#start',
  offer: '#offer',
  tools: '#tools',
  why: '#why',
  'how-it-works': '#how-it-works',
  faq: '#faq',
  top: '#top',
}
const NAV_HREFS = ['#start', '#offer', '#tools', '#why', '#faq'] as const

const emphasised = z.object({ text: z.string(), emphasis: z.string() })
const titled = z.object({ title: z.string(), body: z.string() })
const link = z.object({ label: z.string(), target: z.enum(TARGETS) })

export const atlasCopySchema = z.object({
  brand: z.object({ name: z.string(), legalName: z.string() }),
  nav: z.object({
    links: z.array(z.string()),
    menu: z.object({ label: z.string(), items: z.array(link) }),
    secondary: z.string(),
    cta: z.string(),
  }),
  hero: z.object({
    eyebrow: z.string(),
    headline: emphasised,
    subhead: z.string(),
    primary: z.string(),
    secondary: z.string(),
  }),
  glance: z.object({ columns: z.array(titled), more: z.string() }),
  pitch: z.object({
    heading: emphasised,
    lead: z.string(),
    label: z.string(),
    statement: z.string(),
    action: z.string(),
  }),
  offer: z.object({
    heading: emphasised,
    body: z.string(),
    points: z.array(z.string()),
    action: z.string(),
  }),
  tools: z.object({
    heading: emphasised,
    items: z.array(titled),
    primary: z.string(),
    secondary: z.string(),
  }),
  why: z.object({ heading: z.string(), items: z.array(titled) }),
  steps: z.object({ heading: z.string(), items: z.array(titled) }),
  faq: z.object({
    eyebrow: z.string(),
    heading: z.string(),
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
  footer: z.object({
    columns: z.array(z.array(link)),
    note: z.object({ title: z.string(), body: z.string() }),
    action: z.string(),
  }),
})

export type AtlasCopy = z.infer<typeof atlasCopySchema>

// The lists that must be exactly three, and their paths in a violation.
const TRIPLES: readonly [path: string, pick: (copy: AtlasCopy) => readonly unknown[]][] = [
  ['glance.columns', (copy) => copy.glance.columns],
  ['offer.points', (copy) => copy.offer.points],
  ['tools.items', (copy) => copy.tools.items],
  ['why.items', (copy) => copy.why.items],
  ['steps.items', (copy) => copy.steps.items],
]

// Every count and slot outside its limits. Counts first: a list of the wrong length cannot be
// assembled, so its violations are reported alone and the rest waits for the next attempt.
function atlasCopyViolations(copy: AtlasCopy): readonly SlotViolation[] {
  const counts = TRIPLES.flatMap(([path, pick]) => {
    const length = pick(copy).length
    return length === 3 ? [] : [{ slot: path, length, min: 3, max: 3 }]
  })
  if (counts.length > 0) return counts
  return atlasViolations(assembleAtlas(copy, NO_ASSETS))
}

type Slot = keyof typeof ATLAS_SLOTS

// The slots the copy stage writes: every slot but those of the optional parts.
type ModelSlot = Exclude<
  Slot,
  | `market.${string}`
  | `pitch.exchange.${string}`
  | `partners.${string}`
  | `footer.newsletter.${string}`
>

// What each slot is for, beside its range, for the copy prompt.
const PURPOSE: Readonly<Record<ModelSlot, string>> = {
  'brand.name': 'the company name as given',
  'brand.legalName': 'the legal name for the footer, the company name if unknown',
  'nav.links[].label':
    'two to five menu labels, in order: get started, what is included, how they work, why them, questions',
  'nav.menu.label': 'the label of the menu that drops down, such as More',
  'nav.menu.items[].label':
    'two to four entries in that menu; each has a target of start, offer, tools, why, how-it-works, faq or top',
  'nav.secondary.label': 'the outline header button, which leads to how it works',
  'nav.cta.label': 'the filled header button, the same as ctaLabel if it fits',
  'hero.eyebrow': 'a few words over the headline, set in capitals, such as the company name',
  'hero.headline.text': 'the headline, a plain promise in their words',
  'hero.headline.emphasis':
    'two or three words copied exactly from the headline, set in the brand colours; empty for none',
  'hero.subhead': 'one or two sentences under the headline saying what they do and for whom',
  'hero.primary.label': 'the main button, the same as ctaLabel',
  'hero.secondary.label': 'a quieter button that leads to how it works',
  'glance.columns[].title': 'exactly three column titles on the card under the hero, what they do',
  'glance.columns[].body': 'exactly three column bodies, one or two sentences each',
  'glance.more.label': 'the small link beside each column title, such as More',
  'pitch.heading.text': 'the heading beside the first picture, why they do this',
  'pitch.heading.emphasis': 'one or two words copied exactly from that heading; empty for none',
  'pitch.lead': 'one or two sentences under it',
  'pitch.label': 'one short word in the box beside the statement, such as Why',
  'pitch.statement': "the owner's statement, first person plural, one sentence",
  'pitch.action.label': 'the wide button under the box, the same as ctaLabel',
  'offer.heading.text': 'the heading beside the second picture, what is included',
  'offer.heading.emphasis': 'one or two words copied exactly from that heading; empty for none',
  'offer.body': 'one or two sentences under it',
  'offer.points[]': 'exactly three ticked points, a few words each, what the customer gets',
  'offer.action.label': 'the outline button under the points, a quieter ask',
  'tools.heading.text': 'the heading of the tinted band, what they bring to the work',
  'tools.heading.emphasis': 'one or two words copied exactly from that heading; empty for none',
  'tools.items[].title': 'exactly three titled points in that band, different from the columns',
  'tools.items[].body': 'exactly three bodies under those titles, one or two sentences each',
  'tools.primary.label': 'the outline button under the points, the same as ctaLabel',
  'tools.secondary.label': 'the underlined word beside it, which leads to how it works',
  'why.heading': 'the heading beside the third picture, why choose them',
  'why.items[].title': 'exactly three ticked reasons, from what the owner said',
  'why.items[].body': 'exactly three lines under those reasons',
  'steps.heading': 'the heading of the how it works band',
  'steps.items[].title': 'exactly three short step titles, in order',
  'steps.items[].body': 'exactly three step bodies',
  'faq.eyebrow': 'a small word over the FAQ heading, such as Support',
  'faq.heading': 'the FAQ heading, such as Frequently asked questions',
  'faq.items[].question': 'three to five questions a customer would ask, from the brief',
  'faq.items[].answer': 'the answers, in their words, claiming nothing the owner did not say',
  'footer.columns[][].label':
    'two or three footer columns of two to five links; each link has a target of start, offer, tools, why, how-it-works, faq or top',
  'footer.note.title': 'the title of the last footer column, such as Get in touch',
  'footer.note.body': 'one line under it',
  'footer.action.label': 'the button under that line, the same as ctaLabel',
}

const ATLAS_GUIDE = Object.entries(ATLAS_SLOTS)
  .filter(([slot]) => slot in PURPOSE)
  .map(
    ([slot, { min, max }]) =>
      `- ${slot}: ${String(min)} to ${String(max)} characters, ${PURPOSE[slot as ModelSlot]}`,
  )
  .join('\n')

// Validation needs only words, so the copy is assembled around a wordmark and no pictures.
const NO_ASSETS: TemplateAssets = { logo: { kind: 'wordmark' }, images: {}, email: null }

// The schema has already checked the length; this narrows the type for the content object.
function triple<T>(items: readonly T[]): Three<T> {
  const [a, b, c] = items
  if (a === undefined || b === undefined || c === undefined || items.length !== 3) {
    throw new Error(`Expected three items, got ${String(items.length)}`)
  }
  return [a, b, c]
}

export function assembleAtlas(copy: AtlasCopy, assets: TemplateAssets): AtlasContent {
  const { hero, glance, pitch, offer, tools, footer } = copy
  const image = (slot: string) => assets.images[slot] ?? null
  const [s1, s2, s3] = triple(copy.steps.items)
  return {
    brand: { ...copy.brand, logo: assets.logo },
    nav: {
      links: copy.nav.links.map((label, index) => ({
        label,
        href: NAV_HREFS[index] ?? HREF.top,
      })),
      menu: {
        label: copy.nav.menu.label,
        items: copy.nav.menu.items.map((item) => ({ label: item.label, href: HREF[item.target] })),
      },
      secondary: { label: copy.nav.secondary, href: HREF['how-it-works'] },
      cta: { label: copy.nav.cta, href: HREF.start },
    },
    hero: {
      eyebrow: hero.eyebrow,
      headline: hero.headline,
      subhead: hero.subhead,
      primary: { label: hero.primary, href: HREF.start },
      secondary: { label: hero.secondary, href: HREF['how-it-works'] },
      image: image('hero'),
    },
    market: null,
    glance: { columns: triple(glance.columns), more: { label: glance.more, href: HREF.why } },
    pitch: {
      heading: pitch.heading,
      lead: pitch.lead,
      exchange: null,
      label: pitch.label,
      statement: pitch.statement,
      action: { label: pitch.action, href: HREF.start },
      image: image('pitch'),
    },
    partners: null,
    offer: {
      heading: offer.heading,
      body: offer.body,
      points: triple(offer.points),
      action: { label: offer.action, href: HREF.start },
      image: image('offer'),
    },
    tools: {
      heading: tools.heading,
      items: triple(tools.items),
      primary: { label: tools.primary, href: HREF.start },
      secondary: { label: tools.secondary, href: HREF['how-it-works'] },
      image: image('tools'),
    },
    why: { heading: copy.why.heading, items: triple(copy.why.items), image: image('why') },
    steps: {
      heading: copy.steps.heading,
      items: [
        { ...s1, image: null },
        { ...s2, image: null },
        { ...s3, image: null },
      ],
    },
    faq: { ...copy.faq, image: image('faq') },
    footer: {
      columns: footer.columns.map((column) =>
        column.map((item) => ({ label: item.label, href: HREF[item.target] })),
      ),
      newsletter: null,
      note: footer.note,
      action: { label: footer.action, href: HREF.start },
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
  return fitToSlot(text, ATLAS_SLOTS[slot], FILLERS)
}

// A label is used as given when it fits, else replaced by a plain one that does.
function label(slot: Slot, text: string, plain: string): string {
  return fits(text.trim(), ATLAS_SLOTS[slot]) ? text.trim() : plain
}

function fits(text: string, slot: CopySlot): boolean {
  return text.length >= slot.min && text.length <= slot.max
}

const PLAIN_TITLES = ['What we do', 'Who it is for', 'How to start'] as const
const PLAIN_STEPS = ['Tell us what you need', 'We agree the details', 'We get to work'] as const

// Copy from the brief alone, with no model involved: the visitor's own sentences in the prose
// slots and plain labels everywhere else. Always passes atlasViolations, which the test proves
// over a corpus of briefs.
export function atlasFallbackCopy(brief: BrandBrief): AtlasCopy {
  const name = brief.company
  const positioning = brief.positioning
  const statement = brief.statement === '' ? positioning : brief.statement
  const cta = label('hero.primary.label', brief.ctaLabel, 'Get in touch')
  const props = brief.valueProps
  const steps = brief.steps
  const titles = PLAIN_TITLES.map((plain, index) =>
    label('why.items[].title', props[index]?.title ?? plain, plain),
  )
  const stepTitles = PLAIN_STEPS.map((plain, index) =>
    label('steps.items[].title', steps[index]?.title ?? plain, plain),
  )
  return {
    brand: {
      name: fitToSlot(name, ATLAS_SLOTS['brand.name'], ['Ltd']),
      legalName: fitToSlot(name, ATLAS_SLOTS['brand.legalName'], ['Ltd']),
    },
    nav: {
      links: ['Get started', 'What you get', 'How we work', 'Why us', 'Questions'],
      menu: {
        label: 'More',
        items: [
          { label: 'How it works', target: 'how-it-works' },
          { label: 'Back to top', target: 'top' },
        ],
      },
      secondary: 'How it works',
      cta: label('nav.cta.label', cta, 'Get in touch'),
    },
    hero: {
      eyebrow: label('hero.eyebrow', name, 'Welcome'),
      headline: {
        text: prose('hero.headline.text', brief.headlines[0] ?? positioning),
        emphasis: '',
      },
      subhead: prose('hero.subhead', statement),
      primary: cta,
      secondary: 'See how it works',
    },
    glance: {
      columns: PLAIN_TITLES.map((plain, index) => ({
        title: label('glance.columns[].title', props[index]?.title ?? plain, plain),
        body: prose('glance.columns[].body', props[index]?.body ?? positioning),
      })),
      more: 'More',
    },
    pitch: {
      heading: { text: prose('pitch.heading.text', 'Why we do this'), emphasis: '' },
      lead: prose('pitch.lead', positioning),
      label: 'Why',
      statement: prose('pitch.statement', statement),
      action: cta,
    },
    offer: {
      heading: { text: prose('offer.heading.text', 'What you get'), emphasis: '' },
      body: prose('offer.body', positioning),
      points: PLAIN_TITLES.map((plain, index) =>
        label('offer.points[]', props[index]?.title ?? plain, plain),
      ),
      action: 'Ask a question',
    },
    tools: {
      heading: { text: prose('tools.heading.text', 'How we work with you'), emphasis: '' },
      items: stepTitles.map((title, index) => ({
        title,
        body: prose('tools.items[].body', steps[index]?.body ?? ''),
      })),
      primary: cta,
      secondary: 'Learn more',
    },
    why: {
      heading: prose('why.heading', `Why choose ${name}`),
      items: titles.map((title, index) => ({
        title,
        body: prose('why.items[].body', props[index]?.body ?? positioning),
      })),
    },
    steps: {
      heading: 'How it works, step by step.',
      items: stepTitles.map((title, index) => ({
        title,
        body: prose('steps.items[].body', steps[index]?.body ?? ''),
      })),
    },
    faq: {
      eyebrow: 'Support',
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
    footer: {
      columns: [
        [
          { label: 'Get started', target: 'start' },
          { label: 'What you get', target: 'offer' },
          { label: 'How we work', target: 'tools' },
        ],
        [
          { label: 'Why us', target: 'why' },
          { label: 'Questions', target: 'faq' },
          { label: 'Back to top', target: 'top' },
        ],
      ],
      note: { title: 'Get in touch', body: prose('footer.note.body', positioning) },
      action: cta,
    },
  }
}

export const atlasContract = defineContract<AtlasCopy>({
  meta,
  contrastPairs: ATLAS_CONTRAST_PAIRS,
  imageSlots: ['hero', 'pitch', 'offer', 'tools', 'why', 'faq'],
  copySchema: atlasCopySchema,
  guide: ATLAS_GUIDE,
  fallbackCopy: atlasFallbackCopy,
  copyViolations: atlasCopyViolations,
  headlineOf: (copy) => copy.hero.headline.text,
})
