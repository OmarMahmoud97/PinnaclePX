'use client'

import { useEffect, useRef, useState } from 'react'

type Props = { value: string; className: string }

type Figure = Readonly<{ prefix: string; target: number; grouped: boolean; suffix: string }>

// A figure's leading number, whether it groups its thousands, and what surrounds it; nothing
// when the value is a phrase.
function parse(value: string): Figure | null {
  const match = /^(\D*)(\d{1,3}(?:,\d{3})+|\d+)(.*)$/.exec(value)
  if (match === null) return null
  const [, prefix = '', digits = '', suffix = ''] = match
  return { prefix, target: Number(digits.replace(/,/g, '')), grouped: digits.includes(','), suffix }
}

// The source's 2.2 seconds, easing out as a cubic.
const DURATION = 2200

// The source counted each figure up from zero the first time it came into view, sixty pixels
// in. So does this, and the final text is always the value as written; a phrase, which the copy
// stage writes on a visitor's page, stands as it is, and so does a figure under reduced motion.
export function HarborCount({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [text, setText] = useState(value)

  useEffect(() => {
    const figure = parse(value)
    const el = ref.current
    if (figure === null || el === null) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const observer = new IntersectionObserver(
      (entries, self) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        self.disconnect()
        const started = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - started) / DURATION, 1)
          if (t >= 1) {
            setText(value)
            return
          }
          const n = Math.round(figure.target * (1 - (1 - t) ** 3))
          const digits = figure.grouped ? n.toLocaleString('en-US') : String(n)
          setText(`${figure.prefix}${digits}${figure.suffix}`)
          frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { rootMargin: '-60px' },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}
