import { basicAuthPasses, passwordIn } from '@/lib/admin/basic-auth'

const basic = (name: string, password: string) =>
  `Basic ${Buffer.from(`${name}:${password}`).toString('base64')}`

describe('passwordIn', () => {
  it('reads the password after the first colon, whatever the name', () => {
    expect(passwordIn(basic('owner', 'correct horse battery'))).toBe('correct horse battery')
    expect(passwordIn(basic('', 'a:b:c'))).toBe('a:b:c')
  })

  it('takes the scheme in any case', () => {
    expect(passwordIn(basic('o', 'p').replace('Basic', 'BASIC'))).toBe('p')
  })

  it('is null without a header, for another scheme, or for a pair with no colon', () => {
    expect(passwordIn(null)).toBeNull()
    expect(passwordIn('Bearer abc')).toBeNull()
    expect(passwordIn('Basic')).toBeNull()
    expect(passwordIn(`${basic('o', 'p')} extra`)).toBeNull()
    expect(passwordIn(`Basic ${Buffer.from('no-colon').toString('base64')}`)).toBeNull()
  })
})

describe('basicAuthPasses', () => {
  const password = 'a-long-password-the-owner-chose'

  it('passes the right password under any name', () => {
    expect(basicAuthPasses(basic('owner', password), password)).toBe(true)
    expect(basicAuthPasses(basic('anyone', password), password)).toBe(true)
  })

  it('refuses a wrong password, a prefix of it, an empty one and a missing header', () => {
    expect(basicAuthPasses(basic('owner', password.slice(0, -1)), password)).toBe(false)
    expect(basicAuthPasses(basic('owner', `${password}!`), password)).toBe(false)
    expect(basicAuthPasses(basic('owner', ''), password)).toBe(false)
    expect(basicAuthPasses('Bearer token', password)).toBe(false)
    expect(basicAuthPasses(null, password)).toBe(false)
  })
})
