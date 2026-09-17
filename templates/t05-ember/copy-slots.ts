import type { SlotImage, TemplateLogo } from '@/lib/copy-slots/assets'
import { slotChecks } from '@/lib/copy-slots/checks'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import type { ContrastPair } from '@/lib/tokens/types'

// Everything Ember renders comes through this one object. The layout is PrebuiltUI's Restro
// restaurant template (MIT, https://github.com/prebuiltui/prebuiltui, the repository's
// templates/restaurant-website-template, ported from its published build at
// restro.prebuiltui.com since the repository holds only its README), every section in its
// order: the header and its phone sheet, the hero over a photograph, About with its ornamented
// eyebrow and location card, three numbered points, the pictured grid of dishes, three icon
// features beside a portrait, the three-step booking process beside a testimonial, the card of
// opening times on a photograph, Testimonials, the FAQ, the closing band and the footer.
//
// Six pieces need facts the brief does not hold: the hero's rating line with its guests, the
// location card, the booking testimonial, the opening times, the testimonials and the social
// links. They are optional here. The copy stage leaves them null and the page is complete
// without them (the card on the photograph carries a sentence in place of the rows); the
// example fills them from the source's own copy so the layout can be reviewed whole, and a
// form that collects them one day fills them for real.

type EmberLink = Readonly<{ label: string; href: string }>
export type EmberImage = SlotImage

type Titled = Readonly<{ title: string; body: string }>

export type Three<T> = readonly [T, T, T]

// Every section under the hero opens with the source's coloured uppercase eyebrow over its
// heading.
type Headed = Readonly<{ eyebrow: string; heading: string }>

export type SocialNetwork = 'x' | 'youtube' | 'instagram'

export type EmberContent = Readonly<{
  brand: Readonly<{ name: string; legalName: string; logo: TemplateLogo }>
  nav: Readonly<{ links: readonly EmberLink[]; cta: EmberLink }>
  hero: Readonly<{
    eyebrow: string
    headline: string
    subhead: string
    cta: EmberLink
    // The photograph behind the whole first screen.
    background: EmberImage | null
    // The source's row of guests' portraits beside five stars and a rating line.
    proof: Readonly<{ avatars: readonly EmberImage[]; line: string }> | null
  }>
  about: Headed &
    Readonly<{
      body: string
      image: EmberImage | null
      // The source's small coloured card naming the place with a link to a map.
      location: Readonly<{ image: EmberImage | null; name: string; link: EmberLink }> | null
    }>
  // The source's three numbered points under About.
  stats: Three<Titled>
  // The source's signature dishes: a picture over a name and a price. Here the things they
  // offer, each with a short note in place of the price.
  dishes: Headed &
    Readonly<{
      items: readonly Readonly<{ image: EmberImage | null; title: string; note: string }>[]
    }>
  features: Headed & Readonly<{ items: Three<Titled>; image: EmberImage | null }>
  booking: Headed &
    Readonly<{
      testimonial: Readonly<{ quote: string; name: string; image: EmberImage | null }> | null
      steps: Three<Titled>
    }>
  // The source's card of opening times over a photograph. Without the rows the card carries a
  // sentence, then the button as before.
  timing: Readonly<{
    image: EmberImage | null
    title: string
    rows: readonly Readonly<{ label: string; value: string; closed: boolean }>[] | null
    body: string
    cta: EmberLink
  }>
  testimonials:
    | (Headed &
        Readonly<{
          items: readonly Readonly<{
            quote: string
            name: string
            place: string
            image: EmberImage | null
          }>[]
        }>)
    | null
  faq: Headed & Readonly<{ items: readonly Readonly<{ question: string; answer: string }>[] }>
  // The closing band; the pictures at its corners are the first four dishes'.
  cta: Readonly<{ heading: string; body: string; button: EmberLink }>
  footer: Readonly<{
    description: string
    socials: readonly Readonly<{ network: SocialNetwork; href: string }>[] | null
    groups: readonly Readonly<{ heading: string; links: readonly EmberLink[] }>[]
    // The source's Get in Touch column: a mail link and a phone link, each shown when known.
    contact: Readonly<{ heading: string; email: string | null; phone: string | null }>
  }>
}>

// Character limits per text slot, measured from the source's own copy: the hero's headline is
// text-6xl in a 768px column, About's paragraph and the feature bodies sit in 384px columns,
// the numbered points in 288px ones, and the closing band's paragraph in 384px.
export const EMBER_SLOTS = {
  'brand.name': { min: 2, max: 24 },
  'brand.legalName': { min: 2, max: 60 },
  'nav.links[].label': { min: 3, max: 12 },
  'nav.cta.label': { min: 4, max: 18 },
  'hero.eyebrow': { min: 8, max: 40 },
  'hero.headline': { min: 18, max: 60 },
  'hero.subhead': { min: 60, max: 160 },
  'hero.cta.label': { min: 4, max: 18 },
  'hero.proof.line': { min: 6, max: 40 },
  'about.eyebrow': { min: 6, max: 30 },
  'about.heading': { min: 16, max: 60 },
  'about.body': { min: 60, max: 170 },
  'about.location.name': { min: 4, max: 30 },
  'about.location.link.label': { min: 4, max: 20 },
  'stats[].title': { min: 6, max: 28 },
  'stats[].body': { min: 50, max: 110 },
  'dishes.eyebrow': { min: 6, max: 36 },
  'dishes.heading': { min: 16, max: 50 },
  'dishes.items[].title': { min: 4, max: 28 },
  'dishes.items[].note': { min: 2, max: 20 },
  'features.eyebrow': { min: 6, max: 36 },
  'features.heading': { min: 16, max: 50 },
  'features.items[].title': { min: 6, max: 30 },
  'features.items[].body': { min: 50, max: 120 },
  'booking.eyebrow': { min: 6, max: 36 },
  'booking.heading': { min: 16, max: 60 },
  'booking.testimonial.quote': { min: 30, max: 160 },
  'booking.testimonial.name': { min: 3, max: 30 },
  'booking.steps[].title': { min: 6, max: 30 },
  'booking.steps[].body': { min: 50, max: 120 },
  'timing.title': { min: 4, max: 30 },
  'timing.rows[].label': { min: 2, max: 14 },
  'timing.rows[].value': { min: 2, max: 16 },
  'timing.body': { min: 40, max: 180 },
  'timing.cta.label': { min: 4, max: 18 },
  'testimonials.eyebrow': { min: 6, max: 36 },
  'testimonials.heading': { min: 10, max: 50 },
  'testimonials.items[].quote': { min: 40, max: 160 },
  'testimonials.items[].name': { min: 3, max: 30 },
  'testimonials.items[].place': { min: 3, max: 30 },
  'faq.eyebrow': { min: 2, max: 30 },
  'faq.heading': { min: 10, max: 50 },
  'faq.items[].question': { min: 10, max: 70 },
  'faq.items[].answer': { min: 40, max: 200 },
  'cta.heading': { min: 16, max: 60 },
  'cta.body': { min: 40, max: 130 },
  'cta.button.label': { min: 4, max: 22 },
  'footer.description': { min: 40, max: 140 },
  'footer.groups[].heading': { min: 3, max: 18 },
  'footer.groups[].links[].label': { min: 3, max: 20 },
  'footer.contact.heading': { min: 3, max: 18 },
} as const satisfies Record<string, CopySlot>

// How many of each list the layout holds. The dishes grid is two columns then four, so four
// or eight fill it; the FAQ and the testimonials wrap.
const EMBER_COUNTS = {
  'nav.links': { min: 2, max: 4 },
  'hero.proof.avatars': { min: 1, max: 4 },
  'dishes.items': { min: 4, max: 8 },
  'timing.rows': { min: 1, max: 7 },
  'testimonials.items': { min: 3, max: 6 },
  'faq.items': { min: 3, max: 6 },
  'footer.socials': { min: 1, max: 3 },
  'footer.groups': { min: 1, max: 3 },
  'footer.groups[].links': { min: 2, max: 5 },
} as const satisfies Record<string, CopySlot>

// Every text-on-background pair the template paints. Muted text also sits on the quieter
// surface where a card is hovered; the coloured eyebrows and step numbers are brand-deeper on
// the page, the hero's eyebrow the deeper shade; the buttons and the location card carry
// on-brand on brand-deeper.
export const EMBER_CONTRAST_PAIRS: readonly ContrastPair[] = [
  { text: 'on-surface', background: 'surface' },
  { text: 'on-surface-muted', background: 'surface' },
  { text: 'on-surface-muted', background: 'surface-muted' },
  { text: 'brand-deeper', background: 'surface' },
  { text: 'brand-deepest', background: 'surface' },
  { text: 'on-brand', background: 'brand-deeper' },
]

type Slot = keyof typeof EMBER_SLOTS

// Every slot and count in a content object that is outside its limits. Empty means it fits.
export function emberViolations(content: EmberContent): SlotViolation[] {
  const { brand, nav, hero, about, stats, dishes, features, booking, timing, faq, cta, footer } =
    content
  const { testimonials } = content
  const c = slotChecks(EMBER_SLOTS, EMBER_COUNTS)
  const headed = (
    section: 'about' | 'dishes' | 'features' | 'booking' | 'testimonials' | 'faq',
    value: Headed,
  ) => {
    c.text(`${section}.eyebrow`, `${section}.eyebrow`, value.eyebrow)
    c.text(`${section}.heading`, `${section}.heading`, value.heading)
  }
  const titled = (path: 'stats' | 'features.items' | 'booking.steps', items: Three<Titled>) => {
    items.forEach((item, index) => {
      c.text(`${path}[].title` as Slot, `${path}[${String(index)}].title`, item.title)
      c.text(`${path}[].body` as Slot, `${path}[${String(index)}].body`, item.body)
    })
  }

  c.text('brand.name', 'brand.name', brand.name)
  c.text('brand.legalName', 'brand.legalName', brand.legalName)
  c.list('nav.links', 'nav.links', nav.links, (link, path) => {
    c.text('nav.links[].label', `${path}.label`, link.label)
  })
  c.text('nav.cta.label', 'nav.cta.label', nav.cta.label)

  c.text('hero.eyebrow', 'hero.eyebrow', hero.eyebrow)
  c.text('hero.headline', 'hero.headline', hero.headline)
  c.text('hero.subhead', 'hero.subhead', hero.subhead)
  c.text('hero.cta.label', 'hero.cta.label', hero.cta.label)
  if (hero.proof !== null) {
    c.count('hero.proof.avatars', 'hero.proof.avatars', hero.proof.avatars.length)
    c.text('hero.proof.line', 'hero.proof.line', hero.proof.line)
  }

  headed('about', about)
  c.text('about.body', 'about.body', about.body)
  if (about.location !== null) {
    c.text('about.location.name', 'about.location.name', about.location.name)
    c.text('about.location.link.label', 'about.location.link.label', about.location.link.label)
  }

  titled('stats', stats)

  headed('dishes', dishes)
  c.list('dishes.items', 'dishes.items', dishes.items, (item, path) => {
    c.text('dishes.items[].title', `${path}.title`, item.title)
    c.text('dishes.items[].note', `${path}.note`, item.note)
  })

  headed('features', features)
  titled('features.items', features.items)

  headed('booking', booking)
  if (booking.testimonial !== null) {
    c.text('booking.testimonial.quote', 'booking.testimonial.quote', booking.testimonial.quote)
    c.text('booking.testimonial.name', 'booking.testimonial.name', booking.testimonial.name)
  }
  titled('booking.steps', booking.steps)

  c.text('timing.title', 'timing.title', timing.title)
  if (timing.rows !== null) {
    c.list('timing.rows', 'timing.rows', timing.rows, (row, path) => {
      c.text('timing.rows[].label', `${path}.label`, row.label)
      c.text('timing.rows[].value', `${path}.value`, row.value)
    })
  }
  c.text('timing.body', 'timing.body', timing.body)
  c.text('timing.cta.label', 'timing.cta.label', timing.cta.label)

  if (testimonials !== null) {
    headed('testimonials', testimonials)
    c.list('testimonials.items', 'testimonials.items', testimonials.items, (item, path) => {
      c.text('testimonials.items[].quote', `${path}.quote`, item.quote)
      c.text('testimonials.items[].name', `${path}.name`, item.name)
      c.text('testimonials.items[].place', `${path}.place`, item.place)
    })
  }

  headed('faq', faq)
  c.list('faq.items', 'faq.items', faq.items, (item, path) => {
    c.text('faq.items[].question', `${path}.question`, item.question)
    c.text('faq.items[].answer', `${path}.answer`, item.answer)
  })

  c.text('cta.heading', 'cta.heading', cta.heading)
  c.text('cta.body', 'cta.body', cta.body)
  c.text('cta.button.label', 'cta.button.label', cta.button.label)

  c.text('footer.description', 'footer.description', footer.description)
  if (footer.socials !== null) {
    c.count('footer.socials', 'footer.socials', footer.socials.length)
  }
  c.list('footer.groups', 'footer.groups', footer.groups, (group, path) => {
    c.text('footer.groups[].heading', `${path}.heading`, group.heading)
    c.list('footer.groups[].links', `${path}.links`, group.links, (link, linkPath) => {
      c.text('footer.groups[].links[].label', `${linkPath}.label`, link.label)
    })
  })
  c.text('footer.contact.heading', 'footer.contact.heading', footer.contact.heading)
  return c.violations()
}
