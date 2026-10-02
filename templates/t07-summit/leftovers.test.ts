import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleSummit, summitFallbackCopy } from './contract'
import { Summit } from './index'

// The page a visitor gets, drawn to markup: none of the source's hospital leftovers may come
// back (docs/template-fit-decisions.md, decisions 1 and 9). The reasons and the steps drew
// medical icons, the anchors named a booking process, facilities and appointments, and the
// form's fields were a doctor and a department.
const html = renderToStaticMarkup(
  createElement(Summit, {
    content: assembleSummit(
      summitFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades businesses.')),
      { logo: { kind: 'wordmark' }, images: {}, email: 'owner@example.com' },
    ),
  }),
)

describe('Summit as a visitor gets it', () => {
  it('draws no medical icon', () => {
    for (const icon of ['stethoscope', 'heart-pulse', 'hospital', 'ambulance', 'calendar']) {
      expect(html).not.toContain(`lucide-${icon}`)
    }
  })

  it('numbers its steps and marks its reasons with the services check', () => {
    expect(html).toMatch(/<span aria-hidden="true"[^>]*>1<\/span>/)
    expect(html.match(/lucide-circle-check/g)?.length).toBeGreaterThanOrEqual(4)
  })

  it('leads its links to anchors that exist and name no trade', () => {
    const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]))
    for (const id of ['steps', 'photos', 'contact']) expect(ids).toContain(id)
    for (const id of ['booking-process', 'book-appointment', 'facilities']) {
      expect(html).not.toContain(`id="${id}"`)
      expect(html).not.toContain(`href="#${id}"`)
    }
    for (const [, target] of html.matchAll(/href="#([^"]*)"/g)) expect(ids).toContain(target)
  })

  it('names its form fields for any business', () => {
    expect(html).toContain('name="person"')
    expect(html).toContain('name="service"')
    expect(html).not.toMatch(/doctor|department/)
  })
})
