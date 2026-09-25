// Holds the built pages to their byte budgets. Run after `next build`; exits 1 over budget.
//
// It reads the prerendered HTML for each route, gzips every script and stylesheet the HTML
// references, sums the fonts it preloads as served, and compares the totals with the numbers in
// docs/home-page-design-plan.md, section 8, ADR 0034, ADR 0035 and ADR 0037. It also fails when a
// route is no longer prerendered, and when a chunk that must stay lazy (GSAP, ADR 0005, and the
// others in LAZY below) is referenced from a route's initial script tags or can no longer be
// found at all.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
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
  // The stylesheet was shared by both routes until 25 September 2026, when /start took a sheet of
  // its own as well (below); the hero's finished page took it past 12 KB (12,044 B on 3 September
  // 2026, ADR 0006), so the line is 14 KB. The templates are not in it:
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
  // Then to 18.5 KB on 23 September 2026 for the page below the hero (ADR 0034, plan 6.7): two
  // @font-face rules, the dark scope and its tokens, the retuned scale and the section sheets
  // (seven files under app/_styles, 3,339 B gzipped on their own) land in the shared sheet, and
  // the hairline recipes went. The plan expected 17.0 to 17.4 KB before the section packages
  // wrote their sheets; the closing commit's production build measures 18,271 B on both routes
  // (the same two files), so the line is that plus the 70 B Windows-to-Linux margin, rounded up
  // to the next 500 (18,341 up to 18,500). The foundation carried 18,000 B provisionally until
  // the measure. Then to 19 KB the same afternoon for the PX mark (ADR 0034 amendment): the
  // brand sheet took the measure to 18,430 B, which plus the margin sat exactly on the line.
  // It held at 19 KB on 24 September 2026 through the /start redesign and the five home fixes
  // (docs/start-page-redesign-plan.md, which expected about 20,100 B and a move to 20,500):
  // app/globals.css now keeps docs/ out of class detection (`@source not '../docs'`), which on
  // 15d7721's sheet (18,044 B plus the 775 B font sheet, 18,819 B) was 3,132 B of utilities only
  // a plan or record named. The day's rules add 1,647 B on the same basis (the sheet compiled
  // without docs: 14,914 B at 15d7721, 16,561 B after), header.css the most (283 B to 964 B),
  // and next/font's faces now ride the same file, so both routes measure 17,298 B in one sheet
  // (about 20,700 B with docs read, which would have moved the line to 21 KB). It held again on
  // 25 September 2026, when app/_styles/start.css left it for a route import on /start (ADR 0037):
  // 17,326 B, 606 B under Release 1's 17,932 B.
  // Scripts stayed on 216 KB at the closing commit: 212,832 B measured on 23 September 2026 with
  // the choreography leaf in the initial bundle and GSAP, ScrollTrigger, Lenis and the ink
  // simulation all lazy (the four guards below); the line would have moved to 218 KB only had
  // the measure exceeded it. HTML measured 39,376 B the same day against the unchanged 40 KB,
  // then 35,305 B once the mark's eleven inline SVG paths left the header, footer and About.
  // Scripts then to 218 KB on 24 September 2026 (ADR 0034's amendment of that date, the byte
  // lines): 217,045 B measured, against 214,075 B at 15d7721. The phone menu's open, closing and
  // inert states, the header's steps on CONFIG.motion.headerStepMs, HeaderChrome's island and
  // over-dark props, its re-watch of the dark bands, its measured pill and its text gauge, the hero
  // prompt, the walkthrough's dock and its hold on an arrival fragment, and the glide's move of
  // focus make the 2,970 B. The plan's rule (docs/start-page-redesign-plan.md, section 19) sends a
  // measure over 215,930 B to 218 KB, which also covers the measure plus the 70 B margin rounded up
  // to the next 500 (217,115 B up to 217,500).
  // Fonts (ADR 0034) are the raw bytes of every font the home page preloads, as served: woff2 is
  // already compressed, so gzip would only muddle the number. The line is 64,000 B for the two
  // files the redesign loads, Mona Sans wght-only (39,796 B) and Instrument Serif italic
  // (15,684 B), 55,480 B together as next/font serves them: the same bytes in development
  // (.next/dev/static/media) and in the closing commit's production build (.next/static/media,
  // 23 September 2026); a Google-side re-cut that trips it is raised on the record, never by
  // editing the subset.
  '/': { scripts: 218_000, stylesheets: 19_000, html: 40_000, fonts: 64_000 },
  // Raised from 230 KB on 4 September 2026 for zod 4, whose core is about 13 KB gzipped heavier
  // on this page than zod 3 (ADR 0019); its locales are kept out by the namespace import form.
  // Then to 246.5 KB on 24 September 2026 for the questionnaire's redesign (ADR 0035): 15d7721
  // measures 243,073 B here, not the 240,946 B ADR 0034 recorded before the header's commit.
  // HeaderChrome and its island joining the route, the X icon, the direction flag, and the
  // review's focus moves, done-state status line and radio-group keys took it to 246,101 B once
  // headerLink (app/_components/header-link.ts) stopped pulling SiteHeader and MobileNav in. The
  // line is that measure plus the 70 B margin, rounded up to the next 500 (246,171 B up to
  // 246,500).
  // Then to 248.5 KB on 24 September 2026 for the first release of the questionnaire's journey
  // (ADR 0037, docs/start-page-journey-plan.md, 9.6): 246,220 B at 38c7d82, 248,029 B once the
  // flow keeps the furthest question and its place in the tab's history, reopens a sent brief
  // from its address, polls the status route (also while hidden), holds the tab's title, says the
  // flow's notices and loads the done view as a chunk of its own with a stand-in beside it. The
  // line is that measure plus the 70 B margin, rounded up to the next 500 (248,099 B up to
  // 248,500). The stylesheet (17,932 B) and the HTML (6,116 B, the pre-paint script) stay under
  // their lines, which do not move.
  // Then to 251.5 KB on 25 September 2026 for its second release (ADR 0037's amendment of that
  // date): 251,008 B once the questions run in their new order with their own words
  // (start-copy.ts), the business name and its mark share a question, the mark, the look and the
  // colour are radio groups, the first question meters its sentence, each question carries its
  // receipt and tab title, and a picture is read and downscaled in the browser before it uploads,
  // with the send waiting for any still on its way. The line is that measure plus the 70 B margin,
  // rounded up to the next 500 (251,078 B up to 251,500). The same release moved start.css out of
  // app/globals.css into a route import, so /start now links two sheets, the shared one and its
  // own, which this line counts together: 18,644 B, under the 19,000 B line, which does not move.
  // The HTML measures 6,150 B.
  // Then to 254 KB on 25 September 2026, and the stylesheet line to 25 KB, once the owner had
  // decided the redesign's ceilings (ADR 0037's sixth amendment): Release 3 and the two polishes
  // that fitted it to every screen measured past the 252,000 and 23,500 B ceilings the plan had
  // set (OD11), and the follow-up package that carried the owner's decisions (a poster layout
  // per template, the 120rem cap, the phone's done order, the page's address without its scheme,
  // the mood art in its look's own colours and the dark window's halo) measures 253,760 B of
  // scripts and 24,732 B across /start's two sheets. Each line is that measure plus the 70 B
  // margin, rounded up to the next 500 (253,830 B up to 254,000; 24,802 B up to 25,000). The
  // phase that held /start to the ceilings between releases went with the decision. The HTML
  // measures 5,817 B.
  '/start': { scripts: 254_000, stylesheets: 25_000, html: 25_000 },
}

// Chunks that must never ride a route's initial script tags. Each is found by a string its
// minified source keeps, in a file larger than minBytes, so that a small loader which only names
// the library is not taken for it. A marker that no emitted chunk carries fails the run, because
// its guard would pass blind.
const LAZY = {
  // GSAP (ADR 0005) and Lenis (ADR 0021) load on idle, and so does the hero's ink simulation
  // with its shaders (ADR 0031).
  gsap: { pattern: /gsap\.version|_gsap|GreenSock/, minBytes: 20_000 },
  lenis: { pattern: /lenis-smooth|lenisVersion/, minBytes: 5_000 },
  fluid: { pattern: /u_point_size/, minBytes: 3_000 },
  // ScrollTrigger (ADR 0034) rides the same loader as the core and is never initial.
  scrollTrigger: { pattern: /scrollerProxy|pinSpacing/, minBytes: 10_000 },
  // The home page hands the hero's sentence to /start and never reads a draft back, so it never
  // loads the schema library (plan D4). Its core registers every schema under this trait name.
  zod: { pattern: /\$ZodType/, minBytes: 10_000 },
  // The live draft's four display faces are a /start-only module loaded from the second question
  // (plan 5.8), and Fraunces stands for all four. The marker is the fallback family next/font
  // writes into the module beside the face, never the bare name: the draft's copy names its
  // faces to the visitor from the initial bundle ("set in Fraunces in your designs"), and that
  // must not read as the module.
  fraunces: { pattern: /Fraunces Fallback/, minBytes: 0 },
  // The done view loads while the last question is answered (plan 4.9 and 9.6). The location its
  // call reports to analytics is a literal the minifier keeps.
  done: { pattern: /"brief-done"/, minBytes: 0 },
  // The questions after the first load as one chunk while the first is answered (plan 9.6, one of
  // the offsets Release 3's bytes rely on). The business name's field is the only one in the build
  // that asks for an organisation.
  steps: { pattern: /autoComplete:"organization"/, minBytes: 0 },
}

const GUARDS = {
  '/': ['gsap', 'lenis', 'fluid', 'scrollTrigger', 'zod'],
  '/start': ['gsap', 'lenis', 'fluid', 'fraunces', 'done', 'steps'],
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

// The fonts next/font preloads for the route: every <link ... as="font"> tag, whichever order
// its attributes come in.
function preloadedFonts(html) {
  return [...html.matchAll(/<link\b[^>]*\bas="font"[^>]*>/g)]
    .map((match) => /\bhref="([^"]+)"/.exec(match[0])?.[1])
    .filter((url) => url !== undefined && url.startsWith('/_next/'))
}

// How the number is read: everything the wire compresses is counted gzipped; fonts as served.
const UNITS = { fonts: 'B as served' }

function carries(file, { pattern, minBytes }) {
  return statSync(file).size > minBytes && pattern.test(readFileSync(file, 'utf8'))
}

// Every script the build emitted, whether a route loads it at once or on demand.
const CHUNKS = join(NEXT, 'static', 'chunks')
function emitted() {
  return readdirSync(CHUNKS, { recursive: true })
    .filter((name) => name.endsWith('.js'))
    .map((name) => join(CHUNKS, name))
}

let failed = false
function report(state, route, line) {
  if (state === 'OVER') failed = true
  console.log(`${state.padEnd(7)} ${route.padEnd(7)} ${line}`)
}

if (!existsSync(join(NEXT, 'BUILD_ID'))) {
  console.error('bundle-budget: no production build in .next; run next build first')
  process.exit(1)
}

// The markers some emitted chunk carries. Every marker is guarded on a route, so the guards below
// are where a missing one is reported.
const chunks = emitted()
const built = new Set(
  Object.keys(LAZY).filter((name) => chunks.some((file) => carries(file, LAZY[name]))),
)

for (const [route, line] of Object.entries(BUDGETS)) {
  // A route that stops being prerendered has no HTML here at all. /start must stay static, so it
  // reads the URL inside the flow and never in the page (plan 7.8).
  const file = join(NEXT, 'server', 'app', route === '/' ? 'index.html' : `${route.slice(1)}.html`)
  const shown = relative(ROOT, file).replaceAll('\\', '/')
  if (!existsSync(file)) {
    report('OVER', route, `not prerendered: no ${shown}`)
    continue
  }
  report('ok', route, `prerendered (${shown})`)
  const html = readFileSync(file, 'utf8')
  const scripts = referenced(html, /<script[^>]+src="([^"]+)"/g)
  const stylesheets = referenced(html, /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)
  const totals = {
    scripts: scripts.reduce((sum, url) => sum + gzipped(assetPath(url)), 0),
    stylesheets: stylesheets.reduce((sum, url) => sum + gzipped(assetPath(url)), 0),
    html: gzipSync(html, { level: 9 }).length,
    fonts: preloadedFonts(html).reduce((sum, url) => sum + statSync(assetPath(url)).size, 0),
  }
  const budget = line
  for (const [kind, limit] of Object.entries(budget)) {
    const actual = totals[kind]
    report(
      actual <= limit ? 'ok' : 'OVER',
      route,
      `${kind.padEnd(12)} ${String(actual).padStart(8)} ${UNITS[kind] ?? 'B gzipped'} (budget ${limit})`,
    )
  }
  for (const name of GUARDS[route]) {
    if (!built.has(name)) {
      report(
        'OVER',
        route,
        `${name}: no emitted chunk carries its marker ${String(LAZY[name].pattern)}`,
      )
      continue
    }
    const found = scripts.filter((url) => carries(assetPath(url), LAZY[name]))
    if (found.length === 0) {
      report('ok', route, `${name} stays a lazy chunk`)
    } else {
      report('OVER', route, `${name} in the initial script tags: ${found.join(', ')}`)
    }
  }
}

process.exit(failed ? 1 : 0)
