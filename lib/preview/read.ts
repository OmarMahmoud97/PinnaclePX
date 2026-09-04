import 'server-only'
import { cache } from 'react'
import { type SubmissionAnswers, submissionAnswersSchema } from '@/lib/brief/submission'
import { readSubmission, type SubmissionRow } from '@/lib/db/submissions'
import { slugSchema } from '@/lib/identity/slug'

export type PreviewRow = Readonly<{ row: SubmissionRow; answers: SubmissionAnswers }>

// The row a preview request renders from, with its answers parsed, read once: the page, its
// metadata and its card each ask, and React's per-request cache answers all but the first from
// the same read. A slug that is not one of ours reads nothing. The pipeline reads the row
// through lib/db directly, because it writes between its reads.
export const readPreview = cache(async (slug: string): Promise<PreviewRow | null> => {
  if (!slugSchema.safeParse(slug).success) return null
  const row = await readSubmission(slug)
  return row === null ? null : { row, answers: submissionAnswersSchema.parse(row.answers) }
})
