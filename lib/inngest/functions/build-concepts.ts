import 'server-only'
import { type GetStepTools, NonRetriableError } from 'inngest'
import { writeBrief } from '@/lib/ai/brief'
import { writeCopy } from '@/lib/ai/copy'
import { paletteFor } from '@/lib/brief/palettes'
import { submissionAnswersSchema } from '@/lib/brief/submission'
import { type BrandBrief, fallbackBrief } from '@/lib/copy-slots/brief'
import { revealTemplates } from '@/lib/db/exclusivity'
import { markStage, readSubmission } from '@/lib/db/submissions'
import { inngest } from '@/lib/inngest/client'
import { submissionCreated } from '@/lib/inngest/events'
import { imageryFor, type TemplateImagery } from '@/lib/images/stage'
import { runStage } from '@/lib/inngest/stages'
import { log } from '@/lib/log'
import { analyseSubmissionLogo } from '@/lib/logo/stage'
import { selectTemplates } from '@/lib/select/select'
import { deriveTokens } from '@/lib/tokens/derive'
import { schemeFor } from '@/lib/tokens/scheme'
import type { ContrastPair } from '@/lib/tokens/types'
import { contractFor, READY_TEMPLATES } from '@/templates/registry'

// The pipeline, as one durable function: every stage is a step, so a retry never repeats work
// that finished, and the results land on the submission row as they come. The brief and the
// copy are written by the model and judged by code, each with its deterministic fallback; the
// imagery stage searches, judges and re-hosts, and a slot it cannot fill stays empty, which the
// templates draw around.
export const buildConcepts = inngest.createFunction(
  {
    id: 'build-concepts',
    retries: 1,
    idempotency: 'event.data.slug',
    triggers: [submissionCreated],
  },
  async ({ event, step }) => {
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

    const templateIds = await step.run('select', async () => {
      const chosen = await revealTemplates(row.identityHash, slug, (alreadySeen) =>
        selectTemplates({
          candidates: READY_TEMPLATES,
          seen: alreadySeen,
          polarity,
          count: row.conceptCount,
          seed: row.payloadHash,
        }),
      )
      await runStage(slug, 'select', () => Promise.resolve({ templateIds: chosen, logo }), null)
      return chosen
    })

    if (templateIds.length === 0) {
      // Exhausted: nothing to build. The other stages settle so the status is not left open.
      await step.run('settle-exhausted', async () => {
        for (const stage of ['tokens', 'brief', 'copy', 'imagery'] as const) {
          await markStage(slug, stage, 'done')
        }
      })
      return { slug, exhausted: true }
    }

    await step.run('tokens', () =>
      runStage(
        slug,
        'tokens',
        () => {
          const hex =
            answers.colours.kind === 'palette'
              ? paletteFor(answers.colours.paletteId).hex
              : answers.colours.hex
          const pairs: ContrastPair[] = templateIds.flatMap((id) => [
            ...contractFor(id).contrastPairs,
          ])
          const scheme = schemeFor(answers.imagery.style, polarity)
          return Promise.resolve({ tokens: deriveTokens(hex, scheme, pairs) })
        },
        null,
      ),
    )

    const brief = await step.run('brief', async () => {
      const outcome = await runStage(
        slug,
        'brief',
        async () => ({ brief: await writeBrief(answers, slug) }),
        () => Promise.resolve({ brief: fallbackBrief(answers.company, answers.description) }),
      )
      return outcome.patch.brief ?? fallbackBrief(answers.company, answers.description)
    })

    await Promise.all([
      copyStage(slug, templateIds, brief, answers.description, step),
      step.run('imagery', () =>
        runStage(
          slug,
          'imagery',
          async () => ({
            imagery: Object.fromEntries(
              await Promise.all(
                templateIds.map(async (id): Promise<[string, TemplateImagery]> => [
                  id,
                  await imageryFor(contractFor(id), answers, brief, slug),
                ]),
              ),
            ),
          }),
          () => Promise.resolve({ imagery: Object.fromEntries(templateIds.map((id) => [id, {}])) }),
        ),
      ),
    ])

    return { slug, templateIds }
  },
)

type StepTools = GetStepTools<typeof inngest>

type CopyResult = Readonly<{ id: string; copy: unknown; fallback: boolean }>

// The copy stage: one model call per template, each judged, retried once and fallen back on
// its own, then one write. The stage is marked fallback if any template fell back.
async function copyStage(
  slug: string,
  templateIds: readonly string[],
  brief: BrandBrief,
  ownersWords: string,
  step: StepTools,
): Promise<void> {
  const open = await step.run('copy-start', () => markStage(slug, 'copy', 'running'))
  if (!open) return
  const results = await Promise.all(
    templateIds.map((id) =>
      step.run(`copy-${id}`, async (): Promise<CopyResult> => {
        const contract = contractFor(id)
        try {
          const written = await writeCopy({ brief, contract, ownersWords, slug })
          if (written.ok) return { id, copy: written.value, fallback: false }
          log.warn('copy.fallback', { slug, template: id, reason: 'violations' })
        } catch (error) {
          log.warn('copy.fallback', {
            slug,
            template: id,
            reason: error instanceof Error ? error.message : 'unknown',
          })
        }
        return { id, copy: contract.fallbackCopy(brief), fallback: true }
      }),
    ),
  )
  await step.run('copy-finish', async () => {
    const copy = Object.fromEntries(results.map((result) => [result.id, result.copy]))
    const state = results.some((result) => result.fallback) ? 'fallback' : 'done'
    await markStage(slug, 'copy', state, { copy })
  })
}
