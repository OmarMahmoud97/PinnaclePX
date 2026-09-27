import { expect, type Locator, type Page } from '@playwright/test'

// The Work switch on a touch screen (ADR 0039), for the phone and tablet specs: a touch inside
// the band loads the switch, and a tap on the first tile's Phone flies it. Every frame until the
// flight is over is read for the widest the page gets and each place the tile list stands, and
// the landed tile for anything the flight left on it.

type TouchFlight = Readonly<{
  first: Locator
  flight: Readonly<{ flew: boolean; widest: number; lefts: number[] }>
  landed: Readonly<{ height: string; styled: number; attributes: string[] }>
}>

// What a landed tile carries: no height of its own, no inline style on any part of the device,
// the pill's layers or the pool, and none of the flight's attributes.
export const LANDED = { height: '', styled: 0, attributes: [] }

export async function flyFirstTile(page: Page): Promise<TouchFlight> {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const first = page.locator('#work ul[data-choreo="tiles"]').getByRole('listitem').first()
  await first.scrollIntoViewIfNeeded()
  await first.getByRole('heading').tap()
  await expect(first.locator('fieldset[data-enhanced]')).toHaveCount(1)
  const frames = page.evaluate(
    () =>
      new Promise<TouchFlight['flight']>((resolve) => {
        const html = document.documentElement
        const list = document.querySelector('#work ul[data-choreo="tiles"]')
        const lefts = new Set<number>()
        const since = performance.now()
        let widest = 0
        let flew = false
        const watch = () => {
          widest = Math.max(widest, html.scrollWidth)
          lefts.add(Math.round(list?.scrollLeft ?? -1))
          flew ||= html.hasAttribute('data-work-morph')
          const over = flew && !html.hasAttribute('data-work-morph')
          if (over || performance.now() - since > 6000) resolve({ flew, widest, lefts: [...lefts] })
          else requestAnimationFrame(watch)
        }
        requestAnimationFrame(watch)
      }),
  )
  await first.getByText('Phone', { exact: true }).tap()
  const flight = await frames
  const landed = await first.evaluate((li) => ({
    height: li.style.height,
    styled: [
      ...li.querySelectorAll(
        '.work-stage, .work-stage *, .work-seg-thumb, .work-seg-ink, .work-backlight',
      ),
    ].filter((node) => node.hasAttribute('style')).length,
    attributes: [
      ...['data-morph', 'data-beat', 'data-hold'].filter((name) => li.hasAttribute(name)),
      ...(li.querySelector('fieldset')?.hasAttribute('data-pill') === true ? ['data-pill'] : []),
      // The measuring read marks the row-mates too, so the whole band is looked at.
      ...(document.querySelector('#work [data-measure]') === null ? [] : ['data-measure']),
    ],
  }))
  return { first, flight, landed }
}
