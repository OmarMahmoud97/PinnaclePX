import { NextRequest } from 'next/server'
import { proxy } from '@/proxy'

const state = vi.hoisted(() => ({
  password: undefined as string | undefined,
  warned: [] as string[],
}))

vi.mock('@/lib/env', () => ({
  get env() {
    return { ADMIN_PASSWORD: state.password }
  },
}))

vi.mock('@/lib/log', () => ({
  log: { warn: (event: string) => state.warned.push(event), info: vi.fn(), error: vi.fn() },
}))

const PASSWORD = 'a-long-password-the-owner-chose'

function request(authorization?: string): NextRequest {
  return new NextRequest('http://localhost/admin', {
    headers: authorization === undefined ? {} : { authorization },
  })
}

const basic = (password: string) => `Basic ${Buffer.from(`owner:${password}`).toString('base64')}`

beforeEach(() => {
  state.password = PASSWORD
  state.warned = []
})

describe('proxy', () => {
  it('answers not found while no password is set, whatever the request carries', () => {
    state.password = undefined
    expect(proxy(request()).status).toBe(404)
    expect(proxy(request(basic(PASSWORD))).status).toBe(404)
  })

  it('asks the browser for credentials when none came, and counts nothing', () => {
    const response = proxy(request())
    expect(response.status).toBe(401)
    expect(response.headers.get('www-authenticate')).toMatch(/^Basic realm=/)
    expect(state.warned).toEqual([])
  })

  it('refuses a wrong password, and counts it', () => {
    expect(proxy(request(basic('not-the-password-at-all'))).status).toBe(401)
    expect(state.warned).toEqual(['admin.refused'])
  })

  it('lets the right password through', () => {
    const response = proxy(request(basic(PASSWORD)))
    expect(response.status).toBe(200)
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })
})
