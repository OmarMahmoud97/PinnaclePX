'use client'

import { useEffect } from 'react'

// The source watched every animated wrapper with an IntersectionObserver (its motion library's
// whileInView, once, with no margin) and played the wrapper's entrance the first time any part
// of it came into view. This does the same: it marks each block shown the first time it enters,
// and the stylesheet (ember.css) plays the entrance. Under reduced motion nothing is hidden, so
// nothing needs marking; without a script nothing is hidden either.
export function EmberReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector('.ember')
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
