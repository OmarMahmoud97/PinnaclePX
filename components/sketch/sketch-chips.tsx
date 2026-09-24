import { Check, Circle } from 'lucide-react'
import { paletteFor } from '@/lib/brief/palettes'
import { type QuestionId, QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'
import { styleFor } from '@/lib/brief/styles'
import { cn } from '@/lib/cn'

type Props = {
  answers: Answers
  answered: number
  // Whose brief the screen reader hears about: "Your brief so far" or "A client's brief so far".
  prefix?: string | undefined
  chipsClassName?: string | undefined
  // False draws the sentence alone. The hero puts the clients' logos under the sketch where the
  // chips would go, and a screen reader still needs the brief in words.
  chips?: boolean
}

// One short label per question: the answer itself where it is short enough to show.
function labelsFor(answers: Answers): Readonly<Record<QuestionId, string>> {
  const { imagery, colours } = answers
  const company = answers.company.trim()
  const photos = imagery.photos.length
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

// Which answers are in, as chips beside or under the sketch, plus the sentence a screen reader
// gets in place of the drawing. No edge on a chip: a given answer is a filled chip with the
// product's blue tick; a pending one sits on a faint neutral fill with an open ring where the
// tick goes, so the list reads as a checklist rather than a row of links, every word starts at
// the same x in the column, and the two differ by mark, never by colour alone. The marks never
// shrink, so a long answer wraps inside its chip rather than squeezing its tick or pushing the
// list wider.
export function SketchChips({
  answers,
  answered,
  prefix = 'Your brief so far',
  chipsClassName,
  chips = true,
}: Props) {
  const labels = labelsFor(answers)
  const given = QUESTION_IDS.slice(0, answered).map((id) => labels[id])

  return (
    <>
      <p className="sr-only">
        {given.length === 0 ? `${prefix} is empty.` : `${prefix}: ${given.join(', ')}.`}
      </p>
      {chips && (
        <ul
          aria-hidden="true"
          className={cn('flex flex-wrap justify-center gap-1.5', chipsClassName)}
        >
          {QUESTION_IDS.map((id, index) => {
            const done = index < answered
            return (
              // A plain template, not cn(): tailwind-merge reads text-label as a colour and would
              // drop it for the chip's colour class, leaving the chips at body size.
              <li
                key={id}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-label wrap-anywhere transition-colors duration-(--motion-enter) ${done ? 'bg-surface-muted text-on-surface' : 'bg-on-surface/6 text-on-surface-muted'}`}
              >
                {done ? (
                  <Check className="size-3 shrink-0 text-brand-ink" />
                ) : (
                  <Circle className="size-3 shrink-0 opacity-70" />
                )}
                {labels[id]}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
