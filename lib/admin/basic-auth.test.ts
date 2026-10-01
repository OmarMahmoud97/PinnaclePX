import { basicAuthPasses, credentialsIn } from '@/lib/admin/basic-auth'

const basic = (name: string, password: string) =>
  `Basic ${Buffer.from(`${name}:${password}`).toString('base64')}`

describe('credentialsIn', () => {
  it('reads the name and the password either side of the first colon', () => {
    expect(credentialsIn(basic('owner@example.com', 'correct horse battery'))).toEqual({
      name: 'owner@example.com',
      password: 'correct horse battery',
    })
    expect(credentialsIn(basic('', 'a:b:c'))).toEqual({ name: '', password: 'a:b:c' })
  })

  it('takes the scheme in any case', () => {
    expect(credentialsIn(basic('o', 'p').replace('Basic', 'BASIC'))).toEqual({
      name: 'o',
      password: 'p',
    })
  })

  it('is null without a header, for another scheme, or for a pair with no colon', () => {
    expect(credentialsIn(null)).toBeNull()
    expect(credentialsIn('Bearer abc')).toBeNull()
    expect(credentialsIn('Basic')).toBeNull()
    expect(credentialsIn(`${basic('o', 'p')} extra`)).toBeNull()
    expect(credentialsIn(`Basic ${Buffer.from('no-colon').toString('base64')}`)).toBeNull()
  })
})

describe('basicAuthPasses', () => {
  const owner = { name: 'omar', password: 'a-long-password-the-owner-chose' }

  it("passes the owner's name and password, whatever the name's case or spacing", () => {
    expect(basicAuthPasses(basic('omar', owner.password), owner)).toBe(true)
    expect(basicAuthPasses(basic(' Omar ', owner.password), owner)).toBe(true)
  })

  it('refuses another name, or none, with the right password', () => {
    expect(basicAuthPasses(basic('anyone', owner.password), owner)).toBe(false)
    expect(basicAuthPasses(basic('', owner.password), owner)).toBe(false)
  })

  it('refuses a wrong password, a prefix of it, an empty one and a missing header', () => {
    expect(basicAuthPasses(basic(owner.name, owner.password.slice(0, -1)), owner)).toBe(false)
    expect(basicAuthPasses(basic(owner.name, `${owner.password}!`), owner)).toBe(false)
    expect(basicAuthPasses(basic(owner.name, ''), owner)).toBe(false)
    expect(basicAuthPasses('Bearer token', owner)).toBe(false)
    expect(basicAuthPasses(null, owner)).toBe(false)
  })
})
