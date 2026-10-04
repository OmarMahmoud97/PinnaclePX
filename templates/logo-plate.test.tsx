import { renderToStaticMarkup } from 'react-dom/server'
import type { TemplateAssets, TemplateLogo } from '@/lib/copy-slots/assets'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { contractFor } from './registry'
import { renderConcept } from './render'

// The visitor's logo is always visible (decision 23, docs/template-fit-decisions.md): an image
// logo whose artwork is the page's own shade sits on the plate the page gives it, in the header
// and the footer of each of the eight templates the preview chrome covers. With no plate the
// logo is drawn on nothing, as it always was.
const IDS = [
  't01-aurora',
  't02-monolith',
  't03-meridian',
  't04-atlas',
  't05-ember',
  't06-harbor',
  't07-summit',
  't08-vector',
] as const

const PLATE = 'oklch(0.985 0.004 150)'

function page(id: string, plate?: string): string {
  const logo: TemplateLogo = {
    kind: 'image',
    src: 'https://example.public.blob.vercel-storage.com/logo.png',
    alt: 'Kestrel',
    width: 480,
    height: 160,
    polarity: 'dark-artwork',
    plate,
  }
  const assets: TemplateAssets = { logo, images: {}, email: null }
  const copy = contractFor(id).fallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.'))
  return renderToStaticMarkup(renderConcept(id, copy, assets))
}

const count = (html: string, text: string) => html.split(text).length - 1

describe.each(IDS)('%s', (id) => {
  it('draws the plate behind every image logo it shows', () => {
    const html = page(id, PLATE)
    const logos = count(html, '<img alt="Kestrel"')
    expect(logos).toBeGreaterThan(0)
    expect(count(html, `background-color:${PLATE}`)).toBe(logos)
  })

  it('draws the same logos on nothing when the page suits them', () => {
    const plated = page(id, PLATE)
    const plain = page(id)
    expect(count(plain, '<img alt="Kestrel"')).toBe(count(plated, '<img alt="Kestrel"'))
    expect(plain).not.toContain('background-color:')
  })
})
