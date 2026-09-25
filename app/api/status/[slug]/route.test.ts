import { GET } from '@/app/api/status/[slug]/route'
import { readViewRow } from '@/lib/db/submissions'
import { POSTER_SLOTS, type ViewRow, viewOf } from '@/lib/preview/status'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/db/submissions', () => ({ readViewRow: vi.fn() }))

const SLUG = 'k7m2p9x4w3hd'

const ROW: ViewRow = {
  slug: SLUG,
  createdAt: new Date('2026-09-24T12:00:00Z'),
  deadlineAt: new Date('2026-09-24T12:05:00Z'),
  conceptCount: 3,
  templateIds: ['t01-aurora', 't02-monolith', 't03-meridian'],
  stageSelect: 'done',
  stageTokens: 'done',
  stageBrief: 'done',
  stageCopy: 'done',
  stageImagery: 'running',
  stageSelectAt: new Date('2026-09-24T12:00:06Z'),
  stageTokensAt: new Date('2026-09-24T12:00:07Z'),
  stageBriefAt: new Date('2026-09-24T12:00:21Z'),
  stageCopyAt: new Date('2026-09-24T12:00:58Z'),
  stageImageryAt: null,
  settledAt: null,
  paletteId: 'forest',
  fill: '#2f6f4e',
  copy: {},
  posterPhotos: {},
}

function poll(slug: string): Promise<Response> {
  return GET(new Request(`http://localhost/api/status/${slug}`), {
    params: Promise.resolve({ slug }),
  })
}

beforeEach(() => {
  vi.mocked(readViewRow).mockReset()
})

describe('GET /api/status/[slug]', () => {
  it('answers with the view of the row for that slug, and tells every cache to keep nothing', async () => {
    vi.mocked(readViewRow).mockResolvedValue(ROW)
    const response = await poll(SLUG)
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual(JSON.parse(JSON.stringify(viewOf(ROW))))
    expect(readViewRow).toHaveBeenCalledWith(SLUG, POSTER_SLOTS)
  })

  it('answers missing for a slug that names no submission', async () => {
    vi.mocked(readViewRow).mockResolvedValue(null)
    const response = await poll(SLUG)
    expect(await response.json()).toEqual({ status: 'missing' })
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('answers missing for a slug that is not one of ours, without reading the database', async () => {
    const response = await poll('NOT-A-SLUG')
    expect(await response.json()).toEqual({ status: 'missing' })
    expect(readViewRow).not.toHaveBeenCalled()
  })
})
