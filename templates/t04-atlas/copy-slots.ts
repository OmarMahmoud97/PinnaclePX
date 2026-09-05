import type { SlotImage, TemplateLogo } from '@/lib/copy-slots/assets'
import { slotChecks } from '@/lib/copy-slots/checks'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import type { ContrastPair } from '@/lib/tokens/types'

// Everything Atlas renders comes through this one object. The layout is Rafli Surya Pratama's
// Nefa (MIT, https://github.com/RSurya99/nefa), every section in its order: the header with
// its menu and two buttons, the hero, the market card that overlaps its foot, Buy and trade
// with its exchange rows, the partners' band, the credit card, the trading tools band,
// Security, Getting started, the FAQ, the back-to-top link and the footer with its newsletter.
//
// Four of those need facts the brief does not hold: the market tables, the exchange rows, the
// partner logos and a newsletter. They are optional here. The copy stage leaves them null and
// the page is complete without them: the card under the hero carries three columns of words in
// place of the tables, the boxed row carries the owner's statement in place of the exchange,
// and the footer's last cell carries a note and a button. The example fills them so the layout
// can be reviewed whole.

type AtlasLink = Readonly<{ label: string; href: string }>
export type AtlasImage = SlotImage

// A heading with one phrase set in the header gradient, as the source's headings have. The
// phrase must appear in the text; when it does not, the heading is set plain.
export type Emphasised = Readonly<{ text: string; emphasis: string }>

type Titled = Readonly<{ title: string; body: string }>

export type Three<T> = readonly [T, T, T]
type Two<T> = readonly [T, T]

export type AtlasContent = Readonly<{
  brand: Readonly<{ name: string; legalName: string; logo: TemplateLogo }>
  nav: Readonly<{
    links: readonly AtlasLink[]
    // The source's Products menu: a label that opens onto a short list.
    menu: Readonly<{ label: string; items: readonly AtlasLink[] }>
    secondary: AtlasLink
    cta: AtlasLink
  }>
  hero: Readonly<{
    eyebrow: string
    headline: Emphasised
    subhead: string
    primary: AtlasLink
    secondary: AtlasLink
    image: AtlasImage | null
  }>
  // The source's three market tables, each a title, a link and rows of a coin, a price with
  // its direction and a small chart.
  market: Readonly<{
    groups: Three<
      Readonly<{
        title: string
        rows: readonly Readonly<{
          name: string
          price: string
          up: boolean
          data: readonly number[]
          icon: AtlasImage | null
        }>[]
      }>
    >
    more: string
  }> | null
  // What the card holds when there are no tables: three columns of words with a link.
  glance: Readonly<{ columns: Three<Titled>; more: AtlasLink }>
  pitch: Readonly<{
    heading: Emphasised
    lead: string
    // The source's two exchange rows: a label, a value and a unit with its icon.
    exchange: Readonly<{
      rows: Two<Readonly<{ label: string; value: string; unit: string; icon: AtlasImage | null }>>
      button: string
    }> | null
    // What the row holds when there is no exchange: a label beside the owner's statement.
    label: string
    statement: string
    action: AtlasLink
    image: AtlasImage | null
  }>
  partners: Readonly<{ heading: string; lead: string; logos: readonly AtlasImage[] }> | null
  offer: Readonly<{
    heading: Emphasised
    body: string
    points: Three<string>
    action: AtlasLink
    image: AtlasImage | null
  }>
  tools: Readonly<{
    heading: Emphasised
    items: Three<Titled>
    primary: AtlasLink
    secondary: AtlasLink
    image: AtlasImage | null
  }>
  why: Readonly<{ heading: string; items: Three<Titled>; image: AtlasImage | null }>
  steps: Readonly<{
    heading: string
    items: Three<Titled & Readonly<{ image: AtlasImage | null }>>
  }>
  faq: Readonly<{
    eyebrow: string
    heading: string
    items: readonly Readonly<{ question: string; answer: string }>[]
    image: AtlasImage | null
  }>
  footer: Readonly<{
    columns: readonly (readonly AtlasLink[])[]
    newsletter: Readonly<{
      title: string
      body: string
      placeholder: string
      email: string | null
    }> | null
    note: Readonly<{ title: string; body: string }>
    action: AtlasLink
  }>
}>

// Character limits per text slot. The market card's columns are a third of the width each and
// the exchange row is one line, so those are the tightest.
export const ATLAS_SLOTS = {
  'brand.name': { min: 2, max: 24 },
  'brand.legalName': { min: 2, max: 60 },
  'nav.links[].label': { min: 3, max: 18 },
  'nav.menu.label': { min: 3, max: 16 },
  'nav.menu.items[].label': { min: 3, max: 18 },
  'nav.secondary.label': { min: 3, max: 16 },
  'nav.cta.label': { min: 4, max: 16 },
  'hero.eyebrow': { min: 4, max: 24 },
  'hero.headline.text': { min: 18, max: 60 },
  'hero.headline.emphasis': { min: 0, max: 30 },
  'hero.subhead': { min: 60, max: 160 },
  'hero.primary.label': { min: 4, max: 22 },
  'hero.secondary.label': { min: 4, max: 22 },
  'market.groups[].title': { min: 3, max: 20 },
  'market.groups[].rows[].name': { min: 2, max: 20 },
  'market.groups[].rows[].price': { min: 1, max: 12 },
  'market.more': { min: 2, max: 12 },
  'glance.columns[].title': { min: 4, max: 26 },
  'glance.columns[].body': { min: 40, max: 140 },
  'glance.more.label': { min: 2, max: 12 },
  'pitch.heading.text': { min: 10, max: 60 },
  'pitch.heading.emphasis': { min: 0, max: 30 },
  'pitch.lead': { min: 40, max: 170 },
  'pitch.exchange.rows[].label': { min: 2, max: 12 },
  'pitch.exchange.rows[].value': { min: 1, max: 12 },
  'pitch.exchange.rows[].unit': { min: 2, max: 6 },
  'pitch.exchange.button': { min: 4, max: 22 },
  'pitch.label': { min: 2, max: 12 },
  'pitch.statement': { min: 60, max: 180 },
  'pitch.action.label': { min: 4, max: 22 },
  'partners.heading': { min: 6, max: 40 },
  'partners.lead': { min: 20, max: 120 },
  'offer.heading.text': { min: 10, max: 50 },
  'offer.heading.emphasis': { min: 0, max: 30 },
  'offer.body': { min: 40, max: 170 },
  'offer.points[]': { min: 6, max: 60 },
  'offer.action.label': { min: 4, max: 22 },
  'tools.heading.text': { min: 10, max: 50 },
  'tools.heading.emphasis': { min: 0, max: 30 },
  'tools.items[].title': { min: 6, max: 50 },
  'tools.items[].body': { min: 60, max: 220 },
  'tools.primary.label': { min: 4, max: 22 },
  'tools.secondary.label': { min: 4, max: 22 },
  'why.heading': { min: 18, max: 60 },
  'why.items[].title': { min: 6, max: 40 },
  'why.items[].body': { min: 40, max: 300 },
  'steps.heading': { min: 18, max: 60 },
  'steps.items[].title': { min: 4, max: 24 },
  'steps.items[].body': { min: 60, max: 160 },
  'faq.eyebrow': { min: 3, max: 16 },
  'faq.heading': { min: 10, max: 50 },
  'faq.items[].question': { min: 10, max: 90 },
  'faq.items[].answer': { min: 40, max: 400 },
  'footer.columns[][].label': { min: 3, max: 24 },
  'footer.newsletter.title': { min: 3, max: 24 },
  'footer.newsletter.body': { min: 20, max: 90 },
  'footer.newsletter.placeholder': { min: 3, max: 40 },
  'footer.note.title': { min: 3, max: 24 },
  'footer.note.body': { min: 20, max: 90 },
  'footer.action.label': { min: 4, max: 22 },
} as const satisfies Record<string, CopySlot>

// How many of each list the layout holds.
const ATLAS_COUNTS = {
  'nav.links': { min: 2, max: 5 },
  'nav.menu.items': { min: 2, max: 4 },
  'market.groups[].rows': { min: 1, max: 4 },
  'partners.logos': { min: 2, max: 6 },
  'faq.items': { min: 3, max: 5 },
  'footer.columns': { min: 2, max: 3 },
  'footer.columns[]': { min: 2, max: 5 },
} as const satisfies Record<string, CopySlot>

// Every text-on-background pair the template paints. The gradient buttons run from brand to
// brand-deeper under on-brand; the outline buttons, eyebrows and links set brand-deeper as
// text, and brand carries the underlined word.
export const ATLAS_CONTRAST_PAIRS: readonly ContrastPair[] = [
  { text: 'on-surface', background: 'surface' },
  { text: 'on-surface-muted', background: 'surface' },
  { text: 'on-surface', background: 'surface-muted' },
  { text: 'on-surface-muted', background: 'surface-muted' },
  { text: 'on-surface', background: 'accent' },
  { text: 'brand-deeper', background: 'surface' },
  { text: 'brand-deeper', background: 'surface-muted' },
  { text: 'brand', background: 'surface' },
  { text: 'on-brand', background: 'brand' },
  { text: 'on-brand', background: 'brand-deeper' },
]

type Slot = keyof typeof ATLAS_SLOTS

// Every slot and count in a content object that is outside its limits. Empty means it fits.
export function atlasViolations(content: AtlasContent): SlotViolation[] {
  const { brand, nav, hero, market, glance, pitch, partners, offer, tools, why, steps, faq } =
    content
  const { footer } = content
  const c = slotChecks(ATLAS_SLOTS, ATLAS_COUNTS)
  const titled = (
    section: 'glance.columns' | 'tools.items' | 'why.items' | 'steps.items',
    items: readonly Titled[],
  ) => {
    items.forEach((item, index) => {
      c.text(`${section}[].title`, `${section}[${String(index)}].title`, item.title)
      c.text(`${section}[].body`, `${section}[${String(index)}].body`, item.body)
    })
  }
  const emphasised = (
    path: 'hero.headline' | 'pitch.heading' | 'offer.heading' | 'tools.heading',
    value: Emphasised,
  ) => {
    c.text(`${path}.text` as Slot, `${path}.text`, value.text)
    c.text(`${path}.emphasis` as Slot, `${path}.emphasis`, value.emphasis)
  }

  c.text('brand.name', 'brand.name', brand.name)
  c.text('brand.legalName', 'brand.legalName', brand.legalName)
  c.list('nav.links', 'nav.links', nav.links, (link, path) => {
    c.text('nav.links[].label', `${path}.label`, link.label)
  })
  c.text('nav.menu.label', 'nav.menu.label', nav.menu.label)
  c.list('nav.menu.items', 'nav.menu.items', nav.menu.items, (link, path) => {
    c.text('nav.menu.items[].label', `${path}.label`, link.label)
  })
  c.text('nav.secondary.label', 'nav.secondary.label', nav.secondary.label)
  c.text('nav.cta.label', 'nav.cta.label', nav.cta.label)

  c.text('hero.eyebrow', 'hero.eyebrow', hero.eyebrow)
  emphasised('hero.headline', hero.headline)
  c.text('hero.subhead', 'hero.subhead', hero.subhead)
  c.text('hero.primary.label', 'hero.primary.label', hero.primary.label)
  c.text('hero.secondary.label', 'hero.secondary.label', hero.secondary.label)

  if (market !== null) {
    market.groups.forEach((group, g) => {
      c.text('market.groups[].title', `market.groups[${String(g)}].title`, group.title)
      c.list(
        'market.groups[].rows',
        `market.groups[${String(g)}].rows`,
        group.rows,
        (row, path) => {
          c.text('market.groups[].rows[].name', `${path}.name`, row.name)
          c.text('market.groups[].rows[].price', `${path}.price`, row.price)
        },
      )
    })
    c.text('market.more', 'market.more', market.more)
  }
  titled('glance.columns', glance.columns)
  c.text('glance.more.label', 'glance.more.label', glance.more.label)

  emphasised('pitch.heading', pitch.heading)
  c.text('pitch.lead', 'pitch.lead', pitch.lead)
  if (pitch.exchange !== null) {
    pitch.exchange.rows.forEach((row, index) => {
      const path = `pitch.exchange.rows[${String(index)}]`
      c.text('pitch.exchange.rows[].label', `${path}.label`, row.label)
      c.text('pitch.exchange.rows[].value', `${path}.value`, row.value)
      c.text('pitch.exchange.rows[].unit', `${path}.unit`, row.unit)
    })
    c.text('pitch.exchange.button', 'pitch.exchange.button', pitch.exchange.button)
  }
  c.text('pitch.label', 'pitch.label', pitch.label)
  c.text('pitch.statement', 'pitch.statement', pitch.statement)
  c.text('pitch.action.label', 'pitch.action.label', pitch.action.label)

  if (partners !== null) {
    c.text('partners.heading', 'partners.heading', partners.heading)
    c.text('partners.lead', 'partners.lead', partners.lead)
    c.count('partners.logos', 'partners.logos', partners.logos.length)
  }

  emphasised('offer.heading', offer.heading)
  c.text('offer.body', 'offer.body', offer.body)
  offer.points.forEach((point, index) => {
    c.text('offer.points[]', `offer.points[${String(index)}]`, point)
  })
  c.text('offer.action.label', 'offer.action.label', offer.action.label)

  emphasised('tools.heading', tools.heading)
  titled('tools.items', tools.items)
  c.text('tools.primary.label', 'tools.primary.label', tools.primary.label)
  c.text('tools.secondary.label', 'tools.secondary.label', tools.secondary.label)

  c.text('why.heading', 'why.heading', why.heading)
  titled('why.items', why.items)

  c.text('steps.heading', 'steps.heading', steps.heading)
  titled('steps.items', steps.items)

  c.text('faq.eyebrow', 'faq.eyebrow', faq.eyebrow)
  c.text('faq.heading', 'faq.heading', faq.heading)
  c.list('faq.items', 'faq.items', faq.items, (item, path) => {
    c.text('faq.items[].question', `${path}.question`, item.question)
    c.text('faq.items[].answer', `${path}.answer`, item.answer)
  })

  c.list('footer.columns', 'footer.columns', footer.columns, (column, path) => {
    c.list('footer.columns[]', path, column, (link, linkPath) => {
      c.text('footer.columns[][].label', `${linkPath}.label`, link.label)
    })
  })
  if (footer.newsletter !== null) {
    c.text('footer.newsletter.title', 'footer.newsletter.title', footer.newsletter.title)
    c.text('footer.newsletter.body', 'footer.newsletter.body', footer.newsletter.body)
    c.text(
      'footer.newsletter.placeholder',
      'footer.newsletter.placeholder',
      footer.newsletter.placeholder,
    )
  }
  c.text('footer.note.title', 'footer.note.title', footer.note.title)
  c.text('footer.note.body', 'footer.note.body', footer.note.body)
  c.text('footer.action.label', 'footer.action.label', footer.action.label)
  return c.violations()
}
