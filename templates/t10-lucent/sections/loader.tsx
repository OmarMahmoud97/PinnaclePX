import type { CSSProperties } from 'react'
import { graphemes } from './ui'

type Props = { name: string }

// The source's splash: a sheet of the page's colour over everything, its wordmark's letters
// rising one after another out of a blur, then the sheet fading (sections/hero-entrance.ts). The
// source's wordmark was a drawing of its name; here the name is set in the heading face, one span
// a letter, at a size that gives a name of the source's length the drawing's width and keeps a
// longer one on the screen. Hidden from readers, as the source's was: the page under it carries
// the name.
export function LucentLoader({ name }: Props) {
  const letters = graphemes(name)
  const style = { '--lc-letters': letters.length } as CSSProperties
  return (
    <div className="lc-loader" aria-hidden="true">
      <p className="lc-loader__logo" style={style}>
        {letters.map((letter, index) => (
          <span key={`${String(index)}${letter}`}>{letter}</span>
        ))}
      </p>
    </div>
  )
}
