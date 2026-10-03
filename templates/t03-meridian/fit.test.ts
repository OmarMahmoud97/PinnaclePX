import { fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleMeridian, meridianFallbackCopy } from './contract'
import { headerFrom, textEms } from './fit'

const content = assembleMeridian(
  meridianFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.')),
  { logo: { kind: 'wordmark' }, images: {}, email: null },
)
// The header's parts with a name, a menu label, links and a button of the given words.
const header = (name: string, links: readonly string[], cta = 'Get in touch') => ({
  brand: { ...content.brand, name },
  nav: {
    ...content.nav,
    links: links.map((label, index) => ({ label, href: `#${String(index)}` })),
    cta: { ...content.nav.cta, label: cta },
  },
})

describe('textEms', () => {
  it('adds up each character, an accent adding nothing and an unknown one counting widest', () => {
    expect(textEms('Café')).toBeCloseTo(textEms('Cafe'))
    expect(textEms('W')).toBeCloseTo(1.09)
    expect(textEms('ŋ')).toBeCloseTo(1.09)
    expect(textEms('Wall', 'regular')).toBeLessThan(textEms('Wall', 'bold'))
  })
})

describe('headerFrom', () => {
  it('shows a short set of links from lg', () => {
    expect(headerFrom(header('Kestrel', ['Why us', 'Contact']))).toBe('lg')
  })

  it('waits for xl when the stored pages’ sets would wrap at 1024', () => {
    const links = ['Why us', 'Services', 'Contact', 'Questions']
    expect(headerFrom(header('Bright Spark Electrical', links))).toBe('xl')
    expect(headerFrom(header('Coldharbour Photography', links))).toBe('xl')
  })

  it('leaves the menu button at every width when no bar holds the set', () => {
    const long = ['fill this space to', 'this space to thes', 'space to the longe', 'to the longes']
    expect(headerFrom(header('Plain words fill this sp', long, 'the longest length its'))).toBe(
      null,
    )
  })

  it('counts an image logo at its own shape, 36px high', () => {
    const wide = header('Kestrel', ['Why us', 'Contact'])
    expect(
      headerFrom({
        ...wide,
        brand: {
          ...wide.brand,
          logo: { kind: 'image', src: '/logo.png', alt: 'Kestrel', width: 2400, height: 100 },
        },
      }),
    ).not.toBe('lg')
  })
})
