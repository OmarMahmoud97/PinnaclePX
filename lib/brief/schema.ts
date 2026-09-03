import { z } from 'zod'
import { PALETTE_IDS } from '@/lib/brief/palettes'
import { STYLE_IDS } from '@/lib/brief/styles'
import { CONFIG } from '@/lib/config'

// Three or six digits, with the hash. Anything else and we cannot read the visitor's colour.
const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

// One schema per question. The page validates the current question before moving on, and the
// Server Action validates the whole brief again, because the client is not a trust boundary.
export const describeSchema = z.object({
  description: z
    .string()
    .trim()
    .min(CONFIG.form.minChars, 'Tell us a little more, a sentence or two is plenty.')
    .max(CONFIG.form.maxChars, `Keep it under ${String(CONFIG.form.maxChars)} characters.`),
})

export const detailsSchema = z.object({
  name: z.string().trim().min(1, 'Tell us your name.'),
  company: z.string().trim().min(1, 'Tell us your company name.'),
  email: z.string().trim().email('That does not look like an email address.'),
})

export const logoSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('wordmark') }),
  z.object({ kind: z.literal('file'), fileName: z.string().min(1) }),
])

// A style is always chosen; photos are optional and sit alongside it.
export const imagerySchema = z.object({
  style: z.enum(STYLE_IDS),
  fileNames: z
    .array(z.string().min(1))
    .max(CONFIG.form.maxPhotos, `Up to ${String(CONFIG.form.maxPhotos)} photos.`),
})

export const coloursSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('palette'), paletteId: z.enum(PALETTE_IDS) }),
  z.object({
    kind: z.literal('custom'),
    hex: z.string().trim().regex(HEX_PATTERN, 'Use a hex code such as #2F6F4E.'),
  }),
])

// What a saved draft must look like to be restored: the right shape, but no length or format
// rules, because a draft is allowed to be half-typed.
export const draftSchema = z.object({
  description: z.string(),
  name: z.string(),
  company: z.string(),
  email: z.string(),
  logo: logoSchema,
  imagery: imagerySchema,
  colours: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('palette'), paletteId: z.enum(PALETTE_IDS) }),
    z.object({ kind: z.literal('custom'), hex: z.string() }),
  ]),
})

export const briefSchema = z.object({
  ...describeSchema.shape,
  ...detailsSchema.shape,
  logo: logoSchema,
  imagery: imagerySchema,
  colours: coloursSchema,
})

export type LogoAnswer = z.infer<typeof logoSchema>
export type ImageryAnswer = z.infer<typeof imagerySchema>
export type ColoursAnswer = z.infer<typeof coloursSchema>

// Every answer as the form holds it: the draft shape, since the form is a draft until it is sent.
export type Answers = Readonly<z.infer<typeof draftSchema>>
