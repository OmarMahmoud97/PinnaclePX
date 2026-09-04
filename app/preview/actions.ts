'use server'

import type { SubmissionStatus } from '@/lib/brief/status'
import { readSubmission } from '@/lib/db/submissions'
import { slugSchema } from '@/lib/identity/slug'
import { statusOf } from '@/lib/preview/status'

// How a submission is coming along, for the done page and for a preview opened before it is
// ready. Read straight from the row every time: the row is the only truth.
export async function getSubmissionStatus(slug: string): Promise<SubmissionStatus> {
  const valid = slugSchema.safeParse(slug)
  if (!valid.success) return { status: 'missing' }
  const row = await readSubmission(valid.data)
  return row === null ? { status: 'missing' } : statusOf(row)
}
