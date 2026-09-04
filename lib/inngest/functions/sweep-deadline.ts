import 'server-only'
import { NonRetriableError } from 'inngest'
import { submissionAnswersSchema } from '@/lib/brief/submission'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { CONFIG } from '@/lib/config'
import { markStage, readSubmission, STAGES } from '@/lib/db/submissions'
import { inngest } from '@/lib/inngest/client'
import { submissionCreated, submissionReady } from '@/lib/inngest/events'
import { log } from '@/lib/log'
import { contractFor } from '@/templates/registry'

// The promise that the clock never reaches zero without a result. Wakes shortly before the
// deadline and writes the deterministic fallback into any stage still open. Writes go through
// the same conditional update as the pipeline, so whichever lands first wins. Select and tokens
// have no fallback: still open at this point, they are marked failed so the page can say so.
export const sweepDeadline = inngest.createFunction(
  {
    id: 'sweep-deadline',
    retries: 1,
    idempotency: 'event.data.slug',
    triggers: [submissionCreated],
  },
  async ({ event, step }) => {
    const { slug } = event.data

    const deadline = await step.run('read-deadline', async () => {
      const row = await readSubmission(slug)
      if (row === null) throw new NonRetriableError(`No submission ${slug}`)
      return row.deadlineAt.toISOString()
    })

    await step.sleepUntil(
      'until-shortly-before-the-deadline',
      new Date(new Date(deadline).getTime() - CONFIG.deadline.sweeperLeadMs),
    )

    const swept = await step.run('sweep', async () => {
      const row = await readSubmission(slug)
      if (row === null) throw new NonRetriableError(`No submission ${slug}`)
      const open = STAGES.filter((stage) => {
        const state = {
          select: row.stageSelect,
          tokens: row.stageTokens,
          brief: row.stageBrief,
          copy: row.stageCopy,
          imagery: row.stageImagery,
        }[stage]
        return state === 'pending' || state === 'running'
      })
      if (open.length === 0) return []

      const answers = submissionAnswersSchema.parse(row.answers)
      const brief = row.brief ?? fallbackBrief(answers.company, answers.description)
      const templateIds = row.templateIds ?? []
      const swept: string[] = []
      for (const stage of open) {
        let written: boolean
        switch (stage) {
          case 'select':
          case 'tokens':
            written = await markStage(slug, stage, 'failed')
            break
          case 'brief':
            written = await markStage(slug, 'brief', 'fallback', { brief })
            break
          case 'copy':
            written = await markStage(slug, 'copy', 'fallback', {
              copy: Object.fromEntries(
                templateIds.map((id) => [id, contractFor(id).fallbackCopy(brief)]),
              ),
            })
            break
          case 'imagery':
            written = await markStage(slug, 'imagery', 'fallback', {
              imagery: Object.fromEntries(templateIds.map((id) => [id, {}])),
            })
            break
        }
        if (written) {
          swept.push(stage)
          log.warn('stage.swept', { slug, stage })
        }
      }
      return swept
    })

    // The link goes out once whatever settled the stages; the email function is idempotent.
    await step.sendEvent('ready', submissionReady.create({ slug }))
    return { slug, swept }
  },
)
