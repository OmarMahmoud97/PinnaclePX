import type { Dispatch } from 'react'
import type { BriefAction, Errors } from '@/app/start/_components/brief-reducer'
import type { Answers } from '@/lib/brief/schema'
import type { LogoPolarity } from '@/lib/logo/types'

// A picture the visitor picked, logo or photo, as a step shows it: its id and name from the
// answers, the URL to draw it from (the browser's own object URL while the file is in memory,
// the Blob URL after a refresh), and how its upload is going, which includes the moment the
// browser reads and downscales it before sending (logo-sampler.ts).
type UploadStatus = 'uploading' | 'done' | 'failed'

export type LocalImage = Readonly<{ id: string; name: string; url: string; status: UploadStatus }>

// The logo as the browser read it: light or dark artwork, and its own colour if it has one. Both
// null until it is read, and after a refresh, when only its Blob URL is left.
export type LocalLogo = LocalImage &
  Readonly<{ polarity: LogoPolarity | null; accent: string | null }>

// The mark beside the business name at question two: their name, or their logo.
export type Mark = 'name' | 'logo'

// Every question renders from the same three things: what has been answered, what went wrong,
// and how to record a change.
export type StepProps = {
  answers: Answers
  errors: Errors
  dispatch: Dispatch<BriefAction>
}
