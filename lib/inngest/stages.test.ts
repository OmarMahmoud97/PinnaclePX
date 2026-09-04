import { RetryAfterError } from 'inngest'
import { markStage } from '@/lib/db/submissions'
import { done, runStage } from '@/lib/inngest/stages'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/db/submissions', () => ({ markStage: vi.fn() }))

const PATCH = { templateIds: ['t01-aurora'] }
const FALLBACK = { templateIds: [] }
const fallback = () => Promise.resolve(FALLBACK)

let errors: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  vi.mocked(markStage).mockReset().mockResolvedValue(true)
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  errors = vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('runStage', () => {
  it('marks the stage running, then done with what the work returned', async () => {
    const work = vi.fn().mockResolvedValue(done(PATCH))
    await expect(runStage('slug', 'select', work)).resolves.toEqual({ state: 'done', patch: PATCH })
    expect(vi.mocked(markStage).mock.calls).toEqual([
      ['slug', 'select', 'running'],
      ['slug', 'select', 'done', PATCH],
    ])
  })

  it('marks the stage fallback when the work settled with its own fallback', async () => {
    const work = vi.fn().mockResolvedValue({ state: 'fallback', patch: FALLBACK })
    await expect(runStage('slug', 'imagery', work)).resolves.toEqual({
      state: 'fallback',
      patch: FALLBACK,
    })
    expect(markStage).toHaveBeenLastCalledWith('slug', 'imagery', 'fallback', FALLBACK)
  })

  it('does nothing once the sweeper has settled the stage', async () => {
    vi.mocked(markStage).mockResolvedValue(false)
    const work = vi.fn()
    await expect(runStage('slug', 'select', work)).resolves.toEqual({ state: 'settled' })
    expect(work).not.toHaveBeenCalled()
  })

  it('leaves an unbounded stage open and asks to be tried again', async () => {
    const work = vi.fn().mockRejectedValue(new Error('flaky'))
    await expect(runStage('slug', 'copy', work)).rejects.toBeInstanceOf(RetryAfterError)
    expect(markStage).toHaveBeenCalledTimes(1)
  })

  it('tries a bounded stage again after a pause, then writes its fallback', async () => {
    vi.useFakeTimers()
    const work = vi.fn().mockRejectedValue(new Error('flaky'))
    const outcome = runStage('slug', 'brief', work, {
      attempts: 3,
      fallback,
      isPermanent: () => false,
    })
    await vi.runAllTimersAsync()
    await expect(outcome).resolves.toEqual({ state: 'fallback', patch: FALLBACK })
    expect(work).toHaveBeenCalledTimes(3)
    expect(markStage).toHaveBeenLastCalledWith('slug', 'brief', 'fallback', FALLBACK)
  })

  it('goes straight to the fallback on an error that will not change', async () => {
    const work = vi.fn().mockRejectedValue(new Error('invalid request'))
    const outcome = await runStage('slug', 'brief', work, {
      attempts: 3,
      fallback,
      isPermanent: (error) => error instanceof Error && error.message === 'invalid request',
    })
    expect(outcome).toEqual({ state: 'fallback', patch: FALLBACK })
    expect(work).toHaveBeenCalledTimes(1)
    expect(markStage).toHaveBeenLastCalledWith('slug', 'brief', 'fallback', FALLBACK)
    expect(errors).toHaveBeenCalledWith(expect.stringContaining('"stage.permanent"'))
  })
})
