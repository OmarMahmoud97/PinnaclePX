import { Check, LoaderCircle } from 'lucide-react'
import { ProgressSteps } from '@/components/ui/progress-steps'
import { QUESTION_IDS } from '@/lib/brief/question-ids'

// Mid-way through the questions: what has already happened by then. Ticks match the build
// guide: the brief is read on the sentence, designs are chosen on the logo, copy starts after.
const SHOWN_AT = 4

const STATUS = [
  { label: 'Your sentence', state: 'read', done: true },
  { label: 'Three designs', state: 'chosen for you', done: true },
  { label: 'Your copy', state: 'underway', done: false },
] as const

// Decorative picture of the form part-way through. The surrounding text carries the meaning.
export function ProgressPanel() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-md rounded-xl border border-border bg-surface-raised shadow-badge"
    >
      <div className="border-b border-border px-5 py-3">
        <ProgressSteps current={SHOWN_AT} total={QUESTION_IDS.length} />
      </div>
      <ul className="flex flex-col gap-3 p-5 text-sm">
        {STATUS.map(({ label, state, done }) => (
          <li key={label} className="flex items-center gap-3">
            {done ? (
              <Check className="size-4 text-success" />
            ) : (
              <LoaderCircle className="size-4 text-brand-deeper" />
            )}
            <span className="font-medium">{label}</span>
            <span className="text-on-surface-muted">{state}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
