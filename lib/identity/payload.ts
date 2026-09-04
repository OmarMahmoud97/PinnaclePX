import { createHash } from 'node:crypto'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import { uploadShaOf } from '@/lib/brief/uploads'
import { collapse } from '@/lib/copy-slots/fit'

// A picture by its content, not its URL, so the same file re-uploaded is the same answer.
function pictureKey(url: string): string {
  return uploadShaOf(url) ?? url
}

// What a submission is, as far as the pipeline is concerned: the identity plus every answer the
// pipeline reads, normalised so whitespace and case in the words, and the order of the photos,
// do not make a new submission. The visitor's name is not here: nothing downstream reads it.
export function payloadHashFrom(identityHash: string, answers: SubmissionAnswers): string {
  const canonical = {
    identityHash,
    description: collapse(answers.description),
    company: collapse(answers.company),
    logo: answers.logo.kind === 'file' ? pictureKey(answers.logo.url) : 'wordmark',
    style: answers.imagery.style,
    photos: answers.imagery.photos.map((photo) => pictureKey(photo.url)).sort(),
    colours:
      answers.colours.kind === 'palette'
        ? `palette:${answers.colours.paletteId}`
        : `hex:${answers.colours.hex.toLowerCase()}`,
  }
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex')
}
