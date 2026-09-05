// Compares a template port with its source, section by section, the way ADR 0023's ports were
// checked. Both pages must be running: the source from its own repository (see
// docs/template-porting-guide.md for how to run each stack) and the port from this project's
// dev server. Run by hand:
//
//   node scripts/template-compare.mjs <sourceUrl> <portUrl> [options] <section> ...
//
// Each section is `name=selector`, or `name=sourceSelector::portSelector` when the two pages
// select it differently, or a bare `name` for `#name` on both. Every section is screenshotted
// from both pages into the output folder as source-<name>.png and port-<name>.png, and the
// rendered sizes are printed with the difference, so a port is done when every difference is
// zero and the pairs look the same. Options: --width (default 1535, the owner's laptop),
// --scheme dark|light (default dark), --out <dir> (default .compare, ignored by git), and
// --measure <selector> to print the box tree of one element on both pages instead, for chasing a
// difference of a few pixels to the line height or margin that causes it.
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const args = process.argv.slice(2)
const options = { width: 1535, scheme: 'dark', out: join(process.cwd(), '.compare'), measure: null }
const positional = []
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i]
  if (arg === '--width') options.width = Number(args[(i += 1)])
  else if (arg === '--scheme') options.scheme = args[(i += 1)]
  else if (arg === '--out') options.out = args[(i += 1)]
  else if (arg === '--measure') options.measure = args[(i += 1)]
  else positional.push(arg)
}
const [sourceUrl, portUrl, ...sections] = positional
if (sourceUrl === undefined || portUrl === undefined) {
  console.error(
    'usage: node scripts/template-compare.mjs <sourceUrl> <portUrl> [--width 1535] [--scheme dark|light] [--out dir] [--measure selector] <name[=selector[::portSelector]]> ...',
  )
  process.exit(1)
}

// A section argument to the selector each page uses for it.
function selectorsOf(section) {
  const eq = section.indexOf('=')
  if (eq === -1) return { name: section, source: `#${section}`, port: `#${section}` }
  const name = section.slice(0, eq)
  const rest = section.slice(eq + 1)
  const sep = rest.indexOf('::')
  if (sep === -1) return { name, source: rest, port: rest }
  return { name, source: rest.slice(0, sep), port: rest.slice(sep + 2) }
}

// The box of an element and its children three levels down, with the margins, paddings and type
// metrics that decide a section's height.
function boxTree(selector) {
  const root = document.querySelector(selector)
  if (root === null) return ['no match']
  const out = []
  const walk = (el, depth) => {
    if (depth > 3) return
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    out.push(
      `${'  '.repeat(depth)}${el.tagName.toLowerCase()} ${Math.round(r.width)}x${Math.round(r.height)} mt=${cs.marginTop} mb=${cs.marginBottom} pt=${cs.paddingTop} pb=${cs.paddingBottom} fs=${cs.fontSize} lh=${cs.lineHeight}`,
    )
    for (const child of el.children) walk(child, depth + 1)
  }
  walk(root, 0)
  return out
}

// Whether the selector matches on the page, waiting for a page that is still compiling or
// hydrating rather than reporting it missing.
async function present(page, selector) {
  const el = page.locator(selector).first()
  return el
    .waitFor({ state: 'attached', timeout: 15_000 })
    .then(() => true)
    .catch(() => false)
}

const browser = await chromium.launch()
const pages = {}
for (const [side, url] of [
  ['source', sourceUrl],
  ['port', portUrl],
]) {
  const context = await browser.newContext({
    viewport: { width: options.width, height: 900 },
    reducedMotion: 'reduce',
    colorScheme: options.scheme === 'light' ? 'light' : 'dark',
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle', timeout: 180_000 })
  await page.waitForTimeout(1500)
  pages[side] = page
}

if (options.measure !== null) {
  for (const side of ['source', 'port']) {
    console.log(`== ${side}`)
    await present(pages[side], options.measure)
    console.log((await pages[side].evaluate(boxTree, options.measure)).join('\n'))
  }
} else {
  mkdirSync(options.out, { recursive: true })
  for (const side of ['source', 'port']) {
    await pages[side].screenshot({ path: join(options.out, `${side}-top.png`) })
  }
  for (const section of sections) {
    const { name, ...selectors } = selectorsOf(section)
    const sizes = {}
    for (const side of ['source', 'port']) {
      if (!(await present(pages[side], selectors[side]))) {
        sizes[side] = null
        continue
      }
      const el = pages[side].locator(selectors[side]).first()
      await el.scrollIntoViewIfNeeded()
      await pages[side].waitForTimeout(400)
      await el.screenshot({ path: join(options.out, `${side}-${name}.png`) })
      const box = await el.boundingBox()
      sizes[side] = box === null ? null : { w: Math.round(box.width), h: Math.round(box.height) }
    }
    const show = (size) => (size === null ? 'missing' : `${String(size.w)}x${String(size.h)}`)
    const delta =
      sizes.source === null || sizes.port === null
        ? ''
        : ` height ${sizes.port.h - sizes.source.h >= 0 ? '+' : ''}${String(sizes.port.h - sizes.source.h)}`
    console.log(
      `${name.padEnd(14)} source ${show(sizes.source).padEnd(10)} port ${show(sizes.port).padEnd(10)}${delta}`,
    )
  }
  console.log(`screenshots in ${options.out}`)
}
await browser.close()
