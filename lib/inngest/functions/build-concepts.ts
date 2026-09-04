import 'server-only'
import { NonRetriableError } from 'inngest'
import { paletteFor } from '@/lib/brief/palettes'
import { submissionAnswersSchema } from '@/lib/brief/submission'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { revealTemplates } from '@/lib/db/exclusivity'
import { markStage, readSubmission } from '@/lib/db/submissions'
import { inngest } from '@/lib/inngest/client'
import { submissionCreated } from '@/lib/inngest/events'
import { runStage } from '@/lib/inngest/stages'
import { analyseSubmissionLogo } from '@/lib/logo/stage'
import { selectTemplates } from '@/lib/select/select'
import { deriveTokens } from '@/lib/tokens/derive'
import { schemeFor } from '@/lib/tokens/scheme'
import type { ContrastPair } from '@/lib/tokens/types'
import { contractFor, READY_TEMPLATES } from '@/templates/registry'

// The pipeline, as one durable function: every stage is a step, so a retry never repeats work
// that finished, and the results land on the submission row as they come. The brief and the
// copy are the deterministic fallbacks until the model stages land; the imagery stage settles
// with no pictures until the imagery slice lands, and the templates draw light instead.
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
      const written = fallbackBrief(answers.company, answers.description)
      await markStage(slug, 'brief', 'fallback', { brief: written })
      return written
    })

    await Promise.all([
      step.run('copy', async () => {
        const copy = Object.fromEntries(
          templateIds.map((id) => [id, contractFor(id).fallbackCopy(brief)]),
        )
        await markStage(slug, 'copy', 'fallback', { copy })
      }),
      step.run('imagery', async () => {
        const imagery = Object.fromEntries(templateIds.map((id) => [id, {}]))
        await markStage(slug, 'imagery', 'done', { imagery })
      }),
    ])

    return { slug, templateIds }
  },
)
