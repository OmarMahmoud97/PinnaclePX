import 'client-only'
import * as z from 'zod'
import { CARRIED_KEY, DRAFT_KEY, DRAFT_ORDER } from '@/lib/brief/draft'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import { type Answers, draftSchema } from '@/lib/brief/schema'

// The draft with the furthest question the visitor has seen, and the order that number counts in.
// A draft saved before `reached` existed has none, and one that is out of range loses it rather
// than the answers with it.
const storedDraftSchema = draftSchema.extend({
  reached: z
    .number()
    .int()
    .min(0)
    .max(QUESTION_IDS.length - 1)
    .optional()
    .catch(undefined),
  order: z.string().optional().catch(undefined),
})

export type StoredDraft = Readonly<{ answers: Answers; reached: number | undefined }>

// Restores a draft, validated on the way back in because a draft may be half-typed. Its `reached`
// is kept only when it counts in today's order: one saved under another order, or before the
// order was stamped, resumes at its first unanswered question instead (plan D3).
export function readDraft(): StoredDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (raw === null) return null
    const parsed = storedDraftSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return null
    const { reached, order, ...answers } = parsed.data
    return { answers, reached: order === DRAFT_ORDER ? reached : undefined }
  } catch {
    return null
  }
}

// The hero's sentence, if one was handed over. Read without taking it, because a render may run
// twice; the flow forgets it once it has merged it (lib/brief/draft.ts, forgetCarried).
export function readCarried(): string | null {
  try {
    return sessionStorage.getItem(CARRIED_KEY)
  } catch {
    return null
  }
}
