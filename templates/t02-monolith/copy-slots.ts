import type { SlotImage, TemplateLogo } from '@/lib/copy-slots/assets'
import { slotChecks } from '@/lib/copy-slots/checks'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import type { ContrastPair } from '@/lib/tokens/types'

// Everything Monolith renders comes through this one object. The layout is Leo Miranda's
// shadcn-landing-page (MIT, https://github.com/leoMirandaa/shadcn-landing-page), every section
// in its order: the header, the hero with its four floating cards, the sponsors row, About with
// its statistics, How it works, Features with its badge row, Services, the call to action band,
// Testimonials, Team, Pricing, Newsletter, the FAQ and the footer.
//
// Four of those sections and two lines need facts the brief does not hold: testimonials, team
// members, prices and a newsletter. They are optional here. The copy stage leaves them null and
// the page is complete without them; the example fills them so the layout can be reviewed whole,
// and a form that collects them one day fills them for real.

export type MonolithLink = Readonly<{ label: string; href: string }>
export type MonolithImage = SlotImage

// A heading with one phrase set in the brand gradient, as the source's headings have. The
// phrase must appear in the text; when it does not, the heading is set plain.
export type Emphasised = Readonly<{ text: string; emphasis: string }>

// The headline sets two phrases in two different gradients, as the source's does.
export type Headline = Readonly<{ text: string; first: string; second: string }>

type Titled = Readonly<{ title: string; body: string }>
type LinkGroup = Readonly<{ heading: string; links: readonly MonolithLink[] }>

export type Three<T> = readonly [T, T, T]
export type Four<T> = readonly [T, T, T, T]

export type SocialNetwork = 'linkedin' | 'facebook' | 'instagram'

export type MonolithContent = Readonly<{
  brand: Readonly<{ name: string; legalName: string; logo: TemplateLogo }>
  nav: Readonly<{ links: readonly MonolithLink[]; cta: MonolithLink }>
  hero: Readonly<{
    headline: Headline
    subhead: string
    primary: MonolithLink
    secondary: MonolithLink
    // The four cards that float beside the headline on wide screens, in the source's order: a
    // quote, a profile, a plan and a service. The quote and the profile carry the brand rather
    // than a person; the plan's price is optional, since the brief holds no prices.
    cards: Readonly<{
      quote: Readonly<{ text: string; role: string; image: MonolithImage | null }>
      profile: Readonly<{ role: string; body: string; image: MonolithImage | null }>
      plan: Readonly<{
        title: string
        badge: string
        price: Readonly<{ amount: string; period: string }> | null
        body: string
        action: MonolithLink
        points: Three<string>
      }>
      service: Titled
    }>
  }>
  // The source's row of sponsor names beside an icon: here short labels for what they cover.
  sponsors: Readonly<{ heading: string; items: readonly string[] }>
  about: Readonly<{
    heading: Emphasised
    body: string
    // The source's four statistics: a large figure over a label. The copy stage writes phrases.
    highlights: Four<Readonly<{ value: string; label: string }>>
    image: MonolithImage | null
  }>
  steps: Readonly<{ heading: Emphasised; lead: string; items: Four<Titled> }>
  features: Readonly<{
    heading: Emphasised
    tags: readonly string[]
    items: Three<Titled & Readonly<{ image: MonolithImage | null }>>
  }>
  services: Readonly<{
    heading: Emphasised
    lead: string
    items: Three<Titled>
    image: MonolithImage | null
  }>
  cta: Readonly<{
    heading: Emphasised
    body: string
    primary: MonolithLink
    secondary: MonolithLink
  }>
  testimonials: Readonly<{
    heading: Emphasised
    lead: string
    items: readonly Readonly<{
      image: MonolithImage | null
      name: string
      handle: string
      comment: string
    }>[]
  }> | null
  team: Readonly<{
    heading: Emphasised
    lead: string
    members: readonly Readonly<{
      image: MonolithImage | null
      name: string
      position: string
      body: string
      socials: readonly Readonly<{ network: SocialNetwork; href: string }>[]
    }>[]
  }> | null
  pricing: Readonly<{
    heading: Emphasised
    lead: string
    plans: readonly Readonly<{
      title: string
      popular: boolean
      price: string
      period: string
      body: string
      button: MonolithLink
      benefits: readonly string[]
    }>[]
  }> | null
  newsletter: Readonly<{
    heading: Emphasised
    lead: string
    placeholder: string
    button: string
    // Where the form sends: the owner's email, or nothing, in which case the button is a link.
    email: string | null
  }> | null
  faq: Readonly<{
    heading: Emphasised
    items: readonly Readonly<{ question: string; answer: string }>[]
    prompt: string
    link: MonolithLink
  }>
  footer: Readonly<{ groups: readonly LinkGroup[] }>
}>

// Character limits per text slot. The cards in the hero are fixed widths in the source (340,
// 320, 288 and 350 px), so their slots are the tightest.
export const MONOLITH_SLOTS = {
  'brand.name': { min: 2, max: 24 },
  'brand.legalName': { min: 2, max: 60 },
  'nav.links[].label': { min: 3, max: 18 },
  'nav.cta.label': { min: 4, max: 22 },
  'hero.headline.text': { min: 18, max: 60 },
  'hero.headline.first': { min: 0, max: 30 },
  'hero.headline.second': { min: 0, max: 30 },
  'hero.subhead': { min: 60, max: 190 },
  'hero.primary.label': { min: 4, max: 22 },
  'hero.secondary.label': { min: 4, max: 22 },
  'hero.cards.quote.text': { min: 20, max: 90 },
  'hero.cards.quote.role': { min: 4, max: 30 },
  'hero.cards.profile.role': { min: 4, max: 30 },
  'hero.cards.profile.body': { min: 30, max: 120 },
  'hero.cards.plan.title': { min: 3, max: 18 },
  'hero.cards.plan.badge': { min: 4, max: 16 },
  'hero.cards.plan.price.amount': { min: 1, max: 10 },
  'hero.cards.plan.price.period': { min: 2, max: 12 },
  'hero.cards.plan.body': { min: 30, max: 90 },
  'hero.cards.plan.action.label': { min: 4, max: 22 },
  'hero.cards.plan.points[]': { min: 6, max: 26 },
  'hero.cards.service.title': { min: 6, max: 32 },
  'hero.cards.service.body': { min: 40, max: 120 },
  'sponsors.heading': { min: 6, max: 40 },
  'sponsors.items[]': { min: 3, max: 18 },
  'about.heading.text': { min: 10, max: 40 },
  'about.heading.emphasis': { min: 0, max: 20 },
  'about.body': { min: 120, max: 420 },
  'about.highlights[].value': { min: 1, max: 16 },
  'about.highlights[].label': { min: 3, max: 24 },
  'steps.heading.text': { min: 18, max: 60 },
  'steps.heading.emphasis': { min: 0, max: 30 },
  'steps.lead': { min: 40, max: 170 },
  'steps.items[].title': { min: 6, max: 32 },
  'steps.items[].body': { min: 60, max: 160 },
  'features.heading.text': { min: 10, max: 50 },
  'features.heading.emphasis': { min: 0, max: 30 },
  'features.tags[]': { min: 3, max: 22 },
  'features.items[].title': { min: 6, max: 32 },
  'features.items[].body': { min: 60, max: 160 },
  'services.heading.text': { min: 10, max: 50 },
  'services.heading.emphasis': { min: 0, max: 30 },
  'services.lead': { min: 40, max: 170 },
  'services.items[].title': { min: 6, max: 32 },
  'services.items[].body': { min: 60, max: 160 },
  'cta.heading.text': { min: 18, max: 60 },
  'cta.heading.emphasis': { min: 0, max: 30 },
  'cta.body': { min: 40, max: 190 },
  'cta.primary.label': { min: 4, max: 22 },
  'cta.secondary.label': { min: 4, max: 22 },
  'testimonials.heading.text': { min: 10, max: 60 },
  'testimonials.heading.emphasis': { min: 0, max: 30 },
  'testimonials.lead': { min: 20, max: 170 },
  'testimonials.items[].name': { min: 3, max: 30 },
  'testimonials.items[].handle': { min: 2, max: 24 },
  'testimonials.items[].comment': { min: 10, max: 260 },
  'team.heading.text': { min: 10, max: 50 },
  'team.heading.emphasis': { min: 0, max: 30 },
  'team.lead': { min: 20, max: 170 },
  'team.members[].name': { min: 3, max: 30 },
  'team.members[].position': { min: 3, max: 30 },
  'team.members[].body': { min: 20, max: 120 },
  'pricing.heading.text': { min: 10, max: 50 },
  'pricing.heading.emphasis': { min: 0, max: 30 },
  'pricing.lead': { min: 20, max: 170 },
  'pricing.plans[].title': { min: 3, max: 18 },
  'pricing.plans[].price': { min: 1, max: 10 },
  'pricing.plans[].period': { min: 2, max: 12 },
  'pricing.plans[].body': { min: 20, max: 90 },
  'pricing.plans[].button.label': { min: 4, max: 22 },
  'pricing.plans[].benefits[]': { min: 4, max: 30 },
  'newsletter.heading.text': { min: 10, max: 50 },
  'newsletter.heading.emphasis': { min: 0, max: 30 },
  'newsletter.lead': { min: 10, max: 120 },
  'newsletter.placeholder': { min: 3, max: 40 },
  'newsletter.button': { min: 3, max: 16 },
  'faq.heading.text': { min: 10, max: 50 },
  'faq.heading.emphasis': { min: 0, max: 30 },
  'faq.items[].question': { min: 10, max: 90 },
  'faq.items[].answer': { min: 40, max: 300 },
  'faq.prompt': { min: 10, max: 60 },
  'faq.link.label': { min: 4, max: 22 },
  'footer.groups[].heading': { min: 3, max: 18 },
  'footer.groups[].links[].label': { min: 3, max: 24 },
} as const satisfies Record<string, CopySlot>

// How many of each list the layout holds.
const MONOLITH_COUNTS = {
  'nav.links': { min: 2, max: 4 },
  'sponsors.items': { min: 3, max: 6 },
  'features.tags': { min: 4, max: 9 },
  'testimonials.items': { min: 3, max: 6 },
  'team.members': { min: 2, max: 4 },
  'pricing.plans': { min: 2, max: 3 },
  'pricing.plans[].benefits': { min: 3, max: 5 },
  'faq.items': { min: 3, max: 5 },
  'footer.groups': { min: 2, max: 4 },
  'footer.groups[].links': { min: 2, max: 3 },
} as const satisfies Record<string, CopySlot>

// Every text-on-background pair the template paints. Cards sit on the accent surface; the
// headings' gradient runs to brand-deeper, which also carries text.
export const MONOLITH_CONTRAST_PAIRS: readonly ContrastPair[] = [
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

type Slot = keyof typeof MONOLITH_SLOTS

// Every slot and count in a content object that is outside its limits. Empty means it fits.
export function monolithViolations(content: MonolithContent): SlotViolation[] {
  const { brand, nav, hero, sponsors, about, steps, features, services, cta, faq, footer } = content
  const { testimonials, team, pricing, newsletter } = content
  const c = slotChecks(MONOLITH_SLOTS, MONOLITH_COUNTS)
  const heading = (
    section:
      | 'about'
      | 'steps'
      | 'features'
      | 'services'
      | 'cta'
      | 'testimonials'
      | 'team'
      | 'pricing'
      | 'newsletter'
      | 'faq',
    value: Emphasised,
  ) => {
    c.text(`${section}.heading.text`, `${section}.heading.text`, value.text)
    c.text(`${section}.heading.emphasis`, `${section}.heading.emphasis`, value.emphasis)
  }
  const titled = (section: 'steps' | 'features' | 'services', items: readonly Titled[]) => {
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

  c.text('hero.headline.text', 'hero.headline.text', hero.headline.text)
  c.text('hero.headline.first', 'hero.headline.first', hero.headline.first)
  c.text('hero.headline.second', 'hero.headline.second', hero.headline.second)
  c.text('hero.subhead', 'hero.subhead', hero.subhead)
  c.text('hero.primary.label', 'hero.primary.label', hero.primary.label)
  c.text('hero.secondary.label', 'hero.secondary.label', hero.secondary.label)
  const { quote, profile, plan, service } = hero.cards
  c.text('hero.cards.quote.text', 'hero.cards.quote.text', quote.text)
  c.text('hero.cards.quote.role', 'hero.cards.quote.role', quote.role)
  c.text('hero.cards.profile.role', 'hero.cards.profile.role', profile.role)
  c.text('hero.cards.profile.body', 'hero.cards.profile.body', profile.body)
  c.text('hero.cards.plan.title', 'hero.cards.plan.title', plan.title)
  c.text('hero.cards.plan.badge', 'hero.cards.plan.badge', plan.badge)
  if (plan.price !== null) {
    c.text('hero.cards.plan.price.amount', 'hero.cards.plan.price.amount', plan.price.amount)
    c.text('hero.cards.plan.price.period', 'hero.cards.plan.price.period', plan.price.period)
  }
  c.text('hero.cards.plan.body', 'hero.cards.plan.body', plan.body)
  c.text('hero.cards.plan.action.label', 'hero.cards.plan.action.label', plan.action.label)
  plan.points.forEach((point, i) => {
    c.text('hero.cards.plan.points[]', `hero.cards.plan.points[${String(i)}]`, point)
  })
  c.text('hero.cards.service.title', 'hero.cards.service.title', service.title)
  c.text('hero.cards.service.body', 'hero.cards.service.body', service.body)

  c.text('sponsors.heading', 'sponsors.heading', sponsors.heading)
  c.list('sponsors.items', 'sponsors.items', sponsors.items, (item, path) => {
    c.text('sponsors.items[]', path, item)
  })

  heading('about', about.heading)
  c.text('about.body', 'about.body', about.body)
  about.highlights.forEach((item, i) => {
    c.text('about.highlights[].value', `about.highlights[${String(i)}].value`, item.value)
    c.text('about.highlights[].label', `about.highlights[${String(i)}].label`, item.label)
  })

  heading('steps', steps.heading)
  c.text('steps.lead', 'steps.lead', steps.lead)
  titled('steps', steps.items)

  heading('features', features.heading)
  c.list('features.tags', 'features.tags', features.tags, (tag, path) => {
    c.text('features.tags[]', path, tag)
  })
  titled('features', features.items)

  heading('services', services.heading)
  c.text('services.lead', 'services.lead', services.lead)
  titled('services', services.items)

  heading('cta', cta.heading)
  c.text('cta.body', 'cta.body', cta.body)
  c.text('cta.primary.label', 'cta.primary.label', cta.primary.label)
  c.text('cta.secondary.label', 'cta.secondary.label', cta.secondary.label)

  if (testimonials !== null) {
    heading('testimonials', testimonials.heading)
    c.text('testimonials.lead', 'testimonials.lead', testimonials.lead)
    c.list('testimonials.items', 'testimonials.items', testimonials.items, (item, path) => {
      c.text('testimonials.items[].name', `${path}.name`, item.name)
      c.text('testimonials.items[].handle', `${path}.handle`, item.handle)
      c.text('testimonials.items[].comment', `${path}.comment`, item.comment)
    })
  }

  if (team !== null) {
    heading('team', team.heading)
    c.text('team.lead', 'team.lead', team.lead)
    c.list('team.members', 'team.members', team.members, (member, path) => {
      c.text('team.members[].name', `${path}.name`, member.name)
      c.text('team.members[].position', `${path}.position`, member.position)
      c.text('team.members[].body', `${path}.body`, member.body)
    })
  }

  if (pricing !== null) {
    heading('pricing', pricing.heading)
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

  if (newsletter !== null) {
    heading('newsletter', newsletter.heading)
    c.text('newsletter.lead', 'newsletter.lead', newsletter.lead)
    c.text('newsletter.placeholder', 'newsletter.placeholder', newsletter.placeholder)
    c.text('newsletter.button', 'newsletter.button', newsletter.button)
  }

  heading('faq', faq.heading)
  c.list('faq.items', 'faq.items', faq.items, (item, path) => {
    c.text('faq.items[].question', `${path}.question`, item.question)
    c.text('faq.items[].answer', `${path}.answer`, item.answer)
  })
  c.text('faq.prompt', 'faq.prompt', faq.prompt)
  c.text('faq.link.label', 'faq.link.label', faq.link.label)

  c.list('footer.groups', 'footer.groups', footer.groups, (group, path) => {
    c.text('footer.groups[].heading', `${path}.heading`, group.heading)
    c.list('footer.groups[].links', `${path}.links`, group.links, (link, linkPath) => {
      c.text('footer.groups[].links[].label', `${linkPath}.label`, link.label)
    })
  })
  return c.violations()
}
