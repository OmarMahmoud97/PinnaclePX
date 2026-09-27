import { expect, type Locator, type Page, test } from '@playwright/test'

// The Work switch at 1440x900 (ADR 0039): one device reshapes between a browser window and a
// phone, and every flight hands back to the CSS state with nothing left behind. The page's
// contract for tests is its attributes: li[data-morph], li[data-beat] and fieldset[data-pill]
// while those parts of a flight run, html[data-work-morph] while any flight lives, and the
// work:morph-end event when the last one ends. No test hook ships.

// Every flight over: the device, the pill and the landing beat.
const settled = (page: Page) =>
  expect(page.locator('html')).not.toHaveAttribute('data-work-morph', { timeout: 4000 })

// Brings the band on screen, which loads the switch, and reaches for the first tile, which
// makes its flight parts; armed, its pill loses its colour transition.
async function armed(page: Page): Promise<Locator> {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  await page.locator('#work').scrollIntoViewIfNeeded()
  await page.mouse.wheel(0, 100)
  const first = page.locator('#work').getByRole('listitem').first()
  await first.hover()
  await expect(first.locator('fieldset[data-enhanced]')).toHaveCount(1)
  await expect(first.locator('.work-seg-thumb')).toHaveCount(1)
  return first
}

const heightOf = (tile: Locator) => tile.evaluate((li) => parseFloat(getComputedStyle(li).height))

// What a landed tile must not carry: an inline style on any part of the device, the pill's
// layers or the pool, a height on the tile, or any of the flight's attributes. The measuring
// read marks the tile's row-mates too, so the whole band is looked at for that one.
const residue = (tile: Locator) =>
  tile.evaluate((li) => {
    const parts = li.querySelectorAll(
      '.work-stage, .work-stage *, .work-seg-thumb, .work-seg-ink, .work-backlight',
    )
    const fieldset = li.querySelector('fieldset')
    return {
      styled: [...parts]
        .filter((node) => node.hasAttribute('style'))
        .map((node) => node.getAttribute('class') ?? node.tagName),
      height: li.style.height,
      attributes: [
        ...['data-morph', 'data-beat', 'data-hold'].filter((name) => li.hasAttribute(name)),
        ...(fieldset?.hasAttribute('data-pill') === true ? ['data-pill'] : []),
        ...(document.querySelector('#work [data-measure]') === null ? [] : ['data-measure']),
        ...(document.documentElement.hasAttribute('data-work-morph') ? ['data-work-morph'] : []),
      ],
    }
  })
const CLEAN = { styled: [], height: '', attributes: [] }

// Counts the work:morph-end events from here on; one flight, however often it is retargeted,
// reports one.
type Counted = Window & { workMorphEnds?: number }
const countEnds = (page: Page) =>
  page.evaluate(() => {
    const counted = window as Counted
    counted.workMorphEnds = 0
    window.addEventListener('work:morph-end', () => {
      counted.workMorphEnds = (counted.workMorphEnds ?? 0) + 1
    })
  })
const endsOf = (page: Page) => page.evaluate(() => (window as Counted).workMorphEnds)

test('the switch reshapes the device and hands back to CSS', async ({ page }) => {
  const first = await armed(page)
  await first.getByText('Phone', { exact: true }).click()
  await expect(first).toHaveAttribute('data-morph', '')
  await expect(page.locator('html')).toHaveAttribute('data-work-morph', '')
  await settled(page)
  await expect(first.locator('[data-frame="phone"]')).toBeVisible()
  await expect(first.locator('[data-frame="browser"]')).toBeHidden()
  expect(await residue(first)).toEqual(CLEAN)
  await expect(first.locator('.work-device')).toHaveCSS('width', '224px')
  // The flight's own parts stay in the page between flights, drawn by nothing and read by no one.
  for (const part of ['.work-shade', '.work-front', '.work-size', '.work-glint']) {
    await expect(first.locator(part)).toBeHidden()
  }
})

test('a change of mind lands on the last choice', async ({ page }) => {
  const first = await armed(page)
  const before = await heightOf(first)
  await countEnds(page)
  await first.getByText('Phone', { exact: true }).click()
  await expect(first).toHaveAttribute('data-morph', '')
  await page.waitForTimeout(350)
  await first.getByText('Desktop', { exact: true }).click()
  // Read at once, not waited on: the same flight turns, still in the air.
  expect(await first.evaluate((li) => li.hasAttribute('data-morph'))).toBe(true)
  await settled(page)
  expect(await endsOf(page)).toBe(1)
  await expect(first.getByRole('radio', { name: 'Desktop' })).toBeChecked()
  await expect(first.locator('[data-frame="browser"]')).toBeVisible()
  await expect(first.locator('[data-frame="phone"]')).toBeHidden()
  expect(Math.abs((await heightOf(first)) - before)).toBeLessThan(0.01)
  expect(await residue(first)).toEqual(CLEAN)
})

test('the arrow keys retarget the flight', async ({ page }) => {
  const first = await armed(page)
  await first.getByRole('radio', { name: 'Desktop' }).focus()
  await countEnds(page)
  for (const [i, key] of ['ArrowLeft', 'ArrowRight', 'ArrowLeft'].entries()) {
    await page.keyboard.press(key)
    if (i === 0) await expect(first).toHaveAttribute('data-morph', '')
    await page.waitForTimeout(120)
  }
  await settled(page)
  expect(await endsOf(page)).toBe(1)
  await expect(first.getByRole('radio', { name: 'Phone' })).toBeChecked()
  await expect(first.locator('[data-frame="phone"]')).toBeVisible()
  expect(await residue(first)).toEqual(CLEAN)
})

test('a change of mind in the landing beat flies again, readout and all', async ({ page }) => {
  const first = await armed(page)
  await first.getByText('Phone', { exact: true }).click()
  // Desktop is pressed in the first frame the device has handed back while its beat still runs,
  // and every frame after is read until the flight is over: the readout never shows empty.
  const read = await first.evaluate(
    (li) =>
      new Promise<{ flew: boolean; blank: number }>((resolve, reject) => {
        const html = document.documentElement
        const size = li.querySelector('.work-size')
        const desktop = li.querySelector('input[value="desktop"]')
        if (!(size instanceof HTMLElement) || !(desktop instanceof HTMLInputElement)) {
          reject(new Error('no readout or radio'))
          return
        }
        let flew: boolean | undefined
        let blank = 0
        const sample = () => {
          if (flew === undefined) {
            if (!html.hasAttribute('data-work-morph')) {
              reject(new Error('the flight ended before its beat'))
              return
            }
            if (!li.hasAttribute('data-morph')) {
              desktop.click()
              flew = li.hasAttribute('data-morph')
            }
          } else {
            if (Number(size.style.opacity || '0') > 0 && size.textContent === '') blank += 1
            if (!html.hasAttribute('data-work-morph')) {
              resolve({ flew, blank })
              return
            }
          }
          requestAnimationFrame(sample)
        }
        requestAnimationFrame(sample)
      }),
  )
  expect(read).toEqual({ flew: true, blank: 0 })
  await expect(first.getByRole('radio', { name: 'Desktop' })).toBeChecked()
  expect(await residue(first)).toEqual(CLEAN)
})

test('a change of mind in the landing beat leaves the row where it stood', async ({ page }) => {
  const first = await armed(page)
  await first.getByText('Phone', { exact: true }).click()
  await settled(page)
  // Back to desktop, and Phone pressed in the first frame the device has handed back while its
  // beat still runs: the row's heights, read after layout in every frame (observed afresh each
  // frame, so the frame of the press is read even when nothing in it moves), until the flight is
  // over. Its radio shows the phone by the time the switch reads the row, which once took the
  // phone's height for the row as it stood, and the row leapt 228 px in one frame.
  const read = await first.evaluate(
    (li) =>
      new Promise<{ before: number[]; after: number[] }>((resolve, reject) => {
        const html = document.documentElement
        const phone = li.querySelector('input[value="phone"]')
        const desktop = li.querySelector('input[value="desktop"]')
        if (
          !(li instanceof HTMLElement) ||
          !(phone instanceof HTMLInputElement) ||
          !(desktop instanceof HTMLInputElement)
        ) {
          reject(new Error('no tile or radios'))
          return
        }
        const row = [...(li.parentElement?.children ?? [])].filter(
          (mate): mate is HTMLElement =>
            mate instanceof HTMLElement && mate.offsetTop === li.offsetTop,
        )
        let before: number[] = []
        let after: number[] | undefined
        let pressed = false
        const observer = new ResizeObserver(() => {
          const heights = row.map((mate) => parseFloat(getComputedStyle(mate).height))
          if (!pressed) before = heights
          else after ??= heights
        })
        for (const mate of row) observer.observe(mate)
        desktop.click()
        const watch = () => {
          observer.disconnect()
          if (!html.hasAttribute('data-work-morph')) {
            if (!pressed) reject(new Error('the flight ended before its beat'))
            else if (after === undefined) reject(new Error('no frame was read after the press'))
            else resolve({ before, after })
            return
          }
          if (!pressed && !li.hasAttribute('data-morph') && li.hasAttribute('data-beat')) {
            pressed = true
            phone.click()
          }
          for (const mate of row) observer.observe(mate)
          requestAnimationFrame(watch)
        }
        requestAnimationFrame(watch)
      }),
  )
  expect(read.before).toHaveLength(3)
  read.after.forEach((height, i) => {
    expect(Math.abs(height - (read.before[i] ?? 0))).toBeLessThan(2)
  })
  await expect(first.getByRole('radio', { name: 'Phone' })).toBeChecked()
  expect(await residue(first)).toEqual(CLEAN)
})

test('row-mates switched opposite ways keep the row up', async ({ page }) => {
  const first = await armed(page)
  const tiles = page.locator('#work').getByRole('listitem')
  await tiles.nth(1).hover()
  await first.getByText('Phone', { exact: true }).click()
  await settled(page)
  // The first tile back to desktop and the second to the phone 150 ms later: the row, read after
  // layout every frame until both flights are over, never drops toward the desktop height on the
  // way. It lands on 769.6 px at this width and its lowest frame measured 769.6 in five runs; the
  // second flight's leaving end once took the room alone, and the row fell from 791 to 573 px
  // before rising to 770. Held to where it lands, since a wider text face moves both.
  const { lowest, landed } = await page.evaluate(
    () =>
      new Promise<{ lowest: number; landed: number }>((resolve, reject) => {
        const html = document.documentElement
        const row = [...document.querySelectorAll<HTMLElement>('#work li')].slice(0, 3)
        const desktop = row[0]?.querySelector('input[value="desktop"]')
        const phone = row[1]?.querySelector('input[value="phone"]')
        if (!(desktop instanceof HTMLInputElement) || !(phone instanceof HTMLInputElement)) {
          reject(new Error('no radios'))
          return
        }
        let low = Infinity
        let last = 0
        const observer = new ResizeObserver(() => {
          last = Math.max(...row.map((li) => parseFloat(getComputedStyle(li).height)))
          low = Math.min(low, last)
        })
        for (const li of row) observer.observe(li)
        desktop.click()
        window.setTimeout(() => {
          phone.click()
        }, 150)
        let flew = false
        const watch = () => {
          flew ||= html.hasAttribute('data-work-morph')
          if (flew && !html.hasAttribute('data-work-morph')) {
            observer.disconnect()
            resolve({ lowest: low, landed: last })
          } else requestAnimationFrame(watch)
        }
        requestAnimationFrame(watch)
      }),
  )
  expect(lowest).toBeGreaterThanOrEqual(landed - 5)
  for (const i of [0, 1]) expect(await residue(tiles.nth(i))).toEqual(CLEAN)
})

test('row-mates switched together share one height', async ({ page }) => {
  const first = await armed(page)
  const tiles = page.locator('#work').getByRole('listitem')
  // The first row's three tiles, every frame their heights change until both flights are over:
  // the widest spread of their heights. Two flights in one row share its height, so nothing
  // snaps as either lands. Read after layout, in a ResizeObserver, since a requestAnimationFrame
  // callback can run before the switch's own and read a change's writes beside a frame's.
  const spread = page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const row = [...document.querySelectorAll('#work li')].slice(0, 3)
        const html = document.documentElement
        let widest = 0
        const observer = new ResizeObserver(() => {
          const heights = row.map((li) => parseFloat(getComputedStyle(li).height))
          widest = Math.max(widest, Math.max(...heights) - Math.min(...heights))
        })
        for (const li of row) observer.observe(li)
        let flew = false
        const watch = () => {
          flew ||= html.hasAttribute('data-work-morph')
          if (flew && !html.hasAttribute('data-work-morph')) {
            observer.disconnect()
            resolve(widest)
          } else requestAnimationFrame(watch)
        }
        requestAnimationFrame(watch)
      }),
  )
  await first.getByText('Phone', { exact: true }).click()
  await page.waitForTimeout(450)
  await tiles.nth(1).getByText('Phone', { exact: true }).click()
  expect(await spread).toBeLessThan(0.5)
  for (const i of [0, 1]) expect(await residue(tiles.nth(i))).toEqual(CLEAN)
})

test('only the pressed tile moves', async ({ page }) => {
  const first = await armed(page)
  const tiles = page.locator('#work').getByRole('listitem')
  await first.getByText('Phone', { exact: true }).click()
  await expect(first).toHaveAttribute('data-morph', '')
  // Sampled through the flight, not waited on: a row-mate's device is never written, even for a
  // frame, and only its dated caption and link ride the row's growing edge.
  for (let sample = 0; sample < 6; sample++) {
    const mates = await tiles.evaluateAll((all) =>
      all.slice(1, 3).map((li) => ({
        morph: li.hasAttribute('data-morph'),
        styled: li.querySelector('.work-device')?.hasAttribute('style') ?? true,
      })),
    )
    expect(mates).toEqual([
      { morph: false, styled: false },
      { morph: false, styled: false },
    ])
    await page.waitForTimeout(100)
  }
  await settled(page)
})

test('the pill’s dark words never read as a second label', async ({ page }) => {
  const first = await armed(page)
  await first.getByText('Phone', { exact: true }).click()
  await expect(first.locator('fieldset')).toHaveAttribute('data-pill', '')
  await expect(first.getByText('Phone', { exact: true })).toHaveCount(1)
  await expect(first.getByText('Desktop', { exact: true })).toHaveCount(1)
  await settled(page)
  const tiles = page.locator('#work').getByRole('listitem')
  for (let i = 0; i < 6; i++) {
    await expect(tiles.nth(i).getByText('Phone', { exact: true })).toHaveCount(1)
  }
})

test('a flight lands as the page hides', async ({ page }) => {
  const first = await armed(page)
  await countEnds(page)
  await first.getByText('Phone', { exact: true }).click()
  await expect(first).toHaveAttribute('data-morph', '')
  // Headless Chromium keeps every page visible, so the page is told it has hidden.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  // Read at once, not waited on: it landed in the event's own task, where its radio says.
  expect(await residue(first)).toEqual(CLEAN)
  expect(await endsOf(page)).toBe(1)
  await expect(first.locator('[data-frame="phone"]')).toBeVisible()
})

test('a flight reports its end once', async ({ page }) => {
  const first = await armed(page)
  await countEnds(page)
  await first.getByText('Phone', { exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-work-morph', '')
  await settled(page)
  expect(await endsOf(page)).toBe(1)
})
