import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { type BrandBrief, fallbackBrief } from '@/lib/copy-slots/brief'
import {
  assembleMonolith,
  monolithContract,
  monolithCopySchema,
  monolithFallbackCopy,
} from './contract'
import { MONOLITH_SLOTS } from './copy-slots'
import { KESTREL_MONOLITH } from './example/content'

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

describe('monolithFallbackCopy', () => {
  it.each(CORPUS)('fits every slot for "%s"', (company, description) => {
    const copy = monolithFallbackCopy(fallbackBrief(company, description))
    expect(monolithContract.copyViolations(copy)).toEqual([])
  })

  it('fits every slot for a brief with fields outside the ranges', () => {
    const copy = monolithFallbackCopy(MODEL_BRIEF)
    expect(monolithContract.copyViolations(copy)).toEqual([])
    expect(copy.cta.primary).toBe('Get in touch')
    expect(copy.features.items[1]?.title).toBe('Who it is for')
    expect(copy.features.items[2]?.title).toBe('Get paid')
    expect(copy.steps.items.map((item) => item.title)).toEqual([
      'Import',
      'Add the team',
      'Send the first quote',
      'You hear from us',
    ])
    expect(copy.hero.cards.profile.role).toBe('In our own words')
  })

  it('never colours a word it did not choose', () => {
    const copy = monolithFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    expect(copy.hero.headline.first).toBe('')
    expect(copy.hero.headline.second).toBe('')
    expect(copy.faq.heading.emphasis).toBe('')
  })
})

describe('monolithCopySchema', () => {
  it('accepts a plan with two points, which the violations then report as a count', () => {
    const copy = monolithFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const plan = { ...copy.hero.cards.plan, points: ['a', 'b'] }
    const broken = { ...copy, hero: { ...copy.hero, cards: { ...copy.hero.cards, plan } } }
    expect(monolithCopySchema.safeParse(broken).success).toBe(true)
    expect(monolithContract.copyViolations(broken)).toEqual([
      { slot: 'hero.cards.plan.points', length: 2, min: 3, max: 3 },
    ])
  })

  it('has a guide that names every slot the copy stage writes, and none it does not', () => {
    const lines = monolithContract.guide.split('\n')
    expect(lines).toContain(
      '- hero.headline.text: 18 to 60 characters, the headline, a plain promise in their words',
    )
    const optional = Object.keys(MONOLITH_SLOTS).filter((slot) =>
      /^(testimonials|team|pricing|newsletter|hero\.cards\.plan\.price)\./.test(slot),
    )
    expect(optional.length).toBeGreaterThan(0)
    expect(lines).toHaveLength(Object.keys(MONOLITH_SLOTS).length - optional.length)
    for (const slot of optional) expect(monolithContract.guide).not.toContain(`- ${slot}:`)
  })

  it('rejects a footer link with an unknown target', () => {
    const copy = monolithFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = {
      ...copy,
      footer: { groups: [{ heading: 'A', links: [{ label: 'x', target: 'pricing' }] }] },
    }
    expect(monolithCopySchema.safeParse(broken).success).toBe(false)
  })
})

describe('assembleMonolith', () => {
  const copy = monolithFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))

  it('gives a wordmark, no pictures and no optional sections when there are no assets', () => {
    const content = assembleMonolith(copy, { logo: { kind: 'wordmark' }, images: {}, email: null })
    expect(content.brand.logo).toEqual({ kind: 'wordmark' })
    expect(content.about.image).toBeNull()
    expect(content.hero.cards.quote.image).toBeNull()
    expect(content.hero.cards.plan.price).toBeNull()
    expect(content.features.items.map((item) => item.image)).toEqual([null, null, null])
    expect(content.testimonials).toBeNull()
    expect(content.team).toBeNull()
    expect(content.pricing).toBeNull()
    expect(content.newsletter).toBeNull()
  })

  it('places the pictures in their slots and fixes every link', () => {
    const assets: TemplateAssets = {
      logo: KESTREL_MONOLITH.brand.logo,
      images: {
        about: KESTREL_MONOLITH.about.image,
        'feature-2': KESTREL_MONOLITH.services.image,
        profile: KESTREL_MONOLITH.hero.cards.profile.image,
      },
      email: null,
    }
    const content = assembleMonolith(copy, assets)
    expect(content.about.image).toBe(KESTREL_MONOLITH.about.image)
    expect(content.features.items[1].image).toBe(KESTREL_MONOLITH.services.image)
    expect(content.hero.cards.profile.image).toBe(KESTREL_MONOLITH.hero.cards.profile.image)
    expect(content.nav.links.map((link) => link.href)).toEqual([
      '#features',
      '#about',
      '#how-it-works',
    ])
    expect(content.hero.cards.plan.action.href).toBe('#cta')
    expect(content.cta.secondary.href).toBe('#features')
    expect(content.footer.groups[1]?.links[1]?.href).toBe('#top')
  })
})
