'use client'

import { useEffect } from 'react'

// The source watched every animated part with an IntersectionObserver (its motion library's
// whileInView, once, with no margin) and played the part's entrance the first time any of it
// came into view. This does the same: it marks each block shown the first time it enters, and
// the stylesheet (summit.css) plays the entrance. Under reduced motion nothing is hidden, so
// nothing needs marking; without a script nothing is hidden either.
export function SummitReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector('.summit')
    if (root === null) return
    const observer = new IntersectionObserver((entries, self) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        if (entry.target instanceof HTMLElement) entry.target.dataset.shown = ''
        self.unobserve(entry.target)
      }
    })
    for (const block of root.querySelectorAll('[data-fade]')) observer.observe(block)
    return () => {
      observer.disconnect()
    }
  }, [])
  return null
}
