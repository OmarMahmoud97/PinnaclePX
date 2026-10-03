import { renderToStaticMarkup } from 'react-dom/server'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleAurora, auroraFallbackCopy } from './contract'
import { Aurora } from './index'

// The page as a visitor's would render with no pictures: the fallback copy, assembled the way
// the preview assembles it, drawn to markup.
function page(email: string | null): string {
  const copy = auroraFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))
  const content = assembleAurora(copy, { logo: { kind: 'wordmark' }, images: {}, email })
  return renderToStaticMarkup(<Aurora content={content} />)
}

// The markup between two marks.
const between = (html: string, from: string, to: string) =>
  html.slice(html.indexOf(from), html.indexOf(to, html.indexOf(from)))

describe('the Aurora page', () => {
  const html = page('owner@example.com')
  // The drawn panel in the hero, and the lead feature's motif.
  const panel = between(html, 'min-h-[28rem]', 'id="features"')
  const motif = between(html, 'id="features"', '<h3')

  it("draws the panel with none of an app window's chrome", () => {
    // No window dots, no title-bar pill or its spacer, no progress bars, no selected rail entry.
    expect(panel).not.toContain('size-2.5 rounded-full')
    expect(panel).not.toContain('rounded-md bg-on-surface/6')
    expect(panel).not.toContain('class="w-12"')
    expect(panel).not.toContain('h-1.5 w-12')
    expect(panel).not.toContain('bg-on-surface/8 px-3 py-2')
    expect(panel).not.toContain('bg-brand-deeper')
  })

  it('sets the name as a plain heading at the head of the panel', () => {
    expect(panel).toMatch(
      /^[^>]*>\s*<div class="[^"]*border-b[^"]*"><p class="[^"]*font-display[^"]*">Kestrel<\/p><\/div>/,
    )
  })

  it('marks the three lines with one plain bullet, the same on each', () => {
    const rows = [...panel.matchAll(/<li class="[^"]*rounded-xl[^"]*">([\s\S]*?)<\/li>/g)]
    expect(rows).toHaveLength(3)
    const marks = rows.map((row) => (row[1] ?? '').replace(/>[^<]+</g, '><'))
    expect(new Set(marks).size).toBe(1)
  })

  it('keeps the ticks of the lead feature and draws no switches', () => {
    expect(motif.match(/<svg/g)).toHaveLength(2)
    expect(motif).not.toContain('h-5 w-9')
    expect(motif).not.toContain('translate-x-4')
  })

  it('opens a mail from the closing band alone, under its button label', () => {
    const closing = between(html, 'id="start"', '</section>')
    const mail = `mailto:owner@example.com?subject=${encodeURIComponent('Get in touch')}`
    expect([...html.matchAll(/href="(mailto:[^"]+)"/g)].map((m) => m[1])).toEqual([mail])
    expect(closing).toContain(`href="${mail}"`)
  })

  it('leads the closing button to the top when no email is known', () => {
    const closing = between(page(null), 'id="start"', '</section>')
    expect(closing).toContain('href="#top"')
    expect(closing).not.toContain('mailto:')
  })
})
