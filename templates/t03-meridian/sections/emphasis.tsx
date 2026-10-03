import type { Emphasised } from '../copy-slots'
import { gradientText } from '../styles'

type Props = { heading: Emphasised; padding: 'px-2' | 'pl-2' }

// A heading with its emphasised phrase set in the gradient, as the source's hero (padded both
// sides) and ask (padded left) set one word. The source's markup leaves no space around the
// span and lets its padding stand in, so the spaces beside the phrase are dropped here too, and
// a line may still break where they were: without a space the phrase's neighbours joined it
// into one long word ("somethingsorted?") that ran off a 320px phone. The phrase is found in the
// text; absent, the text is set plain.
export function Emphasis({ heading, padding }: Props) {
  const { text, emphasis } = heading
  const start = emphasis === '' ? -1 : text.indexOf(emphasis)
  if (start === -1) return <>{text}</>
  const end = start + emphasis.length
  return (
    <>
      {text.slice(0, start).trimEnd()}
      <wbr />
      <span className={`${gradientText} ${padding}`}>{emphasis}</span>
      <wbr />
      {padding === 'px-2' ? text.slice(end).trimStart() : text.slice(end)}
    </>
  )
}
