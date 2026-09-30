import * as z from 'zod'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import { defineContract } from '@/lib/copy-slots/contract'
import { fitToSlot } from '@/lib/copy-slots/fit'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import {
  INEGRO_CONTRAST_PAIRS,
  INEGRO_SLOTS,
  type InegroContent,
  type InegroOffer,
  inegroViolations,
} from './copy-slots'
import { meta } from './meta'

// Inegro's side of the pipeline contract: the copy the copy stage writes, the fallback when it
// cannot, and how copy and assets become the content object. Links are never written: the bar
// follows the page's blocks by position (its first dropdown lists the services, its second the
// three glass cards), every block's button leads to a fixed anchor, the hero's pills and the
// footer's links each choose a target from a fixed list, and the band's big button mails the
// owner. The band's social links are not in the copy: the brief holds no such facts, so they
// stay null. The last card on the ribbons carries the company's own name.

const TARGETS = [
  'intro',
  'services',
  'process',
  'approach',
  'offers',
  'mission',
  'newsletter',
  'contact',
] as const
type Target = (typeof TARGETS)[number]
const HREF: Readonly<Record<Target, string>> = {
  intro: '#intro',
  services: '#services',
  process: '#process',
  approach: '#approach',
  offers: '#offers',
  mission: '#mission',
  newsletter: '#newsletter',
  contact: '#contact',
}

const link = z.object({ label: z.string(), target: z.enum(TARGETS) })
const card = z.object({ label: z.string(), text: z.string(), cta: z.string() })
const note = z.object({ text: z.string(), name: z.string(), role: z.string() })

export const inegroCopySchema = z.object({
  brand: z.object({ name: z.string(), legalName: z.string() }),
  nav: z.object({ items: z.array(z.string()), cta: z.string() }),
  hero: z.object({
    headline: z.object({ text: z.string(), emphasis: z.string() }),
    subhead: z.string(),
    linksLabel: z.string(),
    links: z.array(link),
  }),
  intro: card,
  services: z.object({
    label: z.string(),
    cta: z.string(),
    itemCta: z.string(),
    items: z.array(
      z.object({ name: z.string(), line: z.string(), title: z.string(), tagline: z.string() }),
    ),
  }),
  notes: z.object({
    items: z.array(note),
    statement: z.object({ text: z.string(), role: z.string() }),
  }),
  process: z.object({
    label: z.string(),
    body: z.string(),
    cta: z.string(),
    steps: z.array(z.string()),
  }),
  approach: card,
  offers: z.object({
    label: z.string(),
    lead: z.string(),
    cta: z.string(),
    itemCta: z.string(),
    items: z.array(z.object({ tag: z.string(), title: z.string(), body: z.string() })),
  }),
  mission: card,
  newsletter: z.object({ heading: z.string(), placeholder: z.string(), button: z.string() }),
  closing: z.object({ text: z.string(), secondary: z.string(), cta: z.string() }),
  footer: z.object({ links: z.array(link) }),
})

export type InegroCopy = z.infer<typeof inegroCopySchema>

// Lists the layout draws a fixed number of: checked first, because a list of the wrong length
// cannot be assembled, so its violations are reported alone and the rest waits for the next
// attempt.
const FIXED: readonly [
  path: string,
  size: number,
  pick: (copy: InegroCopy) => readonly unknown[],
][] = [['offers.items', 3, (copy) => copy.offers.items]]

function inegroCopyViolations(copy: InegroCopy): readonly SlotViolation[] {
  const counts = FIXED.flatMap(([path, size, pick]) => {
    const length = pick(copy).length
    return length === size ? [] : [{ slot: path, length, min: size, max: size }]
  })
  if (counts.length > 0) return counts
  return inegroViolations(assembleInegro(copy, NO_ASSETS))
}

type Slot = keyof typeof INEGRO_SLOTS

// The slots the copy stage writes: every slot but the last card's name, which is the company's.
type ModelSlot = Exclude<Slot, 'notes.statement.name'>

// What each slot is for, beside its range, for the copy prompt.
const PURPOSE: Readonly<Record<ModelSlot, string>> = {
  'brand.name': 'the company name as given, set as the wordmark in the bar',
  'brand.legalName': 'the legal name for the footer, the company name if unknown',
  'nav.items[].label':
    'exactly four short labels for the bar, in order: their services, about them, why choose them, how it works',
  'nav.cta.label': 'the outlined button at the right of the bar, the same as ctaLabel',
  'hero.headline.text': 'the headline, a short line of a few words set very large over two lines',
  'hero.headline.emphasis':
    'a word or two copied exactly from the headline, set in the brand colour, usually its first word; empty for none',
  'hero.subhead': 'one sentence under the headline saying what they do and for whom',
  'hero.linksLabel': 'a short line over the row of pill links, such as See how we can help',
  'hero.links[].label':
    'two to four short pill labels; each link has a target of intro, services, process, approach, offers, mission, newsletter or contact',
  'intro.label': 'the small label of the first glass card, such as Introduction',
  'intro.text':
    'a long paragraph in their voice about who they are and what they do, several sentences, in the words of the brief',
  'intro.cta.label': 'the button under it, which leads to their services',
  'services.label': 'the small label over the list of services, such as Services',
  'services.cta.label': 'the button at the top right of the list, which leads to the contact band',
  'services.itemCta.label': 'the pill on every service card, such as Enquire now',
  'services.items[].name':
    'three to six services, each a name of a few words set very large on one line',
  'services.items[].line': 'one line under each name, saying what it is',
  'services.items[].title': 'a short title for each service card, set large over the picture',
  'services.items[].tagline': 'a few words under that title, such as With a site visit',
  'notes.items[].text':
    'exactly three short sentences in their voice about how they work, each set in italics on a card',
  'notes.items[].name': 'a short title for each of those three, set in bold under it',
  'notes.items[].role': 'a few words after each title saying what it concerns',
  'notes.statement.text': 'one sentence from the company about why it exists, from the statement',
  'notes.statement.role': 'a few words under the company name on that card, such as Why we do this',
  'process.label': 'the label of the block about working together, such as How it works',
  'process.body': 'a paragraph about how working with them goes, from the steps',
  'process.cta.label': 'the button under it, the same as ctaLabel',
  'process.steps[]': 'exactly three short step titles, one each, in order',
  'approach.label': 'the small label of the second glass card, such as Our approach',
  'approach.text': 'a paragraph about how they work and who they work with',
  'approach.cta.label': 'the button under it, which leads to why choose them',
  'offers.label': 'the small label over the three boxes, such as Why us',
  'offers.lead': 'one sentence beside that label introducing the three boxes',
  'offers.cta.label': 'the button beside it, which leads to the contact band',
  'offers.itemCta.label': 'the button on every box, such as Learn more',
  'offers.items[].tag': 'exactly three boxes, one per value proposition: a one or two word tag',
  'offers.items[].title': 'the title of each box, from the value proposition',
  'offers.items[].body': 'one sentence in each box, from the value proposition',
  'mission.label': 'the small label of the third glass card, such as Why we exist',
  'mission.text': 'a paragraph about why they do what they do, from the statement',
  'mission.cta.label': 'the button under it, the same as ctaLabel',
  'newsletter.heading':
    'the heading over the email form, which mails them the address, such as Get in touch by email',
  'newsletter.placeholder': 'the words inside the empty email field, such as Your email',
  'newsletter.button': 'the button beside the field, such as Send',
  'closing.text': 'one or two sentences in the closing band about the company',
  'closing.secondary.label': 'the outlined button under them, which leads to their services',
  'closing.cta.label': 'the big button at the foot of the band, the same as ctaLabel',
  'footer.links[].label':
    'up to three short labels for the small links in the footer; each link has a target from the same list as the hero pills',
}

const INEGRO_GUIDE = Object.entries(INEGRO_SLOTS)
  .filter(([slot]) => slot in PURPOSE)
  .map(
    ([slot, { min, max }]) =>
      `- ${slot}: ${String(min)} to ${String(max)} characters, ${PURPOSE[slot as ModelSlot]}`,
  )
  .join('\n')

// Validation needs only words, so the copy is assembled around a wordmark and no pictures.
const NO_ASSETS: TemplateAssets = { logo: { kind: 'wordmark' }, images: {}, email: null }

function three<T>(items: readonly T[]): readonly [T, T, T] {
  const [a, b, c] = items
  if (a === undefined || b === undefined || c === undefined || items.length !== 3) {
    throw new Error(`Expected three items, got ${String(items.length)}`)
  }
  return [a, b, c]
}

export function assembleInegro(copy: InegroCopy, assets: TemplateAssets): InegroContent {
  const { hero, intro, services, notes, process, approach, offers, mission } = copy
  const image = (slot: string) => assets.images[slot] ?? null
  const links = (items: readonly { label: string; target: Target }[]) =>
    items.map((item) => ({ label: item.label, href: HREF[item.target] }))
  const email = assets.email
  const cta = { label: copy.nav.cta, href: HREF.contact }
  // The bar by position: the services with their names, about with the three glass cards, then
  // why choose them and how it works.
  const children = [
    services.items.map((item) => ({ label: item.name, href: HREF.services })),
    [
      { label: intro.label, href: HREF.intro },
      { label: approach.label, href: HREF.approach },
      { label: mission.label, href: HREF.mission },
    ],
    [],
    [],
  ]
  const navHrefs = [HREF.services, HREF.intro, HREF.offers, HREF.process]
  return {
    brand: { ...copy.brand, logo: assets.logo },
    nav: {
      items: copy.nav.items.map((label, index) => ({
        label,
        href: navHrefs[index] ?? HREF.contact,
        children: children[index] ?? [],
      })),
      cta,
    },
    hero: { ...hero, links: links(hero.links) },
    intro: {
      label: intro.label,
      text: intro.text,
      cta: { label: intro.cta, href: HREF.services },
      image: image('intro'),
    },
    services: {
      label: services.label,
      cta: { label: services.cta, href: HREF.contact },
      itemCta: { label: services.itemCta, href: HREF.contact },
      items: services.items.map((item, index) => ({
        ...item,
        image: image(`service-${String(index + 1)}`),
      })),
    },
    notes: {
      items: notes.items,
      statement: { ...notes.statement, name: copy.brand.name },
    },
    process: { ...process, cta: { label: process.cta, href: HREF.contact } },
    approach: {
      label: approach.label,
      text: approach.text,
      cta: { label: approach.cta, href: HREF.offers },
      image: image('approach'),
    },
    offers: {
      label: offers.label,
      lead: offers.lead,
      cta: { label: offers.cta, href: HREF.contact },
      itemCta: { label: offers.itemCta, href: HREF.contact },
      items: three<InegroOffer>(offers.items),
    },
    mission: {
      label: mission.label,
      text: mission.text,
      cta: { label: mission.cta, href: HREF.contact },
      image: image('mission'),
    },
    newsletter: { ...copy.newsletter, email },
    closing: {
      text: copy.closing.text,
      secondary: { label: copy.closing.secondary, href: HREF.services },
      cta: {
        label: copy.closing.cta,
        href: email === null ? HREF.newsletter : `mailto:${email}`,
      },
      social: null,
    },
    footer: { links: links(copy.footer.links) },
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
  return fitToSlot(text, INEGRO_SLOTS[slot], FILLERS)
}

// A label is used as given when it fits, else replaced by a plain one that does.
function label(slot: Slot, text: string, plain: string): string {
  return fits(text.trim(), INEGRO_SLOTS[slot]) ? text.trim() : plain
}

function fits(text: string, slot: CopySlot): boolean {
  return text.length >= slot.min && text.length <= slot.max
}

const PLAIN_TITLES = ['What we do', 'Who it is for', 'How to start'] as const
const PLAIN_STEPS = ['Tell us what you need', 'We agree the details', 'We get to work'] as const

// Copy from the brief alone, with no model involved: the visitor's own sentences in the prose
// slots and plain labels everywhere else. Always passes the contract's violations, which the
// test proves over a corpus of briefs.
export function inegroFallbackCopy(brief: BrandBrief): InegroCopy {
  const name = brief.company
  const positioning = brief.positioning
  const statement = brief.statement === '' ? positioning : brief.statement
  const cta = label('nav.cta.label', brief.ctaLabel, 'Get in touch')
  const props = PLAIN_TITLES.map((plain, index) => {
    const prop = brief.valueProps[index]
    return { title: prop?.title ?? plain, body: prop?.body ?? positioning, plain }
  })
  const steps = brief.steps.map((step) => step.body).join(' ')
  const brandName = fitToSlot(name, INEGRO_SLOTS['brand.name'], ['Ltd'])
  const headline = brief.headlines[0] ?? ''
  return {
    brand: {
      name: brandName,
      legalName: fitToSlot(name, INEGRO_SLOTS['brand.legalName'], ['Ltd']),
    },
    nav: { items: ['Services', 'About', 'Why us', 'How it works'], cta },
    hero: {
      headline: {
        text: label('hero.headline.text', headline, 'What we do, and who it is for'),
        emphasis: '',
      },
      subhead: prose('hero.subhead', positioning),
      linksLabel: 'Find out more about us',
      links: [
        { label: 'Services', target: 'services' },
        { label: 'How it works', target: 'process' },
        { label: 'About us', target: 'approach' },
        { label: 'Get in touch', target: 'contact' },
      ],
    },
    intro: {
      label: 'Introduction',
      text: prose('intro.text', `${positioning} ${statement}`),
      cta: 'See what we do',
    },
    services: {
      label: 'Services',
      cta: label('services.cta.label', cta, 'Get in touch'),
      itemCta: 'Enquire',
      items: props.map((prop) => ({
        name: label('services.items[].name', prop.title, prop.plain),
        line: prose('services.items[].line', prop.body),
        title: label('services.items[].title', prop.title, prop.plain),
        tagline: label('services.items[].tagline', `With ${brandName}`, 'In our own words'),
      })),
    },
    notes: {
      items: props.map((prop) => ({
        text: prose('notes.items[].text', prop.body),
        name: label('notes.items[].name', prop.title, prop.plain),
        role: 'In our own words',
      })),
      statement: {
        text: prose('notes.statement.text', statement),
        role: 'Why we do this',
      },
    },
    process: {
      label: 'How it works',
      body: prose('process.body', steps === '' ? positioning : steps),
      cta: label('process.cta.label', cta, 'Get in touch'),
      steps: PLAIN_STEPS.map((plain, index) =>
        label('process.steps[]', brief.steps[index]?.title ?? plain, plain),
      ),
    },
    approach: {
      label: 'Our approach',
      text: prose('approach.text', brief.audience === '' ? positioning : brief.audience),
      cta: 'Why choose us',
    },
    offers: {
      label: 'Why us',
      lead: prose('offers.lead', positioning),
      cta: label('offers.cta.label', cta, 'Get in touch'),
      itemCta: 'Learn more',
      items: props.map((prop) => ({
        tag: prop.plain,
        title: label('offers.items[].title', prop.title, prop.plain),
        body: prose('offers.items[].body', prop.body),
      })),
    },
    mission: {
      label: 'Why we exist',
      text: prose('mission.text', statement),
      cta: label('mission.cta.label', cta, 'Get in touch'),
    },
    newsletter: {
      heading: 'Get in touch by email',
      placeholder: 'Your email',
      button: 'Send',
    },
    closing: {
      text: prose('closing.text', statement),
      secondary: 'See what we do',
      cta: label('closing.cta.label', cta, 'Get in touch'),
    },
    footer: {
      links: [
        { label: 'About us', target: 'intro' },
        { label: 'Services', target: 'services' },
        { label: 'Contact', target: 'contact' },
      ],
    },
  }
}

export const inegroContract = defineContract<InegroCopy>({
  meta,
  contrastPairs: INEGRO_CONTRAST_PAIRS,
  imageSlots: [
    'intro',
    'service-1',
    'service-2',
    'service-3',
    'service-4',
    'service-5',
    'service-6',
    'approach',
    'mission',
  ],
  copySchema: inegroCopySchema,
  guide: INEGRO_GUIDE,
  fallbackCopy: inegroFallbackCopy,
  copyViolations: inegroCopyViolations,
  headlineOf: (copy) => copy.hero.headline.text,
})
