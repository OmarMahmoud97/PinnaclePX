import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { type BrandBrief, fallbackBrief } from '@/lib/copy-slots/brief'
import {
  assembleMeridian,
  meridianContract,
  meridianCopySchema,
  meridianFallbackCopy,
} from './contract'
import { MERIDIAN_SLOTS } from './copy-slots'
import { KESTREL_MERIDIAN } from './example/content'

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

describe('meridianFallbackCopy', () => {
  it.each(CORPUS)('fits every slot for "%s"', (company, description) => {
    const copy = meridianFallbackCopy(fallbackBrief(company, description))
    expect(meridianContract.copyViolations(copy)).toEqual([])
  })

  it('fits every slot for a brief with fields outside the ranges', () => {
    const copy = meridianFallbackCopy(MODEL_BRIEF)
    expect(meridianContract.copyViolations(copy)).toEqual([])
    expect(copy.community.action).toBe('Get in touch')
    expect(copy.benefits.items.map((item) => item.title)).toEqual([
      'What we do',
      'Who it is for',
      'Get paid',
      'What happens next',
    ])
    expect(copy.contact.rows[0]?.title).toBe('Import')
  })

  it('never colours a word it did not choose', () => {
    const copy = meridianFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    expect(copy.hero.headline.emphasis).toBe('')
    expect(copy.community.heading.emphasis).toBe('')
  })
})

describe('meridianCopySchema', () => {
  it('accepts three benefits, which the violations then report as a count', () => {
    const copy = meridianFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = {
      ...copy,
      benefits: { ...copy.benefits, items: copy.benefits.items.slice(0, 3) },
    }
    expect(meridianCopySchema.safeParse(broken).success).toBe(true)
    expect(meridianContract.copyViolations(broken)).toEqual([
      { slot: 'benefits.items', length: 3, min: 4, max: 4 },
    ])
  })

  it('has a guide that names every slot the copy stage writes, and none it does not', () => {
    const lines = meridianContract.guide.split('\n')
    expect(lines).toContain(
      '- hero.headline.text: 18 to 60 characters, the headline, a plain promise in their words',
    )
    const optional = Object.keys(MERIDIAN_SLOTS).filter((slot) =>
      /^(testimonials|team|pricing)\./.test(slot),
    )
    expect(optional.length).toBeGreaterThan(0)
    expect(lines).toHaveLength(Object.keys(MERIDIAN_SLOTS).length - optional.length)
    for (const slot of optional) expect(meridianContract.guide).not.toContain(`- ${slot}:`)
  })

  it('rejects a footer link with an unknown target', () => {
    const copy = meridianFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = {
      ...copy,
      footer: { groups: [{ heading: 'A', links: [{ label: 'x', target: 'pricing' }] }] },
    }
    expect(meridianCopySchema.safeParse(broken).success).toBe(false)
  })
})

describe('assembleMeridian', () => {
  const copy = meridianFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))

  it('gives a wordmark, no picture, no email and no optional sections without assets', () => {
    const content = assembleMeridian(copy, { logo: { kind: 'wordmark' }, images: {}, email: null })
    expect(content.brand.logo).toEqual({ kind: 'wordmark' })
    expect(content.hero.image).toBeNull()
    expect(content.nav.menu.image).toBeNull()
    expect(content.contact.form.email).toBeNull()
    expect(content.testimonials).toBeNull()
    expect(content.team).toBeNull()
    expect(content.pricing).toBeNull()
    expect(content.services.items.every((item) => !item.pro)).toBe(true)
  })

  it('places the picture in its slots, passes the email and fixes every link', () => {
    const assets: TemplateAssets = {
      logo: KESTREL_MERIDIAN.brand.logo,
      images: { hero: KESTREL_MERIDIAN.hero.image },
      email: 'owner@example.com',
    }
    const content = assembleMeridian(copy, assets)
    expect(content.hero.image).toBe(KESTREL_MERIDIAN.hero.image)
    expect(content.nav.menu.image).toBe(KESTREL_MERIDIAN.hero.image)
    expect(content.contact.form.email).toBe('owner@example.com')
    expect(content.nav.links.map((link) => link.href)).toEqual([
      '#benefits',
      '#services',
      '#contact',
    ])
    expect(content.hero.primary.href).toBe('#community')
    expect(content.community.action.href).toBe('#contact')
    expect(content.footer.groups[1]?.links[1]?.href).toBe('#top')
  })
})
