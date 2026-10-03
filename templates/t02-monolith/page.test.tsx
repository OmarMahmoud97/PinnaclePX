import { renderToStaticMarkup } from 'react-dom/server'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleMonolith, monolithFallbackCopy } from './contract'
import { Monolith } from './index'

// The page as a visitor's would render with no pictures: the fallback copy, assembled the way
// the preview assembles it, drawn to markup.
function page(email: string | null): string {
  const copy = monolithFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))
  const content = assembleMonolith(copy, { logo: { kind: 'wordmark' }, images: {}, email })
  return renderToStaticMarkup(<Monolith content={content} />)
}

// The words of each element a pattern finds, drawings and tags left out.
const texts = (html: string, pattern: RegExp) =>
  [...html.matchAll(pattern)].map((m) =>
    (m[1] ?? '')
      .replace(/<svg[\s\S]*?<\/svg>/g, '')
      .replace(/<[^>]+>/g, '')
      .trim(),
  )

describe('the Monolith page', () => {
  const html = page('owner@example.com')
  const steps = html.slice(html.indexOf('id="how-it-works"'), html.indexOf('id="features"'))

  it('draws the first three of the four steps the copy keeps', () => {
    expect(texts(steps, /<h3[^>]*>([\s\S]*?)<\/h3>/g)).toEqual([
      'Tell us what you need',
      'We agree the details',
      'We get to work',
    ])
  })

  it('numbers the steps 1 to 3 outside their headings, hidden from screen readers', () => {
    expect(texts(steps, /<span aria-hidden="true"[^>]*>(\d)<\/span>/g)).toEqual(['1', '2', '3'])
  })

  it('draws none of the source drawings, its panels mark or its radar', () => {
    expect(html).not.toContain('Free Icons')
    expect(html).not.toContain('viewBox="0 0 128 128"')
    expect(html).not.toContain('lucide-panels-top-left')
    expect(html).not.toContain('lucide-radar')
    expect(html).toContain('<span class="sr-only">Menu</span>')
  })

  it('has no #cta address, and every in-page link has its target', () => {
    const ids = new Set(texts(html, /\sid="([^"]+)"/g))
    expect(ids.has('cta')).toBe(false)
    expect(ids.has('contact')).toBe(true)
    for (const target of texts(html, /href="#([^"]+)"/g)) expect(ids).toContain(target)
  })

  it('opens with the headline, then a section heading, and skips no level', () => {
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]))
    expect(levels.slice(0, 2)).toEqual([1, 2])
    levels.forEach((level, index) => {
      expect(level).toBeLessThanOrEqual((levels[index - 1] ?? 0) + 1)
    })
  })

  it('hides the initials in the circles from screen readers', () => {
    const initials = [...html.matchAll(/<span([^>]*)>K<\/span>/g)].map((m) => m[1] ?? '')
    expect(initials).toHaveLength(2)
    for (const attributes of initials) expect(attributes).toContain('aria-hidden="true"')
  })

  it('opens a mail from the closing band alone, under its button label', () => {
    const contact = html.slice(html.indexOf('id="contact"'), html.indexOf('id="faq"'))
    const mail = `mailto:owner@example.com?subject=${encodeURIComponent('Get in touch')}`
    expect(texts(html, /href="(mailto:[^"]+)"/g)).toEqual([mail])
    expect(contact).toContain(`href="${mail}"`)
  })
})
