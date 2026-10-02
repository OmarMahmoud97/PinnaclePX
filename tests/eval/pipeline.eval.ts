// The pipeline eval: the model stages over the frozen fixtures, with nothing else. It calls
// writeBrief, writeCopy, searchPhotos and rankPhotos directly, the way build-concepts does, and
// stops at the rank verdict: no download, no re-host, no Blob, no database, no email. Every
// answer, attempt, violation, verdict and usage object is written under test-results/eval, so a
// change to a prompt can be judged against the run before it. Runs only through `pnpm eval`.
//
//   EVAL_RUN=<name>           the run's folder under test-results/eval (default: a timestamp)
//   EVAL_FIXTURES=a,b         only these fixture ids
//   EVAL_STAGES=copy,rank     only these stages; the others are copied from EVAL_REUSE_RUN
//   EVAL_REUSE_RUN=<name>     a finished run whose briefs or verdicts stand in for the stages
//                             not run, so a copy change is judged on the same briefs; a fixture
//                             with no record there reuses a variant of the same business with
//                             other photographs, and its templates (decision 11)
//   EVAL_TEMPLATES=a,b        write copy only for these templates, on the fixtures they were
//                             chosen for; the briefs and pictures come from EVAL_REUSE_RUN, which
//                             it needs, so a pass on one template's guide pays for its copy alone
//   EVAL_MAX_USD=1.78         the spend stop: no new fixture starts once the calls this run has
//                             made reach this priced cost. Fixtures already started run to their
//                             end, so a run can pass the cap by up to EVAL_CONCURRENCY fixtures
//   EVAL_PLAN=1               validate the fixtures and print the template mix, and what
//                             EVAL_TEMPLATES and EVAL_MAX_USD would do; no calls
//   EVAL_SUMMARISE=<name>     recompute a run's summary from its files; no calls
//   EVAL_CONCURRENCY=2        fixtures in flight at once
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test, vi } from 'vitest'
import * as z from 'zod'
import { writeBrief } from '@/lib/ai/brief'
import { writeCopy } from '@/lib/ai/copy'
import { isPermanentModelError } from '@/lib/ai/errors'
import { rankPhotos } from '@/lib/ai/rank'
import { noteModelCall } from '@/lib/ai/usage'
import { submissionAnswersSchema } from '@/lib/brief/submission'
import { CONFIG } from '@/lib/config'
import { type BrandBrief, briefSchema, fallbackBrief } from '@/lib/copy-slots/brief'
import { fromSlotViolation, ruleViolationsIn } from '@/lib/copy-slots/rules'
import { payloadHashFrom } from '@/lib/identity/payload'
import type { Candidate } from '@/lib/images/candidates'
import { searchPhotos } from '@/lib/images/pexels'
import { orderByVerdict, planImagery } from '@/lib/images/plan'
import { selectTemplates } from '@/lib/select/select'
import { contractFor, READY_TEMPLATES, TEMPLATES } from '@/templates/registry'
import { copyAttemptOf, notebook, usageOf } from './notes'
import {
  type Choice,
  copyTargets,
  maxUsdOf,
  namedTemplates,
  reusedFor,
  runLimited,
  spendStop,
} from './plan'
import { costOf, summarise } from './summary'
import type { FixtureRecord, PoolRecord, RunFacts } from './types'

// The modules that reach outside: the row writer and the logger are replaced, so a call's usage
// is kept here and nothing touches the database. server-only is stubbed as the unit tests do.
vi.mock('server-only', () => ({}))
vi.mock('@/lib/db/model-calls', () => ({ recordModelCall: vi.fn(), readModelCalls: vi.fn() }))
vi.mock('@/lib/ai/usage', () => ({ noteModelCall: vi.fn() }))
vi.mock('@/lib/log', () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }))

const ROOT = process.cwd()
const FIXTURES_FILE = join(ROOT, 'tests', 'fixtures', 'eval', 'fixtures.json')
const RESULTS = join(ROOT, 'test-results', 'eval')

const fixtureSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  identity: z.string().min(1),
  notes: z.string(),
  answers: submissionAnswersSchema,
})
const fixturesFileSchema = z.object({ note: z.string(), fixtures: z.array(fixtureSchema) })
type Fixture = z.infer<typeof fixtureSchema>

type Stage = 'brief' | 'copy' | 'rank'
const STAGES: readonly Stage[] = ['brief', 'copy', 'rank']

const templates = namedTemplates(
  process.env.EVAL_TEMPLATES,
  TEMPLATES.map((t) => t.id),
)
// Named templates write copy and nothing else: their briefs and pictures are reused.
const stagesAsked: readonly string[] =
  process.env.EVAL_STAGES?.split(',') ?? (templates === null ? STAGES : ['copy'])
const env = {
  run: process.env.EVAL_RUN ?? new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19),
  fixtures: process.env.EVAL_FIXTURES?.split(',').filter((id) => id !== '') ?? null,
  stages: stagesAsked.filter((s): s is Stage => STAGES.includes(s as Stage)),
  reuse: process.env.EVAL_REUSE_RUN ?? null,
  templates,
  maxUsd: maxUsdOf(process.env.EVAL_MAX_USD),
  plan: process.env.EVAL_PLAN === '1',
  summarise: process.env.EVAL_SUMMARISE ?? null,
  concurrency: Number(process.env.EVAL_CONCURRENCY ?? '2'),
}
if (env.templates !== null && env.reuse === null) {
  throw new Error('EVAL_TEMPLATES reuses the briefs and pictures of EVAL_REUSE_RUN; set it')
}
if (env.templates !== null && env.stages.join() !== 'copy') {
  throw new Error('EVAL_TEMPLATES writes copy only; leave EVAL_STAGES unset or set it to copy')
}

function loadFixtures(): Fixture[] {
  const parsed = fixturesFileSchema.parse(JSON.parse(readFileSync(FIXTURES_FILE, 'utf8')))
  const ids = new Set(parsed.fixtures.map((f) => f.id))
  if (ids.size !== parsed.fixtures.length) throw new Error('Fixture ids must be unique')
  return env.fixtures === null
    ? parsed.fixtures
    : parsed.fixtures.filter((f) => env.fixtures?.includes(f.id) === true)
}

// The template choice a real submission with this identity would get: the same selector, the
// same seed (the payload hash), a wordmark logo (so polarity is mixed), nothing seen yet.
function templatesFor(fixture: Fixture): { templates: string[]; seed: string } {
  const identityHash = createHash('sha256').update(fixture.identity).digest('hex')
  const seed = payloadHashFrom(identityHash, fixture.answers)
  const templates = selectTemplates({
    candidates: READY_TEMPLATES,
    seen: new Set(),
    polarity: 'mixed',
    count: Math.min(CONFIG.templates.conceptsShown, READY_TEMPLATES.length),
    seed,
  })
  return { templates, seed }
}

function coverage(fixtures: readonly Fixture[]): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(READY_TEMPLATES.map((t) => [t.id, 0]))
  for (const fixture of fixtures) {
    for (const id of templatesFor(fixture).templates) counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}

// Every model call's usage, as noteModelCall receives it, kept in memory until the fixture is
// written (notes.ts). The response carries the answer, so each attempt's answer is kept too,
// and the text of one that did not parse. Each call is priced as it lands, for the spend stop.
const stop = spendStop(env.maxUsd)
const book = notebook((note) => {
  stop.add(costOf(usageOf(note)))
})
vi.mocked(noteModelCall).mockImplementation(book.note)

function errorText(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error)
}

// The violations of one answer, by the same judges the pipeline uses, with each marked as a
// count, a length or a rule violation so the summary can say which kind the retries chase.
function judge(
  copy: unknown,
  templateId: string,
  ownersWords: string,
): FixtureRecord['copy'][string]['attempts'][number]['violations'] {
  const contract = contractFor(templateId)
  const shape = contract.copySchema.safeParse(copy)
  if (!shape.success) {
    return shape.error.issues.slice(0, 20).map((issue) => ({
      path: issue.path.map((part) => String(part)).join('.'),
      reason: `the wrong shape: ${issue.message}`,
      kind: 'shape' as const,
    }))
  }
  const slots = contract.copyViolations(copy).map((v) => ({
    ...fromSlotViolation(v),
    kind: Array.isArray(valueAt(copy, v.slot)) ? ('count' as const) : ('length' as const),
  }))
  const rules = ruleViolationsIn(copy, ownersWords).map((v) => ({ ...v, kind: 'rule' as const }))
  return [...slots, ...rules]
}

// The value at a path written the way the violations write them: a.b[2].c. Undefined when the
// path names a content-object field the model's JSON does not have.
function valueAt(value: unknown, path: string): unknown {
  let current = value
  for (const part of path.split('.')) {
    const m = /^([^[]+)((?:\[\d+\])*)$/.exec(part)
    if (m === null) return undefined
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[m[1] ?? '']
    for (const index of m[2]?.match(/\d+/g) ?? []) {
      if (!Array.isArray(current)) return undefined
      current = current[Number(index)]
    }
  }
  return current
}

async function briefStage(fixture: Fixture, slug: string): Promise<FixtureRecord['brief']> {
  const begun = Date.now()
  const errors: string[] = []
  book.begin(slug, 'brief')
  for (let attempt = 0; attempt < CONFIG.brief.attempts; attempt += 1) {
    try {
      const brief = await writeBrief(fixture.answers, slug)
      return {
        source: 'model',
        attempts: attempt + 1,
        errors,
        brief,
        calls: book.take(slug, 'brief').map(usageOf),
        ruleViolations: ruleViolationsIn(
          brief,
          `${fixture.answers.company}
${fixture.answers.description}`,
        ),
        ms: Date.now() - begun,
      }
    } catch (error) {
      errors.push(errorText(error))
      if (isPermanentModelError(error)) break
    }
  }
  return {
    source: 'fallback',
    attempts: errors.length,
    errors,
    brief: fallbackBrief(fixture.answers.company, fixture.answers.description),
    calls: book.take(slug, 'brief').map(usageOf),
    ruleViolations: [],
    ms: Date.now() - begun,
  }
}

// One template's copy, as copyStage runs it: writeCopy judges and retries once inside; an
// answer that still breaks a limit is asked for again from scratch, up to CONFIG.copy.attempts,
// then the template's fallback stands. An API error that will not change goes to the fallback.
async function copyFor(
  slug: string,
  templateId: string,
  brief: BrandBrief,
  ownersWords: string,
): Promise<FixtureRecord['copy'][string]> {
  const begun = Date.now()
  const contract = contractFor(templateId)
  const errors: string[] = []
  let final: unknown = null
  let fallback = false
  let fallbackReason: FixtureRecord['copy'][string]['fallbackReason'] = null
  for (let step = 0; step < CONFIG.copy.attempts; step += 1) {
    book.step(slug, templateId, step)
    book.begin(slug, 'copy', templateId)
    try {
      const written = await writeCopy({ brief, contract, ownersWords, slug })
      if (written.ok) {
        final = written.value
        break
      }
      if (step + 1 < CONFIG.copy.attempts) continue
      fallback = true
      fallbackReason = 'violations'
    } catch (error) {
      errors.push(errorText(error))
      if (isPermanentModelError(error)) {
        fallback = true
        fallbackReason = 'permanent'
        break
      }
      if (step + 1 < CONFIG.copy.attempts) continue
      fallback = true
      fallbackReason = 'errors'
    }
  }
  if (fallback) final = contract.fallbackCopy(brief)
  // An answer that did not parse is a "not JSON" violation with its text kept (notes.ts). The
  // company name is the owner's too (lib/ai/copy.ts).
  const attempts = book.take(slug, 'copy', templateId).map((note) =>
    copyAttemptOf(note, (parsed) =>
      judge(
        parsed,
        templateId,
        `${brief.company}
${ownersWords}`,
      ),
    ),
  )
  return { final, fallback, fallbackReason, errors, attempts, ms: Date.now() - begun }
}

// The imagery stage up to the verdict: one search per distinct query, one ranking per distinct
// queries and purpose, shared by the templates as lib/images/stage.ts shares them; then the
// pictures each template would take, by the same choice rule, so empty and repeated slots can
// be counted without downloading anything.
async function rankStage(
  slug: string,
  fixture: Fixture,
  templates: readonly string[],
  brief: BrandBrief,
): Promise<FixtureRecord['imagery']> {
  const begun = Date.now()
  const searches = new Map<string, Promise<Candidate[]>>()
  const pools = new Map<string, Promise<PoolRecord>>()
  const once = <T>(cache: Map<string, Promise<T>>, key: string, work: () => Promise<T>) => {
    const pending = cache.get(key)
    if (pending !== undefined) return pending
    const begunWork = work()
    cache.set(key, begunWork)
    return begunWork
  }
  const plans = templates.map((id) => ({
    id,
    plan: planImagery(contractFor(id).imageSlots, fixture.answers, brief),
  }))
  for (const { plan } of plans) {
    for (const step of Object.values(plan)) {
      if (step.kind !== 'search') continue
      const key = `${step.queries.join('\n')}\n${step.purpose}`
      void once(pools, key, async (): Promise<PoolRecord> => {
        const record: PoolRecord = {
          key,
          queries: step.queries,
          purpose: step.purpose,
          query: null,
          candidates: [],
          verdicts: null,
          ordered: [],
          errors: [],
          calls: [],
          ms: 0,
        }
        const poolBegun = Date.now()
        let candidates: Candidate[] = []
        for (const query of step.queries) {
          let found: Candidate[]
          try {
            found = await once(searches, query, () => searchPhotos(query))
          } catch (error) {
            record.errors.push(`search "${query}": ${errorText(error)}`)
            continue
          }
          // As lib/images/stage.ts: a detail pool is every query's pictures together.
          if (step.union) {
            const seen = new Set(candidates.map((c) => c.id))
            candidates = [...candidates, ...found.filter((c) => !seen.has(c.id))]
            if (found.length > 0) {
              record.query = record.query === null ? query : `${record.query} + ${query}`
            }
            continue
          }
          candidates = found
          if (candidates.length > 0) {
            record.query = query
            break
          }
        }
        record.candidates = candidates.map((c) => ({
          id: c.id,
          alt: c.alt,
          photographer: c.photographer,
          thumbnail: c.thumbnail,
        }))
        if (candidates.length > 0) {
          book.begin(slug, 'rank')
          try {
            record.verdicts = await rankPhotos(candidates, step.purpose, slug)
          } catch (error) {
            record.errors.push(`rank: ${errorText(error)}`)
          }
          record.calls = book.take(slug, 'rank').map(usageOf)
        }
        record.ordered = orderByVerdict(candidates, record.verdicts).map((c) => c.id)
        record.ms = Date.now() - poolBegun
        return record
      })
    }
  }
  const settled = await Promise.all([...pools.values()])
  const byKey = new Map(settled.map((pool) => [pool.key, pool]))

  // The choice rule of lib/images/stage.ts: the best candidate no design has taken, else the
  // best this design has not shown, else nothing. Templates in order, slots in order.
  const taken = new Map<number, Set<string>>()
  const assignment: Record<string, Record<string, number | null>> = {}
  let empty = 0
  let repeated = 0
  for (const { id, plan } of plans) {
    assignment[id] = {}
    for (const [slot, step] of Object.entries(plan)) {
      if (step.kind !== 'search') {
        assignment[id][slot] = null
        continue
      }
      const pool = byKey.get(`${step.queries.join('\n')}\n${step.purpose}`)
      const ordered = pool?.ordered ?? []
      const fresh = ordered.find((c) => !taken.has(c))
      const shared = ordered.find((c) => taken.get(c)?.has(id) !== true)
      const chosen = fresh ?? shared ?? null
      if (chosen === null) empty += 1
      else {
        if (fresh === undefined) repeated += 1
        const takers = taken.get(chosen) ?? new Set<string>()
        takers.add(id)
        taken.set(chosen, takers)
      }
      assignment[id][slot] = chosen
    }
  }
  return { pools: settled, assignment, empty, repeated, ms: Date.now() - begun }
}

function readRecord(run: string, id: string): FixtureRecord | null {
  const file = join(RESULTS, run, `${id}.json`)
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as FixtureRecord) : null
}

// Every fixture record of a run, read once.
const runRecords = new Map<string, FixtureRecord[]>()
function recordsOf(run: string): FixtureRecord[] {
  const known = runRecords.get(run)
  if (known !== undefined) return known
  const dir = join(RESULTS, run)
  const records = existsSync(dir)
    ? readdirSync(dir)
        .filter(
          (name) => name.endsWith('.json') && name !== 'summary.json' && !name.startsWith('_'),
        )
        .map((name) => JSON.parse(readFileSync(join(dir, name), 'utf8')) as FixtureRecord)
    : []
  runRecords.set(run, records)
  return records
}

// One fixture's stages. `write` is the templates whose copy the run writes: every template the
// fixture was chosen, or the named ones of EVAL_TEMPLATES (plan.ts).
async function runFixture(fixture: Fixture, write: readonly string[]): Promise<FixtureRecord> {
  const slug = `eval-${fixture.id}`
  const own = templatesFor(fixture)
  const reused = env.reuse === null ? null : reusedFor(fixture, recordsOf(env.reuse))
  const wants = (stage: Stage) => env.stages.includes(stage)
  if (!wants('brief') && reused === null) {
    throw new Error(`EVAL_STAGES leaves out brief but EVAL_REUSE_RUN has no ${fixture.id}.json`)
  }
  // A photograph variant that reuses another variant's copy keeps that variant's templates, so
  // the copy it carries is the copy they were written for (decision 11).
  const templates =
    reused !== null && reused.id !== fixture.id && !wants('copy') ? reused.templates : own.templates
  const { seed } = own
  const brief = wants('brief') || reused === null ? await briefStage(fixture, slug) : reused.brief
  const copy: FixtureRecord['copy'] = {}
  if (wants('copy')) {
    const written = await Promise.all(
      write.map((id) => copyFor(slug, id, brief.brief, fixture.answers.description)),
    )
    write.forEach((id, index) => {
      const result = written[index]
      if (result !== undefined) copy[id] = result
    })
  } else if (reused !== null) {
    Object.assign(copy, reused.copy)
  }
  const imagery =
    wants('rank') || reused === null
      ? await rankStage(slug, fixture, templates, brief.brief)
      : reused.imagery
  return {
    id: fixture.id,
    notes: fixture.notes,
    answers: fixture.answers,
    seed,
    templates,
    stagesRun: env.stages,
    reusedFrom: env.reuse,
    brief,
    copy,
    imagery,
    at: new Date().toISOString(),
  }
}

// The fixtures to run and the templates each writes copy for, by EVAL_FIXTURES and
// EVAL_TEMPLATES.
function targetsOf(fixtures: readonly Fixture[]): (Choice & { fixture: Fixture })[] {
  const byId = new Map(fixtures.map((f) => [f.id, f]))
  return copyTargets(
    fixtures.map((f) => ({ id: f.id, templates: templatesFor(f).templates })),
    env.templates,
  ).flatMap((target) => {
    const fixture = byId.get(target.id)
    return fixture === undefined ? [] : [{ ...target, fixture }]
  })
}

// What the reused run paid for the same answers: a fair guess at what writing them again costs.
function estimateOf(targets: readonly Choice[]): { usd: number; unknown: string[] } | null {
  if (env.reuse === null) return null
  let usd = 0
  const unknown: string[] = []
  for (const target of targets) {
    const reused = readRecord(env.reuse, target.id)
    for (const id of target.templates) {
      const attempts = reused?.copy[id]?.attempts
      if (attempts === undefined) unknown.push(`${target.id}/${id}`)
      else usd += attempts.reduce((sum, a) => sum + costOf(a.usage), 0)
    }
  }
  return { usd, unknown }
}

// A run's records: every fixture file. summary.json and the run's own _run.json are not ones.
function writeSummary(run: string): void {
  const dir = join(RESULTS, run)
  const records = readdirSync(dir)
    .filter((name) => name.endsWith('.json') && name !== 'summary.json' && !name.startsWith('_'))
    .map((name) => JSON.parse(readFileSync(join(dir, name), 'utf8')) as FixtureRecord)
  const factsFile = join(dir, '_run.json')
  const facts = existsSync(factsFile)
    ? (JSON.parse(readFileSync(factsFile, 'utf8')) as RunFacts)
    : null
  const summary = summarise(run, records, facts)
  writeFileSync(join(dir, 'summary.json'), JSON.stringify(summary.json, null, 2))
  writeFileSync(join(dir, 'summary.md'), summary.markdown)
  console.log(summary.markdown)
}

test('the fixtures are valid and every ready template is chosen by at least five', () => {
  const fixtures = loadFixtures()
  for (const fixture of fixtures) {
    const length = fixture.answers.description.length
    expect(length, `${fixture.id} description`).toBeGreaterThanOrEqual(CONFIG.form.minChars)
    expect(length, `${fixture.id} description`).toBeLessThanOrEqual(CONFIG.form.maxChars)
    expect(fixture.answers.company.length, `${fixture.id} company`).toBeLessThanOrEqual(80)
    briefSchema.parse(fallbackBrief(fixture.answers.company, fixture.answers.description))
  }
  const mix = coverage(fixtures)
  const styles = fixtures.map((f) => f.answers.imagery.style)
  const targets = targetsOf(fixtures)
  console.log(
    JSON.stringify(
      {
        fixtures: fixtures.length,
        lengths: fixtures.map((f) => `${f.id}:${String(f.answers.description.length)}`),
        styles: Object.fromEntries(
          ['warm', 'minimal', 'bold', 'dark'].map((s) => [s, styles.filter((x) => x === s).length]),
        ),
        templates: Object.fromEntries(fixtures.map((f) => [f.id, templatesFor(f).templates])),
        coverage: mix,
        // What a run with these switches would do: the copy it would write, by fixture, and
        // what the reused run paid for the same answers; and the spend stop.
        run: {
          stages: env.stages,
          reuse: env.reuse,
          copy: Object.fromEntries(targets.map((t) => [t.id, t.templates])),
          answers: targets.reduce((n, t) => n + t.templates.length, 0),
          notRun: fixtures.filter((f) => !targets.some((t) => t.id === f.id)).map((f) => f.id),
          estimate: env.templates === null ? null : estimateOf(targets),
          // A fixture with no record of its own in the reused run, and the variant it reuses.
          reuses:
            env.reuse === null
              ? {}
              : Object.fromEntries(
                  targets.flatMap((t) => {
                    const found = reusedFor(t.fixture, recordsOf(env.reuse ?? ''))
                    return found === null || found.id === t.id ? [] : [[t.id, found.id]]
                  }),
                ),
          maxUsd: env.maxUsd,
          concurrency: env.concurrency,
        },
      },
      null,
      1,
    ),
  )
  // Named templates write copy on the reused run's briefs and pictures, so each fixture they
  // write must be in it.
  if (env.templates !== null && env.reuse !== null) {
    const reuse = env.reuse
    for (const target of targets) {
      expect(readRecord(reuse, target.id), `${reuse} has no ${target.id}.json`).not.toBeNull()
    }
  }
  if (env.fixtures === null) {
    for (const [id, count] of Object.entries(mix)) {
      expect(count, `${id} appears in fewer than five fixtures`).toBeGreaterThanOrEqual(5)
    }
  }
})

test.skipIf(env.plan || env.summarise !== null)(
  'run the model stages over the fixtures',
  async () => {
    const targets = targetsOf(loadFixtures())
    const dir = join(RESULTS, env.run)
    mkdirSync(dir, { recursive: true })
    console.log(
      `run ${env.run}: ${String(targets.length)} fixtures, stages ${env.stages.join('+')}` +
        (env.reuse === null ? '' : `, the rest from ${env.reuse}`) +
        (env.templates === null ? '' : `, copy for ${env.templates.join(', ')} only`) +
        (env.maxUsd === null ? '' : `, stopping at $${env.maxUsd.toFixed(2)}`),
    )
    const { notStarted } = await runLimited(
      targets,
      env.concurrency,
      stop.mayStart,
      async ({ fixture, templates: write }) => {
        const record = await runFixture(fixture, write)
        writeFileSync(join(dir, `${fixture.id}.json`), JSON.stringify(record, null, 2))
        const copies = Object.values(record.copy)
        console.log(
          `${fixture.id}: brief ${record.brief.source}; copy fallbacks ${String(copies.filter((c) => c.fallback).length)}/${String(copies.length)}; empty slots ${String(record.imagery.empty)}; spent so far $${stop.spent().toFixed(4)}`,
        )
      },
    )
    const facts: RunFacts = {
      templates: env.templates,
      maxUsd: env.maxUsd,
      spent: stop.spent(),
      concurrency: env.concurrency,
      notStarted: notStarted.map((target) => target.id),
    }
    writeFileSync(join(dir, '_run.json'), JSON.stringify(facts, null, 2))
    writeSummary(env.run)
  },
)

test.skipIf(env.summarise === null)('recompute a run summary', () => {
  if (env.summarise !== null) writeSummary(env.summarise)
})
