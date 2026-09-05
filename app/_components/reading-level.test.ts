import { describe, expect, it } from 'vitest'
import { COPY } from '@/app/_components/copy-corpus'
import { log } from '@/lib/log'

// The audience reads at about seventh grade (PRODUCT.md), so the corpus is scored with
// Flesch-Kincaid and a grade over the target is logged as a warning, not failed: one long word in
// a short answer moves the number. The ceiling is where the copy has drifted far enough from the
// audience that the build should stop and someone should read it.
const TARGET_GRADE = 7
const CEILING_GRADE = 9

// A syllable count by vowel groups, with the usual corrections: a silent final "e" ("name"), the
// "le" ending after a consonant ("little"), and "es" or "ed" endings that add no syllable
// ("makes", "asked"). Good to within a syllable on ordinary English, which is all a grade needs.
export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (w.length === 0) return 0
  if (w.length <= 3) return 1
  let stem = w
  if (/[^aeiou]le$/.test(stem))
    return Math.max(1, (stem.slice(0, -2).match(/[aeiouy]+/g) ?? []).length + 1)
  stem = stem.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^aeiouy]e)$/, '')
  return Math.max(1, (stem.match(/[aeiouy]+/g) ?? []).length)
}

export function fleschKincaidGrade(texts: readonly string[]): number {
  const sentences = texts.flatMap((text) => text.split(/(?<=[.!?])\s+/).filter((s) => /\w/.test(s)))
  const words = sentences.flatMap((sentence) =>
    sentence.split(/\s+/).filter((w) => /[a-z]/i.test(w)),
  )
  const syllableCount = words.reduce((sum, word) => sum + syllables(word), 0)
  return 0.39 * (words.length / sentences.length) + 11.8 * (syllableCount / words.length) - 15.59
}

describe('reading level', () => {
  it('counts syllables closely enough for a grade', () => {
    expect(syllables('site')).toBe(1)
    expect(syllables('designs')).toBe(2)
    expect(syllables('little')).toBe(2)
    expect(syllables('asked')).toBe(1)
    expect(syllables('business')).toBe(3)
    expect(syllables('questions')).toBe(2)
  })

  it('keeps the home page copy near the audience', () => {
    const grade = fleschKincaidGrade(COPY)
    if (grade > TARGET_GRADE) {
      log.warn('copy.reading-level', { grade: Math.round(grade * 10) / 10, target: TARGET_GRADE })
    }
    expect(grade).toBeLessThanOrEqual(CEILING_GRADE)
  })
})
