import type { SlotImage, TemplateLogo } from '@/lib/copy-slots/assets'
import { slotChecks } from '@/lib/copy-slots/checks'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import type { ContrastPair } from '@/lib/tokens/types'

// Everything Vector renders comes through this one object. The layout is after React Bits Pro's
// Agency template, rebuilt here from its published demo at rbp-agency-template.vercel.app
// (THIRD_PARTY_NOTICES.md), every block in its order: the floating bar with its
// menu pill, the hero over the wave background with a three-line headline, the marquee and
// the three project cards, the pinned services heading and the flowing menu, About with its
// wide picture, the bento of social proof, the FAQ and the sticky footer.
//
// Two pieces need facts the brief does not hold: the whole social-proof bento (a quote, three
// figures, two company stories) and the footer's places and social links. They are optional
// here. The copy stage leaves them null and the page is complete without them; the example
// fills them from the source's own copy so the layout can be reviewed whole. The footer's
// big address is the owner's email when it is known.

type VectorLink = Readonly<{ label: string; href: string }>
export type VectorImage = SlotImage

type Two<T> = readonly [T, T]

export type VectorContent = Readonly<{
  brand: Readonly<{ name: string; legalName: string; logo: TemplateLogo }>
  // The menu pill's links; each names the block it leads to, so the pill can show where the
  // page is.
  nav: Readonly<{ links: readonly Readonly<{ label: string; href: string; section: string }>[] }>
  hero: Readonly<{
    // Two or three lines, each rising out of its own clipped row; the last in the serif.
    headline: readonly string[]
    subhead: string
    scrollHint: string
  }>
  projects: Readonly<{
    // The marquee: a word in the sans and a word in the thin serif, repeated.
    marquee: Readonly<{ text: string; accent: string }>
    items: readonly Readonly<{
      titleUp: string
      titleDown: string
      description: string
      image: VectorImage | null
    }>[]
  }>
  services: Readonly<{ heading: string; items: readonly string[] }>
  about: Readonly<{ image: VectorImage | null; statement: string; cta: VectorLink }>
  proof: Readonly<{
    heading: string
    cta: VectorLink
    images: Two<VectorImage | null>
    quote: Readonly<{ text: string; name: string; role: string; company: string }>
    stats: Two<Readonly<{ value: string; label: string; company: string }>>
    rating: Readonly<{ value: string; lines: readonly string[]; note: string }>
    story: Readonly<{ text: string; company: string }>
  }> | null
  faq: Readonly<{
    heading: readonly string[]
    items: readonly Readonly<{ question: string; answer: string }>[]
  }>
  footer: Readonly<{
    // The giant address, the owner's email when it is known, and the button under it.
    email: string | null
    cta: VectorLink
    tagline: string
    places: Readonly<{
      heading: string
      entries: readonly Readonly<{ title: string; lines: readonly string[] }>[]
    }> | null
    services: Readonly<{ heading: string; items: readonly string[] }>
    navigation: Readonly<{ heading: string; links: readonly VectorLink[] }>
    social: Readonly<{ heading: string; links: readonly VectorLink[] }> | null
    bottomLinks: readonly VectorLink[]
    credit: string
  }>
}>

// Character limits per text slot, measured from the source's own copy: the headline's lines
// are set at up to 12rem in clipped rows, the subhead in a 448px to 576px column, a project's
// line in a 512px one, the services sentence at up to 7rem across the screen, About's sentence
// in an 896px one, and a question's answer opens to any height.
export const VECTOR_SLOTS = {
  'brand.name': { min: 2, max: 24 },
  'brand.legalName': { min: 2, max: 60 },
  'nav.links[].label': { min: 3, max: 14 },
  'hero.headline[]': { min: 6, max: 24 },
  'hero.subhead': { min: 60, max: 170 },
  'hero.scrollHint': { min: 3, max: 12 },
  'projects.marquee.text': { min: 3, max: 12 },
  'projects.marquee.accent': { min: 3, max: 12 },
  'projects.items[].titleUp': { min: 3, max: 16 },
  'projects.items[].titleDown': { min: 3, max: 16 },
  'projects.items[].description': { min: 50, max: 130 },
  'services.heading': { min: 30, max: 80 },
  'services.items[]': { min: 6, max: 24 },
  'about.statement': { min: 60, max: 160 },
  'about.cta.label': { min: 4, max: 20 },
  'proof.heading': { min: 10, max: 40 },
  'proof.cta.label': { min: 4, max: 20 },
  'proof.quote.text': { min: 40, max: 160 },
  'proof.quote.name': { min: 3, max: 30 },
  'proof.quote.role': { min: 3, max: 30 },
  'proof.quote.company': { min: 2, max: 20 },
  'proof.stats[].value': { min: 2, max: 12 },
  'proof.stats[].label': { min: 6, max: 30 },
  'proof.stats[].company': { min: 2, max: 20 },
  'proof.rating.value': { min: 2, max: 12 },
  'proof.rating.lines[]': { min: 4, max: 24 },
  'proof.rating.note': { min: 6, max: 30 },
  'proof.story.text': { min: 40, max: 160 },
  'proof.story.company': { min: 2, max: 20 },
  'faq.heading[]': { min: 4, max: 24 },
  'faq.items[].question': { min: 10, max: 70 },
  'faq.items[].answer': { min: 60, max: 300 },
  'footer.cta.label': { min: 4, max: 24 },
  'footer.tagline': { min: 6, max: 40 },
  'footer.places.heading': { min: 3, max: 16 },
  'footer.places.entries[].title': { min: 3, max: 24 },
  'footer.places.entries[].lines[]': { min: 3, max: 30 },
  'footer.services.heading': { min: 3, max: 16 },
  'footer.services.items[]': { min: 3, max: 24 },
  'footer.navigation.heading': { min: 3, max: 16 },
  'footer.navigation.links[].label': { min: 3, max: 16 },
  'footer.social.heading': { min: 3, max: 16 },
  'footer.social.links[].label': { min: 3, max: 16 },
  'footer.bottomLinks[].label': { min: 3, max: 20 },
  'footer.credit': { min: 0, max: 60 },
} as const satisfies Record<string, CopySlot>

// How many of each list the layout holds. The headline has three clipped rows, the menu pill
// six lines, the flowing menu any number of rows, the footer's columns a handful each.
const VECTOR_COUNTS = {
  'nav.links': { min: 2, max: 6 },
  'hero.headline': { min: 2, max: 3 },
  'projects.items': { min: 2, max: 4 },
  'services.items': { min: 3, max: 6 },
  'proof.rating.lines': { min: 1, max: 2 },
  'faq.heading': { min: 1, max: 2 },
  'faq.items': { min: 3, max: 6 },
  'footer.places.entries': { min: 1, max: 3 },
  'footer.places.entries[].lines': { min: 1, max: 3 },
  'footer.services.items': { min: 2, max: 6 },
  'footer.navigation.links': { min: 2, max: 6 },
  'footer.social.links': { min: 1, max: 6 },
  'footer.bottomLinks': { min: 0, max: 3 },
} as const satisfies Record<string, CopySlot>

// Every text-on-background pair the template paints. Text sits on the page and on its
// quieter cards; the buttons, the flowing menu's lit rows, the cursor and the whole footer are
// the page inverted, the surface on the ink; the floating pills are on-scrim on the scrim.
export const VECTOR_CONTRAST_PAIRS: readonly ContrastPair[] = [
  { text: 'on-surface', background: 'surface' },
  { text: 'on-surface-muted', background: 'surface' },
  { text: 'on-surface', background: 'surface-muted' },
  { text: 'surface', background: 'on-surface' },
  { text: 'on-scrim', background: 'scrim' },
]

// Every slot and count in a content object that is outside its limits. Empty means it fits.
export function vectorViolations(content: VectorContent): SlotViolation[] {
  const { brand, nav, hero, projects, services, about, proof, faq, footer } = content
  const c = slotChecks(VECTOR_SLOTS, VECTOR_COUNTS)

  c.text('brand.name', 'brand.name', brand.name)
  c.text('brand.legalName', 'brand.legalName', brand.legalName)
  c.list('nav.links', 'nav.links', nav.links, (link, path) => {
    c.text('nav.links[].label', `${path}.label`, link.label)
  })

  c.list('hero.headline', 'hero.headline', hero.headline, (line, path) => {
    c.text('hero.headline[]', path, line)
  })
  c.text('hero.subhead', 'hero.subhead', hero.subhead)
  c.text('hero.scrollHint', 'hero.scrollHint', hero.scrollHint)

  c.text('projects.marquee.text', 'projects.marquee.text', projects.marquee.text)
  c.text('projects.marquee.accent', 'projects.marquee.accent', projects.marquee.accent)
  c.list('projects.items', 'projects.items', projects.items, (item, path) => {
    c.text('projects.items[].titleUp', `${path}.titleUp`, item.titleUp)
    c.text('projects.items[].titleDown', `${path}.titleDown`, item.titleDown)
    c.text('projects.items[].description', `${path}.description`, item.description)
  })

  c.text('services.heading', 'services.heading', services.heading)
  c.list('services.items', 'services.items', services.items, (item, path) => {
    c.text('services.items[]', path, item)
  })

  c.text('about.statement', 'about.statement', about.statement)
  c.text('about.cta.label', 'about.cta.label', about.cta.label)

  if (proof !== null) {
    c.text('proof.heading', 'proof.heading', proof.heading)
    c.text('proof.cta.label', 'proof.cta.label', proof.cta.label)
    c.text('proof.quote.text', 'proof.quote.text', proof.quote.text)
    c.text('proof.quote.name', 'proof.quote.name', proof.quote.name)
    c.text('proof.quote.role', 'proof.quote.role', proof.quote.role)
    c.text('proof.quote.company', 'proof.quote.company', proof.quote.company)
    proof.stats.forEach((stat, i) => {
      const path = `proof.stats[${String(i)}]`
      c.text('proof.stats[].value', `${path}.value`, stat.value)
      c.text('proof.stats[].label', `${path}.label`, stat.label)
      c.text('proof.stats[].company', `${path}.company`, stat.company)
    })
    c.text('proof.rating.value', 'proof.rating.value', proof.rating.value)
    c.list('proof.rating.lines', 'proof.rating.lines', proof.rating.lines, (line, path) => {
      c.text('proof.rating.lines[]', path, line)
    })
    c.text('proof.rating.note', 'proof.rating.note', proof.rating.note)
    c.text('proof.story.text', 'proof.story.text', proof.story.text)
    c.text('proof.story.company', 'proof.story.company', proof.story.company)
  }

  c.list('faq.heading', 'faq.heading', faq.heading, (line, path) => {
    c.text('faq.heading[]', path, line)
  })
  c.list('faq.items', 'faq.items', faq.items, (item, path) => {
    c.text('faq.items[].question', `${path}.question`, item.question)
    c.text('faq.items[].answer', `${path}.answer`, item.answer)
  })

  c.text('footer.cta.label', 'footer.cta.label', footer.cta.label)
  c.text('footer.tagline', 'footer.tagline', footer.tagline)
  if (footer.places !== null) {
    c.text('footer.places.heading', 'footer.places.heading', footer.places.heading)
    c.list(
      'footer.places.entries',
      'footer.places.entries',
      footer.places.entries,
      (entry, path) => {
        c.text('footer.places.entries[].title', `${path}.title`, entry.title)
        c.list('footer.places.entries[].lines', `${path}.lines`, entry.lines, (line, at) => {
          c.text('footer.places.entries[].lines[]', at, line)
        })
      },
    )
  }
  c.text('footer.services.heading', 'footer.services.heading', footer.services.heading)
  c.list('footer.services.items', 'footer.services.items', footer.services.items, (item, path) => {
    c.text('footer.services.items[]', path, item)
  })
  c.text('footer.navigation.heading', 'footer.navigation.heading', footer.navigation.heading)
  c.list(
    'footer.navigation.links',
    'footer.navigation.links',
    footer.navigation.links,
    (link, path) => {
      c.text('footer.navigation.links[].label', `${path}.label`, link.label)
    },
  )
  if (footer.social !== null) {
    c.text('footer.social.heading', 'footer.social.heading', footer.social.heading)
    c.list('footer.social.links', 'footer.social.links', footer.social.links, (link, path) => {
      c.text('footer.social.links[].label', `${path}.label`, link.label)
    })
  }
  c.list('footer.bottomLinks', 'footer.bottomLinks', footer.bottomLinks, (link, path) => {
    c.text('footer.bottomLinks[].label', `${path}.label`, link.label)
  })
  c.text('footer.credit', 'footer.credit', footer.credit)
  return c.violations()
}
