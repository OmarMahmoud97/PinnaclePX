// The rendered contrast check (decision 15; the check standard in
// docs/template-fit-decisions.md, Part 3): every text a visitor reads, composited over what the
// page paints under it (lib/contrast-run.mjs), at AA: 4.5:1, or 3:1 at 24 px and up or 18.66 px
// bold. All four looks and both schemes, at 390 and 1440, with no pictures; words over a
// picture are over-picture.mjs's. Each faded colour class (such as text-on-surface/75) is
// reported with the lowest ratio it reached, which is what decides whether a shade may stay.
//
//   node scripts/checks/contrast.mjs --base http://localhost:3120 [options in lib/args.mjs]
//     --schemes <list>   light,dark (default both)
//     --jobs <n>         pages measured at once (default 2)
import { parseArgs } from './lib/args.mjs'
import { runContrast } from './lib/contrast-run.mjs'
import { outDir, tally, writeReport } from './lib/report.mjs'

const options = parseArgs(process.argv.slice(2), {
  source: 'corpus',
  kind: 'model',
  widths: '390x844,1440x900',
})
const { pages, results, schemes } = await runContrast(options, { gradientOnly: false })
const solid = results.filter((r) => !r.gradient && r.worst !== null)
const failing = solid.filter((r) => r.worst < r.level)
const lines = [
  `Rendered contrast: ${String(pages.length)} pages (${options.source}), schemes ${schemes.join(',')}, looks ${options.looks}, sizes ${options.sizes.map((s) => s.size).join(', ')}; ${String(solid.length)} text measurements, ${String(failing.length)} below AA. Gradient text is gradient-text.mjs's.`,
]
for (const templateId of [...new Set(solid.map((r) => r.templateId))].sort()) {
  const mine = solid.filter((r) => r.templateId === templateId)
  const total = new Set(mine.map((r) => r.page)).size
  lines.push(`\n${templateId} (${String(total)} pages)`)
  for (const scheme of schemes) {
    for (const size of options.sizes.map((s) => s.size)) {
      const at = mine.filter((r) => r.scheme === scheme && r.size === size)
      if (at.length === 0) continue
      const bad = at.filter((r) => r.worst < r.level)
      const pagesBad = new Set(bad.map((r) => r.page)).size
      lines.push(
        `  ${scheme.padEnd(5)} ${size.padEnd(9)} ${String(pagesBad)}/${String(total)} pages, ${String(bad.length)}/${String(at.length)} measurements below AA`,
      )
      // The failing texts by where they are and the colour class that sets them, as
      // review/verify-templates/contrast.cjs grouped them.
      const groups = new Map()
      for (const r of bad) {
        const key = `${r.section} | ${r.tokens === '' ? '(inherited)' : r.tokens} | ${String(r.size)}px`
        const group = groups.get(key) ?? { lowest: Infinity, texts: new Set(), n: 0 }
        group.lowest = Math.min(group.lowest, r.worst)
        group.texts.add(r.text.slice(0, 24))
        group.n += 1
        groups.set(key, group)
      }
      for (const [key, group] of [...groups.entries()]
        .sort((a, b) => b[1].n - a[1].n)
        .slice(0, 6)) {
        lines.push(
          `      ${String(group.n).padStart(3)} ${key} | lowest ${String(group.lowest)} | ${[...group.texts].slice(0, 2).join(' / ')}`,
        )
      }
      // Texts never seen with nothing over them are not judged, so they are named rather than
      // left out of the count as if they passed.
      const unjudged = results.filter(
        (r) =>
          r.templateId === templateId &&
          !r.gradient &&
          r.worst === null &&
          r.scheme === scheme &&
          r.size === size,
      )
      if (unjudged.length > 0) {
        const named = tally(unjudged, (r) => `${r.section} "${r.text.slice(0, 24)}"`)
          .slice(0, 3)
          .map(([k, n]) => `${k} x${String(n)}`)
        lines.push(
          `      unjudged, never seen with nothing over it: ${String(unjudged.length)}: ${named.join('; ')}`,
        )
      }
    }
  }
}
// Faded colour classes: the lowest ratio each reached, on any page, scheme and width.
const shades = new Map()
for (const r of solid) {
  for (const token of r.tokens.split(' ').filter((t) => t.includes('/'))) {
    const key = `${r.templateId} ${token}`
    const shade = shades.get(key) ?? { lowest: Infinity, n: 0, below: 0 }
    shade.lowest = Math.min(shade.lowest, r.worst)
    shade.n += 1
    if (r.worst < r.level) shade.below += 1
    shades.set(key, shade)
  }
}
lines.push('\nFaded colour classes: lowest ratio reached (measurements below AA of all)')
for (const [key, shade] of [...shades.entries()].sort()) {
  lines.push(
    `  ${key}: lowest ${String(shade.lowest)} (${String(shade.below)} of ${String(shade.n)} below AA)`,
  )
}
writeReport(outDir(options, 'contrast'), results, lines)
