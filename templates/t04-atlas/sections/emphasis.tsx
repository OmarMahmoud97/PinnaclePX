import type { Emphasised } from '../copy-slots'
import { headerGradientText } from '../styles'

type Props = { heading: Emphasised }

// A heading with its emphasised phrase set in the source's header gradient, the way it lights
// two or three words. The phrase is found in the text; absent, the text is set plain.
export function Emphasis({ heading }: Props) {
  const { text, emphasis } = heading
  const start = emphasis === '' ? -1 : text.indexOf(emphasis)
  if (start === -1) return <>{text}</>
  const end = start + emphasis.length
  return (
    <>
      {text.slice(0, start)}
      <span className={headerGradientText}>{emphasis}</span>
      {text.slice(end)}
    </>
  )
}
