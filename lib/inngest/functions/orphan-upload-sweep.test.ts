import { list, type ListBlobResult, type ListBlobResultBlob } from '@vercel/blob'
import { deleteBlobs } from '@/lib/blob/delete'
import { urlReferencedElsewhere } from '@/lib/db/retention'
import { sweepUnsentUploads } from '@/lib/inngest/functions/orphan-upload-sweep'

vi.mock('server-only', () => ({}))
vi.mock('@vercel/blob', () => ({ list: vi.fn() }))
vi.mock('@/lib/blob/delete', () => ({ deleteBlobs: vi.fn() }))
vi.mock('@/lib/db/retention', () => ({ urlReferencedElsewhere: vi.fn() }))

const NOW = Date.parse('2026-09-25T03:00:00Z')
const HOUR_MS = 3_600_000
const BLOB = 'https://x.public.blob.vercel-storage.com'

function stored(pathname: string, hoursOld: number): ListBlobResultBlob {
  const url = `${BLOB}/${pathname}`
  return {
    url,
    downloadUrl: `${url}?download=1`,
    pathname,
    size: 1_000,
    uploadedAt: new Date(NOW - hoursOld * HOUR_MS),
    etag: pathname,
  }
}

const OLD_UNSENT = stored(`logos/${'a'.repeat(64)}.png`, 30)
const OLD_SENT = stored(`logos/${'b'.repeat(64)}.svg`, 30)
const FRESH_UNSENT = stored(`photos/${'c'.repeat(64)}.jpg`, 2)
const OLD_UNSENT_PHOTO = stored(`photos/${'d'.repeat(64)}.webp`, 25)
const JUST_UNDER = stored(`photos/${'e'.repeat(64)}.jpg`, 23.9)

// Each folder as the store lists it: the logos over two pages, the photos on one.
const PAGES: Readonly<Record<string, readonly ListBlobResult[]>> = {
  'logos/': [
    { blobs: [OLD_UNSENT], cursor: 'next', hasMore: true },
    { blobs: [OLD_SENT], hasMore: false },
  ],
  'photos/': [{ blobs: [FRESH_UNSENT, OLD_UNSENT_PHOTO, JUST_UNDER], hasMore: false }],
}

beforeEach(() => {
  vi.mocked(list)
    .mockReset()
    .mockImplementation((options) => {
      const pages = PAGES[options?.prefix ?? ''] ?? []
      const page = pages[options?.cursor === undefined ? 0 : 1]
      if (page === undefined) throw new Error('listed a page that does not exist')
      return Promise.resolve(page)
    })
  vi.mocked(urlReferencedElsewhere)
    .mockReset()
    .mockImplementation((url) => Promise.resolve(url === OLD_SENT.url))
  vi.mocked(deleteBlobs).mockReset().mockResolvedValue(undefined)
})

describe('sweepUnsentUploads', () => {
  it('deletes only the uploads a day old that no submission points at', async () => {
    await expect(sweepUnsentUploads(NOW)).resolves.toBe(2)
    expect(deleteBlobs).toHaveBeenCalledTimes(1)
    expect(vi.mocked(deleteBlobs).mock.calls[0]?.[0]).toEqual([
      OLD_UNSENT.url,
      OLD_UNSENT_PHOTO.url,
    ])
  })

  it('lists only the folders the browser uploads into, every page of each', async () => {
    await sweepUnsentUploads(NOW)
    expect(
      vi.mocked(list).mock.calls.map(([options]) => [options?.prefix, options?.cursor]),
    ).toEqual([
      ['logos/', undefined],
      ['logos/', 'next'],
      ['photos/', undefined],
    ])
  })

  it('asks after only the uploads old enough to go', async () => {
    await sweepUnsentUploads(NOW)
    expect(vi.mocked(urlReferencedElsewhere).mock.calls.map(([url]) => url)).toEqual([
      OLD_UNSENT.url,
      OLD_SENT.url,
      OLD_UNSENT_PHOTO.url,
    ])
  })

  it('deletes nothing when every old upload was sent', async () => {
    vi.mocked(urlReferencedElsewhere).mockResolvedValue(true)
    await expect(sweepUnsentUploads(NOW)).resolves.toBe(0)
    expect(vi.mocked(deleteBlobs).mock.calls[0]?.[0]).toEqual([])
  })
})
