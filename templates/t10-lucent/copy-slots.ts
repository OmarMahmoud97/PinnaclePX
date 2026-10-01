import type { SlotImage, TemplateLogo } from '@/lib/copy-slots/assets'
import { slotChecks } from '@/lib/copy-slots/checks'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import type { ContrastPair } from '@/lib/tokens/types'

// Everything Lucent renders comes through this one object. The layout is the owner's own home
// page for their iPhone app (docs/adr/0043-lucent-ported-from-the-owners-app-site.md), rebuilt
// block for block in its order: the glass bar, the hero with its phone, the wide film, the
// overview, the white breakdown card, the reminder over its picture, the three numbered steps,
// the rail of four feature cards, the wide picture under its tint, the pair of tall pictures,
// the statement that rises word by word, the pricing, the questions, the promise card, the
// picture card with its email form, and the dark footer with its big ask.
//
// The source sold an app, so its blocks carry a business's words here: its films are pictures,
// its notification is a notice the business might send, its import steps are the three steps of
// working together, and its four features are four of the business's points. Two pieces need
// facts the brief does not hold: the pricing (prices and what each plan includes) and the
// footer's social links. Both are optional; the copy stage leaves them null, the page is complete
// without them, and the example fills them. A feature card's small badge (the source's "Beta")
// is optional for the same reason.

type LucentLink = Readonly<{ label: string; href: string }>
export type LucentImage = SlotImage

type Two<T> = readonly [T, T]
type Three<T> = readonly [T, T, T]
type Four<T> = readonly [T, T, T, T]

// A feature card in the rail: its small label and optional badge, a heading over two lines, a
// paragraph, a link under it and its picture.
export type LucentFeature = Readonly<{
  label: string
  badge: string | null
  heading: Two<string>
  body: string
  more: LucentLink
  image: LucentImage | null
}>

// A line in a plan's list: a few words set bold, then the rest (either may be empty).
export type LucentPlanItem = Readonly<{ strong: string; text: string }>

export type LucentPricing = Readonly<{
  label: string
  heading: Two<string>
  // The switch over the plans: its two options and the small saving on the second.
  toggle: Readonly<{ monthly: string; yearly: string; saving: string }>
  free: Readonly<{
    name: string
    price: string
    note: string
    items: readonly LucentPlanItem[]
    cta: LucentLink
  }>
  pro: Readonly<{
    flag: string
    name: string
    currency: string
    monthly: number
    yearly: number
    per: Readonly<{ monthly: string; yearly: string }>
    note: Readonly<{ monthly: string; yearly: string }>
    items: readonly LucentPlanItem[]
    cta: LucentLink
  }>
}>

// The networks the footer draws a mark for (sections/icons.tsx), the source's own six.
type LucentNetwork = 'threads' | 'instagram' | 'telegram' | 'x' | 'tiktok' | 'youtube'

export type LucentSocial = Readonly<{ network: LucentNetwork; href: string }>

export type LucentContent = Readonly<{
  brand: Readonly<{ name: string; legalName: string; logo: TemplateLogo }>
  nav: Readonly<{ items: Four<LucentLink>; cta: LucentLink }>
  hero: Readonly<{
    headline: string
    lead: string
    cta: LucentLink
    secondary: LucentLink
    // The picture on the phone's screen.
    image: LucentImage | null
  }>
  promo: Readonly<{ image: LucentImage | null }>
  overview: Readonly<{
    label: string
    heading: Two<string>
    body: string
    ticks: Three<string>
    image: LucentImage | null
  }>
  // The white card: three short lines, the last in the brand's colour.
  breakdown: Readonly<{
    label: string
    heading: Three<string>
    body: string
    image: LucentImage | null
  }>
  reminder: Readonly<{
    label: string
    heading: Two<string>
    body: string
    // The notice that drops onto the picture: its title, its line and its small time.
    notice: Readonly<{ title: string; text: string; time: string }>
    image: LucentImage | null
  }>
  steps: Readonly<{
    label: string
    heading: string
    body: string
    items: Three<string>
    image: LucentImage | null
  }>
  features: Readonly<{ items: Four<LucentFeature> }>
  widgets: Readonly<{
    label: string
    heading: Two<string>
    body: string
    image: LucentImage | null
  }>
  pair: Readonly<{
    label: string
    heading: Two<string>
    body: string
    images: Two<LucentImage | null>
  }>
  // The statement, with two phrases in it set in the brand's colour.
  manifesto: Readonly<{ text: string; emphasis: Two<string> }>
  pricing: LucentPricing | null
  faq: Readonly<{
    label: string
    heading: string
    items: readonly Readonly<{ question: string; answer: string }>[]
  }>
  promise: Readonly<{ lead: string; text: string; badges: readonly string[] }>
  journal: Readonly<{
    // The caption over the picture, one line each, and the line under it.
    lines: Three<string>
    sub: string
    // Where the picture, its caption and its round button lead.
    link: LucentLink
    image: LucentImage | null
    form: Readonly<{
      heading: string
      placeholder: string
      button: string
      terms: string
      // The owner's address the form mails; with none, the button leads to the footer's ask.
      email: string | null
    }>
  }>
  footer: Readonly<{
    // The big ask: the lead word before the brand's name, and the line under them.
    lead: string
    tail: string
    href: string
    // Whether the brand's mark stands for its name's first letter in the big ask, as the source's
    // app icon stood for its S. The pipeline never knows that, so only a page that does sets it.
    markAsInitial: boolean
    // The white pill under it, and the small line under that.
    button: LucentLink
    fine: string
    links: readonly LucentLink[]
    // The source's "Contact us", which copies the owner's address; null without one.
    contact: Readonly<{ label: string; email: string }> | null
    social: readonly LucentSocial[] | null
  }>
}>

// Character limits per text slot, measured from the source's own copy: its hero headline is 50
// characters at 82px in half the page, a section heading's line about 20 at 96 to 104px, the
// breakdown's three lines ten at 84px in half a card, a feature card's lines about 19 at 76px in
// a column of 1.15fr, the statement 213 characters at 60px, the longest answer 316 characters.
// The notice's line is one line of a banner drawn to scale: 40 characters fill it.
export const LUCENT_SLOTS = {
  'brand.name': { min: 2, max: 24 },
  'brand.legalName': { min: 2, max: 60 },
  'nav.items[].label': { min: 3, max: 12 },
  'nav.cta.label': { min: 4, max: 16 },
  'hero.headline': { min: 24, max: 60 },
  'hero.lead': { min: 60, max: 150 },
  'hero.cta.label': { min: 4, max: 20 },
  'hero.secondary.label': { min: 4, max: 20 },
  'overview.label': { min: 3, max: 28 },
  'overview.heading[]': { min: 6, max: 24 },
  'overview.body': { min: 120, max: 260 },
  'overview.ticks[]': { min: 10, max: 44 },
  'breakdown.label': { min: 3, max: 28 },
  'breakdown.heading[]': { min: 4, max: 15 },
  'breakdown.body': { min: 100, max: 230 },
  'reminder.label': { min: 3, max: 28 },
  'reminder.heading[]': { min: 6, max: 26 },
  'reminder.body': { min: 80, max: 180 },
  'reminder.notice.title': { min: 8, max: 28 },
  'reminder.notice.text': { min: 16, max: 40 },
  'reminder.notice.time': { min: 2, max: 10 },
  'steps.label': { min: 3, max: 28 },
  'steps.heading': { min: 20, max: 56 },
  'steps.body': { min: 60, max: 160 },
  'steps.items[]': { min: 6, max: 26 },
  'features.items[].label': { min: 3, max: 24 },
  'features.items[].badge': { min: 2, max: 10 },
  'features.items[].heading[]': { min: 6, max: 22 },
  'features.items[].body': { min: 100, max: 230 },
  'features.items[].more.label': { min: 4, max: 18 },
  'widgets.label': { min: 3, max: 28 },
  'widgets.heading[]': { min: 6, max: 28 },
  'widgets.body': { min: 80, max: 180 },
  'pair.label': { min: 3, max: 28 },
  'pair.heading[]': { min: 6, max: 24 },
  'pair.body': { min: 80, max: 180 },
  'manifesto.text': { min: 150, max: 260 },
  'manifesto.emphasis[]': { min: 0, max: 24 },
  'faq.label': { min: 2, max: 20 },
  'faq.heading': { min: 6, max: 30 },
  'faq.items[].question': { min: 12, max: 60 },
  'faq.items[].answer': { min: 40, max: 320 },
  'promise.lead': { min: 6, max: 30 },
  'promise.text': { min: 30, max: 90 },
  'promise.badges[]': { min: 4, max: 24 },
  'journal.lines[]': { min: 2, max: 14 },
  'journal.sub': { min: 30, max: 90 },
  'journal.link.label': { min: 6, max: 40 },
  'journal.form.heading': { min: 8, max: 30 },
  'journal.form.placeholder': { min: 4, max: 24 },
  'journal.form.button': { min: 3, max: 14 },
  'journal.form.terms': { min: 30, max: 120 },
  'footer.lead': { min: 2, max: 14 },
  'footer.tail': { min: 4, max: 20 },
  'footer.button.label': { min: 4, max: 26 },
  'footer.fine': { min: 10, max: 60 },
  'footer.links[].label': { min: 3, max: 20 },
  'footer.contact.label': { min: 4, max: 20 },
} as const satisfies Record<string, CopySlot>

// How many of each list the layout holds: the questions three to five, the promise's pills two
// to four in one row, the footer's links up to four beside the copyright, its marks up to six.
const LUCENT_COUNTS = {
  'faq.items': { min: 3, max: 5 },
  'promise.badges': { min: 2, max: 4 },
  'footer.links': { min: 0, max: 4 },
  'footer.social': { min: 1, max: 6 },
  'pricing.free.items': { min: 3, max: 8 },
  'pricing.pro.items': { min: 3, max: 9 },
} as const satisfies Record<string, CopySlot>

// Every text-on-background pair the template paints. Text sits on the page and on the white
// cards; the brand's colour carries the buttons' text, and is itself the coloured words, the
// links and the marks on the page and on the cards; the footer and the dark feature card are the
// scrim with its own text on it. The brand's colour on the scrim (the footer's big ask, the dark
// card's heading) is not a pair: one colour cannot be solved against both the page and the scrim,
// so the stylesheet lifts it on the dark instead (--lc-orange-night).
export const LUCENT_CONTRAST_PAIRS: readonly ContrastPair[] = [
  { text: 'on-surface', background: 'surface' },
  { text: 'on-surface-muted', background: 'surface' },
  { text: 'on-surface', background: 'accent' },
  { text: 'on-surface-muted', background: 'accent' },
  { text: 'on-brand', background: 'brand-deeper' },
  { text: 'brand-deeper', background: 'surface' },
  { text: 'brand-deeper', background: 'accent' },
  { text: 'on-scrim', background: 'scrim' },
]

// Every slot and count in a content object that is outside its limits. Empty means it fits.
export function lucentViolations(content: LucentContent): SlotViolation[] {
  const { brand, nav, hero, overview, breakdown, reminder, steps, features } = content
  const { widgets, pair, manifesto, pricing, faq, promise, journal, footer } = content
  const c = slotChecks(LUCENT_SLOTS, LUCENT_COUNTS)
  const lines = (slot: keyof typeof LUCENT_SLOTS, path: string, items: readonly string[]) => {
    items.forEach((line, index) => {
      c.text(slot, `${path}[${String(index)}]`, line)
    })
  }

  c.text('brand.name', 'brand.name', brand.name)
  c.text('brand.legalName', 'brand.legalName', brand.legalName)
  nav.items.forEach((item, index) => {
    c.text('nav.items[].label', `nav.items[${String(index)}].label`, item.label)
  })
  c.text('nav.cta.label', 'nav.cta.label', nav.cta.label)

  c.text('hero.headline', 'hero.headline', hero.headline)
  c.text('hero.lead', 'hero.lead', hero.lead)
  c.text('hero.cta.label', 'hero.cta.label', hero.cta.label)
  c.text('hero.secondary.label', 'hero.secondary.label', hero.secondary.label)

  c.text('overview.label', 'overview.label', overview.label)
  lines('overview.heading[]', 'overview.heading', overview.heading)
  c.text('overview.body', 'overview.body', overview.body)
  lines('overview.ticks[]', 'overview.ticks', overview.ticks)

  c.text('breakdown.label', 'breakdown.label', breakdown.label)
  lines('breakdown.heading[]', 'breakdown.heading', breakdown.heading)
  c.text('breakdown.body', 'breakdown.body', breakdown.body)

  c.text('reminder.label', 'reminder.label', reminder.label)
  lines('reminder.heading[]', 'reminder.heading', reminder.heading)
  c.text('reminder.body', 'reminder.body', reminder.body)
  c.text('reminder.notice.title', 'reminder.notice.title', reminder.notice.title)
  c.text('reminder.notice.text', 'reminder.notice.text', reminder.notice.text)
  c.text('reminder.notice.time', 'reminder.notice.time', reminder.notice.time)

  c.text('steps.label', 'steps.label', steps.label)
  c.text('steps.heading', 'steps.heading', steps.heading)
  c.text('steps.body', 'steps.body', steps.body)
  lines('steps.items[]', 'steps.items', steps.items)

  features.items.forEach((item, index) => {
    const path = `features.items[${String(index)}]`
    c.text('features.items[].label', `${path}.label`, item.label)
    if (item.badge !== null) c.text('features.items[].badge', `${path}.badge`, item.badge)
    lines('features.items[].heading[]', `${path}.heading`, item.heading)
    c.text('features.items[].body', `${path}.body`, item.body)
    c.text('features.items[].more.label', `${path}.more.label`, item.more.label)
  })

  c.text('widgets.label', 'widgets.label', widgets.label)
  lines('widgets.heading[]', 'widgets.heading', widgets.heading)
  c.text('widgets.body', 'widgets.body', widgets.body)

  c.text('pair.label', 'pair.label', pair.label)
  lines('pair.heading[]', 'pair.heading', pair.heading)
  c.text('pair.body', 'pair.body', pair.body)

  c.text('manifesto.text', 'manifesto.text', manifesto.text)
  lines('manifesto.emphasis[]', 'manifesto.emphasis', manifesto.emphasis)

  if (pricing !== null) {
    c.count('pricing.free.items', 'pricing.free.items', pricing.free.items.length)
    c.count('pricing.pro.items', 'pricing.pro.items', pricing.pro.items.length)
  }

  c.text('faq.label', 'faq.label', faq.label)
  c.text('faq.heading', 'faq.heading', faq.heading)
  c.list('faq.items', 'faq.items', faq.items, (item, path) => {
    c.text('faq.items[].question', `${path}.question`, item.question)
    c.text('faq.items[].answer', `${path}.answer`, item.answer)
  })

  c.text('promise.lead', 'promise.lead', promise.lead)
  c.text('promise.text', 'promise.text', promise.text)
  c.list('promise.badges', 'promise.badges', promise.badges, (badge, path) => {
    c.text('promise.badges[]', path, badge)
  })

  lines('journal.lines[]', 'journal.lines', journal.lines)
  c.text('journal.sub', 'journal.sub', journal.sub)
  c.text('journal.link.label', 'journal.link.label', journal.link.label)
  c.text('journal.form.heading', 'journal.form.heading', journal.form.heading)
  c.text('journal.form.placeholder', 'journal.form.placeholder', journal.form.placeholder)
  c.text('journal.form.button', 'journal.form.button', journal.form.button)
  c.text('journal.form.terms', 'journal.form.terms', journal.form.terms)

  c.text('footer.lead', 'footer.lead', footer.lead)
  c.text('footer.tail', 'footer.tail', footer.tail)
  c.text('footer.button.label', 'footer.button.label', footer.button.label)
  c.text('footer.fine', 'footer.fine', footer.fine)
  c.list('footer.links', 'footer.links', footer.links, (link, path) => {
    c.text('footer.links[].label', `${path}.label`, link.label)
  })
  if (footer.contact !== null) {
    c.text('footer.contact.label', 'footer.contact.label', footer.contact.label)
  }
  if (footer.social !== null) c.count('footer.social', 'footer.social', footer.social.length)
  return c.violations()
}
