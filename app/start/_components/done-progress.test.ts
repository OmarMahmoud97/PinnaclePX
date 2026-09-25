import { buildSaid, stageSaid } from '@/app/start/_components/done-copy'
import {
  bookingHref,
  heardAfter,
  heardAtOpen,
  intermissionAt,
  isEarly,
  isLit,
  landedOf,
  logOf,
  newsOf,
  saidOf,
  stageNow,
  tookOf,
} from '@/app/start/_components/done-progress'
import type { DoneDetails } from '@/app/start/_components/done-storage'
import { lineText } from '@/app/start/_components/start-copy'
import type { FoundView } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'
import { type Stages, exampleView } from '@/lib/preview/example'
import { SITE } from '@/lib/site'

const SLUG = 'k7m2p9x4w3hd'
const DEADLINE = new Date('2026-09-25T10:05:00.000Z')
const ARRIVED = DEADLINE.getTime() - CONFIG.deadline.totalMs

const DETAILS: DoneDetails = {
  slug: SLUG,
  first: 'Sam',
  company: 'Gibbs Plumbing',
  email: 'sam@gibbs.example',
  paletteLabel: 'Forest',
  styleLabel: 'Warm and natural',
  photos: 0,
}

// The example build (lib/preview/example.ts) in a state, as the status route would report it.
function view(
  status: FoundView['status'],
  { conceptCount = 3, stages }: { conceptCount?: number; stages?: Partial<Stages> } = {},
): FoundView {
  return exampleView(status, {
    slug: SLUG,
    conceptCount,
    deadlineAt: DEADLINE,
    brief: { company: 'Gibbs Plumbing', description: 'Plumber in Leeds. Boilers and leaks.' },
    photo: (templateId) => ({
      src: `https://e2e.public.blob.vercel-storage.com/photos/${templateId}.jpg`,
      alt: '',
      width: 1920,
      height: 1280,
      credit: { photographer: 'Ana Ruiz', url: 'https://www.pexels.com/@ana-ruiz' },
    }),
    stages,
  })
}

const logText = (lines: ReturnType<typeof logOf>) =>
  lines.map(({ words, atS }) => [typeof words === 'string' ? words : lineText(words), atS])

// A build just sent: the templates still being chosen, nothing landed.
const JUST_SENT: Partial<Stages> = {
  templateIds: null,
  stageSelect: 'running',
  stageTokens: 'pending',
  stageBrief: 'pending',
  stageCopy: 'pending',
  stageImagery: 'pending',
}

describe('a build just sent', () => {
  it('logs only the brief’s arrival, and counts no stage landed', () => {
    const fresh = view('building', { stages: JUST_SENT })
    expect(landedOf(fresh)).toBe(0)
    expect(logOf(fresh, DETAILS)).toEqual([
      {
        id: 'received',
        words: { before: 'Brief received for ', echo: 'Gibbs Plumbing', after: '.' },
        running: false,
        atS: 0,
      },
    ])
    expect(stageNow(fresh)).toBe('select')
  })
})

describe('the log', () => {
  it('stamps each stage as it lands, and names the headlines and photos while they are made', () => {
    expect(logText(logOf(view('building'), DETAILS))).toEqual([
      ['Brief received for Gibbs Plumbing.', 0],
      ['Three layouts chosen for Gibbs Plumbing.', 6],
      ['Your Forest set in 14 tones, every text colour checked for easy reading.', 7],
      ['Your brief written from your sentence.', 21],
      ['Writing three headlines', null],
      ['Finding photos for a warm and natural look', null],
    ])
    expect(landedOf(view('building'))).toBe(3)
  })

  it('says the photos being placed are the visitor’s own when they sent some', () => {
    const lines = logOf(view('building'), { ...DETAILS, photos: 2 })
    expect(logText(lines).at(-1)).toEqual(['Placing your two photos', null])
  })

  it('ends on what was made, or set simply to finish on time', () => {
    expect(logText(logOf(view('ready'), DETAILS)).slice(-2)).toEqual([
      ['Three headlines written.', 58],
      ['Photos placed, each photographer credited.', 64],
    ])
    expect(logText(logOf(view('partial'), DETAILS)).at(-1)).toEqual([
      'Some photo spaces left plain, to finish on time.',
      64,
    ])
    expect(landedOf(view('ready'))).toBe(5)
  })

  it('drops the business, and the running photos, when the tab no longer knows them', () => {
    expect(logText(logOf(view('building'), null))).toEqual([
      ['Brief received.', 0],
      ['Three layouts chosen.', 6],
      ['Your Forest set in 14 tones, every text colour checked for easy reading.', 7],
      ['Your brief written from your sentence.', 21],
      ['Writing three headlines', null],
    ])
  })

  it('counts in the build’s own number of designs', () => {
    expect(logText(logOf(view('building', { conceptCount: 2 }), null)).slice(1, 2)).toEqual([
      ['Two layouts chosen.', 6],
    ])
  })
})

describe('the times', () => {
  it('says how long the build took, and whether it beat the five minutes', () => {
    expect(tookOf(view('building'))).toBeNull()
    expect(tookOf(view('ready'))).toBe('1:04')
    expect(isEarly(view('ready'))).toBe(true)
    const slow: FoundView = { ...view('ready'), settledS: 250 }
    expect(tookOf(slow)).toBe('4:10')
    expect(isEarly(slow)).toBe(false)
  })

  it('offers the call a minute in, or at once when the headlines have landed', () => {
    expect(intermissionAt(view('building'))).toBe(ARRIVED + CONFIG.start.wait.intermissionMs)
    expect(intermissionAt(view('building', { stages: { stageCopy: 'done' } }))).toBe(ARRIVED)
  })

  it('names the stage the build is at, for a visitor who leaves the tab', () => {
    expect(stageNow(view('building'))).toBe('copy')
  })
})

describe('the status line', () => {
  const opened = heardAtOpen(newsOf(view('building'), false))
  const saidAfter = (next: FoundView, late = false) =>
    saidOf(heardAfter(opened, newsOf(next, late)), 3)

  it('says nothing that was already so when the view opened', () => {
    expect(saidOf(opened, 3)).toBe('')
    expect(heardAfter(opened, newsOf(view('building'), false))).toBe(opened)
  })

  it('says each stage once, as it lands, and the build’s end', () => {
    expect(saidAfter(view('building', { stages: { stageCopy: 'done' } }))).toBe(
      stageSaid(3).headlines,
    )
    expect(saidAfter(view('ready'))).toBe(buildSaid(3).ready)
    expect(saidAfter(view('partial'))).toBe(buildSaid(3).ready)
    expect(saidAfter(view('building'), true)).toBe(buildSaid(3).late)
    expect(saidAfter(view('failed'))).toBe(buildSaid(3).failed)
    expect(saidAfter(view('exhausted'))).toBe(buildSaid(3).exhausted)
  })

  it('still says a stage that lands after the time has run out', () => {
    const late = heardAfter(opened, newsOf(view('building'), true))
    expect(saidOf(late, 3)).toBe(buildSaid(3).late)
    // The photos land while the headlines are still being written.
    const photos = view('building', { stages: { stageImagery: 'done' } })
    expect(photos.status).toBe('building')
    const landed = heardAfter(late, newsOf(photos, true))
    expect(saidOf(landed, 3)).toBe(stageSaid(3).photos)
    // Said once: the next poll with nothing new keeps the line as it is.
    expect(heardAfter(landed, newsOf(photos, true))).toBe(landed)
  })

  it('counts in words, for a build of two', () => {
    expect(buildSaid(2).ready).toBe('Both designs are ready to open.')
    expect(stageSaid(2).layouts).toBe('Two layouts chosen.')
    expect(isLit('partial') && isLit('ready') && !isLit('building')).toBe(true)
  })
})

describe('the booking link', () => {
  it('is filled in with the first name and email while the tab has them', () => {
    const href = new URL(bookingHref(DETAILS))
    expect(href.origin + href.pathname).toBe(SITE.bookingUrl)
    expect(href.searchParams.get('name')).toBe('Sam')
    expect(href.searchParams.get('email')).toBe('sam@gibbs.example')
  })

  it('is the plain booking page for a done view opened from a link', () => {
    expect(bookingHref(null)).toBe(SITE.bookingUrl)
    expect(bookingHref({ ...DETAILS, first: '' })).not.toContain('name=')
  })
})
