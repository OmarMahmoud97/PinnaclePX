import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { type BrandBrief, fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleSummit, summitContract, summitCopySchema, summitFallbackCopy } from './contract'
import { SUMMIT_SLOTS } from './copy-slots'
import { KESTREL_SUMMIT } from './example/content'

const LONGEST =
  'Physiotherapy clinic in Sheffield for people who want to get back to running, lifting, cycling and playing without the niggle coming back a fortnight later. We see sports injuries, post-operative rehab, back and neck pain and the long tail of desk work, with same-week appointments and evening slots for people who cannot get away in the day. Every plan is written down and yours to keep.'

// Company names and sentences at the edges of what the form accepts.
const CORPUS: readonly [company: string, description: string][] = [
  ['Kestrel', 'Job scheduling for trades businesses.'],
  ['Ashgrove Physio', 'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab.'],
  ['A', 'We sell bikes and we fix them too.'],
  ['Ashgrove Physiotherapy and Sports Injury Clinic Limited', LONGEST],
  ['  Go Wild   Dog Walking ', '  dog walking  in the peak district,   small groups   '],
  ['VetPres', 'Secure prescription management for veterinary practices, built with vets.'],
]

// A brief as the model might return it: every field present, several out of range.
const MODEL_BRIEF: BrandBrief = {
  company: 'Kestrel',
  positioning: 'Job scheduling for trades businesses that have outgrown the whiteboard.',
  audience: 'Owners of small trades firms with two to ten vans.',
  tone: ['plain', 'confident'],
  headlines: ['Every job, every van, one calendar.', 'Run the day from one screen.'],
  valueProps: [
    { title: 'Speed', body: 'Book once.' },
    { title: 'Quote from the van before you leave the job', body: 'Send it there and then.' },
    { title: 'Get paid', body: 'Invoices go out when the job is marked done.' },
  ],
  steps: [
    { title: 'Import', body: 'Upload a spreadsheet.' },
    { title: 'Add the team', body: 'Invite engineers by phone number and each gets the app.' },
    { title: 'Send the first quote', body: 'Pick a job and build the quote from your price list.' },
  ],
  statement: 'We built Kestrel after watching a heating firm lose a day a week to phone calls.',
  ctaLabel: 'Go',
  imageQueries: { hero: ['calendar on a wall'], detail: ['van interior'] },
}

describe('summitFallbackCopy', () => {
  it.each(CORPUS)('fits every slot for "%s"', (company, description) => {
    const copy = summitFallbackCopy(fallbackBrief(company, description))
    expect(summitContract.copyViolations(copy)).toEqual([])
  })

  it('fits every slot for a brief with fields outside the ranges', () => {
    const copy = summitFallbackCopy(MODEL_BRIEF)
    expect(summitContract.copyViolations(copy)).toEqual([])
    expect(copy.cta.button).toBe('Get in touch')
    expect(copy.hero.badge.text).toBe('In our own words')
    expect(copy.why.cards.map((card) => card.title)).toEqual([
      'What we do',
      'Who it is for',
      'Get paid',
      'What happens next',
    ])
    expect(copy.services.items.map((item) => item.title)).toEqual([
      'What we do for you',
      'Quote from the van before you leave the job',
      'How we get started',
    ])
    expect(copy.steps.items.map((step) => step.title)).toEqual([
      'Import',
      'Add the team',
      'Send the first quote',
    ])
  })

  // The slot holds 50 characters, so a name of up to 32 fits the question whole.
  it('names the business in the closing question only when the whole name fits', () => {
    const heading = (company: string) =>
      summitFallbackCopy(fallbackBrief(company, 'We sell bikes and we fix them too.')).cta.heading
    expect(heading('Kestrel')).toBe('Ready to talk to Kestrel?')
    expect(heading('Ashgrove Physiotherapy and Sport')).toBe(
      'Ready to talk to Ashgrove Physiotherapy and Sport?',
    )
    expect(heading('Ashgrove Physiotherapy and Sports')).toBe('Ready when you are?')
    expect(heading('Ashgrove Physiotherapy and Sports Injury Clinic Limited')).toBe(
      'Ready when you are?',
    )
    expect(heading('AshgrovePhysiotherapyAndSportsInjuryClinic')).toBe('Ready when you are?')
  })
})

describe('summitCopySchema', () => {
  it('accepts three reasons, which the violations then report as a count', () => {
    const copy = summitFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = { ...copy, why: { ...copy.why, cards: copy.why.cards.slice(0, 3) } }
    expect(summitCopySchema.safeParse(broken).success).toBe(true)
    expect(summitContract.copyViolations(broken)).toEqual([
      { slot: 'why.cards', length: 3, min: 4, max: 4 },
    ])
  })

  // The fourth menu entry opens the photographs but read "FAQs" or "Reviews" on 5 of 10 pages,
  // and two footers said "Book now" for businesses that take no bookings (paid pass 3, t07-L3,
  // L4, L8 and L9), so the guide names what each leads to, with each short slot's size in words.
  it('has a guide that says what the menu, the badge and the footer links lead to', () => {
    const lines = summitContract.guide.split('\n')
    for (const line of [
      '- hero.badge.text: 8 to 40 characters, a short line beside it, two to six words on where they work or who they serve',
      '- nav.links[].label: 3 to 12 characters, two to four menu labels of one or two words, in order: home, about, what they offer, a name for the four photographs',
      '- footer.columns[].links[].label: 3 to 20 characters, two to five link labels of one to three words per column; each link has a target of top, home, why-choose-us, our-services, booking-process, facilities, faq, book-appointment or cta, where booking-process is the steps, facilities the four photographs, book-appointment the form and cta the closing ask',
    ]) {
      expect(lines).toContain(line)
    }
    for (const phrase of ['what they have', 'Open every day of the week']) {
      expect(summitContract.guide).not.toContain(phrase)
    }
  })

  it('has a guide that names every slot the copy stage writes, and none it does not', () => {
    const lines = summitContract.guide.split('\n')
    expect(lines).toContain(
      '- hero.subhead: 60 to 160 characters, one or two sentences under the headline saying what they do and for whom',
    )
    const optional = Object.keys(SUMMIT_SLOTS).filter((slot) =>
      /^(hero\.proof|articles)[.[]|^booking\.form\.(doctor|department)\.options\[\]$|^footer\.contact\.address$/.test(
        slot,
      ),
    )
    expect(optional.length).toBeGreaterThan(0)
    expect(lines).toHaveLength(Object.keys(SUMMIT_SLOTS).length - optional.length)
    for (const slot of optional) expect(summitContract.guide).not.toContain(`- ${slot}:`)
  })

  it('rejects a footer link with an unknown target', () => {
    const copy = summitFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = {
      ...copy,
      footer: {
        ...copy.footer,
        columns: [{ heading: 'A', links: [{ label: 'x', target: 'dishes' }] }],
      },
    }
    expect(summitCopySchema.safeParse(broken).success).toBe(false)
  })
})

describe('assembleSummit', () => {
  const copy = summitFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))

  it('gives a wordmark, no pictures and no optional pieces when there are no assets', () => {
    const content = assembleSummit(copy, { logo: { kind: 'wordmark' }, images: {}, email: null })
    expect(content.brand.logo).toEqual({ kind: 'wordmark' })
    expect(content.hero.background).toBeNull()
    expect(content.hero.proof).toBeNull()
    expect(content.why.image).toBeNull()
    expect(content.services.items.every((item) => item.image === null)).toBe(true)
    expect(content.facilities.items.every((item) => item.image === null)).toBe(true)
    expect(content.articles).toBeNull()
    expect(content.booking.form.doctor.options).toBeNull()
    expect(content.booking.form.sendTo).toBeNull()
    expect(content.cta.image).toBeNull()
    expect(content.footer.contact).toEqual({
      heading: 'Get in touch',
      email: null,
      phone: null,
      address: null,
    })
  })

  it('lists the services as the departments, places the pictures, sends the form to the owner and fixes every link', () => {
    const assets: TemplateAssets = {
      logo: KESTREL_SUMMIT.brand.logo,
      images: {
        hero: KESTREL_SUMMIT.hero.background,
        why: KESTREL_SUMMIT.why.image,
        cta: KESTREL_SUMMIT.cta.image,
        'service-2': KESTREL_SUMMIT.services.items[1]?.image ?? null,
        'facility-4': KESTREL_SUMMIT.facilities.items[3].image,
      },
      email: 'owner@example.com',
    }
    const content = assembleSummit(copy, assets)
    expect(content.booking.form.department.options).toEqual(
      copy.services.items.map((item) => item.tag),
    )
    expect(content.hero.background).toBe(KESTREL_SUMMIT.hero.background)
    expect(content.why.image).toBe(KESTREL_SUMMIT.why.image)
    expect(content.cta.image).toBe(KESTREL_SUMMIT.cta.image)
    expect(content.services.items[1]?.image).toBe(KESTREL_SUMMIT.services.items[1]?.image)
    expect(content.services.items[0]?.image).toBeNull()
    expect(content.facilities.items[3].image).toBe(KESTREL_SUMMIT.facilities.items[3].image)
    expect(content.booking.form.sendTo).toBe('owner@example.com')
    expect(content.footer.contact.email).toBe('owner@example.com')
    expect(content.nav.links.map((link) => link.href)).toEqual([
      '#home',
      '#why-choose-us',
      '#our-services',
      '#photos',
    ])
    expect(content.nav.cta.href).toBe('#steps')
    expect(content.hero.primary.href).toBe('#steps')
    expect(content.hero.secondary.href).toBe('#our-services')
    expect(content.facilities.link.href).toBe('#contact')
    expect(content.cta.button.href).toBe('#contact')
    expect(content.footer.columns[0]?.links[2]?.href).toBe('#steps')
    expect(content.footer.columns[1]?.links[0]?.href).toBe('#contact')
    expect(content.footer.columns[1]?.links[1]?.href).toBe('#top')
  })
})
