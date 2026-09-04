import { z } from 'zod'
import { PALETTE_IDS } from '@/lib/brief/palettes'
import { STYLE_IDS } from '@/lib/brief/styles'

// A picture the visitor uploaded from the browser straight to Blob: its name for the record and
// its public URL for the pipeline. The bytes never pass through a function.
const uploadedFile = z.object({ fileName: z.string().min(1), url: z.string().url() })

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
