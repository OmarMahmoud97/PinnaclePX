import { createHash } from 'node:crypto'
import { readUpload } from '@/lib/blob/read-upload'

vi.mock('server-only', () => ({}))

const BYTES = Buffer.from('a logo')
const SHA = createHash('sha256').update(BYTES).digest('hex')
const BLOB = 'https://x.public.blob.vercel-storage.com'

const fetchMock = vi.fn<typeof fetch>()
vi.stubGlobal('fetch', fetchMock)

beforeEach(() => {
  fetchMock.mockReset()
})

describe('readUpload', () => {
  it('returns the bytes and the hash when they are the ones the path names', async () => {
    fetchMock.mockResolvedValue(new Response(BYTES))
    await expect(readUpload(`${BLOB}/logos/${SHA}.png`)).resolves.toEqual({
      bytes: BYTES,
      sha: SHA,
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${BLOB}/logos/${SHA}.png`)
    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal)
  })

  it('refuses bytes that are not the ones the path names', async () => {
    fetchMock.mockResolvedValue(new Response(Buffer.from('someone else')))
    await expect(readUpload(`${BLOB}/logos/${SHA}.png`)).rejects.toThrow(
      'Upload bytes do not match their path',
    )
  })

  it('refuses a URL that is not one of our uploads, without fetching it', async () => {
    await expect(readUpload('https://example.com/logo.png')).rejects.toThrow(
      'Not an upload of ours',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('says which host answered and how when the file cannot be read', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }))
    await expect(readUpload(`${BLOB}/photos/${SHA}.jpg`)).rejects.toThrow(
      'x.public.blob.vercel-storage.com returned 404',
    )
  })
})
