import type { CSSProperties } from 'react'
import iconL from './icon-l.png'
import iconR from './icon-r.png'

type Props = { side: 'left' | 'right' }

// The source's two laurel marks either side of About's eyebrow: its own 22 by 27 pixel
// pictures, drawn at 16 by 16 as it drew them. Each is a mask over the text colour rather than
// a picture, so a brand's set recolours it and it shows on a dark surface as well.
export function Ornament({ side }: Props) {
  const url = `url(${side === 'left' ? iconL.src : iconR.src})`
  const style: CSSProperties = {
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: '100% 100%',
    WebkitMaskSize: '100% 100%',
  }
  return (
    <span aria-hidden="true" className="inline-block size-4 shrink-0 bg-on-surface" style={style} />
  )
}
