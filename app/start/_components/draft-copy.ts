import type { QuestionId } from '@/lib/brief/question-ids'
import { styleFor, type VisualStyle } from '@/lib/brief/styles'
import { CONFIG } from '@/lib/config'

// The live draft's words (docs/start-page-journey-plan.md, 4.6 and 5.8): what the draft beside the
// questions says while it waits for an answer, the tags that name each part as it lands, its
// window's chrome, and the caption under it. The draft itself is aria-hidden; the caption is the
// one line a visitor reads there. Kept out of the components so the copy tests read every one
// without React (app/_components/copy-corpus.ts, draft-copy.test.ts).
//
// The notes are set in the serif italic, the studio's voice beside the visitor's own words, which
// stay upright (plan 5.2); at most two show at once.
export const DRAFT_NOTES = {
  // Where the sentence will land, before a character is typed. The no-break space keeps "set
  // large" together, so the note breaks after the comma in both frames, as the mockups draw it.
  sentence: 'your sentence, set large',
  // Beside the mark, before the business name.
  name: 'your name',
  // On the mood art, before a look is chosen.
  photos: 'photos to match your look',
} as const

// On the mood art once a look is chosen: "photos for a warm and natural look".
export function photosNote(style: VisualStyle): string {
  return `photos for a ${styleFor(style).label.toLowerCase()} look`
}

// Under the headline while the display face is still on its way, or will not come.
export function faceNote(face: string): string {
  return `set in ${face} in your designs`
}

// The signature on the finished draft, with the visitor's first name.
export function signature(first: string): string {
  return `Draft for ${first}`
}

// The tag over each part as its answer lands, numbered in the order the questions come.
export const DRAFT_TAGS: Readonly<Record<QuestionId, string>> = {
  describe: '01 Sentence',
  brand: '02 Name',
  imagery: '03 Look',
  colours: '04 Colour',
  details: '05 Send',
}

// The draft's own chrome: the browser tab before a business name, and the footer's line, which
// carries the year it is drawn in.
export const DRAFT_CHROME = {
  blankTab: 'your-business',
} as const

export function draftFoot(year: number): string {
  return `© ${String(year)}`
}

// The caption under the draft, on the ink: while the visitor answers, once the three designs
// stand in its place, and under the sealed draft of a build that ended without them, where the
// call leads (plan 4.9). It names the call at its real length.
export const DRAFT_CAPTION = {
  live: 'A live draft. Each design gets its own layout and words.',
  done: `Five answers made these. Imagine what a ${String(CONFIG.call.minutes)}-minute call does.`,
  stopped: 'Your draft is kept. The call starts from it.',
} as const
