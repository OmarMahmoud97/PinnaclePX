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
//
// What fails on main is listed beside each template's corpus, in its _expected.json, which that
// template's pull request edits as it fixes the cases (the template pull requests touch no e2e
// spec): a case in textFit.failing is expected to fail, so the fix that makes it pass turns
// Playwright red until the case leaves the list; a case in textFit.unsettled is skipped, with why.

type Corpus = Readonly<{
  answers: { company: string; imagery: { style: string } }
  copy: { brand?: { name?: unknown } }
}>
type Expected = Readonly<{
  fixedBy: string
  textFit: { failing: readonly string[]; unsettled: Readonly<Record<string, string>> }
}>

const DIR = join(process.cwd(), 'tests', 'fixtures', 'template-copy')
const WIDTHS = [
  { width: 320, height: 568, phone: true },
  { width: 390, height: 844, phone: true },
  { width: 768, height: 1024, phone: false },
  { width: 1024, height: 768, phone: false },
  { width: 1440, height: 900, phone: false },
] as const

const read = (...path: string[]): unknown => JSON.parse(readFileSync(join(DIR, ...path), 'utf8'))

function casesOf(templateId: string): string[] {
  const names = readdirSync(join(DIR, templateId))
    .filter((file) => file.endsWith('.json') && !file.startsWith('_'))
    .map((file) => file.replace(/\.json$/, ''))
  const length = (name: string) =>
    readFileSync(join(DIR, templateId, `${name}.json`), 'utf8').length
  const stored = names
    .filter((name) => !name.startsWith('synthetic-'))
    .sort((a, b) => length(b) - length(a) || a.localeCompare(b))
    .slice(0, 3)
  return [...stored, ...names.filter((name) => name.startsWith('synthetic-')).sort()]
}

// Every case opens its own pages, so they share nothing and may run side by side. A case waits
// for its pages to settle at five widths, so it is given more than the default 30 seconds: a
// case that times out counts as unexpected even where it is expected to fail.
test.describe.configure({ mode: 'parallel', timeout: 90_000 })

const templates = readdirSync(DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

for (const templateId of templates) {
  const expected = read(templateId, '_expected.json') as Expected
  test.describe(templateId, () => {
    for (const name of casesOf(templateId)) {
      const key = `${templateId}/${name}`
      test(name, async ({ browser, baseURL }) => {
        const unsettled = expected.textFit.unsettled[name]
        test.skip(unsettled !== undefined, `${unsettled ?? ''}; until ${expected.fixedBy}`)
        const stored = read(templateId, `${name}.json`) as Corpus
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
        test.fail(
          expected.textFit.failing.includes(name),
          `fails today: ${expected.fixedBy} fixes it`,
        )
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
