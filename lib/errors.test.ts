import { AppError, err, ok } from '@/lib/errors'

describe('AppError', () => {
  it('sets its name and preserves the cause', () => {
    const cause = new Error('root')
    const error = new AppError('boom', cause)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('AppError')
    expect(error.message).toBe('boom')
    expect(error.cause).toBe(cause)
  })
})

describe('Result helpers', () => {
  it('ok wraps a value', () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 })
  })

  it('err wraps a reason', () => {
    expect(err('tie')).toEqual({ ok: false, reason: 'tie' })
  })
})
