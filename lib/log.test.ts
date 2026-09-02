import { log } from '@/lib/log'

describe('log', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('emits one JSON line per call with the event first', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    log.info('pipeline.started', { slug: 'abc', stage: 'brief' })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(JSON.parse(spy.mock.calls[0]?.[0] as string)).toEqual({
      event: 'pipeline.started',
      slug: 'abc',
      stage: 'brief',
    })
  })

  it('routes levels to the matching console method', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    log.warn('slow')
    log.error('failed')

    expect(warn).toHaveBeenCalledWith('{"event":"slow"}')
    expect(error).toHaveBeenCalledWith('{"event":"failed"}')
  })
})
