// Captures the first phone screen of each client site for the home page's work band, and writes
// the manifest the band reads its dates from. Run by hand: `node scripts/capture-work.mjs`. Every
// client here has given the studio permission to show their site (owner, 5 September 2026;
// docs/claims-register.md). The capture is an iPhone 13 viewport at 2x, cropped to the phone
// frame's 9:19, resized to the two widths the page shows (2x and 3x of 216 px) and encoded as AVIF
// (into public/work/, served as it is: Turbopack cannot decode AVIF imports) and WebP (into
// app/_images/work/, imported for its size). Cookie banners, chat widgets and autoplaying video
// are hidden or paused, and the hiding is recorded, so a capture is the page as a visitor sees it
// once they have dismissed the furniture. Re-run when a client's site changes; the caption carries
// the date.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, devices } from '@playwright/test'
import sharp from 'sharp'

const OUT = join(process.cwd(), 'app', '_images', 'work')
const AVIF_OUT = join(process.cwd(), 'public', 'work')
// Phone: an iPhone 13's full 390 by 844 screen at its native 3x (Playwright's preset viewport is
// 390 by 664, the screen minus the browser chrome, which would capture too short a page), cropped
// to the frame's 9:19 and written at 2x and 3x of the 216 px frame. Desktop: a 1440 by 900 first
// screen at 2x and 3x of the 224 px browser frame the card shows at lg.
const VIEWS = [
  {
    name: 'phone',
    widths: [432, 648],
    ratio: 9 / 19,
    device: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } },
  },
  {
    name: 'desktop',
    widths: [448, 672],
    ratio: 16 / 10,
    device: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
  },
]

// Trading name, the slug the page uses, and the canonical address (redirect chains resolved by
// hand on 5 September 2026).
const CLIENTS = [
  { slug: 'go-wild', name: 'Go Wild', url: 'https://gowilddogwalking.co.uk/' },
  { slug: 'vetpres', name: 'VetPres', url: 'https://vetpres.com/' },
  { slug: 'trvlwell', name: 'TrvlWell', url: 'https://trvlwell.co/' },
  { slug: 'withu', name: 'WithU', url: 'https://www.withuapp.com/' },
  { slug: 'mvmnt', name: 'Mvmnt', url: 'https://www.mvmnt.com/' },
  { slug: 'urunn', name: 'URUNN', url: 'https://www.urunn.com/' },
]

// Furniture a first-time visitor dismisses before reading: consent banners and chat launchers.
const HIDE_CSS = `
  [id*="termly" i], [class*="termly" i], [id*="cookie" i], [class*="cookie" i],
  [id*="consent" i], [class*="consent" i], [class*="fs-cc" i],
  iframe[src*="chat" i], [id*="intercom" i], [class*="intercom" i], [id*="hubspot" i],
  [class*="crisp" i], [id*="tidio" i], [class*="tawk" i], [id*="drift" i] { display: none !important; }
`

mkdirSync(OUT, { recursive: true })
mkdirSync(AVIF_OUT, { recursive: true })
const browser = await chromium.launch()
const manifest = { capturedAt: new Date().toISOString().slice(0, 10), clients: [] }

for (const client of CLIENTS) {
  const files = []
  let finalUrl = client.url
  for (const view of VIEWS) {
    const context = await browser.newContext({
      ...view.device,
      userAgent: `${view.device.userAgent} PinnaclePX-capture`,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    await page.goto(client.url, { waitUntil: 'networkidle', timeout: 60_000 })
    finalUrl = page.url()
    await page.addStyleTag({ content: HIDE_CSS })
    await page.evaluate(async () => {
      for (const video of document.querySelectorAll('video')) video.pause()
      await document.fonts.ready
    })
    await page.waitForTimeout(1500)
    const png = await page.screenshot({ type: 'png', animations: 'disabled' })
    const image = sharp(png)
    const { width = 0, height = 0 } = await image.metadata()
    const cropHeight = Math.min(height, Math.round(width / view.ratio))
    const cropped = image.extract({ left: 0, top: 0, width, height: cropHeight })
    for (const w of view.widths) {
      const base = `${client.slug}-${view.name}-${w}`
      const resized = cropped.clone().resize({ width: w })
      const avif = await resized.clone().avif({ quality: 55 }).toBuffer()
      const webp = await resized.clone().webp({ quality: 80 }).toBuffer()
      writeFileSync(join(AVIF_OUT, `${base}.avif`), avif)
      writeFileSync(join(OUT, `${base}.webp`), webp)
      files.push({ view: view.name, width: w, avifBytes: avif.length, webpBytes: webp.length })
    }
    await context.close()
  }
  manifest.clients.push({
    slug: client.slug,
    name: client.name,
    url: client.url,
    finalUrl,
    capturedAt: manifest.capturedAt,
    hidden: 'consent banners and chat launchers; video paused',
    files,
  })
  console.log(
    client.slug,
    files.map((f) => `${f.view} ${f.width}: ${f.avifBytes}/${f.webpBytes}`).join(' '),
  )
}
await browser.close()
writeFileSync(join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('manifest written')
