'use client'

import { type CSSProperties, type ReactNode, useState } from 'react'

type Props = { picture: ReactNode; children: ReactNode; style: CSSProperties }

// The source's dish card: its animated wrapper carried a pointer-enter handler that added a
// half turn to the picture each time, and the picture turned there on a spring and stayed, so
// the turns add up and a dish never turns back. The count is state here and the turn is a
// transition on the spring's own curve (ember.css), off under reduced motion. The card is the
// wrapper, so it rises with the others.
export function EmberDish({ picture, children, style }: Props) {
  const [turns, setTurns] = useState(0)
  return (
    <div
      data-fade="up-md"
      style={style}
      className="flex shrink-0 cursor-pointer flex-col items-center text-center"
      onMouseEnter={() => {
        setTurns((count) => count + 1)
      }}
    >
      <div className="ember-spin" style={{ '--turns': String(turns) } as CSSProperties}>
        {picture}
      </div>
      {children}
    </div>
  )
}
