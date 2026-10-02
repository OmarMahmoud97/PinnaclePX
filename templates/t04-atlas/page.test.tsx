import { renderToStaticMarkup } from 'react-dom/server'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleAtlas, atlasFallbackCopy } from './contract'
import { Atlas } from './index'

// The page as a visitor's would render with no pictures: the fallback copy, assembled the way
// the preview assembles it, drawn to markup.
function page(email: string | null): string {
  const copy = atlasFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))
  const content = assembleAtlas(copy, { logo: { kind: 'wordmark' }, images: {}, email })
  return renderToStaticMarkup(<Atlas content={content} />)
}

const all = (html: string, pattern: RegExp) => [...html.matchAll(pattern)].map((m) => m[1] ?? '')

describe('the Atlas page', () => {
  const html = page('owner@example.com')

  it('draws no More link beside the card columns of a visitor page', () => {
    expect(html).not.toContain('aria-label="More: ')
  })

  it('has no #tools address, and every in-page link has its target', () => {
    const ids = new Set(all(html, /\sid="([^"]+)"/g))
    const targets = all(html, /href="#([^"]+)"/g)
    expect(ids.has('tools')).toBe(false)
    expect(ids.has('approach')).toBe(true)
    for (const target of targets) expect(ids).toContain(target)
  })

  it('opens a mail from the closing cell', () => {
    expect(all(html, /href="(mailto:[^"]+)"/g)).toEqual(['mailto:owner@example.com'])
  })
})
