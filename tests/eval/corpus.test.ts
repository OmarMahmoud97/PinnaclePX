import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { evalPageOf } from '@/app/dev/_render/eval-record'
import { contractFor, READY_TEMPLATES } from '@/templates/registry'
import {
  baseOf,
  type CorpusFile,
  corpusFileSchema,
  expectedFileSchema,
  NAMES,
  syntheticFrom,
} from './corpus'
import type { FixtureRecord } from './types'

// The committed copy corpus (tests/fixtures/template-copy): every answer renders in its
// template's shape, every business in it is an invented one, and the synthetic answers are what
// the generator makes from each template's longest stored answer, so a changed slot limit shows
// here until the corpus is written again. With CORPUS_WRITE=1 it is written first, from the
// stored runs l6 and l7, which are kept locally in test-results/eval, and then given Prettier's
// layout (the checks here compare the parsed answers, never the layout):
//
//   CORPUS_WRITE=1 pnpm exec vitest run tests/eval/corpus.test.ts
//   pnpm exec prettier --write tests/fixtures/template-copy

const DIR = join(process.cwd(), 'tests', 'fixtures', 'template-copy')
const RUNS = [
  ['l6', 'l6-all-fixes'],
  ['l7', 'l7-sentence'],
] as const
const SYNTHETIC = [
  'synthetic-longest',
  'synthetic-long-words',
  ...Object.keys(NAMES).map((name) => `synthetic-${name}`),
]

function readFolder(templateId: string): Record<string, CorpusFile> {
  const folder = join(DIR, templateId)
  return Object.fromEntries(
    readdirSync(folder)
      .filter((name) => name.endsWith('.json') && !name.startsWith('_'))
      .map((name) => [
        name.replace(/\.json$/, ''),
        corpusFileSchema.parse(JSON.parse(readFileSync(join(folder, name), 'utf8'))),
      ]),
  )
}

const write = (templateId: string, name: string, file: CorpusFile) => {
  writeFileSync(join(DIR, templateId, `${name}.json`), `${JSON.stringify(file, null, 2)}\n`)
}

// Every model answer of the two stored runs, then each template's synthetic answers.
function writeCorpus(): void {
  for (const { id } of READY_TEMPLATES) mkdirSync(join(DIR, id), { recursive: true })
  for (const [short, run] of RUNS) {
    const dir = join(process.cwd(), 'test-results', 'eval', run)
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.json') || name === 'summary.json' || name.startsWith('_')) continue
      const record = JSON.parse(readFileSync(join(dir, name), 'utf8')) as FixtureRecord
      for (const [templateId, written] of Object.entries(record.copy)) {
        // A template written outside the pick (EVAL_PAIRS) keeps the trio its record stores.
        const page = evalPageOf(record, templateId)
        if (written.fallback || page === null) continue
        write(templateId, `${short}-${record.id}`, {
          source: `${run}/${record.id}`,
          answers: record.answers,
          chosen: [...page.chosen],
          ctaLabel: record.brief.brief.ctaLabel,
          copy: written.final,
        })
      }
    }
  }
  for (const { id } of READY_TEMPLATES) {
    const base = baseOf(readFolder(id))
    if (base === null) continue
    for (const [name, file] of Object.entries(syntheticFrom(contractFor(id), base[1], base[0]))) {
      write(id, name, file)
    }
  }
}

// The invented businesses: the eval's frozen fixtures and the synthetic names.
const INVENTED = new Set([
  ...(
    JSON.parse(
      readFileSync(join(process.cwd(), 'tests', 'fixtures', 'eval', 'fixtures.json'), 'utf8'),
    ) as { fixtures: { answers: { company: string } }[] }
  ).fixtures.map((f) => f.answers.company),
  ...Object.values(NAMES),
])

describe('the template copy corpus', () => {
  it.runIf(process.env.CORPUS_WRITE === '1')('is written from the stored runs', () => {
    writeCorpus()
  })

  it('holds stored answers and every synthetic one for each ready template', () => {
    for (const { id } of READY_TEMPLATES) {
      const names = Object.keys(readFolder(id))
      expect(names.filter((n) => !n.startsWith('synthetic-')).length, id).toBeGreaterThan(0)
      expect(names.filter((n) => n.startsWith('synthetic-')).sort(), id).toEqual(
        [...SYNTHETIC].sort(),
      )
    }
  })

  it('renders: each answer is in its template’s copy shape, for an invented business', () => {
    for (const { id } of READY_TEMPLATES) {
      for (const [name, file] of Object.entries(readFolder(id))) {
        expect(name, id).toMatch(/^[a-z0-9-]+$/)
        expect(() => contractFor(id).copySchema.parse(file.copy), `${id}/${name}`).not.toThrow()
        expect(file.chosen, `${id}/${name}`).toContain(id)
        expect(INVENTED.has(file.answers.company), `${id}/${name}: ${file.answers.company}`).toBe(
          true,
        )
      }
    }
  })

  it('expects of each template only pages its corpus holds, each once', () => {
    for (const { id } of READY_TEMPLATES) {
      const expected = expectedFileSchema.parse(
        JSON.parse(readFileSync(join(DIR, id, '_expected.json'), 'utf8')),
      )
      const names = Object.keys(readFolder(id))
      const listed = [...expected.textFit.failing, ...Object.keys(expected.textFit.unsettled)]
      for (const name of listed) expect(names, `${id}/_expected.json: ${name}`).toContain(name)
      expect(new Set(listed).size, `${id}/_expected.json lists a case twice`).toBe(listed.length)
    }
  })

  it('keeps the synthetic answers the generator makes, so a changed slot limit shows', () => {
    for (const { id } of READY_TEMPLATES) {
      const files = readFolder(id)
      const base = baseOf(files)
      expect(base, id).not.toBeNull()
      if (base === null) continue
      const made = syntheticFrom(contractFor(id), base[1], base[0])
      for (const name of SYNTHETIC) expect(files[name], `${id}/${name}`).toEqual(made[name])
    }
  })
})
