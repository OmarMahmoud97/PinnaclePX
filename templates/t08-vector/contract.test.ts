import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { type BrandBrief, fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleVector, vectorContract, vectorCopySchema, vectorFallbackCopy } from './contract'
import { VECTOR_SLOTS } from './copy-slots'
import { KESTREL_VECTOR } from './example/content'

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

describe('vectorFallbackCopy', () => {
  it.each(CORPUS)('fits every slot for "%s"', (company, description) => {
    const copy = vectorFallbackCopy(fallbackBrief(company, description))
    expect(vectorContract.copyViolations(copy)).toEqual([])
  })

  it("names the items' block for what it holds, never work, and varies its labels", () => {
    const copy = vectorFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))
    const labels = [
      ...copy.nav.links,
      `${copy.projects.marquee.text} ${copy.projects.marquee.accent}`,
      ...copy.footer.navigation.map((link) => link.label),
      ...copy.footer.bottomLinks.map((link) => link.label),
    ]
    expect(labels.filter((label) => /\bwork\b/i.test(label))).toEqual([])
    expect(copy.projects.marquee).toEqual({ text: 'What', accent: 'we do' })
    expect(copy.nav.links[1]).toBe('What we do')
    const items = [...copy.footer.navigation, ...copy.footer.bottomLinks].filter(
      (link) => link.target === 'projects',
    )
    expect(items.map((link) => link.label)).toEqual(['Overview', 'At a glance'])
    // Only the menu and the marquee say it; the footer's two links to the block vary it.
    expect(labels.filter((label) => label === 'What we do')).toHaveLength(2)
  })

  it('fits every slot for a brief with fields outside the ranges', () => {
    const copy = vectorFallbackCopy(MODEL_BRIEF)
    expect(vectorContract.copyViolations(copy)).toEqual([])
    expect(copy.about.cta).toBe('Get in touch')
    expect(copy.services.items).toEqual(['What we offer', 'Who it is for', 'Get paid'])
    expect(copy.hero.subhead).toBe(
      'Every job, every van, one calendar. Get in touch to find out more.',
    )
  })
})

describe('vectorCopySchema', () => {
  it('has a guide that names every slot the copy stage writes, and none it does not', () => {
    const lines = vectorContract.guide.split('\n')
    expect(lines).toContain(
      '- hero.subhead: 60 to 170 characters, one or two sentences under the headline saying what they do and for whom',
    )
    const optional = Object.keys(VECTOR_SLOTS).filter((slot) =>
      /^(proof|footer\.places|footer\.social)[.[]|^footer\.services\.items\[\]$/.test(slot),
    )
    expect(optional.length).toBeGreaterThan(0)
    expect(lines).toHaveLength(Object.keys(VECTOR_SLOTS).length - optional.length)
    for (const slot of optional) expect(vectorContract.guide).not.toContain(`- ${slot}:`)
  })

  it('asks for items the business offers or is known for, never past work', () => {
    expect(vectorContract.guide.split('\n')).toContain(
      '- projects.items[].titleUp: 3 to 16 characters, two to four things they offer or are known for, each a title in two short parts: the first part',
    )
    expect(vectorContract.guide).not.toContain('pieces of work')
  })

  it('rejects a footer link with an unknown target', () => {
    const copy = vectorFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling.'))
    const broken = {
      ...copy,
      footer: { ...copy.footer, bottomLinks: [{ label: 'x', target: 'pricing' }] },
    }
    expect(vectorCopySchema.safeParse(broken).success).toBe(false)
  })
})

describe('assembleVector', () => {
  const copy = vectorFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))

  it('gives a wordmark, no pictures and no optional pieces when there are no assets', () => {
    const content = assembleVector(copy, { logo: { kind: 'wordmark' }, images: {}, email: null })
    expect(content.brand.logo).toEqual({ kind: 'wordmark' })
    expect(content.projects.items.every((item) => item.image === null)).toBe(true)
    expect(content.about.image).toBeNull()
    expect(content.proof).toBeNull()
    expect(content.footer.email).toBeNull()
    expect(content.footer.cta.href).toBe('#top')
    expect(content.footer.places).toBeNull()
    expect(content.footer.social).toBeNull()
    expect(content.footer.services.items).toEqual(copy.services.items)
  })

  it("gives the closing button's mail the button's words as its subject", () => {
    const asked = { ...copy, footer: { ...copy.footer, cta: 'Book a visit & a chat' } }
    const assets: TemplateAssets = {
      logo: { kind: 'wordmark' },
      images: {},
      email: 'owner@example.com',
    }
    expect(assembleVector(asked, assets).footer.cta.href).toBe(
      'mailto:owner@example.com?subject=Book%20a%20visit%20%26%20a%20chat',
    )
    expect(assembleVector(asked, { ...assets, email: null }).footer.cta.href).toBe('#top')
  })

  it('places the pictures, sends the footer to the owner and fixes every link', () => {
    const assets: TemplateAssets = {
      logo: KESTREL_VECTOR.brand.logo,
      images: {
        about: KESTREL_VECTOR.about.image,
        'project-2': KESTREL_VECTOR.projects.items[1]?.image ?? null,
      },
      email: 'owner@example.com',
    }
    const content = assembleVector(copy, assets)
    expect(content.about.image).toBe(KESTREL_VECTOR.about.image)
    expect(content.projects.items[1]?.image).toBe(KESTREL_VECTOR.projects.items[1]?.image)
    expect(content.projects.items[0]?.image).toBeNull()
    expect(content.footer.email).toBe('owner@example.com')
    expect(content.footer.cta.href).toBe(
      `mailto:owner@example.com?subject=${encodeURIComponent(copy.footer.cta)}`,
    )
    expect(content.nav.links.map((link) => [link.href, link.section])).toEqual([
      ['#top', 'hero'],
      ['#featured', 'featured'],
      ['#services-menu', 'services'],
      ['#about', 'about'],
      ['#faq', 'faq'],
      ['#contact', 'contact'],
    ])
    expect(content.about.cta.href).toBe('#contact')
    expect(content.footer.navigation.links[1]?.href).toBe('#featured')
    expect(content.footer.navigation.links[2]?.href).toBe('#services-menu')
    expect(content.footer.bottomLinks[0]?.href).toBe('#about')
  })
})
