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
//                             it needs, so a pass on one template's guide pays for its copy alone.
//                             A run that skips the brief stage (this one, or EVAL_STAGES without
//                             brief) leaves out, before any call, every fixture with no record in
//                             EVAL_REUSE_RUN to build on, and says which: paid passes 1 to 3 run
//                             on l6-all-fixes, so they write copy for the twenty fixtures l6
//                             holds, never decision 11's four, which wait for pass 4
//   EVAL_PAIRS=hr:t01-aurora+t08-vector,florist:t03-meridian
//                             write copy for exactly these fixtures, in this order, and these
//                             templates each, chosen or not, so a pass can fill a cell the
//                             selector never chose. It names the fixtures, so it takes no
//                             EVAL_FIXTURES or EVAL_TEMPLATES; it works with any EVAL_STAGES (all
//                             three when unset). A stage that is not run is reused as above; with
//                             no copy stage, the named copy is carried from EVAL_REUSE_RUN, and a
//                             pair it does not hold stops the run before any call. The record
//                             keeps the pick in `templates`; a template outside it is in `extra`,
//                             set with the pick's first two and its pictures chosen after theirs
//                             on the record's pools, with no call (plan.ts, trioOf, picksAfter)
//   EVAL_MAX_USD=1.78         the spend stop: no new fixture starts once the calls this run has
//                             made reach this priced cost. Fixtures already started run to their
//                             end, so a run can pass the cap by up to EVAL_CONCURRENCY fixtures
//   EVAL_PLAN=1               validate the fixtures and print the template mix, and what
//                             EVAL_TEMPLATES, EVAL_PAIRS and EVAL_MAX_USD would do; no calls
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
  assignPictures,
  type Choice,
  copyRunOf,
  copyTargets,
  maxUsdOf,
  namedPairs,
  namedTemplates,
  picksAfter,
  poolKeyOf,
  reusedFor,
  runLimited,
  spendStop,
  splitByRecord,
  trioOf,
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
// EVAL_PAIRS names its own fixtures and templates. An id that names neither, or either other
// switch beside it, stops the run here, before any call.
const pairs = namedPairs(
  process.env.EVAL_PAIRS,
  (JSON.parse(readFileSync(FIXTURES_FILE, 'utf8')) as { fixtures: { id: string }[] }).fixtures.map(
    (f) => f.id,
  ),
  TEMPLATES.map((t) => t.id),
)
if (pairs !== null && (templates !== null || (process.env.EVAL_FIXTURES ?? '').trim() !== '')) {
  throw new Error(
    'EVAL_PAIRS names the fixtures and templates itself; leave EVAL_FIXTURES and EVAL_TEMPLATES unset',
  )
}
// Named templates write copy and nothing else: their briefs and pictures are reused.
const stagesAsked: readonly string[] =
  process.env.EVAL_STAGES?.split(',') ?? (templates === null ? STAGES : ['copy'])
const env = {
  run: process.env.EVAL_RUN ?? new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19),
  fixtures:
    pairs?.map((pair) => pair.id) ??
    process.env.EVAL_FIXTURES?.split(',').filter((id) => id !== '') ??
    null,
  stages: stagesAsked.filter((s): s is Stage => STAGES.includes(s as Stage)),
  reuse: process.env.EVAL_REUSE_RUN ?? null,
  templates,
  pairs,
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
if (!env.stages.includes('brief') && env.reuse === null && env.summarise === null) {
  throw new Error('EVAL_STAGES leaves out brief, so it builds on EVAL_REUSE_RUN; set it')
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

// How many fixtures' pages each template gets. As the runs are designed (shared), a variant of
// an earlier fixture's business carries that fixture's templates, since it reuses its copy run
// (decision 11's own photographs: one copy run, the others re-run only the rank stage); with
// each fixture's own pick instead (own), as a run that wrote copy for every variant would.
function coverage(fixtures: readonly Fixture[], how: 'shared' | 'own'): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(READY_TEMPLATES.map((t) => [t.id, 0]))
  const runOf = copyRunOf(fixtures)
  const byId = new Map(fixtures.map((f) => [f.id, f]))
  for (const fixture of fixtures) {
    const carried = how === 'own' ? fixture : (byId.get(runOf.get(fixture.id) ?? '') ?? fixture)
    for (const id of templatesFor(carried).templates) counts[id] = (counts[id] ?? 0) + 1
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
      const key = poolKeyOf(step)
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

  // The choice rule of lib/images/stage.ts, templates in order and slots in order (plan.ts).
  const { assignment, empty, repeated } = assignPictures(
    plans,
    (key) => byKey.get(key)?.ordered ?? [],
  )
  return { pools: settled, assignment, empty, repeated, ms: Date.now() - begun }
}

// Each template the record holds copy for outside its pick (EVAL_PAIRS), set as a visitor in
// that row could get it: with the pick's first two, and the pictures it takes after theirs
// from the record's own pools, with no call (plan.ts, trioOf and picksAfter). Every fixture has
// one hero pool and one detail pool that all templates share (lib/images/plan.ts), so the pools
// the pick searched serve it; a slot whose pool the record lacks is left empty.
function extrasOf(
  fixture: Fixture,
  templates: readonly string[],
  copy: FixtureRecord['copy'],
  brief: BrandBrief,
  imagery: FixtureRecord['imagery'],
): NonNullable<FixtureRecord['extra']> {
  const byKey = new Map(imagery.pools.map((pool) => [pool.key, pool.ordered]))
  return Object.fromEntries(
    Object.keys(copy)
      .filter((id) => !templates.includes(id))
      .map((id) => {
        const chosen = trioOf(templates, id)
        const before = Object.fromEntries(
          chosen.slice(0, -1).map((t) => [t, imagery.assignment[t] ?? {}]),
        )
        const plan = planImagery(contractFor(id).imageSlots, fixture.answers, brief)
        return [
          id,
          { chosen, assignment: picksAfter(before, { id, plan }, (key) => byKey.get(key) ?? []) },
        ]
      }),
  )
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

// The templates a fixture's record keeps as its pick: the selector's, or, for a photograph
// variant that carries another variant's copy, that variant's, so the copy it carries is the
// copy they were written for (decision 11).
function pickOf(fixture: Fixture, reused: FixtureRecord | null): readonly string[] {
  return reused !== null && reused.id !== fixture.id && !env.stages.includes('copy')
    ? reused.templates
    : templatesFor(fixture).templates
}

// One fixture's stages. `write` is the templates whose copy the run writes: every template the
// fixture was chosen, the named ones of EVAL_TEMPLATES, or the fixture's EVAL_PAIRS (plan.ts).
async function runFixture(fixture: Fixture, write: readonly string[]): Promise<FixtureRecord> {
  const slug = `eval-${fixture.id}`
  const own = templatesFor(fixture)
  const reused = env.reuse === null ? null : reusedFor(fixture, recordsOf(env.reuse))
  const wants = (stage: Stage) => env.stages.includes(stage)
  if (!wants('brief') && reused === null) {
    throw new Error(`EVAL_STAGES leaves out brief but EVAL_REUSE_RUN has no ${fixture.id}.json`)
  }
  const templates = pickOf(fixture, reused)
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
  } else if (reused !== null && env.pairs === null) {
    Object.assign(copy, reused.copy)
  } else if (reused !== null) {
    // EVAL_PAIRS with no copy stage carries the named copy alone; targetsOf has checked that
    // the reused record holds every pair.
    for (const id of write) {
      const carried = reused.copy[id]
      if (carried !== undefined) copy[id] = carried
    }
  }
  const imagery =
    wants('rank') || reused === null
      ? await rankStage(slug, fixture, templates, brief.brief)
      : reused.imagery
  const extra = extrasOf(fixture, templates, copy, brief.brief, imagery)
  return {
    id: fixture.id,
    notes: fixture.notes,
    answers: fixture.answers,
    seed,
    templates,
    ...(Object.keys(extra).length === 0 ? {} : { extra }),
    stagesRun: env.stages,
    reusedFrom: env.reuse,
    brief,
    copy,
    imagery,
    at: new Date().toISOString(),
  }
}

type Target = Choice & { fixture: Fixture }

// The fixtures to run and the templates each writes copy for, by EVAL_FIXTURES and
// EVAL_TEMPLATES, or by EVAL_PAIRS in its own order. A run that skips the brief stage builds on
// EVAL_REUSE_RUN's records, so each fixture with none there to build on (its own or a
// variant's) is set aside here, before any call (plan.ts, splitByRecord), and both lists are
// said. EVAL_PAIRS with no copy stage carries the named copy from those records, so a pair they
// do not hold stops the run here, before any call.
function targetsOf(fixtures: readonly Fixture[]): { kept: Target[]; dropped: Target[] } {
  const byId = new Map(fixtures.map((f) => [f.id, f]))
  const all = (
    env.pairs ??
    copyTargets(
      fixtures.map((f) => ({ id: f.id, templates: templatesFor(f).templates })),
      env.templates,
    )
  ).flatMap((target) => {
    const fixture = byId.get(target.id)
    return fixture === undefined ? [] : [{ ...target, fixture }]
  })
  const split =
    env.stages.includes('brief') || env.reuse === null
      ? { kept: all, dropped: [] }
      : splitByRecord(all, recordsOf(env.reuse))
  if (env.pairs !== null && !env.stages.includes('copy')) {
    const records = env.reuse === null ? [] : recordsOf(env.reuse)
    const missing = split.kept.flatMap((target) => {
      const held = reusedFor(target.fixture, records)?.copy ?? {}
      return target.templates
        .filter((id) => !Object.hasOwn(held, id))
        .map((id) => `${target.id}:${id}`)
    })
    if (missing.length > 0) {
      throw new Error(
        `EVAL_PAIRS names copy this run does not write (EVAL_STAGES leaves out copy) and EVAL_REUSE_RUN does not hold: ${missing.join(', ')}`,
      )
    }
  }
  return split
}

// What the reused run paid for the same answers: a fair guess at what writing them again costs.
function estimateOf(targets: readonly Target[]): { usd: number; unknown: string[] } | null {
  if (env.reuse === null) return null
  let usd = 0
  const unknown: string[] = []
  for (const target of targets) {
    const reused = reusedFor(target.fixture, recordsOf(env.reuse))
    for (const id of target.templates) {
      const attempts = reused?.copy[id]?.attempts
      if (attempts === undefined) unknown.push(`${target.id}/${id}`)
      else usd += attempts.reduce((sum, a) => sum + costOf(a.usage), 0)
    }
  }
  return { usd, unknown }
}

// The same for EVAL_PAIRS, where most pairs were never written: each pair at what the reused run
// paid for it, else at its template's mean cost per answer there (every call of every answer,
// fallbacks included, as the summary's cost per template counts it). A template the reused run
// never wrote is unknown. Says how each pair was priced.
function pairsEstimateOf(targets: readonly Target[]): {
  usd: number
  unknown: string[]
  priced: Record<string, { usd: number; from: 'paid' | 'mean' }>
} | null {
  if (env.reuse === null) return null
  const records = recordsOf(env.reuse)
  const costOfAnswer = (written: FixtureRecord['copy'][string]) =>
    written.attempts.reduce((sum, a) => sum + costOf(a.usage), 0)
  const meanOf = (id: string) => {
    const answers = records.flatMap((r) => {
      const written = r.copy[id]
      return written === undefined ? [] : [costOfAnswer(written)]
    })
    return answers.length === 0 ? null : answers.reduce((a, b) => a + b, 0) / answers.length
  }
  let usd = 0
  const unknown: string[] = []
  const priced: Record<string, { usd: number; from: 'paid' | 'mean' }> = {}
  for (const target of targets) {
    const reused = reusedFor(target.fixture, records)
    for (const id of target.templates) {
      const pair = `${target.id}/${id}`
      const written = reused?.copy[id]
      const mean = meanOf(id)
      if (written !== undefined) priced[pair] = { usd: costOfAnswer(written), from: 'paid' }
      else if (mean !== null) priced[pair] = { usd: mean, from: 'mean' }
      else {
        unknown.push(pair)
        continue
      }
      usd += priced[pair].usd
    }
  }
  return { usd, unknown, priced }
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
  const mix = coverage(fixtures, 'shared')
  const styles = fixtures.map((f) => f.answers.imagery.style)
  const { kept: targets, dropped } = targetsOf(fixtures)
  const runOf = copyRunOf(fixtures)
  console.log(
    JSON.stringify(
      {
        fixtures: fixtures.length,
        lengths: fixtures.map((f) => `${f.id}:${String(f.answers.description.length)}`),
        styles: Object.fromEntries(
          ['warm', 'minimal', 'bold', 'dark'].map((s) => [s, styles.filter((x) => x === s).length]),
        ),
        templates: Object.fromEntries(fixtures.map((f) => [f.id, templatesFor(f).templates])),
        // Each template's fixtures as the runs are designed: a photograph variant carries the
        // templates of the fixture whose copy run it reuses (sharesCopyWith); and with every
        // fixture's own pick, as a run writing copy for each variant would have it.
        coverage: mix,
        coverageOwnPicks: coverage(fixtures, 'own'),
        sharesCopyWith: Object.fromEntries(
          fixtures.flatMap((f) => (runOf.get(f.id) === f.id ? [] : [[f.id, runOf.get(f.id)]])),
        ),
        // What a run with these switches would do: the copy it would write, by fixture, and
        // what the reused run paid for the same answers; and the spend stop.
        run: {
          stages: env.stages,
          reuse: env.reuse,
          copy: Object.fromEntries(targets.map((t) => [t.id, t.templates])),
          // With EVAL_PAIRS, the templates of each fixture's copy outside its pick.
          ...(env.pairs === null
            ? {}
            : {
                extra: Object.fromEntries(
                  targets.map((t) => {
                    const reused =
                      env.reuse === null ? null : reusedFor(t.fixture, recordsOf(env.reuse))
                    const picked = pickOf(t.fixture, reused)
                    return [t.id, t.templates.filter((id) => !picked.includes(id))]
                  }),
                ),
              }),
          answers: targets.reduce((n, t) => n + t.templates.length, 0),
          notRun: fixtures.filter((f) => !targets.some((t) => t.id === f.id)).map((f) => f.id),
          // Of those, the fixtures set aside for want of a record in the reused run.
          noRecord: dropped.map((t) => t.id),
          estimate:
            env.templates !== null
              ? estimateOf(targets)
              : env.pairs !== null && env.stages.includes('copy')
                ? pairsEstimateOf(targets)
                : null,
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
  // A run that skips the brief stage builds on the reused run, so each fixture it keeps must
  // have a record there; the rest were set aside above.
  if (!env.stages.includes('brief') && env.reuse !== null) {
    const records = recordsOf(env.reuse)
    for (const target of targets) {
      expect(reusedFor(target.fixture, records), `${env.reuse} lacks ${target.id}`).not.toBeNull()
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
    // Every fixture is checked against the reused run before the first call, so a fixture with
    // nothing to build on is set aside here and never stops a paid run part-way.
    const { kept: targets, dropped } = targetsOf(loadFixtures())
    const dir = join(RESULTS, env.run)
    mkdirSync(dir, { recursive: true })
    console.log(
      `run ${env.run}: ${String(targets.length)} fixtures, stages ${env.stages.join('+')}` +
        (env.reuse === null ? '' : `, the rest from ${env.reuse}`) +
        (env.templates === null ? '' : `, copy for ${env.templates.join(', ')} only`) +
        (env.pairs === null ? '' : ', copy for the EVAL_PAIRS pairs only, in their order') +
        (env.maxUsd === null ? '' : `, stopping at $${env.maxUsd.toFixed(2)}`) +
        (dropped.length === 0
          ? ''
          : `; not run, no record in ${env.reuse ?? ''}: ${dropped.map((t) => t.id).join(', ')}`),
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
      ...(env.pairs === null
        ? {}
        : { pairs: Object.fromEntries(env.pairs.map((pair) => [pair.id, pair.templates])) }),
      maxUsd: env.maxUsd,
      spent: stop.spent(),
      concurrency: env.concurrency,
      notStarted: notStarted.map((target) => target.id),
      noRecord: dropped.map((target) => target.id),
    }
    writeFileSync(join(dir, '_run.json'), JSON.stringify(facts, null, 2))
    writeSummary(env.run)
  },
)

test.skipIf(env.summarise === null)('recompute a run summary', () => {
  if (env.summarise !== null) writeSummary(env.summarise)
})
