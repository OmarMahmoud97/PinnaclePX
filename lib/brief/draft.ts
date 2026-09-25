import 'client-only'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'

// A per-tab convenience: a refresh keeps the answers and the furthest question the visitor has
// seen. Cleared on send, never read by the server. Reading validates the draft and so carries the
// schema; it lives in read-draft.ts, so the home page, which only writes, never loads zod.
export const DRAFT_KEY = 'pinnaclepx.brief'

// The sentence typed into the hero, handed to /start in a key of its own. The hero writes only
// this and never touches the draft, so a returning visitor's answers are never overwritten; /start
// merges it into the draft on arrival and forgets it (docs/start-page-journey-plan.md, D4).
export const CARRIED_KEY = 'pinnaclepx.carried'

// The order the questions were asked in, stamped on the draft beside `reached`, which counts in
// it. A tab left open across a change of order (Release 1's, say) holds a question number that
// now names another question, so read-draft.ts trusts `reached` only under this same order.
export const DRAFT_ORDER = QUESTION_IDS.join(' ')

// The draft as stored: the answers, plus `reached`, the highest question shown, 0-based like the
// flow's question index (plan D3), and the order it counts in.
export function writeDraft(answers: Answers, reached: number): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...answers, reached, order: DRAFT_ORDER }))
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

export function writeCarried(sentence: string): void {
  try {
    sessionStorage.setItem(CARRIED_KEY, sentence)
  } catch {
    // Storage is unavailable; /start opens without the sentence.
  }
}

export function forgetCarried(): void {
  try {
    sessionStorage.removeItem(CARRIED_KEY)
  } catch {
    // Nothing to forget.
  }
}
