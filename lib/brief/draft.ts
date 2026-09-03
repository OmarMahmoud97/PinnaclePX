import 'client-only'
import type { Answers } from '@/lib/brief/schema'

// A per-tab convenience shared by the home page and /start: a refresh keeps the answers, and a
// sentence typed on the home page arrives on question one. Cleared on submit, never read by the
// server. Reading validates the draft and so carries the schema; it lives in read-draft.ts so the
// home page, which only writes, never loads zod.
export const DRAFT_KEY = 'pinnaclepx.brief'

export function writeDraft(answers: Answers): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(answers))
  } catch {
    // Storage is unavailable; the answers still live in memory for this visit.
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Nothing to clear.
  }
}
