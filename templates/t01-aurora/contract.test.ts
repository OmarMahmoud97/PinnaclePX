import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { type BrandBrief, fallbackBrief } from '@/lib/copy-slots/brief'
import { KESTREL } from './example/content'
import { assembleAurora, auroraContract, auroraCopySchema, auroraFallbackCopy } from './contract'

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

describe('auroraFallbackCopy', () => {
  it.each(CORPUS)('fits every slot for "%s"', (company, description) => {
    const copy = auroraFallbackCopy(fallbackBrief(company, description))
    expect(auroraContract.copyViolations(copy)).toEqual([])
  })

  it('fits every slot for a brief with fields outside the ranges', () => {
    const copy = auroraFallbackCopy(MODEL_BRIEF)
    expect(auroraContract.copyViolations(copy)).toEqual([])
    // The out-of-range label was replaced, the in-range ones kept.
    expect(copy.cta.action).toBe('Get in touch')
    expect(copy.features.items[1]?.title).toBe('Who it is for')
    expect(copy.features.items[2]?.title).toBe('Get paid')
  })

  it("uses the visitor's words in the prose slots", () => {
    const copy = auroraFallbackCopy(
      fallbackBrief('Ashgrove Physio', 'Physiotherapy clinic in Sheffield. Sports injuries.'),
    )
    expect(copy.hero.headline).toBe('Physiotherapy clinic in Sheffield.')
    expect(copy.hero.subhead).toMatch(/^Physiotherapy clinic in Sheffield\. Sports injuries\./)
    expect(copy.brand.name).toBe('Ashgrove Physio')
  })

  it('shortens a company name that is too long for the wordmark at a word boundary', () => {
    const copy = auroraFallbackCopy(fallbackBrief('Ashgrove Physiotherapy and Sports', 'x'))
    expect(copy.brand.name).toBe('Ashgrove Physiotherapy')
    expect(copy.brand.legalName).toBe('Ashgrove Physiotherapy and Sports')
  })
})

describe('auroraCopySchema', () => {
  it('rejects a frame with two rows', () => {
    const copy = auroraFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = { ...copy, hero: { ...copy.hero, frame: { title: 'x', rows: ['a', 'b'] } } }
    expect(auroraCopySchema.safeParse(broken).success).toBe(false)
  })

  it('rejects a footer link with an unknown target', () => {
    const copy = auroraFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = {
      ...copy,
      footer: { groups: [{ heading: 'A', links: [{ label: 'x', target: 'pricing' }] }] },
    }
    expect(auroraCopySchema.safeParse(broken).success).toBe(false)
  })
})

describe('assembleAurora', () => {
  const copy = auroraFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))

  it('gives a wordmark and no pictures when there are no assets', () => {
    const content = assembleAurora(copy, { logo: { kind: 'wordmark' }, images: {} })
    expect(content.brand.logo).toEqual({ kind: 'wordmark' })
    expect(content.hero.image).toBeNull()
    expect(content.statement.image).toBeNull()
  })

  it('places the logo and the images in their slots and fixes every link', () => {
    const assets: TemplateAssets = {
      logo: KESTREL.brand.logo,
      images: { hero: KESTREL.hero.image, statement: KESTREL.statement.image },
    }
    const content = assembleAurora(copy, assets)
    expect(content.hero.image).toBe(KESTREL.hero.image)
    expect(content.statement.image).toBe(KESTREL.statement.image)
    expect(content.nav.links.map((link) => link.href)).toEqual([
      '#features',
      '#how-it-works',
      '#why',
    ])
    expect(content.cta.action.href).toBe('#start')
    expect(content.footer.groups[1]?.links[1]?.href).toBe('#top')
  })
})
