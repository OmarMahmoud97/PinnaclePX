import * as z from 'zod'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import { defineContract } from '@/lib/copy-slots/contract'
import { fitToSlot } from '@/lib/copy-slots/fit'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import {
  VECTOR_CONTRAST_PAIRS,
  VECTOR_SLOTS,
  type VectorContent,
  vectorViolations,
} from './copy-slots'
import { meta } from './meta'

// Vector's side of the pipeline contract: the copy the copy stage writes, the fallback when
// it cannot, and how copy and assets become the content object. Links are never written: the
// menu follows the page's blocks in the source's order, About's button and every menu row
// lead to the footer, which is the contact block, the footer's big address is the owner's
// email, and footer links point at one of the page's own anchors. The optional pieces (the
// bento of social proof, the footer's places and social links) are not in the copy: the brief
// holds no such facts, so they stay null. The footer's list of services is the page's own.

const TARGETS = ['top', 'projects', 'services', 'services-menu', 'about', 'faq', 'contact'] as const
const HREF: Readonly<Record<(typeof TARGETS)[number], string>> = {
  top: '#top',
  projects: '#projects',
  services: '#services',
  'services-menu': '#services-menu',
  about: '#about',
  faq: '#faq',
  contact: '#contact',
}
// The menu's plan, by position: where each link leads and the block it stands for.
const NAV: readonly Readonly<{ href: string; section: string }>[] = [
  { href: '#top', section: 'hero' },
  { href: '#projects', section: 'projects' },
  { href: '#services-menu', section: 'services' },
  { href: '#about', section: 'about' },
  { href: '#faq', section: 'faq' },
  { href: '#contact', section: 'contact' },
]

const link = z.object({ label: z.string(), target: z.enum(TARGETS) })

export const vectorCopySchema = z.object({
  brand: z.object({ name: z.string(), legalName: z.string() }),
  nav: z.object({ links: z.array(z.string()) }),
  hero: z.object({ headline: z.array(z.string()), subhead: z.string(), scrollHint: z.string() }),
  projects: z.object({
    marquee: z.object({ text: z.string(), accent: z.string() }),
    items: z.array(
      z.object({ titleUp: z.string(), titleDown: z.string(), description: z.string() }),
    ),
  }),
  services: z.object({ heading: z.string(), items: z.array(z.string()) }),
  about: z.object({ statement: z.string(), cta: z.string() }),
  faq: z.object({
    heading: z.array(z.string()),
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
  footer: z.object({
    cta: z.string(),
    tagline: z.string(),
    servicesHeading: z.string(),
    navigationHeading: z.string(),
    navigation: z.array(link),
    bottomLinks: z.array(link),
    credit: z.string(),
  }),
})

export type VectorCopy = z.infer<typeof vectorCopySchema>

// Every count and slot outside its limits.
function vectorCopyViolations(copy: VectorCopy): readonly SlotViolation[] {
  return vectorViolations(assembleVector(copy, NO_ASSETS))
}

type Slot = keyof typeof VECTOR_SLOTS

// The slots the copy stage writes: every slot but those of the optional pieces, and the
// footer's list of services, which is the page's own.
type ModelSlot = Exclude<
  Slot,
  | `proof.${string}`
  | `footer.places.${string}`
  | `footer.social.${string}`
  | 'footer.services.items[]'
>

// What each slot is for, beside its range, for the copy prompt.
const PURPOSE: Readonly<Record<ModelSlot, string>> = {
  'brand.name': 'the company name as given, set in lower case in the bar as the source set its own',
  'brand.legalName': 'the legal name for the footer, the company name if unknown',
  'nav.links[].label':
    'two to six short menu labels, in order: home, their work, what they offer, about, questions, contact',
  'hero.headline[]':
    'two or three short lines of the headline, a few words each; the last is set in the serif italic',
  'hero.subhead': 'one or two sentences under the headline saying what they do and for whom',
  'hero.scrollHint': 'the word at the foot of the first screen, such as Scroll',
  'projects.marquee.text': 'the first word of the giant marquee, such as Selected',
  'projects.marquee.accent': 'its second word, set in the thin serif, such as Work',
  'projects.items[].titleUp':
    'two to four pieces of work, each a title in two short parts: the first part',
  'projects.items[].titleDown': 'the second part of each title, set in the serif italic',
  'projects.items[].description': 'one sentence about each',
  'services.heading':
    'one or two short sentences that fill a screen, letter by letter, such as We craft experiences that captivate.',
  'services.items[]': 'three to six things they offer, a few words each, one menu row each',
  'about.statement': 'one sentence about the company in their words, set large and centred',
  'about.cta.label': 'the round button under it, the same as ctaLabel',
  'faq.heading[]': 'the FAQ heading in one or two lines, such as Frequently asked and Questions',
  'faq.items[].question': 'three to six questions a customer would ask, from the brief',
  'faq.items[].answer': 'the answers, in their words, claiming nothing the owner did not say',
  'footer.cta.label': 'the round button under the big address, the same as ctaLabel',
  'footer.tagline': 'a short line under the name in the footer, such as Built to evolve ideas.',
  'footer.services.heading':
    'the heading of the footer column that lists what they offer, such as Services',
  'footer.navigation.heading': 'the heading of the footer column of links, such as Navigation',
  'footer.navigation.links[].label':
    'two to six link labels for that column; each link has a target of top, projects, services, services-menu, about, faq or contact',
  'footer.bottomLinks[].label':
    'up to three short labels for the small links at the foot, with the same targets',
  'footer.credit': 'a closing line at the foot, or empty',
}

const VECTOR_GUIDE = Object.entries(VECTOR_SLOTS)
  .filter(([slot]) => slot in PURPOSE)
  .map(
    ([slot, { min, max }]) =>
      `- ${slot}: ${String(min)} to ${String(max)} characters, ${PURPOSE[slot as ModelSlot]}`,
  )
  .join('\n')

// Validation needs only words, so the copy is assembled around a wordmark and no pictures.
const NO_ASSETS: TemplateAssets = { logo: { kind: 'wordmark' }, images: {}, email: null }

export function assembleVector(copy: VectorCopy, assets: TemplateAssets): VectorContent {
  const { hero, projects, services, about, faq, footer } = copy
  const image = (slot: string) => assets.images[slot] ?? null
  const links = (items: readonly { label: string; target: (typeof TARGETS)[number] }[]) =>
    items.map((item) => ({ label: item.label, href: HREF[item.target] }))
  const email = assets.email
  return {
    brand: { ...copy.brand, logo: assets.logo },
    nav: {
      links: copy.nav.links.map((label, index) => ({
        label,
        href: NAV[index]?.href ?? HREF.top,
        section: NAV[index]?.section ?? 'hero',
      })),
    },
    hero,
    projects: {
      marquee: projects.marquee,
      items: projects.items.map((item, index) => ({
        ...item,
        image: image(`project-${String(index + 1)}`),
      })),
    },
    services,
    about: {
      image: image('about'),
      statement: about.statement,
      cta: { label: about.cta, href: HREF.contact },
    },
    proof: null,
    faq,
    footer: {
      email,
      cta: { label: footer.cta, href: email === null ? HREF.top : `mailto:${email}` },
      tagline: footer.tagline,
      places: null,
      services: { heading: footer.servicesHeading, items: services.items },
      navigation: { heading: footer.navigationHeading, links: links(footer.navigation) },
      social: null,
      bottomLinks: links(footer.bottomLinks),
      credit: footer.credit,
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
  return fitToSlot(text, VECTOR_SLOTS[slot], FILLERS)
}

// A label is used as given when it fits, else replaced by a plain one that does.
function label(slot: Slot, text: string, plain: string): string {
  return fits(text.trim(), VECTOR_SLOTS[slot]) ? text.trim() : plain
}

function fits(text: string, slot: CopySlot): boolean {
  return text.length >= slot.min && text.length <= slot.max
}

const PLAIN_TITLES = ['What we do', 'Who it is for', 'How to start'] as const
const PLAIN_PAIRS = [
  ['What', 'we do'],
  ['Who', 'it is for'],
  ['How', 'we start'],
] as const

// Copy from the brief alone, with no model involved: the visitor's own sentences in the prose
// slots and plain labels everywhere else. Always passes vectorViolations, which the test
// proves over a corpus of briefs.
export function vectorFallbackCopy(brief: BrandBrief): VectorCopy {
  const name = brief.company
  const positioning = brief.positioning
  const statement = brief.statement === '' ? positioning : brief.statement
  const cta = label('about.cta.label', brief.ctaLabel, 'Get in touch')
  const props = brief.valueProps
  const steps = brief.steps
  const titles = PLAIN_TITLES.map((fallback, index) =>
    label('services.items[]', props[index]?.title ?? fallback, fallback),
  )
  return {
    brand: {
      name: fitToSlot(name, VECTOR_SLOTS['brand.name'], ['Ltd']),
      legalName: fitToSlot(name, VECTOR_SLOTS['brand.legalName'], ['Ltd']),
    },
    nav: { links: ['Home', 'Work', 'Services', 'About us', 'Questions', 'Contact'] },
    hero: {
      headline: ['What we do,', 'and who', 'it is for.'],
      subhead: prose('hero.subhead', brief.headlines[0] ?? positioning),
      scrollHint: 'Scroll',
    },
    projects: {
      marquee: { text: 'Our', accent: 'Work' },
      items: PLAIN_PAIRS.map(([titleUp, titleDown], index) => ({
        titleUp,
        titleDown,
        description: prose('projects.items[].description', props[index]?.body ?? positioning),
      })),
    },
    services: {
      heading: 'Everything we do, and the way we do it.',
      items: titles,
    },
    about: {
      statement: prose('about.statement', `${positioning} ${statement}`),
      cta,
    },
    faq: {
      heading: ['Frequently asked', 'questions'],
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
      cta,
      tagline: 'In our own words.',
      servicesHeading: 'Services',
      navigationHeading: 'Navigation',
      navigation: [
        { label: 'Home', target: 'top' },
        { label: 'Work', target: 'projects' },
        { label: 'Services', target: 'services-menu' },
        { label: 'About', target: 'about' },
        { label: 'Contact', target: 'contact' },
      ],
      bottomLinks: [
        { label: 'About us', target: 'about' },
        { label: 'Our work', target: 'projects' },
        { label: 'Contact', target: 'contact' },
      ],
      credit: '',
    },
  }
}

export const vectorContract = defineContract<VectorCopy>({
  meta,
  contrastPairs: VECTOR_CONTRAST_PAIRS,
  imageSlots: ['about', 'project-1', 'project-2', 'project-3', 'project-4'],
  copySchema: vectorCopySchema,
  guide: VECTOR_GUIDE,
  fallbackCopy: vectorFallbackCopy,
  copyViolations: vectorCopyViolations,
  headlineOf: (copy) => copy.hero.headline.join(' '),
})
