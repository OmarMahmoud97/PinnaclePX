import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { notFound } from 'next/navigation'
import * as z from 'zod'
import { DevConcept, viewOf } from '@/app/dev/_render/concept'
import { evalPageOf, evalRecordSchema } from '@/app/dev/_render/eval-record'
import { env } from '@/lib/env'

// A development-only look at what an eval run wrote (tests/eval/pipeline.eval.ts): one
// template's copy from one fixture, rendered through renderConcept exactly as the preview page
// renders a row, with the tokens the pipeline would derive, the fonts of the chosen look, a
// wordmark logo and no pictures. A template written outside the fixture's pick (EVAL_PAIRS) is
// set with the trio its record stores (app/dev/_render/eval-record.ts). The address can ask for
// another look, scheme, stand-in pictures, a stand-in logo or an email
// (app/dev/_render/concept.tsx), which is how the checks in scripts/checks measure every state.
// Outside development the route does not exist.
type Params = Promise<{ run: string; fixture: string; templateId: string }>
type Search = Promise<Record<string, string | string[] | undefined>>

const segment = z.string().regex(/^[a-z0-9-]+$/)

export default async function EvalConceptPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  if (env.NODE_ENV !== 'development') notFound()
  const { run, fixture, templateId } = await params
  if (![run, fixture, templateId].every((part) => segment.safeParse(part).success)) notFound()
  const file = join(process.cwd(), 'test-results', 'eval', run, `${fixture}.json`)
  if (!existsSync(file)) notFound()
  const record = evalRecordSchema.parse(JSON.parse(readFileSync(file, 'utf8')))
  const shown = evalPageOf(record, templateId)
  if (shown === null) notFound()
  const { written, chosen } = shown
  const view = viewOf(await searchParams, record.answers)
  if (view === null) notFound()

  return (
    <>
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
      <DevConcept
        templateId={templateId}
        copy={written.final}
        answers={record.answers}
        chosen={chosen}
        view={view}
      />
    </>
  )
}
