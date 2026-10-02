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

  it('opens a mail from the closing cell, under the button label', () => {
    const mails = all(html, /href="(mailto:[^"]+)"/g)
    expect(mails).toHaveLength(1)
    expect(mails[0]).toMatch(/^mailto:owner@example\.com\?subject=\S+$/)
  })

  // Decision 15: no header label wraps inside its link or button. The name (the home link) may
  // wrap, and the toggle holds an icon alone.
  it('keeps every header label to one line, with the row from xl', () => {
    const header = html.slice(html.indexOf('<nav id="navbar"'), html.indexOf('</nav>'))
    const controls = [...header.matchAll(/<(?:a|button)\s([^>]*)>/g)].map((m) => m[1] ?? '')
    const labelled = controls.filter(
      (attributes) => !/aria-label="(Menu|[^"]* home)"/.test(attributes),
    )
    expect(labelled.length).toBeGreaterThan(8)
    for (const attributes of labelled) expect(attributes).toContain('whitespace-nowrap')
    const toggle = controls.find((attributes) => attributes.includes('aria-label="Menu"'))
    expect(toggle).toContain('xl:hidden')
  })

  // Decision 15: no word is cut off or runs past the screen. The headline and the six section
  // headings are sized by their longest word, each heading the container its words fit.
  it('sizes the headline and the section headings by their longest word', () => {
    const fitted = all(
      html,
      /<h[12][^>]*class="@container[^"]*"[^>]*><span class="atlas-fit" style="--atlas-word:([\d.]+)">/g,
    )
    expect(fitted).toHaveLength(7)
    for (const width of fitted) expect(Number(width)).toBeGreaterThan(1)
  })

  it('gives the closing cell a column as wide as itself from xl', () => {
    expect(html).toContain('xl:grid-cols-[repeat(3,minmax(0,1fr))_22rem]')
    expect(html).not.toContain('xl:grid-cols-4')
  })
})
