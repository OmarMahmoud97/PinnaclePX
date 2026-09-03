'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics/events'
import { CONFIG } from '@/lib/config'

// The sections whose first appearance on screen is worth counting. Ids match app/page.tsx.
const SECTION_IDS = [
  'what-you-get',
  'how-it-works',
  'taster',
  'straight-answers',
  'about',
  'faq',
  'cta',
] as const

const REVEAL_FAIL_SAFE_MS = 4000

// One observer leaf for the page. It records each listed section once, the first time enough of
// it is on screen, and it arms the list reveals: elements marked data-reveal get data-inview
// when they enter, and only once <html> carries data-motion does the CSS hide them beforehand.
// Anything already on screen is marked before motion is armed, so nothing blinks, and with
// JavaScript off none of this runs and every list is simply visible.
export function PageMotion() {
  useEffect(() => {
    const views = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          trackEvent('section_view', { id: entry.target.id })
          views.unobserve(entry.target)
        }
      },
      { threshold: CONFIG.analytics.sectionViewThreshold },
    )
    for (const id of SECTION_IDS) {
      const element = document.getElementById(id)
      if (element) views.observe(element)
    }

    const reveals = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-inview', '')
          reveals.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    const pending = [...document.querySelectorAll('[data-reveal]')]
    for (const element of pending) {
      const box = element.getBoundingClientRect()
      const onScreen = box.top < window.innerHeight && box.bottom > 0
      if (onScreen) element.setAttribute('data-inview', '')
      else reveals.observe(element)
    }
    document.documentElement.setAttribute('data-motion', '')
    // Whatever the observer has not reached by then is shown anyway: a list must never stay
    // hidden because a browser, a print or a capture never scrolled.
    const failSafe = window.setTimeout(() => {
      for (const element of pending) element.setAttribute('data-inview', '')
      reveals.disconnect()
    }, REVEAL_FAIL_SAFE_MS)

    return () => {
      window.clearTimeout(failSafe)
      views.disconnect()
      reveals.disconnect()
      document.documentElement.removeAttribute('data-motion')
    }
  }, [])

  return null
}
