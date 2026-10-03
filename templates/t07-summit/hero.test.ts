import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { SummitContent, SummitImage } from './copy-slots'
import { KESTREL_SUMMIT } from './example/content'
import { SummitHero } from './sections/hero'
import { SummitNav } from './sections/nav'

// Over a photograph the hero's words sit on a veil of the page surface, so none is drawn in the
// muted grey, which no veil within decision 7's cap holds at WCAG AA over any picture, and none in
// on-scrim, which would sit light on a light veil (docs/template-fit-decisions.md). The hero here
// draws every part it can: the example's words, and portraits with a rating line under them, with
// plain paths for its pictures (a test loads no image files). Its two buttons carry their own
// fills, so they keep their own colours. Over the picture the bar's links keep their grey too, and
// under the pointer they are underlined, since the source's fade to a lighter grey falls below AA.
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
  it('draws no word over a photograph in the muted grey, on the veil', () => {
    const html = words(HERO)
    expect(html).toContain('summit-veil')
    expect(html).toContain('summit-pool')
    expect(html).toContain('4.9/5 from 200 reviews')
    expect(html).not.toContain('on-surface-muted')
    expect(html).not.toContain('on-scrim')
  })

  it('keeps its greys and draws no veil on a plain page', () => {
    const html = words({ ...HERO, background: null })
    expect(html).not.toContain('summit-veil')
    expect(html).not.toContain('summit-pool')
    expect(html).toContain('text-on-surface-muted')
  })

  it("underlines the bar's links under the pointer on a page with a photograph, never fades them", () => {
    const bar = (pictured: boolean) =>
      renderToStaticMarkup(
        createElement(SummitNav, {
          brand: KESTREL_SUMMIT.brand,
          nav: KESTREL_SUMMIT.nav,
          pictured,
        }),
      )
    expect(bar(true)).toContain('hover:underline')
    expect(bar(true)).not.toContain('hover:text-on-surface/55')
    expect(bar(false)).toContain('hover:text-on-surface/55')
  })
})
