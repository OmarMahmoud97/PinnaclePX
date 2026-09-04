import * as z from 'zod'
import { toSixDigitHex } from '@/lib/brief/hex'
import { PALETTE_IDS } from '@/lib/brief/palettes'
import type { briefSchema } from '@/lib/brief/schema'
import { STYLE_IDS } from '@/lib/brief/styles'
import { AppError } from '@/lib/errors'

// A picture the visitor uploaded from the browser straight to Blob: its name for the record and
// its public URL for the pipeline. The bytes never pass through a function.
const uploadedFile = z.object({ fileName: z.string().min(1), url: z.url() })

// The answers as the pipeline reads them from the submission row: what the visitor said, minus
// the name and email, which live on the lead. Validated when stored and again when read.
export const submissionAnswersSchema = z.object({
  description: z.string().min(1),
  company: z.string().min(1),
  logo: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('wordmark') }),
    uploadedFile.extend({ kind: z.literal('file') }),
  ]),
  imagery: z.object({ style: z.enum(STYLE_IDS), photos: z.array(uploadedFile) }),
  colours: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('palette'), paletteId: z.enum(PALETTE_IDS) }),
    z.object({ kind: z.literal('custom'), hex: z.string().regex(/^#[0-9a-f]{6}$/) }),
  ]),
})

export type SubmissionAnswers = z.infer<typeof submissionAnswersSchema>

// The answers as the pipeline stores them, from the brief the form sent: the client ids drop
// away, and a custom colour is written as six lowercase hex digits.
export function submissionAnswersFrom(brief: z.infer<typeof briefSchema>): SubmissionAnswers {
  const colours =
    brief.colours.kind === 'palette'
      ? brief.colours
      : { kind: 'custom' as const, hex: toSixDigitHex(brief.colours.hex) ?? '' }
  if (colours.kind === 'custom' && colours.hex === '') {
    throw new AppError(
      `Not a hex colour: ${brief.colours.kind === 'custom' ? brief.colours.hex : ''}`,
    )
  }
  return submissionAnswersSchema.parse({
    description: brief.description,
    company: brief.company,
    logo:
      brief.logo.kind === 'file'
        ? { kind: 'file', fileName: brief.logo.fileName, url: brief.logo.url }
        : { kind: 'wordmark' },
    imagery: {
      style: brief.imagery.style,
      photos: brief.imagery.photos.map(({ fileName, url }) => ({ fileName, url })),
    },
    colours,
  })
}
