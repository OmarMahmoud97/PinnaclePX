import {
  briefView,
  countLine,
  NO_DESIGNS,
  outcomeOf,
  OWN_COLOUR,
  WORDMARK,
} from '@/app/admin/_components/brief-view'
import type { BriefOverviewRow } from '@/lib/db/briefs'

const APP = 'https://pinnacle-px.vercel.app'
const SLUG = 'k7m2p9x4w3hd'

const row: BriefOverviewRow = {
  createdAt: new Date('2026-10-01T13:05:00Z'),
  slug: SLUG,
  name: 'Sam Carter',
  email: 'sam@ashgrove.example',
  company: 'Ashgrove Physio',
  description: 'A physiotherapy clinic in Sheffield for runners and lifters.',
  logoFile: 'ashgrove.svg',
  logoUrl: 'https://blob.example/ashgrove.svg',
  look: 'warm',
  photoUrls: ['https://blob.example/one.jpg', 'https://blob.example/two.jpg'],
  colour: 'forest',
  templateIds: ['t01-aurora', 't05-ember', 't07-summit'],
  designPaths: [
    `/preview/${SLUG}/t01-aurora`,
    `/preview/${SLUG}/t05-ember`,
    `/preview/${SLUG}/t07-summit`,
  ],
  emailSentAt: new Date('2026-10-01T13:09:30Z'),
  settledAt: new Date('2026-10-01T13:09:00Z'),
}

describe('briefView', () => {
  const view = briefView(row, APP)

  it('carries the lead and the five answers in words', () => {
    expect(view).toMatchObject({
      slug: SLUG,
      submitted: '1 Oct 2026, 14:05',
      name: 'Sam Carter',
      email: 'sam@ashgrove.example',
      company: 'Ashgrove Physio',
      description: 'A physiotherapy clinic in Sheffield for runners and lifters.',
      logo: { label: 'ashgrove.svg', url: 'https://blob.example/ashgrove.svg' },
      look: 'Warm and natural',
      colour: { label: 'Forest', hex: '#2f6f4e' },
      outcome: 'Link sent 1 Oct 2026, 14:09',
    })
    expect(view.photos).toEqual([
      { label: 'Photo 1', url: 'https://blob.example/one.jpg' },
      { label: 'Photo 2', url: 'https://blob.example/two.jpg' },
    ])
  })

  it('names each design by its template and gives every address in full', () => {
    expect(view.designs.links.map((link) => link.label)).toEqual(['Aurora', 'Ember', 'Summit'])
    expect(view.designs.links[1]?.url).toBe(`${APP}/preview/${SLUG}/t05-ember`)
    expect(view.designs.hub).toBe(`${APP}/preview/${SLUG}`)
    expect(view.designs.note).toBeNull()
  })

  it('words a wordmark, a colour of their own and no photos', () => {
    const own = briefView(
      { ...row, logoFile: null, logoUrl: null, colour: '#ff5a1f', photoUrls: [] },
      APP,
    )
    expect(own.logo).toEqual({ label: WORDMARK, url: null })
    expect(own.colour).toEqual({ label: OWN_COLOUR, hex: '#ff5a1f' })
    expect(own.photos).toEqual([])
  })

  it('says why there are no designs: not chosen yet, or every one already seen', () => {
    const open = {
      ...row,
      templateIds: null,
      designPaths: null,
      emailSentAt: null,
      settledAt: null,
    }
    expect(briefView(open, APP).designs).toEqual({ links: [], hub: null, note: NO_DESIGNS.pending })
    const exhausted = { ...row, templateIds: [], designPaths: [], emailSentAt: null }
    expect(briefView(exhausted, APP).designs).toEqual({
      links: [],
      hub: null,
      note: NO_DESIGNS.exhausted,
    })
  })

  it('falls back to the id for a template it no longer knows', () => {
    const gone = { ...row, templateIds: ['t99-gone'], designPaths: [`/preview/${SLUG}/t99-gone`] }
    expect(briefView(gone, APP).designs.links).toEqual([
      { label: 't99-gone', url: `${APP}/preview/${SLUG}/t99-gone` },
    ])
  })
})

describe('outcomeOf', () => {
  it('reads the two stamps and claims nothing more', () => {
    const sent = new Date('2026-10-01T13:09:30Z')
    expect(outcomeOf({ emailSentAt: sent, settledAt: sent })).toBe('Link sent 1 Oct 2026, 14:09')
    expect(outcomeOf({ emailSentAt: null, settledAt: sent })).toBe('Finished, no link sent')
    expect(outcomeOf({ emailSentAt: null, settledAt: null })).toBe('No link sent yet')
  })
})

describe('countLine', () => {
  it('counts the briefs and says how long each stays', () => {
    expect(countLine(0, 200, 30)).toBe(
      'No briefs yet. A brief stays here for 30 days after it is sent, then the nightly sweep removes it.',
    )
    expect(countLine(1, 200, 30)).toMatch(/^1 brief, newest first\./)
    expect(countLine(17, 200, 30)).toMatch(/^17 briefs, newest first\./)
  })

  it('says when the page is full', () => {
    expect(countLine(200, 200, 30)).toMatch(/^The newest 200 briefs, newest first\./)
  })
})
