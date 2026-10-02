import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { notFound } from 'next/navigation'
import * as z from 'zod'
import { DevConcept, viewOf } from '@/app/dev/_render/concept'
import { submissionAnswersSchema } from '@/lib/brief/submission'
import { env } from '@/lib/env'

// A development-only page of the committed copy corpus (tests/fixtures/template-copy): one stored
// or synthetic answer for an invented business, rendered as a visitor's page without pictures,
// as /dev/eval renders a stored run (app/dev/_render/concept.tsx takes the same view in the
// address). It is how CI holds templates to text fit (e2e/template-text-fit.spec.ts), since
// stored runs are not committed. Outside development the route does not exist.
type Params = Promise<{ templateId: string; name: string }>
type Search = Promise<Record<string, string | string[] | undefined>>

const segment = z.string().regex(/^[a-z0-9-]+$/)

const fileSchema = z.object({
  answers: submissionAnswersSchema,
  chosen: z.array(z.string()),
  copy: z.unknown(),
})

export default async function CorpusConceptPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  if (env.NODE_ENV !== 'development') notFound()
  const { templateId, name } = await params
  if (![templateId, name].every((part) => segment.safeParse(part).success)) notFound()
  const file = join(process.cwd(), 'tests', 'fixtures', 'template-copy', templateId, `${name}.json`)
  if (!existsSync(file)) notFound()
  const stored = fileSchema.parse(JSON.parse(readFileSync(file, 'utf8')))
  if (!stored.chosen.includes(templateId)) notFound()
  const view = viewOf(await searchParams, stored.answers)
  if (view === null) notFound()
  return (
    <DevConcept
      templateId={templateId}
      copy={stored.copy}
      answers={stored.answers}
      chosen={stored.chosen}
      view={view}
    />
  )
}
