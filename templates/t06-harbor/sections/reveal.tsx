'use client'

import { useEffect } from 'react'

// The source watched every block with an IntersectionObserver (its motion library's useInView:
// once, with a margin per block) and played the block's entrance the first time it came into
// view. This does the same: it marks each block shown the first time it enters, at the margin
// the block names, and the stylesheet (harbor.css) plays the entrance. Under reduced motion
// nothing is hidden, so nothing needs marking; without a script nothing is hidden either.
export function HarborReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector('.harbor')
    if (root === null) return
    const observers = new Map<string, IntersectionObserver>()
    for (const block of root.querySelectorAll<HTMLElement>('[data-fade]')) {
      const margin = block.dataset.margin ?? '0px'
      let observer = observers.get(margin)
      if (observer === undefined) {
        observer = new IntersectionObserver(
          (entries, self) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue
              if (entry.target instanceof HTMLElement) entry.target.dataset.shown = ''
              self.unobserve(entry.target)
            }
          },
          { rootMargin: margin },
        )
        observers.set(margin, observer)
      }
      observer.observe(block)
    }
    return () => {
      for (const observer of observers.values()) observer.disconnect()
    }
  }, [])
  return null
}
