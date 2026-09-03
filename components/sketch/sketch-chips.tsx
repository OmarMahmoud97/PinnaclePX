import { Check } from 'lucide-react'
import { paletteFor } from '@/lib/brief/palettes'
import { type QuestionId, QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'
import { styleFor } from '@/lib/brief/styles'
import { cn } from '@/lib/cn'

type Props = {
  answers: Answers
  answered: number
  // Whose brief the screen reader hears about: "Your brief so far" or "Example brief so far".
  prefix?: string | undefined
  chipsClassName?: string | undefined
}

// One short label per question: the answer itself where it is short enough to show.
function labelsFor(answers: Answers): Readonly<Record<QuestionId, string>> {
  const { imagery, colours } = answers
  const company = answers.company.trim()
  const photos = imagery.fileNames.length
  const style = styleFor(imagery.style).label
  return {
    describe: 'Sentence',
    details: company === '' ? 'Company' : company,
    logo: answers.logo.kind === 'file' ? 'Logo' : 'Wordmark',
    imagery:
      photos === 0 ? style : `${style}, ${String(photos)} ${photos === 1 ? 'photo' : 'photos'}`,
    colours:
      colours.kind === 'palette'
        ? paletteFor(colours.paletteId).label
        : colours.hex.trim() || 'Colours',
  }
}

// Which answers are in, as chips under the sketch, plus the sentence a screen reader gets in
// place of the drawing.
export function SketchChips({
  answers,
  answered,
  prefix = 'Your brief so far',
  chipsClassName,
}: Props) {
  const labels = labelsFor(answers)
  const given = QUESTION_IDS.slice(0, answered).map((id) => labels[id])

  return (
    <>
      <p className="sr-only">
        {given.length === 0 ? `${prefix} is empty.` : `${prefix}: ${given.join(', ')}.`}
      </p>
      <ul
        aria-hidden="true"
        className={cn('flex flex-wrap justify-center gap-1.5', chipsClassName)}
      >
        {QUESTION_IDS.map((id, index) => {
          const done = index < answered
          return (
            <li
              key={id}
              className={cn(
                'flex items-center gap-1 rounded-full border bg-surface px-2.5 py-0.5 text-[11px] transition-colors duration-(--motion-enter)',
                done
                  ? 'border-border text-on-surface'
                  : 'border-dashed border-border text-on-surface-muted',
              )}
            >
              {done && <Check className="size-3 text-success" />}
              {labels[id]}
            </li>
          )
        })}
      </ul>
    </>
  )
}
