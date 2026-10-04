// Screenshots of an eval run's pages through the development-only route
// app/dev/eval/[run]/[fixture]/[templateId], on a dev server of your own (never the owner's on
// port 3000). Full page, into test-results/eval/<run>/shots/:
//
//   phone    390x844 with touch and reduced motion, taken after scrolling the page end to end,
//            so every block that enters on scroll is drawn and every lazy picture has loaded
//            (decision 19, docs/template-fit-decisions.md). The shot is the phone's 390 px: a
//            page wider than its screen (Aurora's header ask showing on phones made 435 px
//            shots, t01-D2) is the template's defect, and the shot shows what a phone shows.
//   desktop  1440x900, as before.
//
//   pnpm eval:shots <run> [baseUrl] [fixture,fixture]      default baseUrl http://localhost:3100
import { mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const [run, baseUrl = 'http://localhost:3100', only = ''] = process.argv.slice(2)
if (run === undefined) {
  console.error('usage: pnpm eval:shots <run> [baseUrl] [fixture,fixture]')
  process.exit(1)
}
if (new URL(baseUrl).port === '3000') {
  console.error('Port 3000 is the owner’s dev server; start your own on another port.')
  process.exit(1)
}
const dir = join(process.cwd(), 'test-results', 'eval', run)
const wanted = only.split(',').filter((id) => id !== '')
// Every fixture's record; summary.json and the run's own _run.json are not records.
const records = readdirSync(dir)
  .filter((name) => name.endsWith('.json') && name !== 'summary.json' && !name.startsWith('_'))
  .map((name) => JSON.parse(readFileSync(join(dir, name), 'utf8')))
  .filter((record) => wanted.length === 0 || wanted.includes(record.id))
const shots = join(dir, 'shots')
mkdirSync(shots, { recursive: true })

const VIEWPORTS = [
  {
    name: 'desktop',
    context: { viewport: { width: 1440, height: 900 }, isMobile: false },
    scroll: false,
    clip: false,
  },
  {
    name: 'phone',
    context: {
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce',
    },
    scroll: true,
    clip: true,
  },
]

// Down the page a screen at a time, so every entrance runs and every lazy picture is asked
// for, then back to the top, where the shot starts.
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    const step = Math.round(window.innerHeight * 0.8)
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await pause(120)
    }
    window.scrollTo(0, document.documentElement.scrollHeight)
    await pause(200)
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(400)
}

const browser = await chromium.launch()
let taken = 0
for (const { name, context: options, scroll, clip } of VIEWPORTS) {
  const context = await browser.newContext({ ...options, deviceScaleFactor: 1 })
  const page = await context.newPage()
  for (const record of records) {
    // The pick's pages, then those written outside it (EVAL_PAIRS), which /dev/eval sets with
    // the trio their record stores.
    for (const templateId of [...record.templates, ...Object.keys(record.extra ?? {})]) {
      const url = `${baseUrl}/dev/eval/${run}/${record.id}/${templateId}`
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 })
      if (response === null || !response.ok()) {
        console.error(`${url}: ${String(response?.status() ?? 'no response')}`)
        continue
      }
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(500)
      if (scroll) await scrollThrough(page)
      const height = await page.evaluate(() => document.documentElement.scrollHeight)
      await page.screenshot({
        path: join(shots, `${record.id}-${templateId}-${name}.png`),
        fullPage: true,
        ...(clip ? { clip: { x: 0, y: 0, width: options.viewport.width, height } } : {}),
      })
      taken += 1
    }
  }
  await context.close()
}
await browser.close()
console.log(`${String(taken)} screenshots in ${shots}`)
