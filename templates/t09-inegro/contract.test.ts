import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { type BrandBrief, fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleInegro, inegroContract, inegroCopySchema, inegroFallbackCopy } from './contract'
import { INEGRO_SLOTS } from './copy-slots'
import { KESTREL_INEGRO } from './example/content'

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

describe('inegroFallbackCopy', () => {
  it.each(CORPUS)('fits every slot for "%s"', (company, description) => {
    const copy = inegroFallbackCopy(fallbackBrief(company, description))
    expect(inegroContract.copyViolations(copy)).toEqual([])
  })

  it('fits every slot for a brief with fields outside the ranges', () => {
    const copy = inegroFallbackCopy(MODEL_BRIEF)
    expect(inegroContract.copyViolations(copy)).toEqual([])
    expect(copy.nav.cta).toBe('Get in touch')
    expect(copy.hero.headline).toEqual({
      text: 'Every job, every van, one calendar.',
      emphasis: '',
    })
    expect(copy.services.items.map((item) => item.name)).toEqual([
      'Speed',
      'Who it is for',
      'Get paid',
    ])
    // "Import" is shorter than a step's slot, so the plain first step stands in for it.
    expect(copy.process.steps).toEqual([
      'Tell us what you need',
      'Add the team',
      'Send the first quote',
    ])
  })

  it('reports a wrong number of boxes alone', () => {
    const copy = inegroFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const short = { ...copy, offers: { ...copy.offers, items: copy.offers.items.slice(0, 2) } }
    expect(inegroContract.copyViolations(short)).toEqual([
      { slot: 'offers.items', length: 2, min: 3, max: 3 },
    ])
  })
})

describe('inegroCopySchema', () => {
  it('has a guide that names every slot the copy stage writes, and none it does not', () => {
    const lines = inegroContract.guide.split('\n')
    expect(lines).toContain(
      '- hero.subhead: 50 to 110 characters, one sentence under the headline saying what they do and for whom',
    )
    const unwritten = ['notes.statement.name']
    expect(lines).toHaveLength(Object.keys(INEGRO_SLOTS).length - unwritten.length)
    for (const slot of unwritten) expect(inegroContract.guide).not.toContain(`- ${slot}:`)
  })

  it('rejects a link with an unknown target', () => {
    const copy = inegroFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = {
      ...copy,
      footer: { links: [{ label: 'x', target: 'pricing' }] },
    }
    expect(inegroCopySchema.safeParse(broken).success).toBe(false)
  })
})

describe('assembleInegro', () => {
  const copy = inegroFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))

  it('gives a wordmark, no pictures and no social links when there are no assets', () => {
    const content = assembleInegro(copy, { logo: { kind: 'wordmark' }, images: {}, email: null })
    expect(content.brand.logo).toEqual({ kind: 'wordmark' })
    expect(content.intro.image).toBeNull()
    expect(content.services.items.every((item) => item.image === null)).toBe(true)
    expect(content.closing.social).toBeNull()
    expect(content.newsletter.email).toBeNull()
    expect(content.closing.cta.href).toBe('#newsletter')
    expect(content.notes.statement.name).toBe(copy.brand.name)
  })

  it('places the pictures, sends the ask to the owner and fixes every link', () => {
    const assets: TemplateAssets = {
      logo: KESTREL_INEGRO.brand.logo,
      images: {
        intro: KESTREL_INEGRO.intro.image,
        'service-2': KESTREL_INEGRO.services.items[1]?.image ?? null,
        mission: KESTREL_INEGRO.mission.image,
      },
      email: 'owner@example.com',
    }
    const content = assembleInegro(copy, assets)
    expect(content.intro.image).toBe(KESTREL_INEGRO.intro.image)
    expect(content.services.items[1]?.image).toBe(KESTREL_INEGRO.services.items[1]?.image)
    expect(content.services.items[0]?.image).toBeNull()
    expect(content.approach.image).toBeNull()
    expect(content.mission.image).toBe(KESTREL_INEGRO.mission.image)
    expect(content.newsletter.email).toBe('owner@example.com')
    expect(content.closing.cta.href).toBe('mailto:owner@example.com')
    expect(content.nav.items.map((item) => [item.href, item.children.length])).toEqual([
      ['#services', copy.services.items.length],
      ['#intro', 3],
      ['#offers', 0],
      ['#process', 0],
    ])
    expect(content.nav.items[1]?.children.map((child) => child.href)).toEqual([
      '#intro',
      '#approach',
      '#mission',
    ])
    expect(content.intro.cta.href).toBe('#services')
    expect(content.approach.cta.href).toBe('#offers')
    expect(content.hero.links.map((link) => link.href)).toEqual([
      '#services',
      '#process',
      '#approach',
      '#contact',
    ])
    expect(content.footer.links[0]?.href).toBe('#intro')
  })
})
