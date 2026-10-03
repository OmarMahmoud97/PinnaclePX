import type { ReactNode } from 'react'
import { fitWord } from '../fit'

type Props = { text: string; children: ReactNode }

// A heading's words at the heading's own size, or smaller where its longest word would not fit
// its width (fit.ts; atlas.css, .atlas-fit). The heading around it is the @container.
export function Fitted({ text, children }: Props) {
  return (
    <span className="atlas-fit" style={fitWord(text)}>
      {children}
    </span>
  )
}
