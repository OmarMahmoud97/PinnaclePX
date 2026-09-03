import type { Dispatch } from 'react'
import type { BriefAction, Errors } from '@/app/start/_components/brief-reducer'
import type { Answers } from '@/lib/brief/schema'

// An image the visitor picked, logo or photo: its name for the brief, and an object URL for
// showing it. The bytes stay in the browser until the pipeline's upload lands.
export type LocalImage = Readonly<{ name: string; url: string }>

// Every question renders from the same three things: what has been answered, what went wrong,
// and how to record a change.
export type StepProps = {
  answers: Answers
  errors: Errors
  dispatch: Dispatch<BriefAction>
}
