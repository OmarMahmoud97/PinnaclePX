import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { SummitContent, SummitImage } from './copy-slots'
import { KESTREL_SUMMIT } from './example/content'
import { SummitHero } from './sections/hero'

// Over a photograph the hero's words sit on the scrim's veil, so each is drawn in on-scrim: a
// word left in a surface grey would sit dark on a darkened picture (decision 7,
// docs/template-fit-decisions.md). The hero here draws every part it can: the example's words,
// and portraits with a rating line under them, with plain paths for its pictures (a test loads
// no image files). Its two buttons carry their own fills, so they keep their own colours.
const picture = (src: string): SummitImage => ({
  src,
  alt: '',
  width: 36,
  height: 36,
  credit: null,
})
const HERO: SummitContent['hero'] = {
  ...KESTREL_SUMMIT.hero,
  proof: { avatars: [picture('/one.jpg'), picture('/two.jpg')], line: '4.9/5 from 200 reviews' },
  background: picture('/room.jpg'),
}

function words(hero: SummitContent['hero']) {
  return renderToStaticMarkup(createElement(SummitHero, { hero })).replace(/<a [^>]*>.*?<\/a>/g, '')
}

describe("Summit's hero", () => {
  it('draws every word over a photograph in on-scrim, on the veil', () => {
    const html = words(HERO)
    expect(html).toContain('summit-veil')
    expect(html).toContain('4.9/5 from 200 reviews')
    expect(html).not.toMatch(/text-on-surface/)
  })

  it('keeps its greys and draws no veil on a plain page', () => {
    const html = words({ ...HERO, background: null })
    expect(html).not.toContain('summit-veil')
    expect(html).not.toContain('on-scrim')
  })
})
