import type { SlotImage, TemplateLogo } from '@/lib/copy-slots/assets'
import { slotChecks } from '@/lib/copy-slots/checks'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import type { ContrastPair } from '@/lib/tokens/types'

// Everything Harbor renders comes through this one object. The layout is PrebuiltUI's Forged
// gym template (MIT, https://github.com/prebuiltui/prebuiltui, the repository's
// templates/forged-gym-website-template, ported from its published build at
// forged.prebuiltui.com since the repository holds only its README), every block in its
// order: the fixed bar and its phone overlay, the hero over a photograph, About with its
// floating badge and two short quotes, the capability grid, the figures under a watermark, the
// achievement gallery, the plans, the testimonials, the partner marquee, the FAQ beside the
// contact form, the closing band, the articles and the footer under a second watermark.
//
// Nine pieces need facts the brief does not hold: About's badge and its two quotes, the
// gallery, the plans, the testimonials, the partners, the articles, the social links and the
// newsletter's address. They are optional here. The copy stage leaves them null and the page
// is complete without them; the example fills them from the source's own copy so the layout
// can be reviewed whole, and a form that collects them one day fills them for real. The
// figures in the hero and in the grid of figures are phrases, not numbers, on a visitor's page.

type HarborLink = Readonly<{ label: string; href: string }>
export type HarborImage = SlotImage

// The source sets its headings in capitals over two or three lines, one phrase lit in the
// accent. The phrase must sit inside one of the lines; when it does not, the heading is plain.
export type Lines = Readonly<{ lines: readonly string[]; emphasis: string }>

type Titled = Readonly<{ title: string; body: string }>

type Two<T> = readonly [T, T]
export type Three<T> = readonly [T, T, T]
type Four<T> = readonly [T, T, T, T]

// Every block opens with the source's small tracked eyebrow in the accent over its heading.
type Headed = Readonly<{ eyebrow: string; heading: Lines }>

export type SocialNetwork = 'instagram' | 'x' | 'youtube' | 'facebook'

export type HarborContent = Readonly<{
  brand: Readonly<{ name: string; legalName: string; logo: TemplateLogo }>
  nav: Readonly<{ links: readonly HarborLink[]; cta: HarborLink }>
  hero: Readonly<{
    badge: string
    // Three lines, each in its own clipped row; the second is lit.
    headline: Three<string>
    subhead: string
    primary: HarborLink
    secondary: HarborLink
    // The source's row of three figures over labels: short phrases here.
    stats: Three<Readonly<{ value: string; label: string }>>
    image: HarborImage | null
  }>
  about: Headed &
    Readonly<{
      paragraphs: readonly string[]
      tags: readonly string[]
      image: HarborImage | null
      // The source's accent badge over the picture's corner: a figure over a two-line label.
      badge: Readonly<{ value: string; lines: readonly string[] }> | null
      quotes: Two<Readonly<{ quote: string; name: string; role: string }>> | null
    }>
  services: Headed &
    Readonly<{
      lead: string
      // Three to six cards; the third is the lit one, as the source's is.
      items: readonly (Titled & Readonly<{ tag: string }>)[]
      more: string
    }>
  metrics: Headed &
    Readonly<{
      watermark: string
      items: readonly Readonly<{ value: string; label: string; description: string }>[]
    }>
  gallery:
    | (Headed &
        Readonly<{
          items: Four<
            Readonly<{ image: HarborImage | null; tag: string; name: string; result: string }>
          >
          cta: HarborLink
        }>)
    | null
  pricing:
    | (Headed &
        Readonly<{
          lead: string
          popular: string
          plans: Three<
            Readonly<{
              name: string
              price: string
              period: string
              description: string
              features: readonly string[]
              cta: string
              highlight: boolean
            }>
          >
          note: string
        }>)
    | null
  testimonials:
    | (Headed &
        Readonly<{
          items: readonly Readonly<{
            quote: string
            name: string
            role: string
            rating: number
            image: HarborImage | null
          }>[]
        }>)
    | null
  partners: Readonly<{ label: string; names: readonly string[] }> | null
  contact: Headed &
    Readonly<{
      faq: readonly Readonly<{ question: string; answer: string }>[]
      form: Readonly<{
        eyebrow: string
        heading: Lines
        lead: string
        labels: Readonly<{ name: string; email: string; message: string }>
        placeholder: string
        button: string
        // Where the form sends: the owner's email, or nothing, in which case the button leads
        // to the page's ask.
        email: string | null
      }>
    }>
  cta: Headed &
    Readonly<{
      body: string
      primary: HarborLink
      secondary: HarborLink
      image: HarborImage | null
    }>
  blog:
    | (Headed &
        Readonly<{
          link: HarborLink
          posts: Three<
            Readonly<{
              image: HarborImage | null
              category: string
              readTime: string
              title: string
              excerpt: string
              date: string
              author: string
            }>
          >
        }>)
    | null
  footer: Readonly<{
    description: string
    newsletter: Readonly<{ label: string; placeholder: string; email: string | null }>
    columns: readonly Readonly<{ heading: string; links: readonly HarborLink[] }>[]
    note: string
    smallPrint: string
    socials: readonly Readonly<{ network: SocialNetwork; href: string }>[] | null
  }>
}>

// Character limits per text slot, measured from the source's own copy: the headline lines are
// text-7xl in clipped rows, About's paragraphs sit in a 512px column, the card bodies in
// 288px columns, the closing band's paragraph in a 448px one.
export const HARBOR_SLOTS = {
  'brand.name': { min: 2, max: 24 },
  'brand.legalName': { min: 2, max: 60 },
  'nav.links[].label': { min: 3, max: 12 },
  'nav.cta.label': { min: 4, max: 16 },
  'hero.badge': { min: 8, max: 40 },
  'hero.headline[]': { min: 3, max: 20 },
  'hero.subhead': { min: 40, max: 140 },
  'hero.primary.label': { min: 4, max: 20 },
  'hero.secondary.label': { min: 4, max: 20 },
  'hero.stats[].value': { min: 1, max: 12 },
  'hero.stats[].label': { min: 6, max: 30 },
  'about.eyebrow': { min: 6, max: 30 },
  'about.heading.lines[]': { min: 4, max: 24 },
  'about.heading.emphasis': { min: 0, max: 24 },
  'about.paragraphs[]': { min: 60, max: 260 },
  'about.tags[]': { min: 6, max: 24 },
  'about.badge.value': { min: 1, max: 8 },
  'about.badge.lines[]': { min: 3, max: 16 },
  'about.quotes[].quote': { min: 20, max: 100 },
  'about.quotes[].name': { min: 3, max: 30 },
  'about.quotes[].role': { min: 3, max: 30 },
  'services.eyebrow': { min: 6, max: 30 },
  'services.heading.lines[]': { min: 4, max: 24 },
  'services.heading.emphasis': { min: 0, max: 24 },
  'services.lead': { min: 40, max: 140 },
  'services.items[].tag': { min: 3, max: 14 },
  'services.items[].title': { min: 6, max: 28 },
  'services.items[].body': { min: 50, max: 130 },
  'services.more': { min: 4, max: 20 },
  'metrics.eyebrow': { min: 4, max: 30 },
  'metrics.heading.lines[]': { min: 4, max: 24 },
  'metrics.heading.emphasis': { min: 0, max: 24 },
  'metrics.watermark': { min: 4, max: 12 },
  'metrics.items[].value': { min: 1, max: 12 },
  'metrics.items[].label': { min: 6, max: 26 },
  'metrics.items[].description': { min: 6, max: 30 },
  'gallery.eyebrow': { min: 6, max: 30 },
  'gallery.heading.lines[]': { min: 4, max: 24 },
  'gallery.heading.emphasis': { min: 0, max: 24 },
  'gallery.items[].tag': { min: 2, max: 12 },
  'gallery.items[].name': { min: 4, max: 24 },
  'gallery.items[].result': { min: 6, max: 24 },
  'gallery.cta.label': { min: 4, max: 24 },
  'pricing.eyebrow': { min: 6, max: 30 },
  'pricing.heading.lines[]': { min: 4, max: 24 },
  'pricing.heading.emphasis': { min: 0, max: 24 },
  'pricing.lead': { min: 20, max: 120 },
  'pricing.popular': { min: 4, max: 16 },
  'pricing.plans[].name': { min: 3, max: 16 },
  'pricing.plans[].price': { min: 1, max: 8 },
  'pricing.plans[].period': { min: 2, max: 12 },
  'pricing.plans[].description': { min: 20, max: 90 },
  'pricing.plans[].features[]': { min: 6, max: 40 },
  'pricing.plans[].cta': { min: 4, max: 26 },
  'pricing.note': { min: 20, max: 120 },
  'testimonials.eyebrow': { min: 6, max: 30 },
  'testimonials.heading.lines[]': { min: 4, max: 24 },
  'testimonials.heading.emphasis': { min: 0, max: 24 },
  'testimonials.items[].quote': { min: 40, max: 180 },
  'testimonials.items[].name': { min: 3, max: 30 },
  'testimonials.items[].role': { min: 3, max: 30 },
  'partners.label': { min: 10, max: 80 },
  'partners.names[]': { min: 3, max: 24 },
  'contact.eyebrow': { min: 2, max: 30 },
  'contact.heading.lines[]': { min: 4, max: 24 },
  'contact.heading.emphasis': { min: 0, max: 24 },
  'contact.faq[].question': { min: 10, max: 70 },
  'contact.faq[].answer': { min: 40, max: 220 },
  'contact.form.eyebrow': { min: 4, max: 30 },
  'contact.form.heading.lines[]': { min: 4, max: 24 },
  'contact.form.heading.emphasis': { min: 0, max: 24 },
  'contact.form.lead': { min: 20, max: 90 },
  'contact.form.labels.name': { min: 2, max: 16 },
  'contact.form.labels.email': { min: 2, max: 16 },
  'contact.form.labels.message': { min: 2, max: 20 },
  'contact.form.placeholder': { min: 10, max: 60 },
  'contact.form.button': { min: 4, max: 20 },
  'cta.eyebrow': { min: 6, max: 30 },
  'cta.heading.lines[]': { min: 4, max: 26 },
  'cta.heading.emphasis': { min: 0, max: 26 },
  'cta.body': { min: 60, max: 220 },
  'cta.primary.label': { min: 4, max: 24 },
  'cta.secondary.label': { min: 4, max: 24 },
  'blog.eyebrow': { min: 6, max: 30 },
  'blog.heading.lines[]': { min: 4, max: 24 },
  'blog.heading.emphasis': { min: 0, max: 24 },
  'blog.link.label': { min: 6, max: 30 },
  'blog.posts[].category': { min: 3, max: 14 },
  'blog.posts[].readTime': { min: 4, max: 14 },
  'blog.posts[].title': { min: 20, max: 80 },
  'blog.posts[].excerpt': { min: 40, max: 160 },
  'blog.posts[].date': { min: 6, max: 20 },
  'blog.posts[].author': { min: 4, max: 30 },
  'footer.description': { min: 40, max: 160 },
  'footer.newsletter.label': { min: 6, max: 40 },
  'footer.newsletter.placeholder': { min: 6, max: 30 },
  'footer.columns[].heading': { min: 3, max: 16 },
  'footer.columns[].links[].label': { min: 3, max: 24 },
  'footer.note': { min: 0, max: 40 },
  'footer.smallPrint': { min: 6, max: 40 },
} as const satisfies Record<string, CopySlot>

// How many of each list the layout holds.
const HARBOR_COUNTS = {
  'nav.links': { min: 2, max: 5 },
  'about.heading.lines': { min: 2, max: 3 },
  'about.paragraphs': { min: 1, max: 2 },
  'about.tags': { min: 3, max: 5 },
  'about.badge.lines': { min: 1, max: 2 },
  'services.heading.lines': { min: 1, max: 3 },
  'services.items': { min: 3, max: 6 },
  'metrics.heading.lines': { min: 1, max: 3 },
  'metrics.items': { min: 3, max: 6 },
  'gallery.heading.lines': { min: 1, max: 3 },
  'pricing.heading.lines': { min: 1, max: 3 },
  'pricing.plans[].features': { min: 3, max: 8 },
  'testimonials.heading.lines': { min: 1, max: 3 },
  'testimonials.items': { min: 3, max: 6 },
  'partners.names': { min: 4, max: 12 },
  'contact.heading.lines': { min: 1, max: 3 },
  'contact.faq': { min: 3, max: 6 },
  'contact.form.heading.lines': { min: 1, max: 3 },
  'cta.heading.lines': { min: 1, max: 3 },
  'blog.heading.lines': { min: 1, max: 3 },
  'footer.columns': { min: 1, max: 3 },
  'footer.columns[].links': { min: 2, max: 6 },
  'footer.socials': { min: 1, max: 4 },
} as const satisfies Record<string, CopySlot>

// Every text-on-background pair the template paints. Text sits on the page, on its quieter
// bands and on the cards; the accent carries the eyebrows, figures and lit phrases on all
// three, and the buttons and badges carry on-brand on the accent.
export const HARBOR_CONTRAST_PAIRS: readonly ContrastPair[] = [
  { text: 'on-surface', background: 'surface' },
  { text: 'on-surface', background: 'surface-muted' },
  { text: 'on-surface', background: 'accent' },
  { text: 'brand-deeper', background: 'surface' },
  { text: 'brand-deeper', background: 'surface-muted' },
  { text: 'brand-deeper', background: 'accent' },
  { text: 'on-brand', background: 'brand-deeper' },
]

type Slot = keyof typeof HARBOR_SLOTS
type Count = keyof typeof HARBOR_COUNTS

// Every slot and count in a content object that is outside its limits. Empty means it fits.
export function harborViolations(content: HarborContent): SlotViolation[] {
  const { brand, nav, hero, about, services, metrics, contact, cta, footer } = content
  const { gallery, pricing, testimonials, partners, blog } = content
  const c = slotChecks(HARBOR_SLOTS, HARBOR_COUNTS)
  const lines = (path: string, value: Lines) => {
    c.list(`${path}.lines` as Count, `${path}.lines`, value.lines, (line, at) => {
      c.text(`${path}.lines[]` as Slot, at, line)
    })
    c.text(`${path}.emphasis` as Slot, `${path}.emphasis`, value.emphasis)
  }
  const headed = (
    section:
      | 'about'
      | 'services'
      | 'metrics'
      | 'gallery'
      | 'pricing'
      | 'testimonials'
      | 'contact'
      | 'cta'
      | 'blog',
    value: Headed,
  ) => {
    c.text(`${section}.eyebrow`, `${section}.eyebrow`, value.eyebrow)
    lines(`${section}.heading`, value.heading)
  }

  c.text('brand.name', 'brand.name', brand.name)
  c.text('brand.legalName', 'brand.legalName', brand.legalName)
  c.list('nav.links', 'nav.links', nav.links, (link, path) => {
    c.text('nav.links[].label', `${path}.label`, link.label)
  })
  c.text('nav.cta.label', 'nav.cta.label', nav.cta.label)

  c.text('hero.badge', 'hero.badge', hero.badge)
  hero.headline.forEach((line, i) => {
    c.text('hero.headline[]', `hero.headline[${String(i)}]`, line)
  })
  c.text('hero.subhead', 'hero.subhead', hero.subhead)
  c.text('hero.primary.label', 'hero.primary.label', hero.primary.label)
  c.text('hero.secondary.label', 'hero.secondary.label', hero.secondary.label)
  hero.stats.forEach((stat, i) => {
    c.text('hero.stats[].value', `hero.stats[${String(i)}].value`, stat.value)
    c.text('hero.stats[].label', `hero.stats[${String(i)}].label`, stat.label)
  })

  headed('about', about)
  c.list('about.paragraphs', 'about.paragraphs', about.paragraphs, (paragraph, path) => {
    c.text('about.paragraphs[]', path, paragraph)
  })
  c.list('about.tags', 'about.tags', about.tags, (tag, path) => {
    c.text('about.tags[]', path, tag)
  })
  if (about.badge !== null) {
    c.text('about.badge.value', 'about.badge.value', about.badge.value)
    c.list('about.badge.lines', 'about.badge.lines', about.badge.lines, (line, path) => {
      c.text('about.badge.lines[]', path, line)
    })
  }
  if (about.quotes !== null) {
    about.quotes.forEach((item, i) => {
      c.text('about.quotes[].quote', `about.quotes[${String(i)}].quote`, item.quote)
      c.text('about.quotes[].name', `about.quotes[${String(i)}].name`, item.name)
      c.text('about.quotes[].role', `about.quotes[${String(i)}].role`, item.role)
    })
  }

  headed('services', services)
  c.text('services.lead', 'services.lead', services.lead)
  c.list('services.items', 'services.items', services.items, (item, path) => {
    c.text('services.items[].tag', `${path}.tag`, item.tag)
    c.text('services.items[].title', `${path}.title`, item.title)
    c.text('services.items[].body', `${path}.body`, item.body)
  })
  c.text('services.more', 'services.more', services.more)

  headed('metrics', metrics)
  c.text('metrics.watermark', 'metrics.watermark', metrics.watermark)
  c.list('metrics.items', 'metrics.items', metrics.items, (item, path) => {
    c.text('metrics.items[].value', `${path}.value`, item.value)
    c.text('metrics.items[].label', `${path}.label`, item.label)
    c.text('metrics.items[].description', `${path}.description`, item.description)
  })

  if (gallery !== null) {
    headed('gallery', gallery)
    gallery.items.forEach((item, i) => {
      c.text('gallery.items[].tag', `gallery.items[${String(i)}].tag`, item.tag)
      c.text('gallery.items[].name', `gallery.items[${String(i)}].name`, item.name)
      c.text('gallery.items[].result', `gallery.items[${String(i)}].result`, item.result)
    })
    c.text('gallery.cta.label', 'gallery.cta.label', gallery.cta.label)
  }

  if (pricing !== null) {
    headed('pricing', pricing)
    c.text('pricing.lead', 'pricing.lead', pricing.lead)
    c.text('pricing.popular', 'pricing.popular', pricing.popular)
    pricing.plans.forEach((plan, i) => {
      const path = `pricing.plans[${String(i)}]`
      c.text('pricing.plans[].name', `${path}.name`, plan.name)
      c.text('pricing.plans[].price', `${path}.price`, plan.price)
      c.text('pricing.plans[].period', `${path}.period`, plan.period)
      c.text('pricing.plans[].description', `${path}.description`, plan.description)
      c.list('pricing.plans[].features', `${path}.features`, plan.features, (feature, at) => {
        c.text('pricing.plans[].features[]', at, feature)
      })
      c.text('pricing.plans[].cta', `${path}.cta`, plan.cta)
    })
    c.text('pricing.note', 'pricing.note', pricing.note)
  }

  if (testimonials !== null) {
    headed('testimonials', testimonials)
    c.list('testimonials.items', 'testimonials.items', testimonials.items, (item, path) => {
      c.text('testimonials.items[].quote', `${path}.quote`, item.quote)
      c.text('testimonials.items[].name', `${path}.name`, item.name)
      c.text('testimonials.items[].role', `${path}.role`, item.role)
    })
  }

  if (partners !== null) {
    c.text('partners.label', 'partners.label', partners.label)
    c.list('partners.names', 'partners.names', partners.names, (name, path) => {
      c.text('partners.names[]', path, name)
    })
  }

  headed('contact', contact)
  c.list('contact.faq', 'contact.faq', contact.faq, (item, path) => {
    c.text('contact.faq[].question', `${path}.question`, item.question)
    c.text('contact.faq[].answer', `${path}.answer`, item.answer)
  })
  const { form } = contact
  c.text('contact.form.eyebrow', 'contact.form.eyebrow', form.eyebrow)
  lines('contact.form.heading', form.heading)
  c.text('contact.form.lead', 'contact.form.lead', form.lead)
  c.text('contact.form.labels.name', 'contact.form.labels.name', form.labels.name)
  c.text('contact.form.labels.email', 'contact.form.labels.email', form.labels.email)
  c.text('contact.form.labels.message', 'contact.form.labels.message', form.labels.message)
  c.text('contact.form.placeholder', 'contact.form.placeholder', form.placeholder)
  c.text('contact.form.button', 'contact.form.button', form.button)

  headed('cta', cta)
  c.text('cta.body', 'cta.body', cta.body)
  c.text('cta.primary.label', 'cta.primary.label', cta.primary.label)
  c.text('cta.secondary.label', 'cta.secondary.label', cta.secondary.label)

  if (blog !== null) {
    headed('blog', blog)
    c.text('blog.link.label', 'blog.link.label', blog.link.label)
    blog.posts.forEach((post, i) => {
      const path = `blog.posts[${String(i)}]`
      c.text('blog.posts[].category', `${path}.category`, post.category)
      c.text('blog.posts[].readTime', `${path}.readTime`, post.readTime)
      c.text('blog.posts[].title', `${path}.title`, post.title)
      c.text('blog.posts[].excerpt', `${path}.excerpt`, post.excerpt)
      c.text('blog.posts[].date', `${path}.date`, post.date)
      c.text('blog.posts[].author', `${path}.author`, post.author)
    })
  }

  c.text('footer.description', 'footer.description', footer.description)
  c.text('footer.newsletter.label', 'footer.newsletter.label', footer.newsletter.label)
  c.text(
    'footer.newsletter.placeholder',
    'footer.newsletter.placeholder',
    footer.newsletter.placeholder,
  )
  c.list('footer.columns', 'footer.columns', footer.columns, (column, path) => {
    c.text('footer.columns[].heading', `${path}.heading`, column.heading)
    c.list('footer.columns[].links', `${path}.links`, column.links, (link, at) => {
      c.text('footer.columns[].links[].label', `${at}.label`, link.label)
    })
  })
  c.text('footer.note', 'footer.note', footer.note)
  c.text('footer.smallPrint', 'footer.smallPrint', footer.smallPrint)
  if (footer.socials !== null) {
    c.count('footer.socials', 'footer.socials', footer.socials.length)
  }
  return c.violations()
}
