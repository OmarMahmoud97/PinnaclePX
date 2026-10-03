// The pages a check measures: stored model answers, each with what the development routes need
// to render it as a visitor gets it (app/dev/_render/concept.tsx). A page is one template's copy
// for one business; the check sets it in each look, scheme and state it measures.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()

// A run's records, as the eval wrote them: every fixture file, not the summary or _run.json.
function recordsOf(run) {
  const dir = join(ROOT, 'test-results', 'eval', run)
  if (!existsSync(dir)) throw new Error(`No stored run test-results/eval/${run}`)
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json') && name !== 'summary.json' && !name.startsWith('_'))
    .map((name) => JSON.parse(readFileSync(join(dir, name), 'utf8')))
}

// Every model answer in a stored run, rendered through /dev/eval. Fallback copy is not a model
// answer and is left out.
function evalPages(run) {
  return recordsOf(run).flatMap((record) =>
    Object.entries(record.copy)
      .filter(([, written]) => !written.fallback)
      .map(([templateId, written]) => ({
        templateId,
        name: record.id,
        label: `${run}/${record.id}`,
        path: `/dev/eval/${run}/${record.id}/${templateId}`,
        answers: record.answers,
        chosen: record.templates,
        copy: written.final,
        ctaLabel: record.brief.brief.ctaLabel ?? null,
        picks: record.imagery.assignment[templateId] ?? {},
        pools: record.imagery.pools,
        // Each candidate's CDN address, which carries the photo's own file name.
        thumbnails: Object.fromEntries(
          record.imagery.pools.flatMap((pool) => pool.candidates.map((c) => [c.id, c.thumbnail])),
        ),
      })),
  )
}

// Every answer of the committed corpus (tests/fixtures/template-copy), rendered through /dev/copy:
// the stored model answers of l6 and l7 and the synthetic ones. It holds no pictures. A file
// whose name starts with an underscore (_expected.json) is about the pages, not one of them.
function corpusPages() {
  const dir = join(ROOT, 'tests', 'fixtures', 'template-copy')
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap(({ name: templateId }) =>
      readdirSync(join(dir, templateId))
        .filter((file) => file.endsWith('.json') && !file.startsWith('_'))
        .map((file) => {
          const stored = JSON.parse(readFileSync(join(dir, templateId, file), 'utf8'))
          const name = file.replace(/\.json$/, '')
          return {
            templateId,
            name,
            label: `corpus/${templateId}/${name}`,
            path: `/dev/copy/${templateId}/${name}`,
            answers: stored.answers,
            chosen: stored.chosen,
            copy: stored.copy,
            ctaLabel: stored.ctaLabel,
            picks: {},
            pools: [],
            thumbnails: {},
          }
        }),
    )
}

const size = (page) => JSON.stringify(page.copy).length

export function pagesOf(options) {
  const pages = options.source.split(',').flatMap((source) => {
    if (source === 'corpus') return corpusPages()
    if (source.startsWith('eval:')) return evalPages(source.slice('eval:'.length))
    throw new Error(`Unknown source ${source}: use corpus or eval:<run>`)
  })
  const chosen = pages
    .filter((page) => options.templates === null || options.templates.includes(page.templateId))
    .filter((page) => options.names === null || options.names.includes(page.name))
    .filter((page) => {
      const synthetic = page.name.startsWith('synthetic-')
      return options.kind === 'all' || (options.kind === 'synthetic') === synthetic
    })
  if (options.limit === null) return chosen
  // The longest copy first: the pages most likely to break a layout.
  const byTemplate = new Map()
  for (const page of [...chosen].sort((a, b) => size(b) - size(a))) {
    const list = byTemplate.get(page.templateId) ?? []
    if (list.length < options.limit) list.push(page)
    byTemplate.set(page.templateId, list)
  }
  return [...byTemplate.values()].flat()
}

// The address of a page in a view: { look, scheme, pictures, logo, email }, each optional.
export function urlOf(base, page, view = {}) {
  const query = new URLSearchParams(
    Object.entries(view).filter(([, value]) => value !== undefined && value !== null),
  )
  const search = query.toString()
  return `${base}${page.path}${search === '' ? '' : `?${search}`}`
}
