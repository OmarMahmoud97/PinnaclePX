import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { type BrandBrief, fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleEmber, emberContract, emberCopySchema, emberFallbackCopy } from './contract'
import { EMBER_SLOTS } from './copy-slots'
import { KESTREL_EMBER } from './example/content'

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

describe('emberFallbackCopy', () => {
  it.each(CORPUS)('fits every slot for "%s"', (company, description) => {
    const copy = emberFallbackCopy(fallbackBrief(company, description))
    expect(emberContract.copyViolations(copy)).toEqual([])
  })

  it('fits every slot for a brief with fields outside the ranges', () => {
    const copy = emberFallbackCopy(MODEL_BRIEF)
    expect(emberContract.copyViolations(copy)).toEqual([])
    expect(copy.cta.button).toBe('Get in touch')
    expect(copy.hero.eyebrow).toBe('In our own words')
    expect(copy.stats.map((item) => item.title)).toEqual([
      'What we do',
      'Who it is for',
      'Get paid',
    ])
    expect(copy.booking.steps.map((step) => step.title)).toEqual([
      'Import',
      'Add the team',
      'Send the first quote',
    ])
    expect(copy.dishes.items.map((item) => item.title)).toEqual([
      'What we do',
      'Who it is for',
      'Get paid',
      'Import',
    ])
  })
})

describe('emberCopySchema', () => {
  it('accepts two steps, which the violations then report as a count', () => {
    const copy = emberFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = { ...copy, booking: { ...copy.booking, steps: copy.booking.steps.slice(0, 2) } }
    expect(emberCopySchema.safeParse(broken).success).toBe(true)
    expect(emberContract.copyViolations(broken)).toEqual([
      { slot: 'booking.steps', length: 2, min: 3, max: 3 },
    ])
  })

  it('has a guide that names every slot the copy stage writes, and none it does not', () => {
    const lines = emberContract.guide.split('\n')
    expect(lines).toContain(
      '- hero.headline: 18 to 60 characters, the headline, a plain promise in their words',
    )
    const optional = Object.keys(EMBER_SLOTS).filter((slot) =>
      /^(hero\.proof|about\.location|booking\.testimonial|timing\.rows|testimonials)[.[]/.test(
        slot,
      ),
    )
    expect(optional.length).toBeGreaterThan(0)
    expect(lines).toHaveLength(Object.keys(EMBER_SLOTS).length - optional.length)
    for (const slot of optional) expect(emberContract.guide).not.toContain(`- ${slot}:`)
  })

  it('rejects a footer link with an unknown target', () => {
    const copy = emberFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = {
      ...copy,
      footer: {
        ...copy.footer,
        groups: [{ heading: 'A', links: [{ label: 'x', target: 'pricing' }] }],
      },
    }
    expect(emberCopySchema.safeParse(broken).success).toBe(false)
  })
})

describe('assembleEmber', () => {
  const copy = emberFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))

  it('gives a wordmark, no pictures and no optional pieces when there are no assets', () => {
    const content = assembleEmber(copy, { logo: { kind: 'wordmark' }, images: {}, email: null })
    expect(content.brand.logo).toEqual({ kind: 'wordmark' })
    expect(content.hero.background).toBeNull()
    expect(content.hero.proof).toBeNull()
    expect(content.about.image).toBeNull()
    expect(content.about.location).toBeNull()
    expect(content.dishes.items.map((item) => item.image)).toEqual([null, null, null, null])
    expect(content.features.image).toBeNull()
    expect(content.booking.testimonial).toBeNull()
    expect(content.timing.image).toBeNull()
    expect(content.timing.rows).toBeNull()
    expect(content.testimonials).toBeNull()
    expect(content.footer.socials).toBeNull()
    expect(content.footer.contact).toEqual({ heading: 'Get in touch', email: null, phone: null })
  })

  it('places the pictures in their slots, sends the mail link to the owner and fixes every link', () => {
    const assets: TemplateAssets = {
      logo: KESTREL_EMBER.brand.logo,
      images: {
        hero: KESTREL_EMBER.hero.background,
        about: KESTREL_EMBER.about.image,
        features: KESTREL_EMBER.features.image,
        'dish-2': KESTREL_EMBER.dishes.items[1]?.image ?? null,
      },
      email: 'owner@example.com',
    }
    const content = assembleEmber(copy, assets)
    expect(content.hero.background).toBe(KESTREL_EMBER.hero.background)
    expect(content.about.image).toBe(KESTREL_EMBER.about.image)
    expect(content.features.image).toBe(KESTREL_EMBER.features.image)
    expect(content.dishes.items[1]?.image).toBe(KESTREL_EMBER.dishes.items[1]?.image)
    expect(content.dishes.items[0]?.image).toBeNull()
    expect(content.footer.contact.email).toBe('owner@example.com')
    expect(content.nav.links.map((link) => link.href)).toEqual([
      '#about',
      '#dishes',
      '#timing',
      '#faq',
    ])
    expect(content.nav.cta.href).toBe('#booking-process')
    expect(content.hero.cta.href).toBe('#booking-process')
    expect(content.timing.cta.href).toBe('#booking-process')
    expect(content.cta.button.href).toBe('#booking-process')
    expect(content.footer.groups[1]?.links[1]?.href).toBe('#top')
  })
})
