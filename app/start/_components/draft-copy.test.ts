import { describe, expect, it } from 'vitest'
import {
  DRAFT_CAPTION,
  DRAFT_TAGS,
  draftFoot,
  faceNote,
  photosNote,
  signature,
} from '@/app/start/_components/draft-copy'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import { STYLE_IDS } from '@/lib/brief/styles'
import { CONFIG } from '@/lib/config'

// The draft's words (docs/start-page-journey-plan.md, 4.6). The first of the copy corpus's two
// passes, one-word samples for the word limit and the banned words, is
// app/_components/copy-corpus.ts; this is the second, the shapes the slots really take.

describe('the draft', () => {
  it('numbers each tag by its question, in the order the questions come', () => {
    QUESTION_IDS.forEach((id, index) => {
      expect(DRAFT_TAGS[id]).toMatch(new RegExp(`^0${String(index + 1)} [A-Z][a-z]+$`))
    })
  })

  it('names the look in the note on the mood art, in lower case', () => {
    expect(photosNote('warm')).toBe('photos for a warm and natural look')
    for (const style of STYLE_IDS) expect(photosNote(style)).toBe(photosNote(style).toLowerCase())
  })

  it('never leaves a slot empty or unfilled', () => {
    const lines = [faceNote('Fraunces'), signature('Sam'), signature("Sam's"), draftFoot(2026)]
    for (const line of lines) {
      expect(line, line).not.toMatch(/undefined|null|NaN|\s{2}|^\s|\s$/)
    }
    expect(signature('Sam')).toBe('Draft for Sam')
    expect(draftFoot(2026)).toBe('© 2026')
  })

  it('names the call at its real length', () => {
    expect(DRAFT_CAPTION.done).toContain(`${String(CONFIG.call.minutes)}-minute call`)
  })
})
