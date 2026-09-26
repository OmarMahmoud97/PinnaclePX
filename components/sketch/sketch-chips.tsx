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

// Which answers are in, as the sentence a screen reader gets in place of the drawing.
export function SketchChips({
  answers,
  answered,
  labels = questionLabels(answers),
  prefix = 'Your brief so far',
}: Props) {
  const given = labels.slice(0, answered)

  return (
    <p className="sr-only">
      {given.length === 0 ? `${prefix} is empty.` : `${prefix}: ${given.join(', ')}.`}
    </p>
  )
}
