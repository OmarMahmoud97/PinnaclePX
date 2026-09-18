'use client'

import { useEffect } from 'react'

// The source played a project's title and line when the card's top reached the middle of
// the screen, and reversed them when it went back above it (GSAP's play and reverse toggle
// actions). This marks each such block shown while its trigger line is past the middle and
// unmarks it when it is not; the stylesheet (vector.css) transitions both ways. Under reduced
// motion nothing is hidden, so nothing needs marking; without a script nothing is hidden.
export function VectorReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector('.vector')
    if (root === null) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const block = entry.target
          if (!(block instanceof HTMLElement)) continue
          const parts = block.querySelectorAll<HTMLElement>('[data-fade]')
          const above = entry.boundingClientRect.top < window.innerHeight / 2
          for (const part of parts) {
            if (entry.isIntersecting || above) part.dataset.shown = ''
            else delete part.dataset.shown
          }
        }
      },
      { rootMargin: '0px 0px -50% 0px' },
    )
    for (const block of root.querySelectorAll('[data-trigger]')) observer.observe(block)
    return () => {
      observer.disconnect()
    }
  }, [])
  return null
}
