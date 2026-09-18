'use client'

import { type CSSProperties, type MouseEvent, useRef } from 'react'
import type { VectorContent } from '../copy-slots'
import { pad } from '../styles'

type Props = { items: VectorContent['services']['items']; href: string }

// Whether the pointer is nearer the top edge of a row or its bottom edge, as the source
// decided the edge its lit face slid in over.
function edge(event: MouseEvent<HTMLElement>): 'top' | 'bottom' {
  const box = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - box.left
  const y = event.clientY - box.top
  const toTop = (x - box.width / 2) ** 2 + y ** 2
  const toBottom = (x - box.width / 2) ** 2 + (y - box.height) ** 2
  return toTop < toBottom ? 'top' : 'bottom'
}

// The source's flowing menu: a row per service under a hairline, the name in the light face.
// Under the pointer a face in the page's ink is set at once beyond the edge the pointer
// entered by (its inside set beyond the other), then both slide to rest over 0.6s on the
// source's expo curve so the inverse name and an arrow stay put; the name's letters hop up
// and settle one after another; and when the pointer leaves, the letters are put back and
// the face slides out over the edge it leaves by. The source did this with GSAP's set and
// tweens; here the set is an instant style and the tween a transition (vector.css). The source
// also meant each row to slide in from the left as it came into view, but its trigger was
// measured before the pinned sentence's spacer pushed the rows a screen and a half down, so
// the slide finished off screen and a reader never saw it; the rows simply stand here.
function Row({ title, href, index }: { title: string; href: string; index: number }) {
  const face = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const place = (side: 'top' | 'bottom') => {
    const f = face.current
    const i = inner.current
    if (f === null || i === null) return
    f.style.transition = 'none'
    i.style.transition = 'none'
    f.style.translate = side === 'top' ? '0 -101%' : '0 101%'
    i.style.translate = side === 'top' ? '0 101%' : '0 -101%'
    f.getBoundingClientRect()
    f.style.transition = ''
    i.style.transition = ''
  }
  return (
    <div
      ref={row}
      className="vector-row relative overflow-hidden border-t border-on-surface/10"
      onMouseEnter={(event) => {
        place(edge(event))
        if (face.current) face.current.style.translate = '0 0'
        if (inner.current) inner.current.style.translate = '0 0'
        row.current?.setAttribute('data-lit', '')
      }}
      onMouseLeave={(event) => {
        const side = edge(event)
        row.current?.removeAttribute('data-lit')
        if (face.current) face.current.style.translate = side === 'top' ? '0 -101%' : '0 101%'
        if (inner.current) inner.current.style.translate = side === 'top' ? '0 101%' : '0 -101%'
      }}
    >
      <a
        href={href}
        className={`flex cursor-pointer items-center justify-between ${pad} py-8 md:py-10`}
      >
        <span className="text-[clamp(1.5rem,4vw,4rem)] font-light tracking-tight text-on-surface">
          {title}
        </span>
      </a>
      <div
        ref={face}
        aria-hidden="true"
        className="vector-row-face pointer-events-none absolute inset-0 overflow-hidden bg-on-surface"
        style={{ translate: '0 101%' }}
      >
        <div
          ref={inner}
          className={`vector-row-inner flex h-full items-center justify-between ${pad}`}
          style={{ translate: '0 -101%' }}
        >
          <span className="text-[clamp(1.5rem,4vw,4rem)] font-light tracking-tight text-surface">
            {Array.from(title).map((letter, i) => (
              <span
                key={`${String(index)}-${String(i)}`}
                className="vector-letter inline-block"
                style={
                  {
                    '--i': String(i),
                    whiteSpace: letter === ' ' ? 'pre' : undefined,
                  } as CSSProperties
                }
              >
                {letter}
              </span>
            ))}
          </span>
          <svg
            className="h-8 w-8 text-surface md:h-12 md:w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 17L17 7M17 7H7M17 7V17"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export function VectorMenu({ items, href }: Props) {
  return (
    <div id="services-menu" className="w-full scroll-mt-25 pb-24">
      <div className="w-full">
        {items.map((title, index) => (
          <Row key={title} title={title} href={href} index={index} />
        ))}
        <div className="border-t border-on-surface/10" />
      </div>
    </div>
  )
}
