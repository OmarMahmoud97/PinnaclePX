import type { Dispatch } from 'react'
import type { BriefAction, Errors } from '@/app/start/_components/brief-reducer'
import type { Answers } from '@/lib/brief/schema'

// A picture the visitor picked, logo or photo, as a step shows it: its id and name from the
// answers, the URL to draw it from (the browser's own object URL while the file is in memory,
// the Blob URL after a refresh), and how its upload is going.
type UploadStatus = 'uploading' | 'done' | 'failed'

export type LocalImage = Readonly<{ id: string; name: string; url: string; status: UploadStatus }>

// Every question renders from the same three things: what has been answered, what went wrong,
// and how to record a change.
export type StepProps = {
  answers: Answers
  errors: Errors
  dispatch: Dispatch<BriefAction>
}
