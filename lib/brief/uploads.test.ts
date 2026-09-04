import { acceptFor, contentTypesFor, uploadKindOf, uploadPathname } from '@/lib/brief/uploads'

const SHA = 'a'.repeat(64)

describe('uploadPathname', () => {
  it('names a file by its kind, its hash and the extension for its type', () => {
    expect(uploadPathname('logos', SHA, 'image/svg+xml')).toBe(`logos/${SHA}.svg`)
    expect(uploadPathname('photos', SHA, 'image/jpeg')).toBe(`photos/${SHA}.jpg`)
  })

  it('refuses a type the kind does not take', () => {
    expect(uploadPathname('photos', SHA, 'image/svg+xml')).toBeNull()
    expect(uploadPathname('logos', SHA, 'image/heic')).toBeNull()
    expect(uploadPathname('logos', SHA, 'application/pdf')).toBeNull()
  })
})

describe('uploadKindOf', () => {
  it('recognises the paths uploadPathname makes', () => {
    expect(uploadKindOf(`logos/${SHA}.svg`)).toBe('logos')
    expect(uploadKindOf(`photos/${SHA}.webp`)).toBe('photos')
  })

  it.each([
    `photos/${SHA}.svg`,
    `logos/${SHA}.gif`,
    `logos/${SHA.slice(1)}.png`,
    `logos/${SHA.toUpperCase()}.png`,
    `other/${SHA}.png`,
    `../logos/${SHA}.png`,
    `logos/${SHA}.png/extra`,
  ])('refuses %s', (pathname) => {
    expect(uploadKindOf(pathname)).toBeNull()
  })
})

describe('acceptFor', () => {
  it('lists the media types the kind takes, for a file input', () => {
    expect(acceptFor('logos')).toBe('image/png,image/jpeg,image/webp,image/svg+xml')
    expect(contentTypesFor('photos')).toEqual(['image/png', 'image/jpeg', 'image/webp'])
  })
})
