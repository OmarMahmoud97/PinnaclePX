import type { SlotImage, TemplateLogo } from '@/lib/copy-slots/assets'
import { slotChecks } from '@/lib/copy-slots/checks'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import type { ContrastPair } from '@/lib/tokens/types'

// Everything Inegro renders comes through this one object. The layout is after the home page of
// a site the owner's friend built on WordPress for a client of his and gave the owner to use
// (docs/adr/0041-inegro-ported-from-a-friends-site.md), rebuilt block for block in its order:
// the header with its two dropdown panels, the hero over the coloured ribbons, three glass
// cards over photographs whose words light up as the page scrolls, the list of names that opens
// one at a time onto a picture card, the quote cards that travel along two ribbons, the ring
// that cycles through three lines, the three gradient boxes, the email form, the gradient band
// with the big button and the white footer.
//
// The source was a podcast's site, so its blocks carry a business's words here: the list of
// guests is the list of services, the quotes are three principles and the company's own
// statement, the ring's figures are the three steps of working together (numbered, so nothing
// is claimed), and the resources are the three value propositions. The one piece that needs
// facts the brief does not hold is the band's row of social links: it is optional, the copy
// stage leaves it null and the band is complete without it; the example fills it.

export type InegroLink = Readonly<{ label: string; href: string }>
export type InegroImage = SlotImage
// A heading with a phrase set in the brand colour, as the source set its first word.
export type Emphasised = Readonly<{ text: string; emphasis: string }>

type Three<T> = readonly [T, T, T]

type InegroNavItem = Readonly<{
  label: string
  href: string
  // A dropdown's links. Empty for a plain link.
  children: readonly InegroLink[]
}>

export type InegroService = Readonly<{
  // The big name in the list, and the line under it when it is open.
  name: string
  line: string
  // The picture card's title and the small line under it.
  title: string
  tagline: string
  image: InegroImage | null
}>

// A card on the ribbons: a sentence, a name in the display face and a few words after it.
export type InegroNote = Readonly<{ text: string; name: string; role: string }>

export type InegroOffer = Readonly<{ tag: string; title: string; body: string }>

// The networks the band draws a mark for (sections/icons.tsx).
type InegroNetwork =
  'instagram' | 'linkedin' | 'x' | 'substack' | 'facebook' | 'youtube' | 'spotify' | 'bluesky'

export type InegroSocial = Readonly<{ network: InegroNetwork; href: string }>

// A glass card over a photograph: the small label, the paragraph that lights up, its button.
export type InegroCard = Readonly<{
  label: string
  text: string
  cta: InegroLink
  image: InegroImage | null
}>

export type InegroContent = Readonly<{
  brand: Readonly<{ name: string; legalName: string; logo: TemplateLogo }>
  nav: Readonly<{ items: readonly InegroNavItem[]; cta: InegroLink }>
  hero: Readonly<{
    headline: Emphasised
    subhead: string
    // The small line over the row of pill links.
    linksLabel: string
    links: readonly InegroLink[]
  }>
  intro: InegroCard
  services: Readonly<{
    label: string
    cta: InegroLink
    // The pill on every picture card.
    itemCta: InegroLink
    items: readonly InegroService[]
  }>
  notes: Readonly<{
    items: readonly InegroNote[]
    // The last card, which stays: the company's statement over its own name.
    statement: InegroNote
  }>
  process: Readonly<{
    label: string
    body: string
    cta: InegroLink
    // The ring's three lines, each under its number.
    steps: readonly string[]
  }>
  approach: InegroCard
  offers: Readonly<{
    label: string
    lead: string
    cta: InegroLink
    itemCta: InegroLink
    items: Three<InegroOffer>
  }>
  mission: InegroCard
  newsletter: Readonly<{
    heading: string
    placeholder: string
    button: string
    // The owner's address the form mails; with none, the button leads to the band.
    email: string | null
  }>
  closing: Readonly<{
    text: string
    secondary: InegroLink
    cta: InegroLink
    social: readonly InegroSocial[] | null
  }>
  footer: Readonly<{ links: readonly InegroLink[] }>
}>

// Character limits per text slot, measured from the source's own copy: its headline sits in a
// 575px column at 60px, a name in the list is one line at 44px under a 48px clip, a card's
// title is set at 25px right-aligned in 40% of a 470px card, the quotes run in a 284px card, the
// ring's lines sit under their number in 40% of the ring, and the three long paragraphs light
// up letter by letter in cards that grow to fit them.
export const INEGRO_SLOTS = {
  'brand.name': { min: 2, max: 24 },
  'brand.legalName': { min: 2, max: 60 },
  'nav.items[].label': { min: 3, max: 14 },
  'nav.cta.label': { min: 4, max: 16 },
  'hero.headline.text': { min: 20, max: 52 },
  'hero.headline.emphasis': { min: 0, max: 20 },
  'hero.subhead': { min: 50, max: 110 },
  'hero.linksLabel': { min: 8, max: 30 },
  'hero.links[].label': { min: 4, max: 16 },
  'intro.label': { min: 4, max: 20 },
  'intro.text': { min: 180, max: 560 },
  'intro.cta.label': { min: 6, max: 24 },
  'services.label': { min: 4, max: 20 },
  'services.cta.label': { min: 6, max: 22 },
  'services.itemCta.label': { min: 4, max: 14 },
  'services.items[].name': { min: 4, max: 24 },
  'services.items[].line': { min: 30, max: 80 },
  'services.items[].title': { min: 8, max: 34 },
  'services.items[].tagline': { min: 8, max: 30 },
  'notes.items[].text': { min: 60, max: 170 },
  'notes.items[].name': { min: 4, max: 24 },
  'notes.items[].role': { min: 4, max: 40 },
  'notes.statement.text': { min: 80, max: 200 },
  'notes.statement.name': { min: 2, max: 24 },
  'notes.statement.role': { min: 4, max: 40 },
  'process.label': { min: 8, max: 32 },
  'process.body': { min: 150, max: 360 },
  'process.cta.label': { min: 6, max: 24 },
  'process.steps[]': { min: 8, max: 34 },
  'approach.label': { min: 4, max: 20 },
  'approach.text': { min: 150, max: 400 },
  'approach.cta.label': { min: 6, max: 22 },
  'offers.label': { min: 4, max: 20 },
  'offers.lead': { min: 50, max: 120 },
  'offers.cta.label': { min: 6, max: 22 },
  'offers.itemCta.label': { min: 4, max: 14 },
  'offers.items[].tag': { min: 4, max: 18 },
  'offers.items[].title': { min: 10, max: 56 },
  'offers.items[].body': { min: 50, max: 120 },
  'mission.label': { min: 4, max: 20 },
  'mission.text': { min: 150, max: 420 },
  'mission.cta.label': { min: 6, max: 22 },
  'newsletter.heading': { min: 12, max: 40 },
  'newsletter.placeholder': { min: 4, max: 24 },
  'newsletter.button': { min: 4, max: 14 },
  'closing.text': { min: 80, max: 220 },
  'closing.secondary.label': { min: 6, max: 24 },
  'closing.cta.label': { min: 6, max: 20 },
  'footer.links[].label': { min: 3, max: 20 },
} as const satisfies Record<string, CopySlot>

// How many of each list the layout holds. The bar has four links, the hero a row of up to four
// pills, the list three to six names, the ribbons three cards before the last, the ring three
// lines, and the band a row of icons.
const INEGRO_COUNTS = {
  'nav.items': { min: 4, max: 4 },
  'hero.links': { min: 2, max: 4 },
  'services.items': { min: 3, max: 6 },
  'notes.items': { min: 3, max: 3 },
  'process.steps': { min: 3, max: 3 },
  'offers.items': { min: 3, max: 3 },
  'closing.social': { min: 1, max: 8 },
  'footer.links': { min: 0, max: 3 },
} as const satisfies Record<string, CopySlot>

// Every text-on-background pair the template paints. Text sits on the page; the headline's
// emphasis is the brand's fill; the coloured buttons carry on-brand on the fill; the white
// buttons, the dropdown panel, the band's words and the footer are the page inverted, the
// surface on the ink; the names not open in the list are the muted ink.
export const INEGRO_CONTRAST_PAIRS: readonly ContrastPair[] = [
  { text: 'on-surface', background: 'surface' },
  { text: 'on-surface-muted', background: 'surface' },
  { text: 'brand-deeper', background: 'surface' },
  { text: 'on-brand', background: 'brand-deeper' },
  { text: 'surface', background: 'on-surface' },
]

// Every slot and count in a content object that is outside its limits. Empty means it fits.
export function inegroViolations(content: InegroContent): SlotViolation[] {
  const { brand, nav, hero, intro, services, notes, process, approach, offers, mission } = content
  const { newsletter, closing, footer } = content
  const c = slotChecks(INEGRO_SLOTS, INEGRO_COUNTS)

  c.text('brand.name', 'brand.name', brand.name)
  c.text('brand.legalName', 'brand.legalName', brand.legalName)
  c.list('nav.items', 'nav.items', nav.items, (item, path) => {
    c.text('nav.items[].label', `${path}.label`, item.label)
  })
  c.text('nav.cta.label', 'nav.cta.label', nav.cta.label)

  c.text('hero.headline.text', 'hero.headline.text', hero.headline.text)
  c.text('hero.headline.emphasis', 'hero.headline.emphasis', hero.headline.emphasis)
  c.text('hero.subhead', 'hero.subhead', hero.subhead)
  c.text('hero.linksLabel', 'hero.linksLabel', hero.linksLabel)
  c.list('hero.links', 'hero.links', hero.links, (link, path) => {
    c.text('hero.links[].label', `${path}.label`, link.label)
  })

  c.text('intro.label', 'intro.label', intro.label)
  c.text('intro.text', 'intro.text', intro.text)
  c.text('intro.cta.label', 'intro.cta.label', intro.cta.label)

  c.text('services.label', 'services.label', services.label)
  c.text('services.cta.label', 'services.cta.label', services.cta.label)
  c.text('services.itemCta.label', 'services.itemCta.label', services.itemCta.label)
  c.list('services.items', 'services.items', services.items, (item, path) => {
    c.text('services.items[].name', `${path}.name`, item.name)
    c.text('services.items[].line', `${path}.line`, item.line)
    c.text('services.items[].title', `${path}.title`, item.title)
    c.text('services.items[].tagline', `${path}.tagline`, item.tagline)
  })

  c.list('notes.items', 'notes.items', notes.items, (note, path) => {
    c.text('notes.items[].text', `${path}.text`, note.text)
    c.text('notes.items[].name', `${path}.name`, note.name)
    c.text('notes.items[].role', `${path}.role`, note.role)
  })
  c.text('notes.statement.text', 'notes.statement.text', notes.statement.text)
  c.text('notes.statement.name', 'notes.statement.name', notes.statement.name)
  c.text('notes.statement.role', 'notes.statement.role', notes.statement.role)

  c.text('process.label', 'process.label', process.label)
  c.text('process.body', 'process.body', process.body)
  c.text('process.cta.label', 'process.cta.label', process.cta.label)
  c.list('process.steps', 'process.steps', process.steps, (step, path) => {
    c.text('process.steps[]', path, step)
  })

  c.text('approach.label', 'approach.label', approach.label)
  c.text('approach.text', 'approach.text', approach.text)
  c.text('approach.cta.label', 'approach.cta.label', approach.cta.label)

  c.text('offers.label', 'offers.label', offers.label)
  c.text('offers.lead', 'offers.lead', offers.lead)
  c.text('offers.cta.label', 'offers.cta.label', offers.cta.label)
  c.text('offers.itemCta.label', 'offers.itemCta.label', offers.itemCta.label)
  c.list('offers.items', 'offers.items', offers.items, (item, path) => {
    c.text('offers.items[].tag', `${path}.tag`, item.tag)
    c.text('offers.items[].title', `${path}.title`, item.title)
    c.text('offers.items[].body', `${path}.body`, item.body)
  })

  c.text('mission.label', 'mission.label', mission.label)
  c.text('mission.text', 'mission.text', mission.text)
  c.text('mission.cta.label', 'mission.cta.label', mission.cta.label)

  c.text('newsletter.heading', 'newsletter.heading', newsletter.heading)
  c.text('newsletter.placeholder', 'newsletter.placeholder', newsletter.placeholder)
  c.text('newsletter.button', 'newsletter.button', newsletter.button)

  c.text('closing.text', 'closing.text', closing.text)
  c.text('closing.secondary.label', 'closing.secondary.label', closing.secondary.label)
  c.text('closing.cta.label', 'closing.cta.label', closing.cta.label)
  if (closing.social !== null) c.count('closing.social', 'closing.social', closing.social.length)

  c.list('footer.links', 'footer.links', footer.links, (link, path) => {
    c.text('footer.links[].label', `${path}.label`, link.label)
  })
  return c.violations()
}
