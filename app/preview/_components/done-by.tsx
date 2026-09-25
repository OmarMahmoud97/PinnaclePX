'use client'

import { useSyncExternalStore } from 'react'
import { usePassed } from '@/app/preview/_components/use-passed'

type Props = Readonly<{
  deadlineAt: string
  // The time line's words (deadline-words.ts): either side of the time, the delay line, and the
  // quiet line under it.
  words: Readonly<{ before: string; after: string; late: string; keep: string }>
}>

// "14:32": a moment on the visitor's own clock, in the 24-hour form the site writes times in.
const CLOCK = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function subscribeNothing(): () => void {
  return () => undefined
}

// When the designs are usually done, "Usually done by 14:32.", and past that moment the delay line
// in its place, with what to do under it as a small muted line, so the time's own voice stays a
// short one (docs/start-page-journey-plan.md, 4.6 and 4.9). The server knows neither the
// visitor's time zone nor the moment the page is read, so it renders nothing here, and the browser
// fills the line in once it has hydrated. Nothing ticks: the one timer is set for the deadline,
// when the line changes.
export function DoneBy({ deadlineAt, words }: Props) {
  const due = Date.parse(deadlineAt)
  const time = useSyncExternalStore(
    subscribeNothing,
    () => CLOCK.format(due),
    () => null,
  )
  const passed = usePassed(due)
  if (passed) {
    return (
      <>
        {words.late}
        <span className="block text-small font-normal text-on-surface-muted">{words.keep}</span>
      </>
    )
  }
  return time === null ? null : `${words.before}${time}${words.after}`
}
