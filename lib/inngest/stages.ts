import 'server-only'
import { RetryAfterError } from 'inngest'
import { CONFIG } from '@/lib/config'
import { markStage, type Stage, type StagePatch } from '@/lib/db/submissions'
import { log } from '@/lib/log'

type Work = () => Promise<StagePatch>

export type StageOutcome =
  | Readonly<{ state: 'done' | 'fallback'; patch: StagePatch }>
  // The sweeper settled this stage before this attempt reached it: there is nothing to do.
  | Readonly<{ state: 'settled' }>

// A stage that may give up: tried this many times within the step, a pause between, and then
// its deterministic fallback is written and the pipeline moves on.
type Bounded = Readonly<{ attempts: number; fallback: Work }>

const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// Runs one stage against the row: marks it running, does the work, marks it done with the
// results. If the work fails, the stage is not settled here: the failure is logged and the step
// is retried on a fixed cadence until it succeeds or the sweeper settles the stage at the
// deadline with the deterministic fallback. A page is only ever called ready when its stages
// finished, and only ever called finished by the sweeper when the time ran out. A bounded stage
// is the exception: after its attempts, its own fallback is written here.
export async function runStage(
  slug: string,
  stage: Stage,
  work: Work,
  bounded?: Bounded,
): Promise<StageOutcome> {
  const open = await markStage(slug, stage, 'running')
  if (!open) return { state: 'settled' }
  const attempts = bounded?.attempts ?? 1
  let reason = 'unknown'
  let cause: unknown
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) await pause(CONFIG.pipeline.retryAfterMs)
    try {
      const patch = await work()
      await markStage(slug, stage, 'done', patch)
      return { state: 'done', patch }
    } catch (error) {
      reason = error instanceof Error ? error.message : 'unknown'
      cause = error
      log.warn('stage.retry', { slug, stage, attempt, reason })
    }
  }
  if (bounded === undefined) {
    throw new RetryAfterError(reason, CONFIG.pipeline.retryAfterMs, { cause })
  }
  log.warn('stage.fallback', { slug, stage, reason })
  const patch = await bounded.fallback()
  await markStage(slug, stage, 'fallback', patch)
  return { state: 'fallback', patch }
}
