import { Check, Circle } from 'lucide-react'
import { paletteFor } from '@/lib/brief/palettes'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'
import { styleFor } from '@/lib/brief/styles'

type Props = {
  answers: Answers
  answered: number
  // One short label per step, in order, where the steps are not the questionnaire's own: the home
  // page's walkthrough keeps a step list of its own. By default, the questionnaire's labels, drawn
  // from the answers.
  labels?: readonly string[] | undefined
  // Whose brief the screen reader hears about: "Your brief so far" or "A client's brief so far".
  prefix?: string | undefined
  chipsClassName?: string | undefined
  // False draws the sentence alone. The hero puts the clients' logos under the sketch where the
  // chips would go, and a screen reader still needs the brief in words.
  chips?: boolean
}

// One short label per question, in the questionnaire's order: the answer itself where it is short
// enough to show.
function questionLabels(answers: Answers): readonly string[] {
  const { imagery, colours } = answers
  const company = answers.company.trim()
  const name = company === '' ? 'Business name' : company
  const photos = imagery.photos.length
  const style = styleFor(imagery.style).label
  const labels = {
    describe: 'Sentence',
    brand: answers.logo.kind === 'file' ? `${name}, logo` : name,
    imagery:
      photos === 0 ? style : `${style}, ${String(photos)} ${photos === 1 ? 'photo' : 'photos'}`,
    colours:
      colours.kind === 'palette'
        ? paletteFor(colours.paletteId).label
        : colours.hex.trim() || 'Colours',
    details: 'Your details',
  } as const
  return QUESTION_IDS.map((id) => labels[id])
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
  labels = questionLabels(answers),
  prefix = 'Your brief so far',
  chipsClassName = '',
  chips = true,
}: Props) {
  const given = labels.slice(0, answered)

  return (
    <>
      <p className="sr-only">
        {given.length === 0 ? `${prefix} is empty.` : `${prefix}: ${given.join(', ')}.`}
      </p>
      {chips && (
        <ul
          aria-hidden="true"
          className={`flex flex-wrap justify-center gap-1.5 ${chipsClassName}`}
        >
          {labels.map((label, index) => {
            const done = index < answered
            return (
              // A plain template, not cn(): tailwind-merge reads text-label as a colour and would
              // drop it for the chip's colour class, leaving the chips at body size.
              <li
                key={index}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-label wrap-anywhere transition-colors duration-(--motion-enter) ${done ? 'bg-surface-muted text-on-surface' : 'bg-on-surface/6 text-on-surface-muted'}`}
              >
                {done ? (
                  <Check className="size-3 shrink-0 text-brand-ink" />
                ) : (
                  <Circle className="size-3 shrink-0 opacity-70" />
                )}
                {label}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
