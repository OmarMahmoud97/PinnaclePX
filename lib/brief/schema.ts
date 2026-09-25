import * as z from 'zod'
import { PALETTE_IDS } from '@/lib/brief/palettes'
import { STYLE_IDS } from '@/lib/brief/styles'
import { CONFIG } from '@/lib/config'
import { LOGO_POLARITIES } from '@/lib/logo/types'

// Three or six digits, with the hash. Anything else and we cannot read the visitor's colour.
const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

// One schema per question (docs/start-page-journey-plan.md, D2). The page validates the current
// question before moving on, and the Server Action validates the whole brief again, because the
// client is not a trust boundary.
export const describeSchema = z.object({
  description: z
    .string()
    .trim()
    .min(CONFIG.form.minChars, 'Tell us a little more, a sentence or two is plenty.')
    .max(CONFIG.form.maxChars, `Keep it under ${String(CONFIG.form.maxChars)} characters.`),
})

// Names are bounded (plan 7.7): every place one is shown, the sketch, the done page, the email
// and the designs, is sized for the longest the schema takes. The messages are read by the copy
// tests too (app/_components/copy-corpus.ts).
const { companyMax, personMax } = CONFIG.start.names

export const NAME_TOO_LONG = {
  name: `Keep your name to ${String(personMax)} characters.`,
  company: `Keep your business name to ${String(companyMax)} characters.`,
} as const

const company = z
  .string()
  .trim()
  .min(1, 'Tell us your business name.')
  .max(companyMax, NAME_TOO_LONG.company)

// The last question: where the designs go, and who they are for.
export const detailsSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: 'That does not look like an email address.' })),
  name: z.string().trim().min(1, 'Tell us your name.').max(personMax, NAME_TOO_LONG.name),
})

// A picture the visitor picked: a client id to tell it apart, its name, and the URL it lives at
// on Blob once the browser has uploaded it. The questions and a saved draft take one still on its
// way (a null URL), because an upload never holds up Next (plan D14); the send waits for it, and
// the brief it sends must carry the URL. A brief without one never came from the page, which
// holds the send until every picture has its URL or has been removed
// (app/start/_components/picture-holds.ts), so the rule carries no words for a visitor.
const draftFile = z.object({
  id: z.string().min(1),
  fileName: z.string().min(1),
  url: z.string().nullable(),
})
const uploadedFile = draftFile.extend({ url: z.url() })

const wordmark = z.object({ kind: z.literal('wordmark') })

// A draft's logo also keeps what the browser read in it (app/start/_components/logo-sampler.ts):
// whether its artwork is light or dark, which decides the draft's surface, and its own colour,
// which the colour question offers as a tile. Both live in the draft rather than in memory, so a
// refresh keeps a white logo on the ink it needs. A reading that does not parse is dropped, never
// the draft with it; the server reads neither, since its logo stage samples the file itself.
const draftLogo = z.discriminatedUnion('kind', [
  wordmark,
  draftFile.extend({
    kind: z.literal('file'),
    polarity: z.enum(LOGO_POLARITIES).optional().catch(undefined),
    accent: z.string().regex(HEX_PATTERN).nullable().optional().catch(undefined),
  }),
])
const draftPhotos = z.array(draftFile)
const style = z.enum(STYLE_IDS)
const tooManyPhotos = `Up to ${String(CONFIG.form.maxPhotos)} photos.`

// The second question: the business name, and the mark beside it, their logo or their name.
export const brandSchema = z.object({ company, logo: draftLogo })

// The third question: a look is always chosen; photos are optional and sit alongside it.
export const lookSchema = z.object({
  style,
  photos: draftPhotos.max(CONFIG.form.maxPhotos, tooManyPhotos),
})

const logoSchema = z.discriminatedUnion('kind', [
  wordmark,
  uploadedFile.extend({ kind: z.literal('file') }),
])

const imagerySchema = z.object({
  style,
  photos: z.array(uploadedFile).max(CONFIG.form.maxPhotos, tooManyPhotos),
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
  logo: draftLogo,
  imagery: z.object({ style, photos: draftPhotos }),
  colours: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('palette'), paletteId: z.enum(PALETTE_IDS) }),
    z.object({ kind: z.literal('custom'), hex: z.string() }),
  ]),
})

// The brief as it is sent: every question answered and every picture uploaded.
export const briefSchema = z.object({
  ...describeSchema.shape,
  company,
  ...detailsSchema.shape,
  logo: logoSchema,
  imagery: imagerySchema,
  colours: coloursSchema,
})

export type ColoursAnswer = z.infer<typeof coloursSchema>

// Every answer as the form holds it: the draft shape, since the form is a draft until it is sent.
export type Answers = Readonly<z.infer<typeof draftSchema>>

export type DraftLogo = Answers['logo']
export type DraftImagery = Answers['imagery']
export type DraftPhoto = Answers['imagery']['photos'][number]
