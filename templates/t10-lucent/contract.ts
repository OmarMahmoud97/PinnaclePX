import * as z from 'zod'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import { defineContract } from '@/lib/copy-slots/contract'
import { fitToSlot } from '@/lib/copy-slots/fit'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import {
  LUCENT_CONTRAST_PAIRS,
  LUCENT_SLOTS,
  type LucentContent,
  type LucentFeature,
  lucentViolations,
} from './copy-slots'
import { meta } from './meta'

// Lucent's side of the pipeline contract: the copy the copy stage writes, the fallback when it
// cannot, and how copy and assets become the content object. Links are never written: the bar
// follows the page by position (the overview, the rail's last card, the questions, the ask),
// every button leads to a fixed anchor, and the footer's links each choose a target from a fixed
// list. The ask is the footer, whose big line and pill mail the owner when their address is
// known. The pricing, the feature badges and the social links are not in the copy: the brief
// holds no prices or networks and no word on what is new, so they stay null.

const TARGETS = ['overview', 'steps', 'features', 'faq', 'contact'] as const
type Target = (typeof TARGETS)[number]
const HREF: Readonly<Record<Target, string>> = {
  overview: '#overview',
  steps: '#steps',
  features: '#features',
  faq: '#faq',
  contact: '#contact',
}
// The rail's last card, the black one, which the bar's second link opens as the source's did.
const LAST_FEATURE = '#feature-4'
const FORM = '#contact-form'

const strings = z.array(z.string())
const headed = { label: z.string(), heading: strings, body: z.string() }

export const lucentCopySchema = z.object({
  brand: z.object({ name: z.string(), legalName: z.string() }),
  nav: z.object({ items: strings, cta: z.string() }),
  hero: z.object({
    headline: z.string(),
    lead: z.string(),
    cta: z.string(),
    secondary: z.string(),
  }),
  overview: z.object({ ...headed, ticks: strings }),
  breakdown: z.object(headed),
  reminder: z.object({
    ...headed,
    notice: z.object({ title: z.string(), text: z.string(), time: z.string() }),
  }),
  steps: z.object({ label: z.string(), heading: z.string(), body: z.string(), items: strings }),
  features: z.object({ items: z.array(z.object({ ...headed, more: z.string() })) }),
  widgets: z.object(headed),
  pair: z.object(headed),
  manifesto: z.object({ text: z.string(), emphasis: strings }),
  faq: z.object({
    label: z.string(),
    heading: z.string(),
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
  promise: z.object({ lead: z.string(), text: z.string(), badges: strings }),
  journal: z.object({
    lines: strings,
    sub: z.string(),
    link: z.string(),
    form: z.object({
      heading: z.string(),
      placeholder: z.string(),
      button: z.string(),
      terms: z.string(),
    }),
  }),
  footer: z.object({
    lead: z.string(),
    tail: z.string(),
    button: z.string(),
    fine: z.string(),
    links: z.array(z.object({ label: z.string(), target: z.enum(TARGETS) })),
    contact: z.string(),
  }),
})

export type LucentCopy = z.infer<typeof lucentCopySchema>

// Lists the layout draws a fixed number of: checked first, because a list of the wrong length
// cannot be assembled, so its violations are reported alone and the rest waits for the next
// attempt.
const FIXED: readonly [
  path: string,
  size: number,
  pick: (copy: LucentCopy) => readonly unknown[],
][] = [
  ['nav.items', 4, (copy) => copy.nav.items],
  ['overview.heading', 2, (copy) => copy.overview.heading],
  ['overview.ticks', 3, (copy) => copy.overview.ticks],
  ['breakdown.heading', 3, (copy) => copy.breakdown.heading],
  ['reminder.heading', 2, (copy) => copy.reminder.heading],
  ['steps.items', 3, (copy) => copy.steps.items],
  ['features.items', 4, (copy) => copy.features.items],
  // A card missing from the list is reported above, so its heading is not reported again.
  ['features.items[0].heading', 2, (copy) => copy.features.items[0]?.heading ?? ['', '']],
  ['features.items[1].heading', 2, (copy) => copy.features.items[1]?.heading ?? ['', '']],
  ['features.items[2].heading', 2, (copy) => copy.features.items[2]?.heading ?? ['', '']],
  ['features.items[3].heading', 2, (copy) => copy.features.items[3]?.heading ?? ['', '']],
  ['widgets.heading', 2, (copy) => copy.widgets.heading],
  ['pair.heading', 2, (copy) => copy.pair.heading],
  ['manifesto.emphasis', 2, (copy) => copy.manifesto.emphasis],
  ['journal.lines', 3, (copy) => copy.journal.lines],
]

function lucentCopyViolations(copy: LucentCopy): readonly SlotViolation[] {
  const counts = FIXED.flatMap(([path, size, pick]) => {
    const length = pick(copy).length
    return length === size ? [] : [{ slot: path, length, min: size, max: size }]
  })
  if (counts.length > 0) return counts
  return lucentViolations(assembleLucent(copy, NO_ASSETS))
}

type Slot = keyof typeof LUCENT_SLOTS

// The slots the copy stage writes: every slot but a feature card's badge, which would need a
// fact about what is new.
type ModelSlot = Exclude<Slot, 'features.items[].badge'>

// What each slot is for, beside its range, for the copy prompt.
const PURPOSE: Readonly<Record<ModelSlot, string>> = {
  'brand.name': 'the company name as given, set beside the logo in the bar',
  'brand.legalName': 'the legal name for the footer, the company name if unknown',
  'nav.items[].label':
    'exactly four short labels for the bar, in order: an overview of them, their highlights, their questions, and getting in touch',
  'nav.cta.label': 'the button at the right of the bar, the same as ctaLabel',
  'hero.headline':
    'the headline, two short sentences set very large: what they offer, then what it means for the customer',
  'hero.lead': 'one or two sentences under the headline saying what they do and for whom',
  'hero.cta.label': 'the filled button under the lead, the same as ctaLabel',
  'hero.secondary.label': 'the outlined button beside it, which leads to the overview',
  'overview.label': 'the small capitals over the overview, such as Overview',
  'overview.heading[]':
    'exactly two lines of one short sentence, set very large, the second finishing the first',
  'overview.body': 'a paragraph of three sentences about what a customer gets from them',
  'overview.ticks[]': 'exactly three short ticked lines, each one thing a customer gets',
  'breakdown.label': 'the small capitals over the white card, such as Who it is for',
  'breakdown.heading[]':
    'exactly three very short lines of two or three words each, a rhythm of three, the last set in the brand colour',
  'breakdown.body': 'a paragraph of two sentences about who they serve, from the audience',
  'reminder.label': 'the small capitals over the next heading, such as Staying in touch',
  'reminder.heading[]': 'exactly two lines of one sentence about how they keep a customer informed',
  'reminder.body': 'one or two sentences under it, in their words',
  'reminder.notice.title':
    'the bold title of a phone notification the business might send a customer, such as Booking confirmed',
  'reminder.notice.text':
    'the line of that notification, one short sentence with no times or dates',
  'reminder.notice.time': 'the small time on that notification, a word such as now, with no digits',
  'steps.label': 'the small capitals over the steps, such as Getting started',
  'steps.heading': 'a heading of one sentence about how a customer starts with them',
  'steps.body': 'one or two sentences under it, from the steps',
  'steps.items[]': 'exactly three short step titles in numbered pills, in order, from the steps',
  'features.items[].label':
    'exactly four feature cards, one per value proposition and the last for the statement: the small capitals at the top of each',
  'features.items[].heading[]':
    'exactly two lines for each card, one short sentence each, set large',
  'features.items[].body': 'a paragraph of two or three sentences in each card, from that point',
  'features.items[].more.label': 'the small link under each paragraph, such as Ask about this',
  'widgets.label': 'the small capitals over the wide picture, such as How we work',
  'widgets.heading[]': 'exactly two lines of one sentence about how they work',
  'widgets.body': 'one or two sentences under it',
  'pair.label': 'the small capitals over the two tall pictures, such as In practice',
  'pair.heading[]': 'exactly two lines of one sentence about what working with them looks like',
  'pair.body': 'one or two sentences under it',
  'manifesto.text':
    'the statement, several short sentences in their voice about why they exist, set very large',
  'manifesto.emphasis[]':
    'exactly two phrases copied exactly from the statement, a word or a few words each, set in the brand colour; empty for none',
  'faq.label': 'the small capitals over the questions, such as FAQ',
  'faq.heading': 'the heading beside the questions, such as Good questions.',
  'faq.items[].question': 'three to five questions a customer would ask, from the brief',
  'faq.items[].answer': 'the answers, in their words, claiming nothing the owner did not say',
  'promise.lead': 'a few words set bold at the start of the promise card, ending in a full stop',
  'promise.text': 'one sentence after them on the same line, from the statement',
  'promise.badges[]': 'two to four short pills under that line, each one thing they offer',
  'journal.lines[]':
    'exactly three very short lines over the big picture, one or two words each, inviting the visitor to get in touch',
  'journal.sub': 'one sentence under those lines',
  'journal.link.label': 'a label for screen readers saying the picture leads to getting in touch',
  'journal.form.heading':
    'the heading of the email form on the picture, such as Get in touch by email',
  'journal.form.placeholder': 'the words inside the empty email field, such as you@example.com',
  'journal.form.button': 'the button beside the field, such as Send',
  'journal.form.terms':
    'one sentence under the field saying that sending opens an email to them from the visitor',
  'footer.lead': "the word or two before the company name in the footer's big ask, such as Talk to",
  'footer.tail': 'the line under the company name finishing that ask, such as to get started',
  'footer.button.label': 'the white button under the ask, the same as ctaLabel',
  'footer.fine': 'a short line under that button, a few words about how to start, with no digits',
  'footer.links[].label':
    'up to four short labels for the small links in the footer; each link has a target of overview, steps, features, faq or contact',
  'footer.contact.label': 'the footer link that copies their email address, such as Contact us',
}

const LUCENT_GUIDE = Object.entries(LUCENT_SLOTS)
  .filter(([slot]) => slot in PURPOSE)
  .map(
    ([slot, { min, max }]) =>
      `- ${slot}: ${String(min)} to ${String(max)} characters, ${PURPOSE[slot as ModelSlot]}`,
  )
  .join('\n')

// Validation needs only words, so the copy is assembled around a wordmark and no pictures.
const NO_ASSETS: TemplateAssets = { logo: { kind: 'wordmark' }, images: {}, email: null }

// A list of the length the layout draws, as a tuple; any other length is a programming error,
// since the copy's counts are checked before it is assembled.
function sized(items: readonly unknown[], size: number): void {
  if (items.length !== size) {
    throw new Error(`Expected ${String(size)} items, got ${String(items.length)}`)
  }
}

function two<T>(items: readonly T[]): readonly [T, T] {
  sized(items, 2)
  const [a, b] = items as readonly [T, T]
  return [a, b]
}

function three<T>(items: readonly T[]): readonly [T, T, T] {
  sized(items, 3)
  const [a, b, c] = items as readonly [T, T, T]
  return [a, b, c]
}

function four<T>(items: readonly T[]): readonly [T, T, T, T] {
  sized(items, 4)
  const [a, b, c, d] = items as readonly [T, T, T, T]
  return [a, b, c, d]
}

export function assembleLucent(copy: LucentCopy, assets: TemplateAssets): LucentContent {
  const image = (slot: string) => assets.images[slot] ?? null
  const email = assets.email
  const ask = { label: copy.nav.cta, href: HREF.contact }
  // The ask itself: a mail message to the owner, or the email form when there is no address.
  const mail = email === null ? FORM : `mailto:${email}`
  const navHrefs = [HREF.overview, LAST_FEATURE, HREF.faq, HREF.contact] as const
  const [first, second, third, fourth] = four(copy.nav.items)
  const features = four(copy.features.items).map((item, index): LucentFeature => ({
    label: item.label,
    badge: null,
    heading: two(item.heading),
    body: item.body,
    more: { label: item.more, href: HREF.contact },
    image: image(`feature-${String(index + 1)}`),
  }))
  return {
    brand: { ...copy.brand, logo: assets.logo },
    nav: {
      items: [
        { label: first, href: navHrefs[0] },
        { label: second, href: navHrefs[1] },
        { label: third, href: navHrefs[2] },
        { label: fourth, href: navHrefs[3] },
      ],
      cta: ask,
    },
    hero: {
      headline: copy.hero.headline,
      lead: copy.hero.lead,
      cta: { label: copy.hero.cta, href: HREF.contact },
      secondary: { label: copy.hero.secondary, href: HREF.overview },
      image: image('hero'),
    },
    promo: { image: image('promo') },
    overview: {
      label: copy.overview.label,
      heading: two(copy.overview.heading),
      body: copy.overview.body,
      ticks: three(copy.overview.ticks),
      image: image('overview'),
    },
    breakdown: {
      label: copy.breakdown.label,
      heading: three(copy.breakdown.heading),
      body: copy.breakdown.body,
      image: image('breakdown'),
    },
    reminder: {
      label: copy.reminder.label,
      heading: two(copy.reminder.heading),
      body: copy.reminder.body,
      notice: copy.reminder.notice,
      image: image('reminder'),
    },
    steps: {
      label: copy.steps.label,
      heading: copy.steps.heading,
      body: copy.steps.body,
      items: three(copy.steps.items),
      image: image('steps'),
    },
    features: { items: four(features) },
    widgets: {
      label: copy.widgets.label,
      heading: two(copy.widgets.heading),
      body: copy.widgets.body,
      image: image('widgets'),
    },
    pair: {
      label: copy.pair.label,
      heading: two(copy.pair.heading),
      body: copy.pair.body,
      images: [image('pair-1'), image('pair-2')],
    },
    manifesto: { text: copy.manifesto.text, emphasis: two(copy.manifesto.emphasis) },
    pricing: null,
    faq: copy.faq,
    promise: copy.promise,
    journal: {
      lines: three(copy.journal.lines),
      sub: copy.journal.sub,
      link: { label: copy.journal.link, href: mail },
      image: image('journal'),
      form: { ...copy.journal.form, email },
    },
    footer: {
      lead: copy.footer.lead,
      tail: copy.footer.tail,
      href: mail,
      markAsInitial: false,
      button: { label: copy.footer.button, href: mail },
      fine: copy.footer.fine,
      links: copy.footer.links.map((link) => ({ label: link.label, href: HREF[link.target] })),
      contact: email === null ? null : { label: copy.footer.contact, email },
      social: null,
    },
  }
}

// Sentences that claim nothing, appended to a visitor's words that come up short of a slot.
const FILLERS = [
  'Get in touch to find out more.',
  'Everything starts with a conversation.',
  'Tell us what you need and we will take it from there.',
  'You can ask as many questions as you like before deciding anything.',
  'There is no obligation, and every question gets a plain answer.',
] as const

function prose(slot: Slot, text: string): string {
  return fitToSlot(text, LUCENT_SLOTS[slot], FILLERS)
}

// A label is used as given when it fits, else replaced by a plain one that does.
function label(slot: Slot, text: string, plain: string): string {
  return fits(text.trim(), LUCENT_SLOTS[slot]) ? text.trim() : plain
}

function fits(text: string, slot: CopySlot): boolean {
  return text.length >= slot.min && text.length <= slot.max
}

const PLAIN_TITLES = ['What we do', 'Who it is for', 'How to start'] as const
const PLAIN_STEPS = ['Tell us what you need', 'We agree the details', 'We get to work'] as const
const PLAIN_HEADINGS = [
  ['What we do,', 'and how we do it.'],
  ['Who it is for,', 'and why it helps.'],
  ['How to start,', 'one step at a time.'],
  ['Why we exist,', 'in a sentence.'],
] as const

// Copy from the brief alone, with no model involved: the visitor's own sentences in the prose
// slots and plain labels everywhere else. Always passes the contract's violations, which the
// test proves over a corpus of briefs.
export function lucentFallbackCopy(brief: BrandBrief): LucentCopy {
  const name = brief.company
  const positioning = brief.positioning
  const statement = brief.statement === '' ? positioning : brief.statement
  const audience = brief.audience === '' ? positioning : brief.audience
  const cta = label('nav.cta.label', brief.ctaLabel, 'Get in touch')
  const props = PLAIN_TITLES.map((plain, index) => {
    const prop = brief.valueProps[index]
    return { title: prop?.title ?? plain, body: prop?.body ?? positioning, plain }
  })
  const steps = brief.steps.map((step) => step.body).join(' ')
  const brandName = fitToSlot(name, LUCENT_SLOTS['brand.name'], ['Ltd'])
  const headline = brief.headlines[0] ?? ''
  const feature = (index: number, body: string) => {
    const prop = props[index]
    const [line1, line2] = PLAIN_HEADINGS[index] ?? PLAIN_HEADINGS[0]
    return {
      label: label('features.items[].label', prop?.title ?? '', prop?.plain ?? 'Why we exist'),
      heading: [line1, line2],
      body: prose('features.items[].body', body),
      more: 'Ask about this',
    }
  }
  return {
    brand: {
      name: brandName,
      legalName: fitToSlot(name, LUCENT_SLOTS['brand.legalName'], ['Ltd']),
    },
    nav: { items: ['Overview', 'Highlights', 'Questions', 'Contact'], cta },
    hero: {
      headline: label('hero.headline', headline, 'What we do, and who it is for.'),
      lead: prose('hero.lead', positioning),
      cta: label('hero.cta.label', cta, 'Get in touch'),
      secondary: 'See how it works',
    },
    overview: {
      label: 'Overview',
      heading: ['What we do,', 'and how we do it.'],
      body: prose('overview.body', `${positioning} ${statement}`),
      ticks: props.map((prop) =>
        label('overview.ticks[]', prop.title, `${prop.plain}, in plain words`),
      ),
    },
    breakdown: {
      label: 'Who it is for',
      heading: ['Who it is for.', 'How it helps.', 'Why it matters.'],
      body: prose('breakdown.body', audience),
    },
    reminder: {
      label: 'Staying in touch',
      heading: ['Tell us what', 'you need.'],
      body: prose('reminder.body', positioning),
      notice: {
        title: label('reminder.notice.title', `A note from ${brandName}`, 'A note from us'),
        text: 'Your message has reached us.',
        time: 'now',
      },
    },
    steps: {
      label: 'Getting started',
      heading: 'Three steps to get started.',
      body: prose('steps.body', steps === '' ? positioning : steps),
      items: PLAIN_STEPS.map((plain, index) =>
        label('steps.items[]', brief.steps[index]?.title ?? plain, plain),
      ),
    },
    features: {
      items: [
        feature(0, props[0]?.body ?? positioning),
        feature(1, props[1]?.body ?? positioning),
        feature(2, props[2]?.body ?? positioning),
        feature(3, statement),
      ],
    },
    widgets: {
      label: 'How we work',
      heading: ['How we work,', 'from first to last.'],
      body: prose('widgets.body', audience),
    },
    pair: {
      label: 'In practice',
      heading: ['See what we do,', 'up close.'],
      body: prose('pair.body', positioning),
    },
    manifesto: { text: prose('manifesto.text', statement), emphasis: ['', ''] },
    faq: {
      label: 'FAQ',
      heading: 'Good questions.',
      items: [
        { question: 'What do you do?', answer: prose('faq.items[].answer', positioning) },
        { question: 'Who is it for?', answer: prose('faq.items[].answer', audience) },
        {
          question: 'How do I get started?',
          answer: prose('faq.items[].answer', steps === '' ? positioning : steps),
        },
      ],
    },
    promise: {
      lead: 'In short.',
      text: prose('promise.text', positioning),
      badges: props.map((prop) => label('promise.badges[]', prop.title, prop.plain)),
    },
    journal: {
      lines: ['Get', 'in touch', 'with us'],
      sub: prose('journal.sub', positioning),
      link: 'Get in touch by email',
      form: {
        heading: 'Get in touch by email',
        placeholder: 'you@example.com',
        button: 'Send',
        terms: 'Sending opens an email to us from your own address.',
      },
    },
    footer: {
      lead: 'Talk to',
      tail: 'to get started',
      button: label('footer.button.label', cta, 'Get in touch'),
      fine: 'Get in touch to find out more.',
      links: [
        { label: 'Overview', target: 'overview' },
        { label: 'Questions', target: 'faq' },
        { label: 'Contact', target: 'contact' },
      ],
      contact: 'Contact us',
    },
  }
}

export const lucentContract = defineContract<LucentCopy>({
  meta,
  contrastPairs: LUCENT_CONTRAST_PAIRS,
  imageSlots: [
    'hero',
    'promo',
    'overview',
    'breakdown',
    'reminder',
    'steps',
    'feature-1',
    'feature-2',
    'feature-3',
    'feature-4',
    'widgets',
    'pair-1',
    'pair-2',
    'journal',
  ],
  copySchema: lucentCopySchema,
  guide: LUCENT_GUIDE,
  fallbackCopy: lucentFallbackCopy,
  copyViolations: lucentCopyViolations,
  headlineOf: (copy) => copy.hero.headline,
})
