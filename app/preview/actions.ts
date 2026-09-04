'use server'

import type { SubmissionStatus } from '@/lib/brief/status'
import { readStageRow } from '@/lib/db/submissions'
import { slugSchema } from '@/lib/identity/slug'
import { statusOf } from '@/lib/preview/status'

// How a submission is coming along, for the done page and for a preview opened before it is
// ready. Read straight from the row every time, its stage columns only: the row is the only
// truth, and the rest of it is not needed here.
export async function getSubmissionStatus(slug: string): Promise<SubmissionStatus> {
  const valid = slugSchema.safeParse(slug)
  if (!valid.success) return { status: 'missing' }
  const row = await readStageRow(valid.data)
  return row === null ? { status: 'missing' } : statusOf(row)
}
