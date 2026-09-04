import type { SubmissionAnswers } from '@/lib/brief/submission'
import type { SlotImage } from '@/lib/copy-slots/assets'
import type { LogoAnalysis } from '@/lib/logo/types'

// The parts of a submission that point at files on Blob: the answers (the uploads), the logo
// stage's result (the raster) and the imagery stage's (the re-hosted pictures). Any may be
// absent, because a stage records only what it wrote.
type Parts = Readonly<{
  answers?: SubmissionAnswers | undefined
  logo?: LogoAnalysis | null | undefined
  imagery?: Readonly<Record<string, Readonly<Record<string, SlotImage | null>>>> | undefined
}>

// Every URL on Blob these parts point at, each once. Pure, so the writers and the sweep agree.
export function blobUrlsIn(parts: Parts): string[] {
  const urls = new Set<string>()
  if (parts.answers !== undefined) {
    if (parts.answers.logo.kind === 'file') urls.add(parts.answers.logo.url)
    for (const photo of parts.answers.imagery.photos) urls.add(photo.url)
  }
  if (parts.logo?.image) urls.add(parts.logo.image.src)
  for (const slots of Object.values(parts.imagery ?? {})) {
    for (const image of Object.values(slots)) if (image !== null) urls.add(image.src)
  }
  return [...urls]
}
