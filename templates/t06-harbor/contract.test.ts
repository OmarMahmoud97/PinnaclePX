import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { type BrandBrief, fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleHarbor, harborContract, harborCopySchema, harborFallbackCopy } from './contract'
import { HARBOR_SLOTS } from './copy-slots'
import { KESTREL_HARBOR } from './example/content'

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

describe('harborFallbackCopy', () => {
  it.each(CORPUS)('fits every slot for "%s"', (company, description) => {
    const copy = harborFallbackCopy(fallbackBrief(company, description))
    expect(harborContract.copyViolations(copy)).toEqual([])
  })

  it('fits every slot for a brief with fields outside the ranges', () => {
    const copy = harborFallbackCopy(MODEL_BRIEF)
    expect(harborContract.copyViolations(copy)).toEqual([])
    expect(copy.cta.primary).toBe('Get in touch')
    expect(copy.hero.badge).toBe('In our own words')
    expect(copy.services.items.map((item) => item.title)).toEqual([
      'What we do',
      'Who it is for',
      'Get paid',
    ])
    expect(copy.metrics.items.map((item) => item.label)).toEqual([
      'Import',
      'Add the team',
      'Send the first quote',
    ])
  })

  it('never lights a phrase it did not choose', () => {
    const copy = harborFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    expect(copy.about.heading.emphasis).toBe('')
    expect(copy.cta.heading.emphasis).toBe('')
  })
})

describe('harborCopySchema', () => {
  it('accepts two figures in the hero, which the violations then report as a count', () => {
    const copy = harborFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = { ...copy, hero: { ...copy.hero, stats: copy.hero.stats.slice(0, 2) } }
    expect(harborCopySchema.safeParse(broken).success).toBe(true)
    expect(harborContract.copyViolations(broken)).toEqual([
      { slot: 'hero.stats', length: 2, min: 3, max: 3 },
    ])
  })

  it('has a guide that names every slot the copy stage writes, and none it does not', () => {
    const lines = harborContract.guide.split('\n')
    expect(lines).toContain(
      '- hero.subhead: 40 to 140 characters, one or two short sentences under the headline',
    )
    const optional = Object.keys(HARBOR_SLOTS).filter((slot) =>
      /^(about\.badge|about\.quotes|gallery|pricing|testimonials|partners|blog)[.[]/.test(slot),
    )
    expect(optional.length).toBeGreaterThan(0)
    expect(lines).toHaveLength(Object.keys(HARBOR_SLOTS).length - optional.length)
    for (const slot of optional) expect(harborContract.guide).not.toContain(`- ${slot}:`)
  })

  it('rejects a footer link with an unknown target', () => {
    const copy = harborFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = {
      ...copy,
      footer: {
        ...copy.footer,
        columns: [{ heading: 'A', links: [{ label: 'x', target: 'pricing' }] }],
      },
    }
    expect(harborCopySchema.safeParse(broken).success).toBe(false)
  })
})

describe('assembleHarbor', () => {
  const copy = harborFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))

  it('gives a wordmark, no pictures and no optional pieces when there are no assets', () => {
    const content = assembleHarbor(copy, { logo: { kind: 'wordmark' }, images: {}, email: null })
    expect(content.brand.logo).toEqual({ kind: 'wordmark' })
    expect(content.hero.image).toBeNull()
    expect(content.about.image).toBeNull()
    expect(content.about.badge).toBeNull()
    expect(content.about.quotes).toBeNull()
    expect(content.gallery).toBeNull()
    expect(content.pricing).toBeNull()
    expect(content.testimonials).toBeNull()
    expect(content.partners).toBeNull()
    expect(content.blog).toBeNull()
    expect(content.cta.image).toBeNull()
    expect(content.contact.form.email).toBeNull()
    expect(content.footer.newsletter.email).toBeNull()
    expect(content.footer.socials).toBeNull()
  })

  it('places the pictures in their slots, sends the forms to the owner and fixes every link', () => {
    const assets: TemplateAssets = {
      logo: KESTREL_HARBOR.brand.logo,
      images: {
        hero: KESTREL_HARBOR.hero.image,
        about: KESTREL_HARBOR.about.image,
        cta: KESTREL_HARBOR.cta.image,
      },
      email: 'owner@example.com',
    }
    const content = assembleHarbor(copy, assets)
    expect(content.hero.image).toBe(KESTREL_HARBOR.hero.image)
    expect(content.about.image).toBe(KESTREL_HARBOR.about.image)
    expect(content.cta.image).toBe(KESTREL_HARBOR.cta.image)
    expect(content.contact.form.email).toBe('owner@example.com')
    expect(content.footer.newsletter.email).toBe('owner@example.com')
    expect(content.nav.links.map((link) => link.href)).toEqual([
      '#hero',
      '#about',
      '#services',
      '#contact',
    ])
    expect(content.nav.cta.href).toBe('#contact')
    expect(content.hero.primary.href).toBe('#contact')
    expect(content.hero.secondary.href).toBe('#about')
    expect(content.cta.primary.href).toBe('#contact')
    expect(content.cta.secondary.href).toBe('#about')
    expect(content.footer.columns[1]?.links[1]?.href).toBe('#top')
  })
})
