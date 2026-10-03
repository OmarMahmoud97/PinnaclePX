import { renderToStaticMarkup } from 'react-dom/server'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleAtlas, atlasFallbackCopy } from './contract'
import { Atlas } from './index'

// The heading outline of a visitor's page with no pictures: the fallback copy, assembled the way
// the preview assembles it, drawn to markup. No level may be skipped.
describe('the Atlas heading outline', () => {
  it('never skips a level', () => {
    const copy = atlasFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))
    const content = assembleAtlas(copy, { logo: { kind: 'wordmark' }, images: {}, email: null })
    const html = renderToStaticMarkup(<Atlas content={content} />)
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]))
    expect(levels[0]).toBe(1)
    levels.forEach((level, index) => {
      expect(level).toBeLessThanOrEqual((levels[index - 1] ?? 0) + 1)
    })
  })
})
