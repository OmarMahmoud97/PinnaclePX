import 'client-only'
import { DRAFT_KEY } from '@/lib/brief/draft'
import { type Answers, draftSchema } from '@/lib/brief/schema'

// Restores a draft, validated on the way back in because a draft may be half-typed.
export function readDraft(): Answers | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (raw === null) return null
    const parsed = draftSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
