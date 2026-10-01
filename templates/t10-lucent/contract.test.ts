import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { type BrandBrief, fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleLucent, lucentContract, lucentCopySchema, lucentFallbackCopy } from './contract'
import { LUCENT_SLOTS } from './copy-slots'
import { SUBSCRR_LUCENT } from './example/content'

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

describe('lucentFallbackCopy', () => {
  it.each(CORPUS)('fits every slot for "%s"', (company, description) => {
    const copy = lucentFallbackCopy(fallbackBrief(company, description))
    expect(lucentContract.copyViolations(copy)).toEqual([])
  })

  it('fits every slot for a brief with fields outside the ranges', () => {
    const copy = lucentFallbackCopy(MODEL_BRIEF)
    expect(lucentContract.copyViolations(copy)).toEqual([])
    expect(copy.nav.cta).toBe('Get in touch')
    expect(copy.hero.headline).toBe('Every job, every van, one calendar.')
    // "Speed" is shorter than a tick's slot, so the plain line stands in for it.
    expect(copy.overview.ticks).toEqual([
      'What we do, in plain words',
      'Quote from the van before you leave the job',
      'How to start, in plain words',
    ])
    // A step's pill takes a title as short as six letters, so "Import" stands as written.
    expect(copy.steps.items).toEqual(['Import', 'Add the team', 'Send the first quote'])
    expect(copy.features.items.map((item) => item.label)).toEqual([
      'Speed',
      'Who it is for',
      'Get paid',
      'Why we exist',
    ])
  })

  it('reports a wrong number of lines alone', () => {
    const copy = lucentFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const short = { ...copy, breakdown: { ...copy.breakdown, heading: ['Clear.', 'Plain.'] } }
    expect(lucentContract.copyViolations(short)).toEqual([
      { slot: 'breakdown.heading', length: 2, min: 3, max: 3 },
    ])
  })

  it('reports a feature card missing from the rail alone', () => {
    const copy = lucentFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const short = { ...copy, features: { items: copy.features.items.slice(0, 3) } }
    expect(lucentContract.copyViolations(short)).toEqual([
      { slot: 'features.items', length: 3, min: 4, max: 4 },
    ])
  })
})

describe('lucentCopySchema', () => {
  it('has a guide that names every slot the copy stage writes, and none it does not', () => {
    const lines = lucentContract.guide.split('\n')
    expect(lines).toContain(
      '- hero.lead: 60 to 150 characters, one or two sentences under the headline saying what they do and for whom',
    )
    const unwritten = ['features.items[].badge']
    expect(lines).toHaveLength(Object.keys(LUCENT_SLOTS).length - unwritten.length)
    for (const slot of unwritten) expect(lucentContract.guide).not.toContain(`- ${slot}:`)
  })

  it('rejects a link with an unknown target', () => {
    const copy = lucentFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = {
      ...copy,
      footer: { ...copy.footer, links: [{ label: 'Prices', target: 'pricing' }] },
    }
    expect(lucentCopySchema.safeParse(broken).success).toBe(false)
  })
})

describe('assembleLucent', () => {
  const copy = lucentFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))

  it('gives a wordmark, no pictures, no pricing and no networks when there are no assets', () => {
    const content = assembleLucent(copy, { logo: { kind: 'wordmark' }, images: {}, email: null })
    expect(content.brand.logo).toEqual({ kind: 'wordmark' })
    expect(content.hero.image).toBeNull()
    expect(content.features.items.every((item) => item.image === null && item.badge === null)).toBe(
      true,
    )
    expect(content.pair.images).toEqual([null, null])
    expect(content.pricing).toBeNull()
    expect(content.footer.social).toBeNull()
    expect(content.footer.contact).toBeNull()
    expect(content.footer.markAsInitial).toBe(false)
    expect(content.journal.form.email).toBeNull()
    // With no address, the ask leads to the email form on the picture card.
    expect(content.footer.href).toBe('#contact-form')
    expect(content.footer.button.href).toBe('#contact-form')
    expect(content.journal.link.href).toBe('#contact-form')
  })

  it('places the pictures, sends the ask to the owner and fixes every link', () => {
    const assets: TemplateAssets = {
      logo: SUBSCRR_LUCENT.brand.logo,
      images: {
        hero: SUBSCRR_LUCENT.hero.image,
        'feature-2': SUBSCRR_LUCENT.features.items[1].image,
        'pair-2': SUBSCRR_LUCENT.pair.images[1],
        journal: SUBSCRR_LUCENT.journal.image,
      },
      email: 'owner@example.com',
    }
    const content = assembleLucent(copy, assets)
    expect(content.hero.image).toBe(SUBSCRR_LUCENT.hero.image)
    expect(content.features.items[1].image).toBe(SUBSCRR_LUCENT.features.items[1].image)
    expect(content.features.items[0].image).toBeNull()
    expect(content.pair.images).toEqual([null, SUBSCRR_LUCENT.pair.images[1]])
    expect(content.promo.image).toBeNull()
    expect(content.journal.form.email).toBe('owner@example.com')
    expect(content.footer.href).toBe('mailto:owner@example.com')
    expect(content.footer.contact).toEqual({
      label: copy.footer.contact,
      email: 'owner@example.com',
    })
    expect(content.nav.items.map((item) => item.href)).toEqual([
      '#overview',
      '#feature-4',
      '#faq',
      '#contact',
    ])
    expect(content.nav.cta.href).toBe('#contact')
    expect(content.hero.cta.href).toBe('#contact')
    expect(content.hero.secondary.href).toBe('#overview')
    expect(content.features.items.every((item) => item.more.href === '#contact')).toBe(true)
    expect(content.footer.links.map((link) => link.href)).toEqual(['#overview', '#faq', '#contact'])
  })
})
