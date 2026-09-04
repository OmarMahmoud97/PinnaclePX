import 'server-only'
import { type GetStepTools, NonRetriableError, RetryAfterError } from 'inngest'
import { writeBrief } from '@/lib/ai/brief'
import { writeCopy } from '@/lib/ai/copy'
import { paletteFor } from '@/lib/brief/palettes'
import { submissionAnswersSchema } from '@/lib/brief/submission'
import { CONFIG } from '@/lib/config'
import { type BrandBrief, fallbackBrief } from '@/lib/copy-slots/brief'
import { revealTemplates } from '@/lib/db/exclusivity'
import { markStage, readSubmission } from '@/lib/db/submissions'
import { imageryFor, type TemplateImagery } from '@/lib/images/stage'
import { inngest } from '@/lib/inngest/client'
import { submissionCreated, submissionReady } from '@/lib/inngest/events'
import { runStage } from '@/lib/inngest/stages'
import { log } from '@/lib/log'
import { analyseSubmissionLogo } from '@/lib/logo/stage'
import { selectTemplates } from '@/lib/select/select'
import { deriveTokens } from '@/lib/tokens/derive'
import { schemeFor } from '@/lib/tokens/scheme'
import type { ContrastPair } from '@/lib/tokens/types'
import { contractFor, READY_TEMPLATES } from '@/templates/registry'

// The pipeline, as one durable function: every stage is a step, so a retry never repeats work
// that finished, and the results land on the submission row as they come. A stage that fails
// is tried again on a fixed cadence until the sweeper settles it at the deadline: a page is
// called ready only when its stages finished. The brief and the copy are written by the model
// and judged by code; the imagery stage searches, judges and re-hosts, and keeps what it has
// filled while it tries again for the rest. Once the sweeper has settled a stage, the run ends.
export const buildConcepts = inngest.createFunction(
  {
    id: 'build-concepts',
    retries: CONFIG.pipeline.retries,
    idempotency: 'event.data.slug',
    triggers: [submissionCreated],
  },
  async ({ event, step, attempt }) => {
    const { slug } = event.data

    const row = await step.run('load', async () => {
      const found = await readSubmission(slug)
      if (found === null) throw new NonRetriableError(`No submission ${slug}`)
      return {
        identityHash: found.identityHash,
        payloadHash: found.payloadHash,
        conceptCount: found.conceptCount,
        answers: submissionAnswersSchema.parse(found.answers),
      }
    })
    const { answers } = row

    const logo = await step.run('logo', () => analyseSubmissionLogo(answers.logo, slug))
    const polarity = logo?.polarity ?? 'mixed'

    const selected = await step.run('select', () =>
      runStage(slug, 'select', async () => ({
        logo,
        templateIds: await revealTemplates(row.identityHash, slug, (alreadySeen) =>
          selectTemplates({
            candidates: READY_TEMPLATES,
            seen: alreadySeen,
            polarity,
            count: row.conceptCount,
            seed: row.payloadHash,
          }),
        ),
      })),
    )
    if (selected.state === 'settled') return { slug, swept: true }
    const templateIds = selected.patch.templateIds ?? []

    if (templateIds.length === 0) {
      // Exhausted: nothing to build. The other stages settle so the status is not left open.
      await step.run('settle-exhausted', async () => {
        for (const stage of ['tokens', 'brief', 'copy', 'imagery'] as const) {
          await markStage(slug, stage, 'done')
        }
      })
      return { slug, exhausted: true }
    }

    const tokens = await step.run('tokens', () =>
      runStage(slug, 'tokens', () => {
        const hex =
          answers.colours.kind === 'palette'
            ? paletteFor(answers.colours.paletteId).hex
            : answers.colours.hex
        const pairs: ContrastPair[] = templateIds.flatMap((id) => [
          ...contractFor(id).contrastPairs,
        ])
        const scheme = schemeFor(answers.imagery.style, polarity)
        return Promise.resolve({ tokens: deriveTokens(hex, scheme, pairs) })
      }),
    )
    if (tokens.state === 'settled') return { slug, swept: true }

    const written = await step.run('brief', () =>
      runStage(slug, 'brief', async () => ({ brief: await writeBrief(answers, slug) }), {
        attempts: CONFIG.brief.attempts,
        fallback: () =>
          Promise.resolve({ brief: fallbackBrief(answers.company, answers.description) }),
      }),
    )
    if (written.state === 'settled') return { slug, swept: true }
    const brief = written.patch.brief ?? fallbackBrief(answers.company, answers.description)

    const [copied, pictured] = await Promise.all([
      copyStage(slug, templateIds, brief, answers.description, step, attempt),
      step.run('imagery', () =>
        runStage(slug, 'imagery', async () => {
          const imagery = Object.fromEntries(
            await Promise.all(
              templateIds.map(async (id): Promise<[string, TemplateImagery]> => [
                id,
                await imageryFor(contractFor(id), answers, brief, slug),
              ]),
            ),
          )
          // What was filled is kept on the row while the rest is tried again, so the sweeper
          // never has to throw a picture away.
          const empty = templateIds.flatMap((id) =>
            contractFor(id)
              .imageSlots.filter((slot) => imagery[id]?.[slot] === null)
              .map((slot) => `${id}.${slot}`),
          )
          if (empty.length > 0) {
            await markStage(slug, 'imagery', 'running', { imagery })
            throw new Error(`Slots still empty: ${empty.join(', ')}`)
          }
          return { imagery }
        }),
      ),
    ])
    if (copied === 'settled' || pictured.state === 'settled') return { slug, swept: true }

    await step.sendEvent('ready', submissionReady.create({ slug }))
    return { slug, templateIds }
  },
)

type StepTools = GetStepTools<typeof inngest>

type CopyResult = Readonly<{ id: string; copy: unknown; fallback: boolean }>

// The copy stage: one model call per template, each judged on its own, then one write. An
// answer that still breaks a limit after the in-call retry is asked for again on the next
// attempt of the step; after CONFIG.copy.attempts the template's fallback stands, because the
// model is not going to do better. An API failure is retried like any other stage. The stage is
// marked fallback if any template fell back, which the email respects.
async function copyStage(
  slug: string,
  templateIds: readonly string[],
  brief: BrandBrief,
  ownersWords: string,
  step: StepTools,
  attempt: number,
): Promise<'done' | 'fallback' | 'settled'> {
  const open = await step.run('copy-start', () => markStage(slug, 'copy', 'running'))
  if (!open) return 'settled'
  const results = await Promise.all(
    templateIds.map((id) =>
      step.run(`copy-${id}`, async (): Promise<CopyResult> => {
        const contract = contractFor(id)
        try {
          const written = await writeCopy({ brief, contract, ownersWords, slug })
          if (written.ok) return { id, copy: written.value, fallback: false }
          if (attempt + 1 < CONFIG.copy.attempts) {
            log.warn('copy.retry', { slug, template: id, attempt, count: written.reason.length })
            throw new RetryAfterError('Copy broke its limits', CONFIG.pipeline.retryAfterMs)
          }
          log.warn('copy.fallback', { slug, template: id, reason: 'violations' })
          return { id, copy: contract.fallbackCopy(brief), fallback: true }
        } catch (error) {
          if (error instanceof RetryAfterError) throw error
          const reason = error instanceof Error ? error.message : 'unknown'
          log.warn('stage.retry', { slug, stage: 'copy', template: id, reason })
          throw new RetryAfterError(reason, CONFIG.pipeline.retryAfterMs, { cause: error })
        }
      }),
    ),
  )
  return step.run('copy-finish', async () => {
    const copy = Object.fromEntries(results.map((result) => [result.id, result.copy]))
    const state = results.some((result) => result.fallback) ? 'fallback' : 'done'
    const written = await markStage(slug, 'copy', state, { copy })
    return written ? state : 'settled'
  })
}
