import { renderToStaticMarkup } from 'react-dom/server'
import type { TemplateLogo } from '@/lib/copy-slots/assets'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleAurora, auroraFallbackCopy } from './contract'
import { bodyEms, displayEms } from './fit'
import { AuroraNav } from './sections/nav'

// The header as a visitor's page draws it, for some links and a logo.
function header(
  links?: readonly string[],
  logo: TemplateLogo = { kind: 'wordmark' },
  name = 'Kestrel',
): string {
  const copy = auroraFallbackCopy(fallbackBrief(name, 'Job scheduling for trades.'))
  const content = assembleAurora(
    { ...copy, nav: { ...copy.nav, links: [...(links ?? copy.nav.links)] } },
    { logo, images: {}, email: null },
  )
  return renderToStaticMarkup(<AuroraNav brand={content.brand} nav={content.nav} />)
}

// The classes of the bar's links, and of the menu button's wrapper.
const linksClasses = (html: string) => /aria-label="Main" class="([^"]*)"/.exec(html)?.[1] ?? ''
const menuClasses = (html: string) =>
  /<div class="([^"]*)"><button[^>]*aria-controls="aurora-menu"/.exec(html)?.[1] ?? null

describe('the Aurora widths table', () => {
  it('adds up a text from its characters, the widest for any it does not list', () => {
    expect(displayEms('Mm')).toBeCloseTo(0.96 + 0.98)
    expect(bodyEms('Mm')).toBeCloseTo(0.93 + 0.95)
    expect(displayEms('é')).toBeCloseTo(displayEms('e'))
    expect(bodyEms('😀')).toBeCloseTo(1.09)
  })
})

describe('the Aurora header', () => {
  it('shows three plain links from lg, with the menu below it', () => {
    const html = header()
    expect(linksClasses(html).split(' ')).toEqual(['hidden', 'shrink-0', 'lg:block'])
    expect(menuClasses(html)).toBe('lg:hidden')
  })

  it('waits for xl when four long links would not hold a row at lg', () => {
    const links = [
      'What we bake fresh',
      'How ordering works',
      'Why bakers pick us',
      'Our opening hours',
    ]
    const html = header(links, { kind: 'wordmark' }, 'Kestrel Bakery')
    expect(linksClasses(html)).toContain('xl:block')
    expect(menuClasses(html)).toBe('xl:hidden')
  })

  it('keeps the menu at every width when no row holds the links', () => {
    const links = [
      'Sports injury care',
      'Back and neck pain',
      'Post-op rehab care',
      'Evening clinic too',
    ]
    const html = header(links, { kind: 'wordmark' }, 'Ashgrove Physiotherapy')
    expect(linksClasses(html).split(' ')).toEqual(['hidden', 'shrink-0', ''])
    expect(menuClasses(html)).toBe('')
  })

  it('counts an image logo at its own shape', () => {
    const wide: TemplateLogo = {
      kind: 'image',
      src: '/logo.png',
      alt: 'Kestrel',
      width: 2000,
      height: 100,
    }
    expect(linksClasses(header(undefined, wide))).toContain('xl:block')
  })

  it('folds the button into the menu on phones by a wrapper of its own', () => {
    const html = header()
    expect(html).toMatch(/<div class="hidden md:flex"><a href="#start" class="inline-flex/)
  })
})
