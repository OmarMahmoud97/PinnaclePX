import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { Layout } from '@/lib/preview/descriptors'

type Props = Readonly<{
  company: string
  headline: string | null
  photo: string | null
  // The fill every design's buttons carry; null until the tokens stage has derived it.
  fill: string | null
  // The arrangement of the template's first screen; null until the select stage has named it.
  layout: Layout | null
}>

// A design in miniature, drawn only from what the status poll has released (plan 8.2): the
// business's name in its bar, the picture in its first image slot, its headline, and a button in
// its colour, placed as its template places them from the moment the select stage names it. A
// part not yet made is a plain shape where it will land, so the poster fills as the stages
// settle and never shows a word or a picture the build has not made. Decoration: the link or the
// row around it carries the design's name, so the whole poster is hidden from the screen reader,
// and its picture is never the largest paint of the page (lazy, sized to the poster). Its rules
// are app/_styles/design-poster.css, which each route that draws a poster imports.
export function DesignPoster({ company, headline, photo, fill, layout }: Props) {
  return (
    <span
      aria-hidden="true"
      data-layout={layout ?? undefined}
      className="design-poster"
      style={fill === null ? undefined : ({ '--poster-fill': fill } as CSSProperties)}
    >
      <span className="design-poster-page">
        <span className="design-poster-bar">
          <span className="design-poster-mark" />
          <span className="design-poster-name">{company}</span>
        </span>
        <span className="design-poster-photo">
          {photo !== null && (
            <Image src={photo} alt="" fill sizes="(min-width: 40rem) 196px, 84px" />
          )}
        </span>
        {headline !== null && <span className="design-poster-headline">{headline}</span>}
        <span className="design-poster-lines" />
        <span className="design-poster-button" />
      </span>
    </span>
  )
}
