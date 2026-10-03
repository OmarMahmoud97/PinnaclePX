import { renderToStaticMarkup } from 'react-dom/server'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { assembleMeridian, type MeridianCopy, meridianFallbackCopy } from './contract'
import { Meridian } from './index'

// The page as a visitor's would render with no pictures: the fallback copy, assembled the way
// the preview assembles it, drawn to markup. The copy may be changed first.
function page(
  email: string | null = 'owner@example.com',
  change: (copy: MeridianCopy) => MeridianCopy = (copy) => copy,
): string {
  const copy = change(meridianFallbackCopy(fallbackBrief('Kestrel', 'Job scheduling for trades.')))
  const content = assembleMeridian(copy, { logo: { kind: 'wordmark' }, images: {}, email })
  return renderToStaticMarkup(<Meridian content={content} />)
}

// The words of each element a pattern finds, drawings and tags left out.
const texts = (html: string, pattern: RegExp) =>
  [...html.matchAll(pattern)].map((m) =>
    (m[1] ?? '')
      .replace(/<svg[\s\S]*?<\/svg>/g, '')
      .replace(/<[^>]+>/g, '')
      .trim(),
  )

// The source's icons that stood for its own business, by their lucide names (decision 1).
const SOURCE_ICONS = [
  'crown',
  'vegan',
  'ghost',
  'puzzle',
  'squirrel',
  'cookie',
  'drama',
  'blocks',
  'chart-line',
  'wallet',
  'sparkle',
  'tablet-smartphone',
  'badge-check',
  'goal',
  'picture-in-picture',
  'mouse-pointer-click',
  'newspaper',
  'building-2',
  'phone',
  'mail',
  'clock',
]

describe('the Meridian page', () => {
  const html = page()
  const section = (id: string, next: string) =>
    html.slice(html.indexOf(`id="${id}"`), html.indexOf(`id="${next}"`))

  it('draws none of the source’s icons, and a tick in every feature’s disc', () => {
    for (const name of SOURCE_ICONS) expect(html).not.toContain(`lucide-${name}"`)
    for (const name of SOURCE_ICONS) expect(html).not.toContain(`lucide-${name} `)
    const features = section('features', 'services')
    expect(features.match(/lucide-check/g)).toHaveLength(3)
  })

  it('numbers the steps 01 to 03 beside their titles, hidden from screen readers', () => {
    const contact = section('contact', 'faq')
    expect(texts(contact, /<span aria-hidden="true"[^>]*>(\d+)<\/span>/g)).toEqual([
      '01',
      '02',
      '03',
    ])
  })

  it('keeps the benefits’ faint numbers as decoration at the cards’ right', () => {
    const benefits = section('benefits', 'features')
    expect(benefits.match(/<div class="flex justify-end"><span aria-hidden="true"/g)).toHaveLength(
      4,
    )
  })

  it('suggests no stranger’s name or address in the form, only a message', () => {
    expect(texts(html, /placeholder="([^"]*)"/g)).toEqual(['Your message...'])
  })

  it('lights a phrase from checked colours, the glow left to a dark page’s style sheet', () => {
    const lit = page('owner@example.com', (copy) => ({
      ...copy,
      hero: {
        ...copy.hero,
        headline: { text: 'Every job in one calendar', emphasis: 'one calendar' },
      },
    }))
    const span = /<span class="([^"]*)">one calendar<\/span>/.exec(lit)?.[1]?.split(' ') ?? []
    expect(span).toEqual(
      expect.arrayContaining(['meridian-lit', 'from-brand-deeper', 'to-brand-deepest']),
    )
    expect(span.some((name) => name.includes('glow'))).toBe(false)
  })

  it('lets a line break beside the lit phrase, whose spaces its padding stands in for', () => {
    const ask = page('owner@example.com', (copy) => ({
      ...copy,
      community: {
        ...copy.community,
        heading: { text: 'Fancy getting something sorted?', emphasis: 'sorted?' },
      },
    }))
    expect(ask).toContain('Fancy getting something<wbr/><span class="meridian-lit')
  })

  it('sizes the headline and each section heading by its longest word', () => {
    const fitted = [...html.matchAll(/class="meridian-fit[^"]*" style="--meridian-word:([\d.]+)"/g)]
    // The headline, the ask, five section headings and four benefit titles.
    expect(fitted).toHaveLength(11)
  })
})

describe('the Meridian footer', () => {
  const columns = (heading: string) => {
    const html = page(null, (copy) => ({
      ...copy,
      footer: {
        groups: copy.footer.groups.map((group, index) =>
          index === 0 ? { ...group, heading } : group,
        ),
      },
    }))
    const footer = html.slice(html.indexOf('<footer'))
    return /<div class="(grid [^"]*)"/.exec(footer)?.[1]?.split(' ') ?? []
  }

  it('stands its columns two to a row on a phone while every word fits', () => {
    expect(columns('Explore')).toContain('grid-cols-2')
  })

  it('stands them one to a row below sm when a word would not fit a 320px phone’s column', () => {
    const classes = columns('ACCOUNTANCY')
    expect(classes).toContain('grid-cols-1')
    expect(classes).toContain('sm:grid-cols-2')
    expect(classes).not.toContain('grid-cols-2')
  })
})
