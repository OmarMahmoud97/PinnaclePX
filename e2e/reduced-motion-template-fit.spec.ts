import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import { installHelpers, isStyled, loadFonts, settle } from '../scripts/checks/lib/in-page.mjs'
import { measureTextFit, type TextFitFinding } from '../scripts/checks/lib/text-fit-measure.mjs'

// The text-fit guard (decision 20, docs/template-fit-decisions.md). Each template's committed copy
// corpus (tests/fixtures/template-copy), rendered as a visitor's page by the development route
// /dev/copy, at 320, 390, 768, 1024 and 1440 with reduced motion, in the answer's own look: no
// text clipped, run past the screen or broken mid-word, and no header control wrapped,
// overlapping or off the screen (scripts/checks/lib/text-fit-measure.mjs, the measure the local
// check runs over every look and width). Kept fast: per template, the three longest stored
// answers and every synthetic one. Nothing here sends a brief.

type Corpus = Readonly<{
  answers: { company: string; imagery: { style: string } }
  copy: { brand?: { name?: unknown } }
}>

const DIR = join(process.cwd(), 'tests', 'fixtures', 'template-copy')
const WIDTHS = [
  { width: 320, height: 568, phone: true },
  { width: 390, height: 844, phone: true },
  { width: 768, height: 1024, phone: false },
  { width: 1024, height: 768, phone: false },
  { width: 1440, height: 900, phone: false },
] as const

// Each template's Phase 2 pull request, which holds it to text fit (decisions 15 and 19).
const FIXED_BY: Readonly<Record<string, string>> = {
  't01-aurora': 'Aurora’s Phase 2 pull request, fix/aurora-template-fit',
  't02-monolith': 'Monolith’s Phase 2 pull request, fix/monolith-template-fit',
  't03-meridian': 'Meridian’s Phase 2 pull request, fix/meridian-template-fit',
  't04-atlas': 'Atlas’s Phase 2 pull request, fix/atlas-template-fit',
  't05-ember': 'Ember’s Phase 2 pull request, fix/ember-template-fit',
  't06-harbor': 'Harbor’s Phase 2 pull request, fix/harbor-template-fit',
  't07-summit': 'Summit’s Phase 2 pull request, fix/summit-template-fit',
  't08-vector': 'Vector’s Phase 2 pull request, fix/vector-template-fit',
}

// The cases that fail on main on 2 October 2026 (measured on a dev server of this worktree):
// each fails as expected until its template's pull request fixes it, when Playwright reports the
// unexpected pass and that pull request takes the case out of this list.
const FAILING_TODAY: Readonly<Record<string, readonly string[]>> = {
  't01-aurora': [
    'l6-physio-unbroken',
    'synthetic-long-words',
    'synthetic-longest',
    'synthetic-name-40',
    'synthetic-name-60',
    'synthetic-name-80',
  ],
  't02-monolith': [
    'l6-a1-gas',
    'l6-cleaning',
    'l7-dentist-claims',
    'synthetic-long-words',
    'synthetic-longest',
    'synthetic-name-10',
    'synthetic-name-16',
    'synthetic-name-40',
    'synthetic-name-60',
    'synthetic-name-80',
  ],
  't03-meridian': [
    'l6-longest',
    'l7-architects',
    'l7-longest',
    'synthetic-long-words',
    'synthetic-longest',
    'synthetic-name-16',
    'synthetic-name-40',
    'synthetic-name-60',
    'synthetic-name-80',
  ],
  't04-atlas': [
    'l6-a1-gas',
    'l7-a1-gas',
    'l7-awkward',
    'synthetic-long-words',
    'synthetic-longest',
    'synthetic-name-10',
    'synthetic-name-16',
    'synthetic-name-40',
    'synthetic-name-60',
    'synthetic-name-80',
  ],
  't05-ember': ['l7-longest', 'synthetic-long-words', 'synthetic-longest', 'synthetic-name-60'],
  't06-harbor': [
    'l6-gardens',
    'l6-hr',
    'l6-photographer',
    'synthetic-long-words',
    'synthetic-longest',
    'synthetic-name-10',
    'synthetic-name-16',
    'synthetic-name-40',
    'synthetic-name-60',
    'synthetic-name-80',
  ],
  't07-summit': [
    'l6-longest',
    'l7-longest',
    'synthetic-long-words',
    'synthetic-longest',
    'synthetic-name-16',
    'synthetic-name-40',
    'synthetic-name-60',
    'synthetic-name-80',
  ],
  't08-vector': [
    'l6-bakery',
    'l6-dentist-claims',
    'l6-physio-longest',
    'synthetic-long-words',
    'synthetic-longest',
    'synthetic-name-10',
    'synthetic-name-16',
    'synthetic-name-40',
    'synthetic-name-60',
    'synthetic-name-80',
  ],
}

// Cases skipped until their template's pull request, rather than left to pass or fail by chance.
// Meridian's, Ember's and Summit's pass on Windows but fail with their text about 4% wider, as
// CI's Linux Chromium sets it, each at the edge of a header that pull request fixes. Aurora's
// fail only through its header ask on phones (t01-D2), whose classes set its display twice
// (inline-flex, and hidden md:inline-flex): the dev server's style sheets can order those either
// way from one start to the next, so the ask shows on some starts and not on others.
const UNSETTLED: Readonly<Record<string, readonly string[]>> = {
  't01-aurora': ['l6-architects', 'l7-florist', 'synthetic-name-10', 'synthetic-name-16'],
  't03-meridian': ['synthetic-name-10'],
  't05-ember': ['synthetic-name-16', 'synthetic-name-40', 'synthetic-name-80'],
  't07-summit': ['l6-architects'],
}

function casesOf(templateId: string): string[] {
  const names = readdirSync(join(DIR, templateId))
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace(/\.json$/, ''))
  const length = (name: string) =>
    readFileSync(join(DIR, templateId, `${name}.json`), 'utf8').length
  const stored = names
    .filter((name) => !name.startsWith('synthetic-'))
    .sort((a, b) => length(b) - length(a) || a.localeCompare(b))
    .slice(0, 3)
  return [...stored, ...names.filter((name) => name.startsWith('synthetic-')).sort()]
}

// Every case opens its own pages, so they share nothing and may run side by side.
test.describe.configure({ mode: 'parallel' })

const templates = readdirSync(DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

for (const templateId of templates) {
  test.describe(templateId, () => {
    for (const name of casesOf(templateId)) {
      const key = `${templateId}/${name}`
      test(name, async ({ browser, baseURL }) => {
        const fixedBy = FIXED_BY[templateId] ?? 'its template’s pull request'
        test.skip(UNSETTLED[templateId]?.includes(name) === true, `unsettled until ${fixedBy}`)
        const stored = JSON.parse(
          readFileSync(join(DIR, templateId, `${name}.json`), 'utf8'),
        ) as Corpus
        const brand = stored.copy.brand?.name
        // The phone's page and the window's, each checked as served before anything is measured,
        // so a broken server fails here and never counts as a case's expected failure.
        const pages = []
        for (const phone of [true, false]) {
          const sizes = WIDTHS.filter((w) => w.phone === phone)
          const context = await browser.newContext({
            ...(baseURL === undefined ? {} : { baseURL }),
            viewport: { width: sizes[0]?.width ?? 390, height: sizes[0]?.height ?? 844 },
            isMobile: phone,
            hasTouch: phone,
            reducedMotion: 'reduce',
          })
          const page = await context.newPage()
          const response = await page.goto(`/dev/copy/${templateId}/${name}`, {
            waitUntil: 'networkidle',
          })
          expect(response?.status(), `${key} as served`).toBe(200)
          expect(await page.evaluate(isStyled), `${key} with its style sheet`).toBe(true)
          await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
          await page.evaluate(loadFonts)
          await page.evaluate(installHelpers)
          pages.push({ context, page, sizes })
        }
        test.fail(FAILING_TODAY[templateId]?.includes(name) === true, `fails today: ${fixedBy}`)
        const found: string[] = []
        for (const { context, page, sizes } of pages) {
          for (const size of sizes) {
            await page.setViewportSize({ width: size.width, height: size.height })
            await page.waitForTimeout(150)
            await page.evaluate(settle)
            const findings: TextFitFinding[] = await page.evaluate(measureTextFit, {
              names: [typeof brand === 'string' ? brand : null, stored.answers.company],
            })
            for (const f of findings) {
              found.push(
                `${String(size.width)}: ${f.kind} in ${f.section}: ${f.el}${f.px === undefined ? '' : ` by ${String(f.px)}px`}`,
              )
            }
          }
          await context.close()
        }
        expect(found, `${key} in the ${stored.answers.imagery.style} look`).toEqual([])
      })
    }
  })
}
