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
})
