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
  // The React and Next floor is about 155 KB of this; the page's own code stays under 50 KB.
  // The stylesheet is shared by both routes; the hero's finished page took it past 12 KB
  // (12,044 B on 3 September 2026, ADR 0006), so the line is 14 KB.
  '/': { scripts: 210_000, stylesheets: 14_000, html: 25_000 },
  // Raised from 230 KB on 4 September 2026 for zod 4, whose core is about 13 KB gzipped heavier
  // on this page than zod 3 (ADR 0019); its locales are kept out by the namespace import form.
  '/start': { scripts: 245_000, stylesheets: 14_000, html: 25_000 },
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
  if (route === '/') {
    const gsapInInitial = scripts.filter((url) => {
      const source = readFileSync(assetPath(url), 'utf8')
      return /gsap\.version|_gsap|GreenSock/.test(source) && statSync(assetPath(url)).size > 20_000
    })
    if (gsapInInitial.length > 0) {
      failed = true
      console.log(`OVER /       gsap in the initial script tags: ${gsapInInitial.join(', ')}`)
    } else {
      console.log('ok   /       gsap stays a lazy chunk')
    }
  }
}

process.exit(failed ? 1 : 0)
