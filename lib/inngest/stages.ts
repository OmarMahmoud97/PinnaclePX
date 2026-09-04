import 'server-only'
import { markStage, type Stage, type StagePatch } from '@/lib/db/submissions'
import type { StageState } from '@/lib/db/schema'
import { log } from '@/lib/log'

type Work = () => Promise<StagePatch>

// Runs one stage against the row: marks it running, does the work, marks it done with the
// results. If the work throws, the fallback's results are written and the stage is marked
// fallback; a stage with no fallback is marked failed and the error goes on up, so Inngest shows
// it. A stage the sweeper has already settled is left alone and reported as such.
export async function runStage(
  slug: string,
  stage: Stage,
  work: Work,
  fallback: Work | null,
): Promise<StageState> {
  const open = await markStage(slug, stage, 'running')
  if (!open) return 'done'
  try {
    const patch = await work()
    await markStage(slug, stage, 'done', patch)
    return 'done'
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown'
    if (fallback === null) {
      log.error('stage.failed', { slug, stage, reason })
      await markStage(slug, stage, 'failed')
      throw error
    }
    log.warn('stage.fallback', { slug, stage, reason })
    await markStage(slug, stage, 'fallback', await fallback())
    return 'fallback'
  }
}
