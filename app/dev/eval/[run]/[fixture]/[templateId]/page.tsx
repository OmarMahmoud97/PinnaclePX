import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { notFound } from 'next/navigation'
import * as z from 'zod'
import { typeStyle } from '@/app/preview/_components/fonts'
import { paletteFor } from '@/lib/brief/palettes'
import { submissionAnswersSchema } from '@/lib/brief/submission'
import { env } from '@/lib/env'
import type { TemplateAssets } from '@/lib/copy-slots/assets'
import { tokenStyle } from '@/lib/tokens/css'
import { deriveTokens } from '@/lib/tokens/derive'
import { schemeFor } from '@/lib/tokens/scheme'
import type { ContrastPair } from '@/lib/tokens/types'
import { contractFor } from '@/templates/registry'
import { renderConcept } from '@/templates/render'

// A development-only look at what an eval run wrote (tests/eval/pipeline.eval.ts): one
// template's copy from one fixture, rendered through renderConcept exactly as the preview page
// renders a row, with the tokens the pipeline would derive, the fonts of the chosen look, a
// wordmark logo and no pictures. Outside development the route does not exist.
type Params = Promise<{ run: string; fixture: string; templateId: string }>

const segment = z.string().regex(/^[a-z0-9-]+$/)

const recordSchema = z.object({
  answers: submissionAnswersSchema,
  templates: z.array(z.string()),
  copy: z.record(z.string(), z.object({ final: z.unknown(), fallback: z.boolean() })),
})

export default async function EvalConceptPage({ params }: { params: Params }) {
  if (env.NODE_ENV !== 'development') notFound()
  const { run, fixture, templateId } = await params
  if (![run, fixture, templateId].every((part) => segment.safeParse(part).success)) notFound()
  const file = join(process.cwd(), 'test-results', 'eval', run, `${fixture}.json`)
  if (!existsSync(file)) notFound()
  const record = recordSchema.parse(JSON.parse(readFileSync(file, 'utf8')))
  const written = record.copy[templateId]
  if (written === undefined || !record.templates.includes(templateId)) notFound()

  const { answers } = record
  const hex =
    answers.colours.kind === 'palette'
      ? paletteFor(answers.colours.paletteId).hex
      : answers.colours.hex
  // The pipeline solves the tokens over every chosen template's pairs (build-concepts.ts).
  const pairs: ContrastPair[] = record.templates.flatMap((id) => [...contractFor(id).contrastPairs])
  const tokens = deriveTokens(hex, schemeFor(answers.imagery.style, 'mixed'), pairs)
  const assets: TemplateAssets = { logo: { kind: 'wordmark' }, images: {}, email: null }

  return (
    <div style={{ ...tokenStyle(tokens), ...typeStyle(answers.imagery.style) }}>
      {written.fallback ? (
        <p
          style={{
            background: '#000',
            color: '#fff',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
          }}
        >
          Fallback copy: the answers to this template broke their limits or the call failed.
        </p>
      ) : null}
      {renderConcept(templateId, written.final, assets)}
    </div>
  )
}
