import type { SubmissionAnswers } from '@/lib/brief/submission'
import type { BrandBrief } from '@/lib/copy-slots/brief'
import type { CopyViolation } from '@/lib/copy-slots/rules'

// What one eval run writes per fixture (test-results/eval/<run>/<fixture>.json). The shape is
// the harness's own; the summary and the dev-only render route read it.

// One model call's usage, as noteModelCall received it.
export type CallRecord = Readonly<{
  slug: string
  stage: 'brief' | 'copy' | 'rank'
  template: string | null
  // writeCopy's in-call attempt (0 first, 1 the retry); 0 for the other stages.
  attempt: number
  // The fresh start the call belonged to (copyStage's step attempts); 0 for the other stages.
  step: number
  model: string
  stop: string
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  // Wall time of the call, when the harness could measure it.
  ms: number | null
  at: string
}>

export type JudgedViolation = CopyViolation &
  Readonly<{ kind: 'shape' | 'count' | 'length' | 'rule' }>

export type CopyAttempt = Readonly<{
  step: number
  call: number
  // The answer as the pipeline's reader parsed it, or null when it was not JSON.
  parsed: unknown
  // An unreadable answer's text, cut to RAW_TEXT_LIMIT characters (notes.ts), so the defect
  // that stopped it parsing can be read. Records written before 2 October 2026 have none, and
  // their unreadable answers carry no violation; the summary counts those as not JSON too.
  raw?: string
  violations: readonly JudgedViolation[]
  usage: CallRecord
}>

// What a run records about itself beside its fixtures, in test-results/eval/<run>/_run.json
// (the underscore keeps it from ever being a fixture id): the switches that limited it and what
// it spent. Runs from before 2 October 2026 have none.
export type RunFacts = Readonly<{
  // EVAL_TEMPLATES: the only templates whose copy the run wrote, or null for every chosen one.
  templates: readonly string[] | null
  // EVAL_MAX_USD, or null with no spend stop.
  maxUsd: number | null
  // The priced cost of the calls this run made, reused stages not included.
  spent: number
  concurrency: number
  notStarted: readonly string[]
  // Fixtures set aside before the first call: the run skipped the brief stage and the reused run
  // held no record of theirs to build on (plan.ts, splitByRecord).
  noRecord?: readonly string[]
}>

export type PoolRecord = {
  key: string
  queries: readonly string[]
  purpose: string
  // The query that found candidates, or null when none did.
  query: string | null
  candidates: readonly Readonly<{
    id: number
    alt: string
    photographer: string
    thumbnail: string
  }>[]
  verdicts: readonly Readonly<{ id: number; score: number; reject: string | null }>[] | null
  // Candidate ids in the order the stage would try them.
  ordered: readonly number[]
  errors: string[]
  calls: readonly CallRecord[]
  ms: number
}

export type FixtureRecord = Readonly<{
  id: string
  notes: string
  answers: SubmissionAnswers
  seed: string
  templates: readonly string[]
  stagesRun: readonly ('brief' | 'copy' | 'rank')[]
  reusedFrom: string | null
  brief: Readonly<{
    source: 'model' | 'fallback'
    attempts: number
    errors: readonly string[]
    brief: BrandBrief
    calls: readonly CallRecord[]
    // Numbers, superlatives and claims in the brief that the owner's sentence does not carry.
    ruleViolations: readonly CopyViolation[]
    ms: number
  }>
  copy: Record<
    string,
    Readonly<{
      final: unknown
      fallback: boolean
      fallbackReason: 'violations' | 'errors' | 'permanent' | null
      errors: readonly string[]
      attempts: readonly CopyAttempt[]
      ms: number
    }>
  >
  imagery: Readonly<{
    pools: readonly PoolRecord[]
    // Per template, per slot: the Pexels id the stage would take, or null.
    assignment: Readonly<Record<string, Readonly<Record<string, number | null>>>>
    empty: number
    repeated: number
    ms: number
  }>
  at: string
}>
