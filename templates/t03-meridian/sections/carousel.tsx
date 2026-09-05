'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { button } from '../styles'

type Props = { children: React.ReactNode }

// The source's Carousel, which Embla drove: a track of slides a third wide from lg, and a round
// outline button at each side that moves it one slide. Here the track is a snapping scroller
// and the buttons scroll it, so the slides can also be dragged.
export function Carousel({ children }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const move = (direction: -1 | 1) => {
    const track = trackRef.current
    if (track === null) return
    const slide = track.querySelector('[role="group"]')
    const width =
      slide instanceof HTMLElement ? slide.getBoundingClientRect().width : track.clientWidth
    track.scrollBy({ left: direction * width, behavior: 'smooth' })
  }
  return (
    <div
      className="relative mx-auto w-[80%] sm:w-[90%] lg:max-w-(--breakpoint-xl)"
      role="region"
      aria-roledescription="carousel"
    >
      <div
        ref={trackRef}
        tabIndex={0}
        aria-label="Slides"
        className="meridian-track snap-x snap-mandatory overflow-x-auto focus-visible:ring-2 focus-visible:ring-brand-deepest focus-visible:outline-none"
      >
        <div className="-ml-4 flex">{children}</div>
      </div>
      <button
        type="button"
        onClick={() => {
          move(-1)
        }}
        className={`${button.outlineRound} absolute top-1/2 -left-12 -translate-y-1/2`}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </button>
      <button
        type="button"
        onClick={() => {
          move(1)
        }}
        className={`${button.outlineRound} absolute top-1/2 -right-12 -translate-y-1/2`}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </button>
    </div>
  )
}
