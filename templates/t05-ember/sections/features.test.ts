import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { KESTREL_EMBER } from '../example/content'
import { EmberFeatures } from './features'

// The source marked the three feature rows with a chef's hat, a leaf and a heart, a restaurant's
// marks on any business's page. Each row now has one dot of the brand colour in the icon's place
// (decision 1, docs/template-fit-decisions.md). The picture beside the rows plays no part here, so
// it is left out.
describe('EmberFeatures', () => {
  const html = renderToStaticMarkup(
    createElement(EmberFeatures, { features: { ...KESTREL_EMBER.features, image: null } }),
  )

  it('draws no icon beside the rows', () => {
    expect(html).not.toContain('<svg')
  })

  it('marks each of the three rows with a brand dot that screen readers skip', () => {
    const dots = html.match(/<span aria-hidden="true"[^>]*><span class="[^"]*\bbg-brand-deeper\b/g)
    expect(dots).toHaveLength(3)
  })
})
