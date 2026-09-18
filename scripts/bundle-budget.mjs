// Holds the built pages to their byte budgets. Run after `next build`; exits 1 over budget.
//
// It reads the prerendered HTML for each route, gzips every script and stylesheet the HTML
// references, and compares the totals with the numbers in docs/home-page-design-plan.md,
// section 8. It also fails if a chunk containing GSAP is referenced from the initial script tags
// of the home page, because GSAP must stay a lazy chunk (ADR 0005).
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const ROOT = process.cwd()
const NEXT = join(ROOT, '.next')

// Gzipped bytes.
const BUDGETS = {
  // The React and Next floor is about 155 KB of this; the page's own code stays under 55 KB.
  // Scripts raised from 210 KB on 6 September 2026 for the walkthrough (ADR 0025): main measured
  // 208,824 B, and the walkthrough's frame, track, stop function and brand are 3,721 B more,
  // about a third of that the four photographs' blur placeholders (212,545 B measured); its
  // timeline and finished page ride the lazy chunks. Then to 216 KB on 18 September 2026 for the
  // four new templates: the home page reads READY_TEMPLATES (Straight answers, Your options), so
  // the registry and all ten metas are in its bundle and each template made ready adds its own.
  // The line is 216 rather than 215.5 because the same commit measures 214,965 B on Windows and
  // 215,031 B on CI's Linux: the two builds differ by about 70 B, so a line inside that margin
  // is one CI can fail while the machine that set it passes.
  // The stylesheet is shared by both routes; the hero's finished page took it past 12 KB
  // (12,044 B on 3 September 2026, ADR 0006), so the line is 14 KB. The templates are not in it:
  // they carry their own sheet on the preview and example routes, which is what keeps this line
  // still (13,103 B measured on 5 September 2026 with four templates ready, ADR 0024), then to
  // 14.5 KB on 6 September 2026 for the colour and motion pass (ADR 0026): --surface-tint and
  // the corrected --glow-secondary, the tinted commercial band and its two gradient rules, the
  // gradient the ask keeps on hover, and the colour the walkthrough's active step, the open FAQ
  // entry and the six work cells take (13,975 B measured), then to 16 KB on 18 September 2026
  // for the ink hero (ADR 0031): the fitted fifteen-stop ground, the ink canvas, the headline's
  // blend and fills, the hero type token and the header's see-through and solid states
  // (15,384 B measured, 15,149 B once the sketch loop's section went the same day).
  // HTML raised from 25 KB on 5 September 2026 for the three content sections and the longer FAQ
  // (26,971 B measured), then to 36 KB the same day for the work band's six cards, each with a
  // phone and a desktop capture in two formats at two widths and a view toggle (34,941 B
  // measured, ADR 0022), then to 38 KB the same evening for the eight-cell "Everything built in"
  // band and the asks that end the work, real-build and options bands (36,576 B measured, ADR
  // 0022 amendment), then to 39 KB on 6 September 2026 for the hero's logo strip, whose row is
  // drawn twice so the slide has no seam, each mark carrying its own size and mask (38,245 B
  // measured), then to 40 KB the same day for the colour and motion pass (ADR 0026): the two
  // band rules, and the hover, focus and active-step classes the work cells, the walkthrough's
  // five steps and the hero's field now carry (39,185 B measured). Re-measured when the journey
  // band ships.
  '/': { scripts: 216_000, stylesheets: 16_000, html: 40_000 },
  // Raised from 230 KB on 4 September 2026 for zod 4, whose core is about 13 KB gzipped heavier
  // on this page than zod 3 (ADR 0019); its locales are kept out by the namespace import form.
  '/start': { scripts: 245_000, stylesheets: 16_000, html: 25_000 },
}

function gzipped(file) {
  return gzipSync(readFileSync(file), { level: 9 }).length
}

function assetPath(url) {
  // /_next/static/chunks/abc.js -> .next/static/chunks/abc.js
  return join(NEXT, url.replace(/^\/_next\//, '').split('?')[0])
}

function referenced(html, pattern) {
  return [...html.matchAll(pattern)]
    .map((match) => match[1])
    .filter((url) => url.startsWith('/_next/'))
}

let failed = false
for (const [route, budget] of Object.entries(BUDGETS)) {
  const file = join(NEXT, 'server', 'app', route === '/' ? 'index.html' : `${route.slice(1)}.html`)
  let html
  try {
    html = readFileSync(file, 'utf8')
  } catch {
    console.error(`bundle-budget: no prerendered HTML at ${file}; run next build first`)
    process.exit(1)
  }
  const scripts = referenced(html, /<script[^>]+src="([^"]+)"/g)
  const stylesheets = referenced(html, /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)
  const totals = {
    scripts: scripts.reduce((sum, url) => sum + gzipped(assetPath(url)), 0),
    stylesheets: stylesheets.reduce((sum, url) => sum + gzipped(assetPath(url)), 0),
    html: gzipSync(html, { level: 9 }).length,
  }
  for (const [kind, limit] of Object.entries(budget)) {
    const actual = totals[kind]
    const ok = actual <= limit
    if (!ok) failed = true
    console.log(
      `${ok ? 'ok  ' : 'OVER'} ${route.padEnd(7)} ${kind.padEnd(12)} ${String(actual).padStart(8)} B gzipped (budget ${limit})`,
    )
  }
  // GSAP (ADR 0005) and Lenis (ADR 0021) are lazy chunks on every route, and so is the hero's
  // ink simulation with its shaders (ADR 0031); the home page stands for all of them.
  if (route === '/') {
    const lazy = {
      gsap: { pattern: /gsap\.version|_gsap|GreenSock/, minBytes: 20_000 },
      lenis: { pattern: /lenis-smooth|lenisVersion/, minBytes: 5_000 },
      fluid: { pattern: /u_point_size/, minBytes: 3_000 },
    }
    for (const [name, { pattern, minBytes }] of Object.entries(lazy)) {
      const inInitial = scripts.filter((url) => {
        const source = readFileSync(assetPath(url), 'utf8')
        return pattern.test(source) && statSync(assetPath(url)).size > minBytes
      })
      if (inInitial.length > 0) {
        failed = true
        console.log(`OVER /       ${name} in the initial script tags: ${inInitial.join(', ')}`)
      } else {
        console.log(`ok   /       ${name} stays a lazy chunk`)
      }
    }
  }
}

process.exit(failed ? 1 : 0)
