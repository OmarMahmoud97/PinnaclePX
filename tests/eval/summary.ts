import { NOT_JSON } from './notes'
import type { CallRecord, CopyAttempt, FixtureRecord, JudgedViolation, RunFacts } from './types'

// A run's numbers: tokens and cost by stage and template, how often a first answer fitted, how
// often the retry or the fallback did the work, what the picture judge rejected and why, and
// the automated quality checks over every stored answer. Every figure here is measured from
// the run's own records; the prices are the one external input.

// US dollars per million tokens: the claude-api skill's price table, cached 25 September 2026.
const PRICE: Readonly<
  Record<string, Readonly<{ input: number; output: number; cacheRead: number; cacheWrite: number }>>
> = {
  'claude-sonnet-5': { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  'claude-haiku-4-5': { input: 1, output: 5, cacheRead: 0.1, cacheWrite: 1.25 },
}

function priceOf(model: string) {
  const key = Object.keys(PRICE).find((k) => model.startsWith(k))
  return key === undefined ? null : PRICE[key]
}

// A call's price in dollars, or NaN for a model the table does not hold.
export function costOf(call: CallRecord): number {
  const price = priceOf(call.model)
  if (price === null || price === undefined) return Number.NaN
  return (
    (call.input * price.input +
      call.output * price.output +
      call.cacheRead * price.cacheRead +
      call.cacheWrite * price.cacheWrite) /
    1_000_000
  )
}

type Tally = {
  calls: number
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  cost: number
  ms: number[]
}

const tally = (): Tally => ({
  calls: 0,
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
  cost: 0,
  ms: [],
})

function add(into: Tally, call: CallRecord): void {
  into.calls += 1
  into.input += call.input
  into.output += call.output
  into.cacheRead += call.cacheRead
  into.cacheWrite += call.cacheWrite
  into.cost += costOf(call)
  if (call.ms !== null) into.ms.push(call.ms)
}

const mean = (xs: readonly number[]) =>
  xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length
const max = (xs: readonly number[]) => (xs.length === 0 ? 0 : Math.max(...xs))
const pct = (n: number, d: number) =>
  d === 0 ? '0%' : `${(Math.round((n / d) * 1000) / 10).toFixed(1)}%`
const usd = (x: number) => `$${x.toFixed(4)}`

// Phrases a brochure writes and a tradesperson never says. A hit is a mark against the copy,
// not a violation; the list is the eval's, not the pipeline's.
const FILLER = [
  'elevate',
  'unlock',
  'seamless',
  'cutting-edge',
  'world-class',
  'passionate',
  'tailored solutions',
  'journey',
  'empower',
  'leverage',
  'best-in-class',
  'innovative',
  'next level',
  'transform your',
  'unparalleled',
  'state-of-the-art',
  'solutions',
  'synergy',
  'bespoke solutions',
  'dream',
  'vision to life',
]

// Spellings that are not British. Only words with one clear UK form are listed.
const AMERICAN = [
  'color',
  'colors',
  'center',
  'organize',
  'organization',
  'favorite',
  'neighbor',
  'neighborhood',
  'specialize',
  'specialized',
  'customize',
  'customized',
  'analyze',
  'catalog',
  'gray',
  'jewelry',
  'aluminum',
  'personalize',
  'personalized',
  'optimize',
  'realize',
  'recognize',
  'honor',
  'labor',
  'flavor',
  'flavors',
  'mom',
]

function stringsIn(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach((v) => stringsIn(v, out))
  else if (value !== null && typeof value === 'object')
    Object.values(value).forEach((v) => stringsIn(v, out))
  return out
}

// Every { lines | text | headline, emphasis } object: the emphasis must be a substring, or
// empty, else the template drops the accent without a word.
function emphasisMisses(value: unknown, out: string[] = [], path = ''): string[] {
  if (Array.isArray(value)) value.forEach((v, i) => emphasisMisses(v, out, `${path}[${String(i)}]`))
  else if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.emphasis === 'string' && record.emphasis !== '') {
      const text = Array.isArray(record.lines)
        ? record.lines.join(' ')
        : typeof record.text === 'string'
          ? record.text
          : typeof record.headline === 'string'
            ? record.headline
            : null
      if (text !== null && !text.toLowerCase().includes(record.emphasis.toLowerCase()))
        out.push(path)
    }
    for (const [k, v] of Object.entries(record))
      emphasisMisses(v, out, path === '' ? k : `${path}.${k}`)
  }
  return out
}

function wordHits(texts: readonly string[], words: readonly string[]): Record<string, number> {
  const hits: Record<string, number> = {}
  const joined = texts.join('\n').toLowerCase()
  for (const word of words) {
    const re = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g')
    const n = joined.match(re)?.length ?? 0
    if (n > 0) hits[word] = n
  }
  return hits
}

const REJECT_KINDS: readonly [string, RegExp][] = [
  ['watermark', /watermark/i],
  ['text or logo', /\b(text|logo|lettering|sign|writing|caption|brand)/i],
  ['busy', /busy|clutter|no clear subject|chaotic/i],
  ['face', /\bface|person|portrait|people|man\b|woman\b/i],
  [
    'off topic',
    /nothing to do|unrelated|not relevant|irrelevant|does not (show|relate)|off[- ]topic/i,
  ],
]

function rejectKind(reason: string): string {
  return REJECT_KINDS.find(([, re]) => re.test(reason))?.[0] ?? 'other'
}

const isNotJson = (v: JudgedViolation) => v.kind === NOT_JSON.kind && v.reason === NOT_JSON.reason

// An attempt's violations, with an answer that did not parse counted as "not JSON" once. Records
// written before 2 October 2026 kept no violation for such an answer (an empty list), which
// counted it as a fit; counting it here makes old and new runs agree.
function violationsOf(attempt: CopyAttempt): readonly JudgedViolation[] {
  if (attempt.parsed !== null || attempt.violations.some(isNotJson)) return attempt.violations
  return [...attempt.violations, NOT_JSON]
}

// The run's own line: which templates it wrote copy for, and its spend stop. The cost table
// prices every call in the records, reused stages included, so a copy-only run reads as a whole
// submission would; the spend here is what this run itself paid.
function runLine(facts: RunFacts | null): string {
  if (facts === null) return 'Spend stop: none recorded (the run has no _run.json).'
  const noRecord = facts.noRecord ?? []
  const pairs = Object.entries(facts.pairs ?? {})
    .map(([id, templates]) => `${id} (${templates.join(', ')})`)
    .join(', ')
  const written = `${
    facts.templates === null
      ? ''
      : `Copy written for EVAL_TEMPLATES only: ${facts.templates.join(', ')}. `
  }${
    facts.pairs === undefined
      ? ''
      : `Copy for EVAL_PAIRS only, in this order: ${pairs}. A template outside a fixture's pick is in its record's extra, set with the pick's first two. `
  }${
    noRecord.length === 0
      ? ''
      : `Not run, with no record in the reused run to build on: ${noRecord.join(', ')}. `
  }`
  if (facts.maxUsd === null) {
    return `${written}Spend stop: none (EVAL_MAX_USD unset). This run spent ${usd(facts.spent)}.`
  }
  const reached = !(facts.spent < facts.maxUsd)
  const skipped =
    facts.notStarted.length === 0
      ? 'every fixture started'
      : `${String(facts.notStarted.length)} fixtures not started (${facts.notStarted.join(', ')})`
  return `${written}Spend stop: EVAL_MAX_USD ${usd(facts.maxUsd)}, ${reached ? 'reached' : 'not reached'}; this run spent ${usd(facts.spent)}; ${skipped}. A fixture already started when the stop was reached ran to its end, so a run can pass its cap by the cost of up to ${String(facts.concurrency)} fixtures (EVAL_CONCURRENCY).`
}

export function summarise(
  run: string,
  records: readonly FixtureRecord[],
  facts: RunFacts | null = null,
): { json: unknown; markdown: string } {
  const byStage = { brief: tally(), copy: tally(), rank: tally() }
  const byTemplate = new Map<
    string,
    Tally & {
      firstPass: number
      templates: number
      inCallRetries: number
      retryPassed: number
      stepRetries: number
      fallbacks: number
    }
  >()
  const violationsByKind = { shape: 0, count: 0, length: 0, rule: 0 }
  const violationsBySlot = new Map<string, number>()
  const ruleReasons = new Map<string, number>()
  const perFixtureCost: number[] = []
  const briefSources = { model: 0, fallback: 0 }
  let briefRuleViolations = 0
  let firstPass = 0
  let templatesTotal = 0
  let fallbacks = 0
  const fallbackReasons = new Map<string, number>()
  let inCallRetries = 0
  let retryPassed = 0
  let stepRetries = 0
  let copyCalls = 0
  // Answers the pipeline's reader could not parse (lib/ai/json.ts, extractJson): where each one
  // fell, whether its text was kept, and what the call after it cost, since that call was spent
  // only because of it.
  const unreadable = {
    calls: 0,
    firstAnswers: 0,
    stepStarts: 0,
    inCallRetries: 0,
    withText: 0,
    costAfter: 0,
  }
  const unreadableByTemplate = new Map<string, number>()
  const filler: Record<string, number> = {}
  const american: Record<string, number> = {}
  let emphasisBroken = 0
  let emphasisSlots = 0
  const rejectKinds = new Map<string, number>()
  let candidatesJudged = 0
  let rejected = 0
  let unmatchedVerdicts = 0
  let pools = 0
  let poolsWithoutVerdict = 0
  let emptySlots = 0
  let repeatedSlots = 0
  let searchErrors = 0
  const scores: number[] = []

  for (const record of records) {
    let fixtureCost = 0
    briefSources[record.brief.source] += 1
    briefRuleViolations += record.brief.ruleViolations.length
    for (const call of record.brief.calls) {
      add(byStage.brief, call)
      fixtureCost += costOf(call)
    }
    for (const [templateId, copy] of Object.entries(record.copy)) {
      templatesTotal += 1
      const t = byTemplate.get(templateId) ?? {
        ...tally(),
        firstPass: 0,
        templates: 0,
        inCallRetries: 0,
        retryPassed: 0,
        stepRetries: 0,
        fallbacks: 0,
      }
      t.templates += 1
      if (copy.fallback) {
        fallbacks += 1
        t.fallbacks += 1
        fallbackReasons.set(
          copy.fallbackReason ?? 'unknown',
          (fallbackReasons.get(copy.fallbackReason ?? 'unknown') ?? 0) + 1,
        )
      }
      const first = copy.attempts.find((a) => a.step === 0 && a.call === 0)
      if (first !== undefined && violationsOf(first).length === 0) {
        firstPass += 1
        t.firstPass += 1
      }
      copy.attempts.forEach((attempt, index) => {
        const violations = violationsOf(attempt)
        copyCalls += 1
        add(byStage.copy, attempt.usage)
        add(t, attempt.usage)
        fixtureCost += costOf(attempt.usage)
        if (attempt.call > 0) {
          inCallRetries += 1
          t.inCallRetries += 1
          if (violations.length === 0) {
            retryPassed += 1
            t.retryPassed += 1
          }
        }
        if (attempt.step > 0 && attempt.call === 0) {
          stepRetries += 1
          t.stepRetries += 1
        }
        if (attempt.parsed === null) {
          unreadable.calls += 1
          if (attempt.call > 0) unreadable.inCallRetries += 1
          else if (attempt.step > 0) unreadable.stepStarts += 1
          else unreadable.firstAnswers += 1
          if (attempt.raw !== undefined) unreadable.withText += 1
          unreadableByTemplate.set(templateId, (unreadableByTemplate.get(templateId) ?? 0) + 1)
          // Attempts are kept in the order they were made, so the next one is the call this
          // answer caused: the retry inside writeCopy, or the next fresh start.
          const next = copy.attempts[index + 1]
          if (next !== undefined) unreadable.costAfter += costOf(next.usage)
        }
        for (const v of violations) {
          violationsByKind[v.kind] += 1
          const slot = isNotJson(v) ? '(not JSON)' : v.path.replace(/\[\d+\]/g, '[]')
          violationsBySlot.set(
            `${templateId} ${slot}`,
            (violationsBySlot.get(`${templateId} ${slot}`) ?? 0) + 1,
          )
          if (v.kind === 'rule') {
            const reason = v.reason.replace(/: ".*"$/, '')
            ruleReasons.set(reason, (ruleReasons.get(reason) ?? 0) + 1)
          }
        }
      })
      byTemplate.set(templateId, t)
      const texts = stringsIn(copy.final)
      for (const [w, n] of Object.entries(wordHits(texts, FILLER))) filler[w] = (filler[w] ?? 0) + n
      for (const [w, n] of Object.entries(wordHits(texts, AMERICAN)))
        american[w] = (american[w] ?? 0) + n
      const misses = emphasisMisses(copy.final)
      emphasisBroken += misses.length
      emphasisSlots += stringsIn(copy.final).length === 0 ? 0 : countEmphasis(copy.final)
    }
    for (const pool of record.imagery.pools) {
      pools += 1
      searchErrors += pool.errors.filter((e) => e.startsWith('search')).length
      for (const call of pool.calls) {
        add(byStage.rank, call)
        fixtureCost += costOf(call)
      }
      if (pool.verdicts === null) {
        if (pool.candidates.length > 0) poolsWithoutVerdict += 1
        continue
      }
      const ids = new Set(pool.candidates.map((c) => c.id))
      for (const v of pool.verdicts) {
        if (!ids.has(v.id)) {
          unmatchedVerdicts += 1
          continue
        }
        candidatesJudged += 1
        scores.push(v.score)
        if (v.reject !== null) {
          rejected += 1
          const kind = rejectKind(v.reject)
          rejectKinds.set(kind, (rejectKinds.get(kind) ?? 0) + 1)
        }
      }
    }
    emptySlots += record.imagery.empty
    repeatedSlots += record.imagery.repeated
    perFixtureCost.push(fixtureCost)
  }

  const totalCost = byStage.brief.cost + byStage.copy.cost + byStage.rank.cost
  const n = records.length
  const stagesRun = [...new Set(records.flatMap((r) => r.stagesRun))]
  const json = {
    run,
    fixtures: n,
    stagesRun,
    reusedFrom: records[0]?.reusedFrom ?? null,
    runFacts: facts,
    cost: {
      pass: totalCost,
      perSubmissionMean: n === 0 ? 0 : totalCost / n,
      perSubmissionMin: Math.min(...perFixtureCost),
      perSubmissionMax: Math.max(...perFixtureCost),
      byStage: Object.fromEntries(
        Object.entries(byStage).map(([k, t]) => [
          k,
          {
            calls: t.calls,
            input: t.input,
            output: t.output,
            cacheRead: t.cacheRead,
            cacheWrite: t.cacheWrite,
            cost: t.cost,
            perSubmission: n === 0 ? 0 : t.cost / n,
            meanInput: t.calls === 0 ? 0 : Math.round(t.input / t.calls),
            meanOutput: t.calls === 0 ? 0 : Math.round(t.output / t.calls),
            meanMs: Math.round(mean(t.ms)),
            maxMs: max(t.ms),
          },
        ]),
      ),
    },
    brief: { sources: briefSources, ruleViolations: briefRuleViolations },
    copy: {
      templates: templatesTotal,
      calls: copyCalls,
      firstAnswerPassed: firstPass,
      firstAnswerPassRate: templatesTotal === 0 ? 0 : firstPass / templatesTotal,
      inCallRetries,
      inCallRetryPassed: retryPassed,
      stepRetries,
      fallbacks,
      fallbackReasons: Object.fromEntries(fallbackReasons),
      unreadable: {
        ...unreadable,
        costAfterShare: byStage.copy.cost === 0 ? 0 : unreadable.costAfter / byStage.copy.cost,
        byTemplate: Object.fromEntries(unreadableByTemplate),
      },
      violationsByKind,
      violationsBySlot: Object.fromEntries(
        [...violationsBySlot.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25),
      ),
      ruleReasons: Object.fromEntries(ruleReasons),
      byTemplate: Object.fromEntries(
        [...byTemplate.entries()].map(([id, t]) => [
          id,
          {
            templates: t.templates,
            calls: t.calls,
            firstAnswerPassRate: t.templates === 0 ? 0 : t.firstPass / t.templates,
            inCallRetries: t.inCallRetries,
            inCallRetryPassed: t.retryPassed,
            stepRetries: t.stepRetries,
            fallbacks: t.fallbacks,
            meanInput: t.calls === 0 ? 0 : Math.round(t.input / t.calls),
            meanOutput: t.calls === 0 ? 0 : Math.round(t.output / t.calls),
            costPerTemplate: t.templates === 0 ? 0 : t.cost / t.templates,
            meanMs: Math.round(mean(t.ms)),
          },
        ]),
      ),
      quality: { filler, american, emphasisBroken, emphasisSlots },
    },
    rank: {
      pools,
      poolsWithoutVerdict,
      searchErrors,
      candidatesJudged,
      rejected,
      rejectRate: candidatesJudged === 0 ? 0 : rejected / candidatesJudged,
      rejectKinds: Object.fromEntries(rejectKinds),
      unmatchedVerdicts,
      meanScore: Math.round(mean(scores) * 10) / 10,
      emptySlots,
      repeatedSlots,
    },
  }

  const stageRows = Object.entries(json.cost.byStage)
    .map(
      ([k, t]) =>
        `| ${k} | ${String(t.calls)} | ${String(t.input)} | ${String(t.output)} | ${String(t.meanInput)} | ${String(t.meanOutput)} | ${String(t.meanMs)} | ${usd(t.cost)} | ${usd(t.perSubmission)} |`,
    )
    .join('\n')
  const templateRows = Object.entries(json.copy.byTemplate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([id, t]) =>
        `| ${id} | ${String(t.templates)} | ${String(t.calls)} | ${pct(t.firstAnswerPassRate, 1)} | ${String(t.inCallRetries)} (${String(t.inCallRetryPassed)} passed) | ${String(t.stepRetries)} | ${String(t.fallbacks)} | ${String(t.meanInput)} | ${String(t.meanOutput)} | ${usd(t.costPerTemplate)} |`,
    )
    .join('\n')
  const topSlots = Object.entries(json.copy.violationsBySlot)
    .slice(0, 12)
    .map(([k, v]) => `${k} ${String(v)}`)
    .join('; ')
  const markdown = `# Eval run ${run}

${String(n)} fixtures, stages ${stagesRun.join('+')}${json.reusedFrom === null ? '' : ` (the rest from ${json.reusedFrom})`}. Prices: the claude-api skill's table, 25 September 2026.

${runLine(facts)}

| Stage | Calls | Input | Output | Mean in | Mean out | Mean ms | Cost | Per submission |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${stageRows}
| **all** | | | | | | | **${usd(totalCost)}** | **${usd(json.cost.perSubmissionMean)}** (${usd(json.cost.perSubmissionMin)} to ${usd(json.cost.perSubmissionMax)}) |

Brief: ${String(briefSources.model)} from the model, ${String(briefSources.fallback)} fallback; ${String(briefRuleViolations)} rule hits inside model briefs.

Copy: ${String(templatesTotal)} template answers, ${String(copyCalls)} calls. First answer fitted ${String(firstPass)}/${String(templatesTotal)} (${pct(firstPass, templatesTotal)}). In-call retries ${String(inCallRetries)}, of which ${String(retryPassed)} fitted. Step retries ${String(stepRetries)}. Fallbacks ${String(fallbacks)} (${JSON.stringify(json.copy.fallbackReasons)}). Violations: shape ${String(violationsByKind.shape)}, count ${String(violationsByKind.count)}, length ${String(violationsByKind.length)}, rule ${String(violationsByKind.rule)}; rule reasons ${JSON.stringify(json.copy.ruleReasons)}.
Unreadable answers (not JSON, counted as a shape violation and never as a fit): ${String(unreadable.calls)} of ${String(copyCalls)} calls (${pct(unreadable.calls, copyCalls)}): ${String(unreadable.firstAnswers)} first answers, ${String(unreadable.stepStarts)} later fresh starts, ${String(unreadable.inCallRetries)} in-call retries; by template ${JSON.stringify(json.copy.unreadable.byTemplate)}. The calls after them cost ${usd(unreadable.costAfter)} (${pct(unreadable.costAfter, byStage.copy.cost)} of copy spend). Text kept for ${String(unreadable.withText)} of ${String(unreadable.calls)}.
Most violated slots: ${topSlots}.
Quality checks: filler ${JSON.stringify(filler)}; American spellings ${JSON.stringify(american)}; emphasis not in its text ${String(emphasisBroken)} of ${String(emphasisSlots)}.

| Template | Answers | Calls | First fit | In-call retries | Step retries | Fallbacks | Mean in | Mean out | Cost per answer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${templateRows}

Rank: ${String(pools)} pools, ${String(poolsWithoutVerdict)} without a verdict, ${String(searchErrors)} search errors. ${String(candidatesJudged)} candidates judged, ${String(rejected)} rejected (${pct(rejected, candidatesJudged)}): ${JSON.stringify(json.rank.rejectKinds)}; ${String(unmatchedVerdicts)} verdicts matched no candidate; mean score ${String(json.rank.meanScore)}. Slots the stage would leave empty: ${String(emptySlots)}; filled with a picture another design took: ${String(repeatedSlots)}.
`
  return { json, markdown }
}

function countEmphasis(value: unknown): number {
  if (Array.isArray(value)) return value.reduce<number>((n, v) => n + countEmphasis(v), 0)
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const own = typeof record.emphasis === 'string' ? 1 : 0
    return own + Object.values(record).reduce<number>((n, v) => n + countEmphasis(v), 0)
  }
  return 0
}
