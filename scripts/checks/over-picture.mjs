// Words over a picture (decision 7's rule; the check standard in docs/template-fit-decisions.md,
// Part 3). Every text item that lies on a picture must meet 4.5:1, or 3:1 when large, over every
// pixel of its box when the picture is pure white and when it is pure black, and with no
// picture: in both schemes, at every width, with the header at the top and scrolled past its
// glass threshold, and with a phone's menu open. Started from review/photos/measure-hero.cjs
// (the text boxes) and legibility-real.cjs (the pixels under them); here the page is
// screenshotted with every glyph hidden, so the pixels are what the template paints under its
// words: the picture with any veil, gradient or sheet over it.
//
//   node scripts/checks/over-picture.mjs --base http://localhost:3120 [options in lib/args.mjs]
//     --mode worst    the rule: white, black and no pictures (default)
//     --mode picks    the cross-check: each stored pick of an eval source under its words, which
//                     pass when 95% of each box's pixels meet the level (plan line 1286)
//     --mode pool     the same over every unrejected candidate of the stored hero pools of
//                     --pool-templates (default t05-ember,t07-summit)
//     --mode logos    stand-in image logos (decision 23's marks) over the three pictures
//     --schemes <list>   light,dark (default both; picks and pool use the answers' own)
//     --jobs <n>      pages measured at once (default 2)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { parseArgs } from './lib/args.mjs'
import { contextFor, inPool, launch, open, resize } from './lib/browser.mjs'
import { round2 } from './lib/colour.mjs'
import { installHelpers, logoBoxes, textItems } from './lib/in-page.mjs'
import { pagesOf, urlOf } from './lib/pages.mjs'
import {
  grab,
  hideText,
  judge,
  measureItems,
  prepareHiding,
  withoutGeometry,
} from './lib/pixels.mjs'
import { outDir, tally, writeReport } from './lib/report.mjs'

// The stored picks and pools are an eval run's; the rest measure the committed corpus.
const asked = process.argv.indexOf('--mode')
const withPictures = ['picks', 'pool'].includes(process.argv[asked + 1] ?? '') && asked !== -1
const options = parseArgs(process.argv.slice(2), {
  source: withPictures ? 'eval:l6-all-fixes' : 'corpus',
  kind: 'model',
  looks: 'own',
})
const mode = options.rest.mode ?? 'worst'
const schemes = (options.rest.schemes ?? 'light,dark').split(',')
const jobs = Number(options.rest.jobs ?? 2)
const SCROLLED = 120 // past every glass threshold: Ember and Summit 10, Harbor 40 (nav.tsx)

// The phones and the windows, each set measured on one load per state.
const groups = [options.sizes.filter((s) => s.phone), options.sizes.filter((s) => !s.phone)].filter(
  (g) => g.length > 0,
)

async function ready(tab, url) {
  await open(tab, url)
  await tab.evaluate(installHelpers)
  await prepareHiding(tab)
}

// The phone menu's toggle at the top of the page: a header button that says it is shut. It is
// held by a mark, not by its shut state: once open it no longer matches [aria-expanded="false"],
// and a menu that Escape leaves open (Atlas's on main) must still be found to shut it.
async function openMenu(tab) {
  const toggle = tab.locator(
    'header button[aria-expanded="false"], nav button[aria-expanded="false"]',
  )
  const count = await toggle.count()
  for (let i = 0; i < count; i += 1) {
    const candidate = toggle.nth(i)
    if (!(await candidate.isVisible())) continue
    await candidate.evaluate((el) => {
      for (const old of document.querySelectorAll('[data-check-menu-toggle]')) {
        old.removeAttribute('data-check-menu-toggle')
      }
      el.setAttribute('data-check-menu-toggle', '')
    })
    const button = tab.locator('[data-check-menu-toggle]')
    const id = await button.getAttribute('aria-controls')
    await button.click()
    await tab.waitForTimeout(500)
    return { id, button }
  }
  return null
}

const strip = withoutGeometry

async function worst(browser, page, scheme) {
  const results = []
  const look = page.answers.imagery.style
  for (const sizes of groups) {
    const keys = new Map()
    for (const pictures of ['white', 'black', 'none']) {
      const context = await contextFor(browser, sizes[0])
      try {
        const tab = await context.newPage()
        await ready(
          tab,
          urlOf(options.base, page, {
            look,
            scheme,
            pictures: pictures === 'none' ? null : pictures,
          }),
        )
        for (const size of sizes) {
          await resize(tab, size)
          const known = keys.get(size.size) ?? {}
          const states = [
            ['top', 'page'],
            ['scrolled', 'header'],
          ]
          if (size.phone) states.push(['menu', 'menu'])
          for (const [state, scope] of states) {
            await tab.evaluate((y) => window.scrollTo(0, y), state === 'scrolled' ? SCROLLED : 0)
            await tab.waitForTimeout(250)
            let menu = null
            if (state === 'menu') {
              menu = await openMenu(tab)
              if (menu === null) continue
            }
            const items = await tab.evaluate(textItems, {
              keys: pictures === 'white' ? null : (known[state] ?? []),
              scope,
              menuId: menu?.id ?? null,
            })
            if (pictures === 'white') known[state] = items.map((i) => i.key)
            const query = (keys) =>
              tab.evaluate(textItems, { keys, scope, menuId: menu?.id ?? null })
            for (const r of await measureItems(tab, items, query, { walk: state === 'top' })) {
              results.push({
                ...strip(r),
                templateId: page.templateId,
                page: page.label,
                scheme,
                pictures,
                size: size.size,
                state,
              })
            }
            if (menu !== null) {
              // Shut it for the next width: Escape, else its button, else the page afresh.
              await tab.keyboard.press('Escape')
              await tab.waitForTimeout(300)
              const expanded = () =>
                menu.button.getAttribute('aria-expanded', { timeout: 2000 }).catch(() => null)
              if ((await expanded()) === 'true') {
                await menu.button.click({ timeout: 2000 }).catch(() => undefined)
                await tab.waitForTimeout(300)
              }
              if ((await expanded()) !== 'false') await ready(tab, tab.url())
            }
          }
          keys.set(size.size, known)
        }
      } finally {
        await context.close().catch(() => undefined)
      }
    }
  }
  return results
}

// Pexels' CDN centre crop of a picture, at the stand-ins' 3:2, cached on disk. A few at a time,
// with backoff on a failed fetch; never the API.
const CROPS = join(process.cwd(), 'test-results', 'checks', 'crops')
mkdirSync(CROPS, { recursive: true })
let fetching = 0
const unavailable = new Set()
async function cropOf(id, thumbnail) {
  const file = join(CROPS, `${String(id)}-1600x1067.jpg`)
  if (existsSync(file)) return readFileSync(file)
  if (thumbnail === undefined || unavailable.has(id)) return null
  while (fetching >= 4) await new Promise((resolve) => setTimeout(resolve, 100))
  fetching += 1
  try {
    // The stored thumbnail's address names the photo's own file; only the size changes.
    const url = `${thumbnail.split('?')[0]}?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1067`
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`${url}: ${String(response.status)}`)
        const bytes = Buffer.from(await response.arrayBuffer())
        writeFileSync(file, bytes)
        return bytes
      } catch (error) {
        if (attempt === 3) {
          process.stderr.write(`${String(error)}\n`)
          unavailable.add(id)
          return null
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt))
      }
    }
  } finally {
    fetching -= 1
  }
  return null
}

// Serve the stored picture for each slot the map names, in place of its grey stand-in: at the
// width next/image asked for, or whole where a template sets the stand-in as a CSS background.
async function servePicks(tab, picks, thumbnails) {
  const serve = async (route, source, width) => {
    const slot = /\/dev\/picture\/grey\/\d+x\d+-([a-z0-9-]+)\.png$/.exec(source)?.[1]
    const id = slot === undefined ? undefined : picks[slot]
    if (id === undefined || id === null) return route.continue()
    const crop = await cropOf(id, thumbnails[id])
    if (crop === null) return route.continue()
    const body = await sharp(crop).resize({ width }).jpeg({ quality: 85 }).toBuffer()
    return route.fulfill({ status: 200, contentType: 'image/jpeg', body })
  }
  await tab.route('**/_next/image**', async (route) => {
    const url = new URL(route.request().url())
    const source = decodeURIComponent(url.searchParams.get('url') ?? '')
    return serve(route, source, Number(url.searchParams.get('w') ?? '1600'))
  })
  await tab.route('**/dev/picture/grey/**', async (route) =>
    serve(route, new URL(route.request().url()).pathname, 1600),
  )
}

async function overPicks(browser, page, picks, label) {
  const results = []
  const view = { look: page.answers.imagery.style, pictures: 'grey' }
  for (const sizes of groups) {
    const context = await contextFor(browser, sizes[0])
    try {
      const tab = await context.newPage()
      await servePicks(tab, picks, page.thumbnails)
      await ready(tab, urlOf(options.base, page, view))
      for (const size of sizes) {
        await resize(tab, size)
        await tab.evaluate(() => window.scrollTo(0, 0))
        // Only words over a stored pick that the CDN served: a slot the visitor's page leaves
        // empty, or a pick that could not be fetched, keeps its grey stand-in and is not judged.
        const items = (await tab.evaluate(textItems, { scope: 'page' })).filter((i) => {
          const id = picks[i.picture]
          return id !== undefined && id !== null && !unavailable.has(id)
        })
        const query = (keys) => tab.evaluate(textItems, { keys, scope: 'page' })
        for (const r of await measureItems(tab, items, query)) {
          results.push({
            ...strip(r),
            templateId: page.templateId,
            page: page.label,
            pick: picks[r.picture],
            label,
            size: size.size,
          })
        }
      }
    } finally {
      await context.close().catch(() => undefined)
    }
  }
  return results
}

// The grey of a stand-in mark, read from a pixel of the picture the development route serves
// for it (app/dev/_render/stand-in.ts), so the measure and the page never disagree on it.
const greys = new Map()
async function greyOf(fill) {
  if (!greys.has(fill)) {
    const response = await fetch(`${options.base}/dev/picture/${fill}/1x1-probe.png`)
    if (!response.ok) throw new Error(`/dev/picture/${fill}: ${String(response.status)}`)
    const png = Buffer.from(await response.arrayBuffer())
    const { data } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    greys.set(fill, data[0])
  }
  return greys.get(fill)
}
// Decision 23's marks and the scheme each gets: dark artwork on the light scheme, light on the
// dark; dark artwork on the dark look waits for the plate (the preview chrome's pull request),
// and mixed artwork is reported, not gated.
const MARKS = [
  { fill: 'black', l: 0, scheme: 'light', gated: true },
  { fill: 'l034', l: 0.34, scheme: 'light', gated: true },
  { fill: 'l066', l: 0.66, scheme: 'dark', gated: true },
  { fill: 'white', l: 1, scheme: 'dark', gated: true },
  { fill: 'black', l: 0, scheme: 'dark', gated: false, note: 'dark look, before the plate' },
  { fill: 'l034', l: 0.34, scheme: 'dark', gated: false, note: 'dark look, before the plate' },
  { fill: 'l035', l: 0.35, scheme: 'light', gated: false, note: 'mixed' },
  { fill: 'l050', l: 0.5, scheme: 'light', gated: false, note: 'mixed' },
  { fill: 'l065', l: 0.65, scheme: 'light', gated: false, note: 'mixed' },
  { fill: 'l035', l: 0.35, scheme: 'dark', gated: false, note: 'mixed, dark look' },
  { fill: 'l050', l: 0.5, scheme: 'dark', gated: false, note: 'mixed, dark look' },
  { fill: 'l065', l: 0.65, scheme: 'dark', gated: false, note: 'mixed, dark look' },
]

async function logos(browser, page) {
  const results = []
  for (const mark of MARKS) {
    const grey = await greyOf(mark.fill)
    for (const sizes of groups) {
      for (const pictures of ['white', 'black', 'none']) {
        const context = await contextFor(browser, sizes[0])
        try {
          const tab = await context.newPage()
          const view = {
            look: page.answers.imagery.style,
            scheme: mark.scheme,
            logo: mark.fill,
            pictures: pictures === 'none' ? null : pictures,
          }
          await ready(tab, urlOf(options.base, page, view))
          for (const size of sizes) {
            await resize(tab, size)
            await tab.evaluate(() => window.scrollTo(0, 0))
            const boxes = await tab.evaluate(logoBoxes)
            if (boxes.length === 0) continue
            const restore = await hideText(tab, 'img[src*="-logo.png"]')
            try {
              for (const box of boxes) {
                const [left, top, right, bottom] = box.rect
                const region = await grab(tab, { left, top, right, bottom }, true)
                const item = {
                  colours: [[grey, grey, grey, 1]],
                  opacity: 1,
                  size: 24,
                  weight: 400,
                  rects: [box.rect],
                }
                const judged = judge(item, region)
                results.push({
                  templateId: page.templateId,
                  page: page.label,
                  mark: mark.fill,
                  scheme: mark.scheme,
                  gated: mark.gated,
                  note: mark.note ?? '',
                  pictures,
                  size: size.size,
                  where: box.where,
                  worst: judged.worst,
                  share: judged.share,
                })
              }
            } finally {
              await restore()
            }
          }
        } finally {
          await context.close().catch(() => undefined)
        }
      }
    }
  }
  return results
}

const pages = pagesOf(options)
const browser = await launch()
let results = []
const lines = []
if (mode === 'worst') {
  const work = pages.flatMap((page) => schemes.map((scheme) => ({ page, scheme })))
  results = (
    await inPool(
      work,
      jobs,
      ({ page, scheme }) => worst(browser, page, scheme),
      ({ page, scheme }) => `${page.label} ${scheme}`,
    )
  ).flat()
  const fails = results.filter((r) => r.worst !== null && r.worst < r.level)
  lines.push(
    `Words over a picture, worst case: ${String(pages.length)} pages (${options.source}), schemes ${schemes.join(',')}, ${String(options.sizes.length)} sizes; ${String(results.length)} item measurements, ${String(fails.length)} below their level.`,
  )
  for (const templateId of [...new Set(pages.map((p) => p.templateId))].sort()) {
    const mine = results.filter((r) => r.templateId === templateId)
    const pageCount = pages.filter((p) => p.templateId === templateId).length
    if (mine.length === 0) {
      lines.push(`\n${templateId} (${String(pageCount)} pages): no text over a picture`)
      continue
    }
    lines.push(
      `\n${templateId} (${String(pageCount)} pages): items failing / measured, by state and picture`,
    )
    for (const size of options.sizes.map((s) => s.size)) {
      const at = mine.filter((r) => r.size === size)
      if (at.length === 0) continue
      const cells = []
      for (const state of ['top', 'scrolled', 'menu']) {
        for (const pictures of ['white', 'black', 'none']) {
          const cell = at.filter((r) => r.state === state && r.pictures === pictures)
          if (cell.length === 0) continue
          const bad = cell.filter((r) => r.worst !== null && r.worst < r.level)
          cells.push(`${state}/${pictures} ${String(bad.length)}/${String(cell.length)}`)
        }
      }
      lines.push(`  ${size.padEnd(9)} ${cells.join('  ')}`)
    }
    const worstItems = tally(
      mine.filter((r) => r.worst !== null && r.worst < r.level),
      (r) => `${r.state} ${r.section} "${r.text.slice(0, 24)}"`,
    ).slice(0, 4)
    if (worstItems.length > 0) {
      lines.push(`  most failing: ${worstItems.map(([k, n]) => `${k} x${String(n)}`).join('; ')}`)
    }
  }
} else if (mode === 'picks' || mode === 'pool') {
  const named = (options.rest['pool-templates'] ?? 't05-ember,t07-summit').split(',')
  const work =
    mode === 'picks'
      ? pages.map((page) => ({ page, picks: page.picks, label: 'stored pick' }))
      : pages
          .filter((page) => named.includes(page.templateId))
          .flatMap((page) => {
            const hero = page.pools.find((pool) => pool.purpose.startsWith('the main'))
            const slot = Object.keys(page.picks)[0]
            return (hero?.ordered ?? []).map((id) => ({
              page,
              picks: { [slot]: id },
              label: `pool ${String(id)}`,
            }))
          })
  results = (
    await inPool(
      work,
      jobs,
      ({ page, picks, label }) => overPicks(browser, page, picks, label),
      ({ page, label }) => `${page.label} ${label}`,
    )
  ).flat()
  const pairs = new Set(results.map((r) => `${r.page} ${r.templateId} ${r.label}`))
  const failingPairs = new Set(
    results.filter((r) => r.share < 0.95).map((r) => `${r.page} ${r.templateId} ${r.label}`),
  )
  lines.push(
    `Words over a picture, ${mode === 'picks' ? 'stored picks' : 'stored hero pools'} (the 95% rule): ${String(work.length)} pages with their pictures, ${String(pairs.size)} with words over a served picture, measured at ${options.sizes.map((s) => s.size).join(', ')}; ${String(failingPairs.size)} have an item under 95% at some width.`,
  )
  for (const templateId of [...new Set(results.map((r) => r.templateId))].sort()) {
    for (const size of options.sizes.map((s) => s.size)) {
      const mine = results.filter((r) => r.templateId === templateId && r.size === size)
      if (mine.length === 0) continue
      const all = new Set(mine.map((r) => `${r.page} ${r.label}`))
      const bad = new Set(mine.filter((r) => r.share < 0.95).map((r) => `${r.page} ${r.label}`))
      const pickIds = new Set(mine.map((r) => r.pick))
      lines.push(
        `${templateId} ${size}: ${String(all.size - bad.size)}/${String(all.size)} pairs pass (${String(pickIds.size)} distinct pictures)`,
      )
    }
  }
} else if (mode === 'logos') {
  const firsts = [...new Map(pages.map((p) => [p.templateId, p])).values()]
  results = (
    await inPool(
      firsts,
      jobs,
      (page) => logos(browser, page),
      (page) => page.label,
    )
  ).flat()
  lines.push(
    `Stand-in logos (decision 23): ${String(firsts.length)} templates, one page each; pass at 3:1 over every pixel of the mark's box.`,
  )
  for (const templateId of [...new Set(results.map((r) => r.templateId))].sort()) {
    lines.push(`\n${templateId}`)
    for (const mark of MARKS) {
      const mine = results.filter(
        (r) => r.templateId === templateId && r.mark === mark.fill && r.scheme === mark.scheme,
      )
      if (mine.length === 0) continue
      const bad = mine.filter((r) => r.worst !== null && r.worst < 3)
      const low = Math.min(...mine.map((r) => r.worst ?? Infinity))
      const where = tally(bad, (r) => `${r.where} ${r.pictures} ${r.size}`).map(
        ([k, n]) => `${k}${n > 1 ? ` x${String(n)}` : ''}`,
      )
      lines.push(
        `  ${mark.fill.padEnd(5)} ${mark.scheme.padEnd(5)} ${mark.gated ? 'gated   ' : 'reported'} ${String(mine.length - bad.length)}/${String(mine.length)} pass, lowest ${String(round2(low))}${bad.length === 0 ? '' : `; fails: ${where.slice(0, 6).join(', ')}`}${mark.note === undefined ? '' : ` (${mark.note})`}`,
      )
    }
  }
} else {
  throw new Error(`Unknown --mode ${mode}: worst, picks, pool or logos`)
}
await browser.close()
for (const r of results) {
  if (r.worst !== undefined && r.worst !== null) r.worst = round2(r.worst)
  if (r.share !== undefined && r.share !== null) r.share = round2(r.share)
}
writeReport(outDir(options, `over-picture-${mode}`), results, lines)
