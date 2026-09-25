import { drawnKey } from '@/app/preview/_components/drawn-key'
import { exampleView, type Stages } from '@/lib/preview/example'

const DEADLINE = new Date('2026-09-24T12:05:00Z')

function view(
  status: 'building' | 'ready',
  stages: Partial<Stages> = {},
  deadlineAt: Date = DEADLINE,
) {
  return exampleView(status, {
    slug: 'k7m2p9x4w3hd',
    conceptCount: 3,
    deadlineAt,
    brief: { company: 'Ashgrove Physio', description: 'Sports physiotherapy in Sheffield.' },
    photo: (templateId) => ({
      src: `https://example.com/${templateId}.jpg`,
      alt: '',
      width: 1920,
      height: 1280,
      credit: null,
    }),
    stages,
  })
}

// A build whose templates and colour are still being chosen.
const CHOOSING: Partial<Stages> = {
  templateIds: null,
  stageSelect: 'running',
  stageTokens: 'pending',
}

describe('drawnKey, for a page drawn from the full view', () => {
  it('changes when the templates and the colour arrive, though the status stays building', () => {
    const early = view('building', CHOOSING)
    const chosen = view('building')
    expect(early.palette).toBeNull()
    expect(chosen.palette).not.toBeNull()
    expect(drawnKey(early, true)).not.toBe(drawnKey(chosen, true))
  })

  it('changes with each stage that settles, and with the headlines and pictures', () => {
    const keys = [
      view('building'),
      view('building', { stageCopy: 'done' }),
      view('building', { stageCopy: 'done', stageImagery: 'fallback' }),
    ].map((each) => drawnKey(each, true))
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('is the same for the same build, whatever deadline the send fixed', () => {
    const later = new Date(DEADLINE.getTime() + 60_000)
    expect(drawnKey(view('building'), true)).toBe(drawnKey(view('building', {}, later), true))
  })
})

describe('drawnKey, for a page drawn from the status alone', () => {
  it('changes only when a design can be opened', () => {
    const shown = drawnKey(view('building', CHOOSING), false)
    expect(drawnKey(view('building', { stageCopy: 'done' }), false)).toBe(shown)
    expect(drawnKey(view('ready'), false)).not.toBe(shown)
  })

  it('says missing for a submission that is gone', () => {
    expect(drawnKey({ status: 'missing' }, false)).toBe('missing')
  })
})
