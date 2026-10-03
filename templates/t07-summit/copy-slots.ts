import type { SlotImage, TemplateLogo } from '@/lib/copy-slots/assets'
import { slotChecks } from '@/lib/copy-slots/checks'
import type { CopySlot, SlotViolation } from '@/lib/copy-slots/validate'
import type { ContrastPair } from '@/lib/tokens/types'

// Everything Summit renders comes through this one object. The layout is PrebuiltUI's
// MediCare hospital template (MIT, https://github.com/prebuiltui/prebuiltui, the repository's
// templates/hospital-website-template, ported from its published build at
// medicare.prebuiltui.com since the repository holds only its README), every block in its
// order: the fixed bar and its phone sheet, the hero over a photograph, Why choose us (four
// cards around a picture), the stacked deck of services, How it works, the facilities grid,
// the FAQ, the articles, the appointment form, the closing band and the footer under a
// watermark.
//
// Three pieces need facts the brief does not hold: the hero's rating line with its patients,
// the articles, and the appointment form's list of people to see. They are optional here. The
// copy stage leaves them null and the page is complete without them (the form's fourth field
// takes a name typed in when there is no list); the example fills them from the source's own
// copy so the layout can be reviewed whole, and a form that collects them one day fills them
// for real. The form's department list is the page's own services on a visitor's page.

type SummitLink = Readonly<{ label: string; href: string }>
export type SummitImage = SlotImage

type Titled = Readonly<{ title: string; body: string }>

type Three<T> = readonly [T, T, T]
export type Four<T> = readonly [T, T, T, T]

// Every block opens with the source's small grey eyebrow over its heading.
type Headed = Readonly<{ eyebrow: string; heading: string }>

// A text field of the appointment form: its label, set in capitals, and its hint.
type Field = Readonly<{ label: string; placeholder: string }>

export type SummitContent = Readonly<{
  brand: Readonly<{ name: string; legalName: string; logo: TemplateLogo }>
  nav: Readonly<{ links: readonly SummitLink[]; cta: SummitLink }>
  hero: Readonly<{
    // The source's pill: a small ringed word beside a short line.
    badge: Readonly<{ tag: string; text: string }>
    headline: string
    subhead: string
    primary: SummitLink
    secondary: SummitLink
    // The source's row of patients' portraits beside five stars and a rating line.
    proof: Readonly<{ avatars: readonly SummitImage[]; line: string }> | null
    // The photograph behind the whole first screen.
    background: SummitImage | null
  }>
  // Four cards, two each side of a picture; the icons are the template's, by position.
  why: Headed & Readonly<{ cards: Four<Titled>; image: SummitImage | null }>
  // The stacked deck: each card a pill, a title, a line, a checklist and a picture.
  services: Headed &
    Readonly<{
      items: readonly Readonly<{
        tag: string
        title: string
        body: string
        checklist: readonly string[]
        image: SummitImage | null
      }>[]
    }>
  // The source's How it works: a line under the heading, then the steps down a hairline; the
  // icons are the template's, by position.
  steps: Headed & Readonly<{ body: string; items: readonly Titled[] }>
  // Four pictures in a seven-five, five-seven grid, each hiding a caption with the same link,
  // which slides up under the pointer.
  facilities: Headed &
    Readonly<{
      items: Four<Readonly<{ title: string; body: string; image: SummitImage | null }>>
      link: SummitLink
    }>
  faq: Headed & Readonly<{ items: readonly Readonly<{ question: string; answer: string }>[] }>
  articles:
    | (Headed &
        Readonly<{
          link: SummitLink
          posts: Three<
            Readonly<{ image: SummitImage | null; author: string; readTime: string; title: string }>
          >
        }>)
    | null
  // The appointment form beside its heading: three text fields, two lists, a date, a button.
  booking: Headed &
    Readonly<{
      form: Readonly<{
        name: Field
        email: Field
        phone: Field
        // Who they would like to see: a list when the facts are known, else a typed name.
        doctor: Field & Readonly<{ options: readonly string[] | null }>
        department: Field & Readonly<{ options: readonly string[] }>
        date: Readonly<{ label: string }>
        button: string
        // Where the form sends: the owner's email, or nothing, in which case the button
        // leads to the closing band.
        sendTo: string | null
      }>
    }>
  cta: Readonly<{ heading: string; body: string; button: SummitLink; image: SummitImage | null }>
  footer: Readonly<{
    description: string
    columns: readonly Readonly<{ heading: string; links: readonly SummitLink[] }>[]
    // The source's Get in Touch column: a mail link, a phone link and an address, each shown
    // when known; the column goes when none is.
    contact: Readonly<{
      heading: string
      email: string | null
      phone: string | null
      address: string | null
    }>
    smallLinks: readonly SummitLink[]
  }>
}>

// Character limits per text slot, measured from the source's own copy: the hero's headline is
// text-6xl in a 640px column, the card bodies sit in 288px to 336px columns, a service's title
// at 40px in a 416px column and its line in a 376px one, the closing band's line in a 320px
// one, and a question's answer must fit the source's 160px panel on a phone.
export const SUMMIT_SLOTS = {
  'brand.name': { min: 2, max: 24 },
  'brand.legalName': { min: 2, max: 60 },
  'nav.links[].label': { min: 3, max: 12 },
  'nav.cta.label': { min: 4, max: 18 },
  'hero.badge.tag': { min: 2, max: 12 },
  'hero.badge.text': { min: 8, max: 40 },
  'hero.headline': { min: 18, max: 60 },
  'hero.subhead': { min: 60, max: 160 },
  'hero.primary.label': { min: 4, max: 18 },
  'hero.secondary.label': { min: 4, max: 18 },
  'hero.proof.line': { min: 6, max: 40 },
  'why.eyebrow': { min: 4, max: 30 },
  'why.heading': { min: 16, max: 50 },
  'why.cards[].title': { min: 6, max: 30 },
  'why.cards[].body': { min: 50, max: 130 },
  'services.eyebrow': { min: 4, max: 30 },
  'services.heading': { min: 16, max: 50 },
  'services.items[].tag': { min: 3, max: 20 },
  'services.items[].title': { min: 12, max: 52 },
  'services.items[].body': { min: 60, max: 150 },
  'services.items[].checklist[]': { min: 6, max: 44 },
  'steps.eyebrow': { min: 4, max: 30 },
  'steps.heading': { min: 16, max: 60 },
  'steps.body': { min: 60, max: 170 },
  'steps.items[].title': { min: 6, max: 30 },
  'steps.items[].body': { min: 50, max: 120 },
  'facilities.eyebrow': { min: 4, max: 30 },
  'facilities.heading': { min: 16, max: 60 },
  'facilities.items[].title': { min: 6, max: 36 },
  'facilities.items[].body': { min: 50, max: 130 },
  'facilities.link.label': { min: 4, max: 20 },
  'faq.eyebrow': { min: 2, max: 30 },
  'faq.heading': { min: 10, max: 50 },
  'faq.items[].question': { min: 10, max: 70 },
  'faq.items[].answer': { min: 40, max: 220 },
  'articles.eyebrow': { min: 4, max: 30 },
  'articles.heading': { min: 16, max: 50 },
  'articles.link.label': { min: 6, max: 24 },
  'articles.posts[].author': { min: 4, max: 30 },
  'articles.posts[].readTime': { min: 4, max: 14 },
  'articles.posts[].title': { min: 20, max: 70 },
  'booking.eyebrow': { min: 4, max: 30 },
  'booking.heading': { min: 16, max: 50 },
  'booking.form.name.label': { min: 3, max: 24 },
  'booking.form.name.placeholder': { min: 4, max: 40 },
  'booking.form.email.label': { min: 3, max: 24 },
  'booking.form.email.placeholder': { min: 4, max: 40 },
  'booking.form.phone.label': { min: 3, max: 24 },
  'booking.form.phone.placeholder': { min: 4, max: 40 },
  'booking.form.doctor.label': { min: 3, max: 24 },
  'booking.form.doctor.placeholder': { min: 4, max: 40 },
  'booking.form.doctor.options[]': { min: 3, max: 44 },
  'booking.form.department.label': { min: 3, max: 24 },
  'booking.form.department.placeholder': { min: 4, max: 40 },
  'booking.form.department.options[]': { min: 3, max: 44 },
  'booking.form.date.label': { min: 3, max: 24 },
  'booking.form.button': { min: 4, max: 24 },
  'cta.heading': { min: 16, max: 50 },
  'cta.body': { min: 40, max: 130 },
  'cta.button.label': { min: 4, max: 22 },
  'footer.description': { min: 40, max: 140 },
  'footer.columns[].heading': { min: 3, max: 18 },
  'footer.columns[].links[].label': { min: 3, max: 20 },
  'footer.contact.heading': { min: 3, max: 18 },
  'footer.contact.address': { min: 4, max: 40 },
  'footer.smallLinks[].label': { min: 3, max: 20 },
} as const satisfies Record<string, CopySlot>

// How many of each list the layout holds. The deck stacks any number of cards; the steps run
// down one hairline with four icons; the lists in the form are as long as a menu can be.
const SUMMIT_COUNTS = {
  'nav.links': { min: 2, max: 4 },
  'hero.proof.avatars': { min: 1, max: 4 },
  'services.items': { min: 3, max: 6 },
  'services.items[].checklist': { min: 2, max: 5 },
  'steps.items': { min: 3, max: 4 },
  'faq.items': { min: 3, max: 6 },
  'booking.form.doctor.options': { min: 1, max: 8 },
  'booking.form.department.options': { min: 1, max: 8 },
  'footer.columns': { min: 1, max: 3 },
  'footer.columns[].links': { min: 2, max: 5 },
  'footer.smallLinks': { min: 0, max: 4 },
} as const satisfies Record<string, CopySlot>

// Every text-on-background pair the template paints. Text sits on the page, on the quieter
// cards and on the tinted ones; the buttons carry on-brand on brand-deeper; a facility's
// caption is on-scrim over the scrim's wash on its photograph.
export const SUMMIT_CONTRAST_PAIRS: readonly ContrastPair[] = [
  { text: 'on-surface', background: 'surface' },
  { text: 'on-surface-muted', background: 'surface' },
  { text: 'on-surface', background: 'surface-muted' },
  { text: 'on-surface-muted', background: 'surface-muted' },
  { text: 'on-surface', background: 'accent' },
  { text: 'on-surface-muted', background: 'accent' },
  { text: 'on-brand', background: 'brand-deeper' },
  { text: 'on-scrim', background: 'scrim' },
]

type Slot = keyof typeof SUMMIT_SLOTS

// Every slot and count in a content object that is outside its limits. Empty means it fits.
export function summitViolations(content: SummitContent): SlotViolation[] {
  const { brand, nav, hero, why, services, steps, facilities, faq, booking, cta, footer } = content
  const { articles } = content
  const c = slotChecks(SUMMIT_SLOTS, SUMMIT_COUNTS)
  const headed = (
    section: 'why' | 'services' | 'steps' | 'facilities' | 'faq' | 'articles' | 'booking',
    value: Headed,
  ) => {
    c.text(`${section}.eyebrow`, `${section}.eyebrow`, value.eyebrow)
    c.text(`${section}.heading`, `${section}.heading`, value.heading)
  }
  const titled = (
    path: 'why.cards' | 'steps.items' | 'facilities.items',
    item: Titled,
    i: number,
  ) => {
    c.text(`${path}[].title` as Slot, `${path}[${String(i)}].title`, item.title)
    c.text(`${path}[].body` as Slot, `${path}[${String(i)}].body`, item.body)
  }
  const field = (name: 'name' | 'email' | 'phone' | 'doctor' | 'department', value: Field) => {
    c.text(`booking.form.${name}.label`, `booking.form.${name}.label`, value.label)
    c.text(
      `booking.form.${name}.placeholder`,
      `booking.form.${name}.placeholder`,
      value.placeholder,
    )
  }

  c.text('brand.name', 'brand.name', brand.name)
  c.text('brand.legalName', 'brand.legalName', brand.legalName)
  c.list('nav.links', 'nav.links', nav.links, (link, path) => {
    c.text('nav.links[].label', `${path}.label`, link.label)
  })
  c.text('nav.cta.label', 'nav.cta.label', nav.cta.label)

  c.text('hero.badge.tag', 'hero.badge.tag', hero.badge.tag)
  c.text('hero.badge.text', 'hero.badge.text', hero.badge.text)
  c.text('hero.headline', 'hero.headline', hero.headline)
  c.text('hero.subhead', 'hero.subhead', hero.subhead)
  c.text('hero.primary.label', 'hero.primary.label', hero.primary.label)
  c.text('hero.secondary.label', 'hero.secondary.label', hero.secondary.label)
  if (hero.proof !== null) {
    c.count('hero.proof.avatars', 'hero.proof.avatars', hero.proof.avatars.length)
    c.text('hero.proof.line', 'hero.proof.line', hero.proof.line)
  }

  headed('why', why)
  why.cards.forEach((card, i) => {
    titled('why.cards', card, i)
  })

  headed('services', services)
  c.list('services.items', 'services.items', services.items, (item, path) => {
    c.text('services.items[].tag', `${path}.tag`, item.tag)
    c.text('services.items[].title', `${path}.title`, item.title)
    c.text('services.items[].body', `${path}.body`, item.body)
    c.list('services.items[].checklist', `${path}.checklist`, item.checklist, (line, at) => {
      c.text('services.items[].checklist[]', at, line)
    })
  })

  headed('steps', steps)
  c.text('steps.body', 'steps.body', steps.body)
  c.list('steps.items', 'steps.items', steps.items, (item, path) => {
    c.text('steps.items[].title', `${path}.title`, item.title)
    c.text('steps.items[].body', `${path}.body`, item.body)
  })

  headed('facilities', facilities)
  facilities.items.forEach((item, i) => {
    titled('facilities.items', item, i)
  })
  c.text('facilities.link.label', 'facilities.link.label', facilities.link.label)

  headed('faq', faq)
  c.list('faq.items', 'faq.items', faq.items, (item, path) => {
    c.text('faq.items[].question', `${path}.question`, item.question)
    c.text('faq.items[].answer', `${path}.answer`, item.answer)
  })

  if (articles !== null) {
    headed('articles', articles)
    c.text('articles.link.label', 'articles.link.label', articles.link.label)
    articles.posts.forEach((post, i) => {
      const path = `articles.posts[${String(i)}]`
      c.text('articles.posts[].author', `${path}.author`, post.author)
      c.text('articles.posts[].readTime', `${path}.readTime`, post.readTime)
      c.text('articles.posts[].title', `${path}.title`, post.title)
    })
  }

  headed('booking', booking)
  const { form } = booking
  field('name', form.name)
  field('email', form.email)
  field('phone', form.phone)
  field('doctor', form.doctor)
  if (form.doctor.options !== null) {
    c.list(
      'booking.form.doctor.options',
      'booking.form.doctor.options',
      form.doctor.options,
      (option, path) => {
        c.text('booking.form.doctor.options[]', path, option)
      },
    )
  }
  field('department', form.department)
  c.list(
    'booking.form.department.options',
    'booking.form.department.options',
    form.department.options,
    (option, path) => {
      c.text('booking.form.department.options[]', path, option)
    },
  )
  c.text('booking.form.date.label', 'booking.form.date.label', form.date.label)
  c.text('booking.form.button', 'booking.form.button', form.button)

  c.text('cta.heading', 'cta.heading', cta.heading)
  c.text('cta.body', 'cta.body', cta.body)
  c.text('cta.button.label', 'cta.button.label', cta.button.label)

  c.text('footer.description', 'footer.description', footer.description)
  c.list('footer.columns', 'footer.columns', footer.columns, (column, path) => {
    c.text('footer.columns[].heading', `${path}.heading`, column.heading)
    c.list('footer.columns[].links', `${path}.links`, column.links, (link, at) => {
      c.text('footer.columns[].links[].label', `${at}.label`, link.label)
    })
  })
  c.text('footer.contact.heading', 'footer.contact.heading', footer.contact.heading)
  if (footer.contact.address !== null) {
    c.text('footer.contact.address', 'footer.contact.address', footer.contact.address)
  }
  c.list('footer.smallLinks', 'footer.smallLinks', footer.smallLinks, (link, path) => {
    c.text('footer.smallLinks[].label', `${path}.label`, link.label)
  })
  return c.violations()
}
