import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { type BrandBrief, fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleAtlas, atlasContract, atlasCopySchema, atlasFallbackCopy } from './contract'
import { ATLAS_SLOTS } from './copy-slots'
import { KESTREL_ATLAS } from './example/content'

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

describe('atlasFallbackCopy', () => {
  it.each(CORPUS)('fits every slot for "%s"', (company, description) => {
    const copy = atlasFallbackCopy(fallbackBrief(company, description))
    expect(atlasContract.copyViolations(copy)).toEqual([])
  })

  it('fits every slot for a brief with fields outside the ranges', () => {
    const copy = atlasFallbackCopy(MODEL_BRIEF)
    expect(atlasContract.copyViolations(copy)).toEqual([])
    expect(copy.hero.primary).toBe('Get in touch')
    expect(copy.why.items.map((item) => item.title)).toEqual([
      'What we do',
      'Who it is for',
      'Get paid',
    ])
    expect(copy.steps.items[0]?.title).toBe('Import')
    expect(copy.hero.eyebrow).toBe('Kestrel')
  })

  it('never colours a word it did not choose', () => {
    const copy = atlasFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    expect(copy.hero.headline.emphasis).toBe('')
    expect(copy.pitch.heading.emphasis).toBe('')
  })
})

describe('atlasCopySchema', () => {
  it('accepts two glance columns, which the violations then report as a count', () => {
    const copy = atlasFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = {
      ...copy,
      glance: { ...copy.glance, columns: copy.glance.columns.slice(0, 2) },
    }
    expect(atlasCopySchema.safeParse(broken).success).toBe(true)
    expect(atlasContract.copyViolations(broken)).toEqual([
      { slot: 'glance.columns', length: 2, min: 3, max: 3 },
    ])
  })

  it('has a guide that names every slot the copy stage writes, and none it does not', () => {
    const lines = atlasContract.guide.split('\n')
    expect(lines).toContain(
      '- hero.headline.text: 18 to 60 characters, the headline, a plain promise in their words',
    )
    const optional = Object.keys(ATLAS_SLOTS).filter((slot) =>
      /^(market|pitch\.exchange|partners|footer\.newsletter)\./.test(slot),
    )
    expect(optional.length).toBeGreaterThan(0)
    expect(lines).toHaveLength(Object.keys(ATLAS_SLOTS).length - optional.length)
    for (const slot of optional) expect(atlasContract.guide).not.toContain(`- ${slot}:`)
  })

  it('rejects a footer link with an unknown target', () => {
    const copy = atlasFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = {
      ...copy,
      footer: { ...copy.footer, columns: [[{ label: 'x', target: 'pricing' }]] },
    }
    expect(atlasCopySchema.safeParse(broken).success).toBe(false)
  })
})

describe('assembleAtlas', () => {
  const copy = atlasFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))

  it('gives a wordmark, no pictures and no optional parts when there are no assets', () => {
    const content = assembleAtlas(copy, { logo: { kind: 'wordmark' }, images: {}, email: null })
    expect(content.brand.logo).toEqual({ kind: 'wordmark' })
    expect(content.hero.image).toBeNull()
    expect(content.faq.image).toBeNull()
    expect(content.market).toBeNull()
    expect(content.pitch.exchange).toBeNull()
    expect(content.partners).toBeNull()
    expect(content.footer.newsletter).toBeNull()
    expect(content.steps.items.map((step) => step.image)).toEqual([null, null, null])
  })

  it('places the pictures in their slots and fixes every link', () => {
    const assets: TemplateAssets = {
      logo: KESTREL_ATLAS.brand.logo,
      images: { hero: KESTREL_ATLAS.hero.image, why: KESTREL_ATLAS.why.image },
      email: null,
    }
    const content = assembleAtlas(copy, assets)
    expect(content.hero.image).toBe(KESTREL_ATLAS.hero.image)
    expect(content.why.image).toBe(KESTREL_ATLAS.why.image)
    expect(content.pitch.image).toBeNull()
    expect(content.nav.links.map((link) => link.href)).toEqual([
      '#start',
      '#offer',
      '#tools',
      '#why',
      '#faq',
    ])
    expect(content.nav.menu.items.map((item) => item.href)).toEqual(['#how-it-works', '#top'])
    expect(content.glance.more.href).toBe('#why')
    expect(content.pitch.action.href).toBe('#start')
    expect(content.footer.columns[1]?.[2]?.href).toBe('#top')
  })
})
