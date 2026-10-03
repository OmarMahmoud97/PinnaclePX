// Rendered contrast, as both contrast checks run it. Every text item a visitor reads is
// composited, colour and alpha and opacity, over the pixels under it as the page paints them
// with its glyphs hidden (lib/pixels.mjs), in each scheme and look at each width, with no
// pictures. review/verify-templates/contrast.cjs, where this started, composited over the
// ancestors' solid backgrounds and skipped the rest; reading the painted pixels measures a
// gradient, a veil or an alpha band under the words as drawn too. Gradient text
// (background-clip: text), which a computed colour cannot show, is measured from its resolved
// stops: each stop against each pixel under it.
import { looksFor } from './args.mjs'
import { contextFor, inPool, launch, open, resize } from './browser.mjs'
import { round2 } from './colour.mjs'
import { installHelpers, textItems } from './in-page.mjs'
import { pagesOf, urlOf } from './pages.mjs'
import { measureItems, prepareHiding, withoutGeometry } from './pixels.mjs'

export async function runContrast(options, { gradientOnly }) {
  const schemes = (options.rest.schemes ?? 'light,dark').split(',')
  const jobs = Number(options.rest.jobs ?? 2)
  const pages = pagesOf(options)
  const groups = [options.sizes.filter((s) => s.phone), options.sizes.filter((s) => !s.phone)]
  const work = pages.flatMap((page) =>
    schemes.flatMap((scheme) =>
      looksFor(options.looks, page.answers.imagery.style).map((look) => ({ page, scheme, look })),
    ),
  )
  const browser = await launch()
  const measured = await inPool(
    work,
    jobs,
    async ({ page, scheme, look }) => {
      const rows = []
      for (const sizes of groups.filter((g) => g.length > 0)) {
        const context = await contextFor(browser, sizes[0])
        try {
          const tab = await context.newPage()
          await open(tab, urlOf(options.base, page, { look, scheme }))
          await tab.evaluate(installHelpers)
          await prepareHiding(tab)
          for (const size of sizes) {
            await resize(tab, size)
            await tab.evaluate(() => window.scrollTo(0, 0))
            const items = (await tab.evaluate(textItems, { keys: 'all' })).filter(
              (item) => !gradientOnly || item.gradient,
            )
            const query = (keys) => tab.evaluate(textItems, { keys })
            for (const r of await measureItems(tab, items, query)) {
              const rest = withoutGeometry(r)
              rows.push({
                ...rest,
                worst: r.worst === null ? null : round2(r.worst),
                share: r.share === null ? null : round2(r.share),
                templateId: page.templateId,
                page: page.label,
                scheme,
                look,
                size: size.size,
              })
            }
          }
        } finally {
          await context.close().catch(() => undefined)
        }
      }
      return rows
    },
    ({ page, scheme, look }) => `${page.label} ${scheme} in ${look}`,
  )
  await browser.close()
  return { pages, results: measured.flat(), schemes }
}
