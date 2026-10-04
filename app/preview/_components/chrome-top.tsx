'use client'

import { useEffect, useRef } from 'react'
import { type LenisClass, onActiveLenis } from '@/lib/motion/lenis'

// How much of the studio bar is still on the screen, as --chrome-top on the column that holds
// the bar and the design (decision 22, docs/template-fit-decisions.md). The bar scrolls away
// with the page, as designed; a design whose header is fixed to the top (Ember, Harbor, Summit,
// Vector) starts that header, and its full-screen sheets, this far down, so it never covers the
// way back or the call. It is the bar's whole height at the top of the page (the column sets
// that before this runs, so the first paint is right) and 0 once the bar has gone. Read once a
// frame on the browser's own scrolling, and on each of the site's glide's frames as it moves
// the page, so the header keeps pace with the bar under a wheel too.
export function ChromeTop() {
  const mark = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const bar = mark.current?.parentElement
    const column = bar?.parentElement
    if (bar === null || bar === undefined || column === null || column === undefined) return
    const measure = () => {
      const shown = Math.max(0, Math.ceil(bar.getBoundingClientRect().bottom))
      column.style.setProperty('--chrome-top', `${String(shown)}px`)
    }
    let frame = 0
    const schedule = () => {
      if (frame !== 0) return
      frame = requestAnimationFrame(() => {
        frame = 0
        measure()
      })
    }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    let following: InstanceType<LenisClass> | undefined
    const unsubscribe = onActiveLenis((lenis) => {
      following?.off('scroll', measure)
      lenis?.on('scroll', measure)
      following = lenis
    })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      unsubscribe()
      following?.off('scroll', measure)
    }
  }, [])

  return <span ref={mark} hidden />
}
