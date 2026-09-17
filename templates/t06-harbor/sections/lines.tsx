import { Fragment, type ReactNode } from 'react'
import type { Lines } from '../copy-slots'

type Props = { heading: Lines }

// A heading over its lines with the lit phrase in the accent, as the source's headings break
// with <br /> and wrap one phrase in a coloured span. A phrase not found in any line leaves
// the heading plain.
export function HeadingLines({ heading }: Props) {
  return heading.lines.map((line, index) => (
    <Fragment key={`${String(index)} ${line}`}>
      {index > 0 && <br />}
      {lit(line, heading.emphasis)}
    </Fragment>
  ))
}

function lit(line: string, emphasis: string): ReactNode {
  if (emphasis === '') return line
  const at = line.indexOf(emphasis)
  if (at === -1) return line
  return (
    <>
      {line.slice(0, at)}
      <span className="text-brand-deeper">{emphasis}</span>
      {line.slice(at + emphasis.length)}
    </>
  )
}
