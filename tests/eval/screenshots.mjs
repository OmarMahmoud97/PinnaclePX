// Screenshots of an eval run's pages through the development-only route
// app/dev/eval/[run]/[fixture]/[templateId], on a dev server of your own (never the owner's on
// port 3000). Phone and desktop, full page, into test-results/eval/<run>/shots/.
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
  { name: 'desktop', viewport: { width: 1440, height: 900 }, isMobile: false },
  { name: 'phone', viewport: { width: 390, height: 844 }, isMobile: true },
]

const browser = await chromium.launch()
let taken = 0
for (const { name, viewport, isMobile } of VIEWPORTS) {
  const context = await browser.newContext({
    viewport,
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  for (const record of records) {
    for (const templateId of record.templates) {
      const url = `${baseUrl}/dev/eval/${run}/${record.id}/${templateId}`
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 })
      if (response === null || !response.ok()) {
        console.error(`${url}: ${String(response?.status() ?? 'no response')}`)
        continue
      }
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(500)
      await page.screenshot({
        path: join(shots, `${record.id}-${templateId}-${name}.png`),
        fullPage: true,
      })
      taken += 1
    }
  }
  await context.close()
}
await browser.close()
console.log(`${String(taken)} screenshots in ${shots}`)
