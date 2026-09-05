import type { SlotImage, TemplateLogo } from '@/lib/copy-slots/assets'
import { slotChecks } from '@/lib/copy-slots/checks'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import type { ContrastPair } from '@/lib/tokens/types'

// Everything Meridian renders comes through this one object. The layout is Bruno Felipy's
// shadcn-landing-page (MIT, https://github.com/nobruf/shadcn-landing-page), every section in
// its order: the floating header with its Features menu, the hero, the sponsors' marquee,
// Benefits, Features, Services, Testimonials, Team, Community, Pricing, Contact, the FAQ and the
// footer.
//
// Three of those sections need facts the brief does not hold: testimonials, team members and
// prices. They are optional here. The copy stage leaves them null and the page is complete
// without them; the example fills them so the layout can be reviewed whole, and a form that
// collects them one day fills them for real. Contact's rows and form are kept, the rows filled
// with the steps and the form sending to the owner's email when it is known.

export type MeridianLink = Readonly<{ label: string; href: string }>
export type MeridianImage = SlotImage

// A heading with one phrase set in the gradient, as the source's hero and ask have. The phrase
// must appear in the text; when it does not, the heading is set plain.
export type Emphasised = Readonly<{ text: string; emphasis: string }>

type Titled = Readonly<{ title: string; body: string }>
type LinkGroup = Readonly<{ heading: string; links: readonly MeridianLink[] }>

export type Three<T> = readonly [T, T, T]
export type Four<T> = readonly [T, T, T, T]

// Every section under the hero opens with the source's small tracked eyebrow over its heading.
type Headed = Readonly<{ eyebrow: string; heading: string }>

export type SocialNetwork = 'linkedin' | 'github' | 'x'

export type MeridianContent = Readonly<{
  brand: Readonly<{ name: string; legalName: string; logo: TemplateLogo }>
  nav: Readonly<{
    links: readonly MeridianLink[]
    cta: MeridianLink
    // The header's first item opens onto a picture beside three short entries.
    menu: Readonly<{ label: string; items: Three<Titled>; image: MeridianImage | null }>
  }>
  hero: Readonly<{
    badge: Readonly<{ label: string; text: string }>
    headline: Emphasised
    subhead: string
    primary: MeridianLink
    secondary: MeridianLink
    image: MeridianImage | null
  }>
  // The source's row of sponsor names beside icons, sliding: here labels for what they cover.
  sponsors: Readonly<{ heading: string; items: readonly string[] }>
  benefits: Headed & Readonly<{ lead: string; items: Four<Titled> }>
  features: Headed & Readonly<{ lead: string; items: readonly Titled[] }>
  services: Headed &
    Readonly<{ lead: string; items: readonly (Titled & Readonly<{ pro: boolean }>)[] }>
  testimonials:
    | (Headed &
        Readonly<{
          items: readonly Readonly<{
            image: MeridianImage | null
            name: string
            role: string
            comment: string
            rating: number
          }>[]
        }>)
    | null
  team:
    | (Headed &
        Readonly<{
          members: readonly Readonly<{
            image: MeridianImage | null
            firstName: string
            lastName: string
            positions: readonly string[]
            socials: readonly Readonly<{ network: SocialNetwork; href: string }>[]
          }>[]
        }>)
    | null
  community: Readonly<{ heading: Emphasised; body: string; action: MeridianLink }>
  pricing:
    | (Headed &
        Readonly<{
          lead: string
          plans: readonly Readonly<{
            title: string
            popular: boolean
            price: string
            period: string
            body: string
            button: MeridianLink
            benefits: readonly string[]
          }>[]
        }>)
    | null
  contact: Headed &
    Readonly<{
      lead: string
      // The source's rows of an icon, a bold label and lines: here the steps, one line each.
      rows: readonly Readonly<{ title: string; lines: readonly string[] }>[]
      form: Readonly<{ subjects: readonly string[]; button: string; email: string | null }>
    }>
  faq: Headed & Readonly<{ items: readonly Readonly<{ question: string; answer: string }>[] }>
  footer: Readonly<{ groups: readonly LinkGroup[] }>
}>

// Character limits per text slot. The benefit cards are half a column each and the feature
// cards a third, so their bodies are the shortest prose on the page.
export const MERIDIAN_SLOTS = {
  'brand.name': { min: 2, max: 24 },
  'brand.legalName': { min: 2, max: 60 },
  'nav.links[].label': { min: 3, max: 18 },
  'nav.cta.label': { min: 4, max: 22 },
  'nav.menu.label': { min: 3, max: 16 },
  'nav.menu.items[].title': { min: 6, max: 30 },
  'nav.menu.items[].body': { min: 20, max: 90 },
  'hero.badge.label': { min: 2, max: 10 },
  'hero.badge.text': { min: 10, max: 44 },
  'hero.headline.text': { min: 18, max: 60 },
  'hero.headline.emphasis': { min: 0, max: 30 },
  'hero.subhead': { min: 60, max: 190 },
  'hero.primary.label': { min: 4, max: 22 },
  'hero.secondary.label': { min: 4, max: 22 },
  'sponsors.heading': { min: 6, max: 40 },
  'sponsors.items[]': { min: 3, max: 18 },
  'benefits.eyebrow': { min: 3, max: 18 },
  'benefits.heading': { min: 10, max: 50 },
  'benefits.lead': { min: 60, max: 220 },
  'benefits.items[].title': { min: 6, max: 32 },
  'benefits.items[].body': { min: 60, max: 170 },
  'features.eyebrow': { min: 3, max: 18 },
  'features.heading': { min: 10, max: 50 },
  'features.lead': { min: 40, max: 200 },
  'features.items[].title': { min: 6, max: 28 },
  'features.items[].body': { min: 50, max: 150 },
  'services.eyebrow': { min: 3, max: 18 },
  'services.heading': { min: 10, max: 50 },
  'services.lead': { min: 40, max: 200 },
  'services.items[].title': { min: 6, max: 40 },
  'services.items[].body': { min: 20, max: 120 },
  'testimonials.eyebrow': { min: 3, max: 18 },
  'testimonials.heading': { min: 10, max: 50 },
  'testimonials.items[].name': { min: 3, max: 30 },
  'testimonials.items[].role': { min: 3, max: 30 },
  'testimonials.items[].comment': { min: 20, max: 200 },
  'team.eyebrow': { min: 3, max: 18 },
  'team.heading': { min: 10, max: 50 },
  'team.members[].firstName': { min: 2, max: 20 },
  'team.members[].lastName': { min: 2, max: 20 },
  'team.members[].positions[]': { min: 3, max: 30 },
  'community.heading.text': { min: 18, max: 60 },
  'community.heading.emphasis': { min: 0, max: 30 },
  'community.body': { min: 40, max: 190 },
  'community.action.label': { min: 4, max: 22 },
  'pricing.eyebrow': { min: 3, max: 18 },
  'pricing.heading': { min: 10, max: 50 },
  'pricing.lead': { min: 20, max: 170 },
  'pricing.plans[].title': { min: 3, max: 18 },
  'pricing.plans[].price': { min: 1, max: 10 },
  'pricing.plans[].period': { min: 2, max: 12 },
  'pricing.plans[].body': { min: 20, max: 90 },
  'pricing.plans[].button.label': { min: 4, max: 22 },
  'pricing.plans[].benefits[]': { min: 4, max: 30 },
  'contact.eyebrow': { min: 3, max: 18 },
  'contact.heading': { min: 10, max: 40 },
  'contact.lead': { min: 40, max: 190 },
  'contact.rows[].title': { min: 4, max: 26 },
  'contact.rows[].lines[]': { min: 4, max: 90 },
  'contact.form.subjects[]': { min: 3, max: 30 },
  'contact.form.button': { min: 4, max: 22 },
  'faq.eyebrow': { min: 3, max: 18 },
  'faq.heading': { min: 10, max: 40 },
  'faq.items[].question': { min: 10, max: 90 },
  'faq.items[].answer': { min: 20, max: 300 },
  'footer.groups[].heading': { min: 3, max: 18 },
  'footer.groups[].links[].label': { min: 3, max: 24 },
} as const satisfies Record<string, CopySlot>

// How many of each list the layout holds.
const MERIDIAN_COUNTS = {
  'nav.links': { min: 2, max: 4 },
  'sponsors.items': { min: 3, max: 7 },
  'features.items': { min: 3, max: 6 },
  'services.items': { min: 2, max: 4 },
  'testimonials.items': { min: 3, max: 6 },
  'team.members': { min: 2, max: 8 },
  'team.members[].positions': { min: 1, max: 2 },
  'pricing.plans': { min: 2, max: 3 },
  'pricing.plans[].benefits': { min: 3, max: 5 },
  'contact.rows': { min: 3, max: 4 },
  'contact.rows[].lines': { min: 1, max: 2 },
  'contact.form.subjects': { min: 2, max: 5 },
  'faq.items': { min: 3, max: 5 },
  'footer.groups': { min: 2, max: 4 },
  'footer.groups[].links': { min: 2, max: 3 },
} as const satisfies Record<string, CopySlot>

// Every text-on-background pair the template paints. Cards sit on the accent surface; the
// gradient runs from the first glow to brand-deeper, which also carries text.
export const MERIDIAN_CONTRAST_PAIRS: readonly ContrastPair[] = [
  { text: 'on-surface', background: 'surface' },
  { text: 'on-surface-muted', background: 'surface' },
  { text: 'on-surface', background: 'surface-muted' },
  { text: 'on-surface-muted', background: 'surface-muted' },
  { text: 'on-surface', background: 'accent' },
  { text: 'on-surface-muted', background: 'accent' },
  { text: 'brand-deeper', background: 'surface' },
  { text: 'brand-deeper', background: 'accent' },
  { text: 'on-brand', background: 'brand-deeper' },
]

type Slot = keyof typeof MERIDIAN_SLOTS

// Every slot and count in a content object that is outside its limits. Empty means it fits.
export function meridianViolations(content: MeridianContent): SlotViolation[] {
  const { brand, nav, hero, sponsors, benefits, features, services, community } = content
  const { testimonials, team, pricing, contact, faq, footer } = content
  const c = slotChecks(MERIDIAN_SLOTS, MERIDIAN_COUNTS)
  const headed = (
    section:
      | 'benefits'
      | 'features'
      | 'services'
      | 'testimonials'
      | 'team'
      | 'pricing'
      | 'contact'
      | 'faq',
    value: Headed,
  ) => {
    c.text(`${section}.eyebrow`, `${section}.eyebrow`, value.eyebrow)
    c.text(`${section}.heading`, `${section}.heading`, value.heading)
  }
  const titled = (
    section: 'nav.menu' | 'benefits' | 'features' | 'services',
    items: readonly Titled[],
  ) => {
    items.forEach((item, index) => {
      c.text(
        `${section}.items[].title` as Slot,
        `${section}.items[${String(index)}].title`,
        item.title,
      )
      c.text(
        `${section}.items[].body` as Slot,
        `${section}.items[${String(index)}].body`,
        item.body,
      )
    })
  }

  c.text('brand.name', 'brand.name', brand.name)
  c.text('brand.legalName', 'brand.legalName', brand.legalName)
  c.list('nav.links', 'nav.links', nav.links, (link, path) => {
    c.text('nav.links[].label', `${path}.label`, link.label)
  })
  c.text('nav.cta.label', 'nav.cta.label', nav.cta.label)
  c.text('nav.menu.label', 'nav.menu.label', nav.menu.label)
  titled('nav.menu', nav.menu.items)

  c.text('hero.badge.label', 'hero.badge.label', hero.badge.label)
  c.text('hero.badge.text', 'hero.badge.text', hero.badge.text)
  c.text('hero.headline.text', 'hero.headline.text', hero.headline.text)
  c.text('hero.headline.emphasis', 'hero.headline.emphasis', hero.headline.emphasis)
  c.text('hero.subhead', 'hero.subhead', hero.subhead)
  c.text('hero.primary.label', 'hero.primary.label', hero.primary.label)
  c.text('hero.secondary.label', 'hero.secondary.label', hero.secondary.label)

  c.text('sponsors.heading', 'sponsors.heading', sponsors.heading)
  c.list('sponsors.items', 'sponsors.items', sponsors.items, (item, path) => {
    c.text('sponsors.items[]', path, item)
  })

  headed('benefits', benefits)
  c.text('benefits.lead', 'benefits.lead', benefits.lead)
  titled('benefits', benefits.items)

  headed('features', features)
  c.text('features.lead', 'features.lead', features.lead)
  c.count('features.items', 'features.items', features.items.length)
  titled('features', features.items)

  headed('services', services)
  c.text('services.lead', 'services.lead', services.lead)
  c.count('services.items', 'services.items', services.items.length)
  titled('services', services.items)

  if (testimonials !== null) {
    headed('testimonials', testimonials)
    c.list('testimonials.items', 'testimonials.items', testimonials.items, (item, path) => {
      c.text('testimonials.items[].name', `${path}.name`, item.name)
      c.text('testimonials.items[].role', `${path}.role`, item.role)
      c.text('testimonials.items[].comment', `${path}.comment`, item.comment)
    })
  }

  if (team !== null) {
    headed('team', team)
    c.list('team.members', 'team.members', team.members, (member, path) => {
      c.text('team.members[].firstName', `${path}.firstName`, member.firstName)
      c.text('team.members[].lastName', `${path}.lastName`, member.lastName)
      c.list('team.members[].positions', `${path}.positions`, member.positions, (position, at) => {
        c.text('team.members[].positions[]', at, position)
      })
    })
  }

  c.text('community.heading.text', 'community.heading.text', community.heading.text)
  c.text('community.heading.emphasis', 'community.heading.emphasis', community.heading.emphasis)
  c.text('community.body', 'community.body', community.body)
  c.text('community.action.label', 'community.action.label', community.action.label)

  if (pricing !== null) {
    headed('pricing', pricing)
    c.text('pricing.lead', 'pricing.lead', pricing.lead)
    c.list('pricing.plans', 'pricing.plans', pricing.plans, (plan, path) => {
      c.text('pricing.plans[].title', `${path}.title`, plan.title)
      c.text('pricing.plans[].price', `${path}.price`, plan.price)
      c.text('pricing.plans[].period', `${path}.period`, plan.period)
      c.text('pricing.plans[].body', `${path}.body`, plan.body)
      c.text('pricing.plans[].button.label', `${path}.button.label`, plan.button.label)
      c.list('pricing.plans[].benefits', `${path}.benefits`, plan.benefits, (benefit, at) => {
        c.text('pricing.plans[].benefits[]', at, benefit)
      })
    })
  }

  headed('contact', contact)
  c.text('contact.lead', 'contact.lead', contact.lead)
  c.list('contact.rows', 'contact.rows', contact.rows, (row, path) => {
    c.text('contact.rows[].title', `${path}.title`, row.title)
    c.list('contact.rows[].lines', `${path}.lines`, row.lines, (line, at) => {
      c.text('contact.rows[].lines[]', at, line)
    })
  })
  c.list('contact.form.subjects', 'contact.form.subjects', contact.form.subjects, (subject, at) => {
    c.text('contact.form.subjects[]', at, subject)
  })
  c.text('contact.form.button', 'contact.form.button', contact.form.button)

  headed('faq', faq)
  c.list('faq.items', 'faq.items', faq.items, (item, path) => {
    c.text('faq.items[].question', `${path}.question`, item.question)
    c.text('faq.items[].answer', `${path}.answer`, item.answer)
  })

  c.list('footer.groups', 'footer.groups', footer.groups, (group, path) => {
    c.text('footer.groups[].heading', `${path}.heading`, group.heading)
    c.list('footer.groups[].links', `${path}.links`, group.links, (link, linkPath) => {
      c.text('footer.groups[].links[].label', `${linkPath}.label`, link.label)
    })
  })
  return c.violations()
}
