'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics/events'
import { CONFIG } from '@/lib/config'

// The sections whose first appearance on screen is worth counting. Ids match app/page.tsx.
const SECTION_IDS = [
  'work',
  'included',
  'how-it-works',
  'real-build',
  'your-options',
  'straight-answers',
  'about',
  'faq',
  'cta',
] as const

// The same clock as the scroll choreography's own fail-safe (app/_components/motion/index.ts).
// Every tick it shows what the viewport has reached and the observer has not: a list whose top
// is inside the viewport (a fragment landing, a browser that never fires the observer, a group
// parked on the bottom edge). A list still below the fold is left for the observer, or for the
// choreography, whichever gets there first: a visitor who reads Work for a while must still meet
// every entrance further down, which a page-wide clock would have consumed unseen. A print is
// covered in CSS (app/globals.css), whatever the clock.
const REVEAL_FAIL_SAFE_MS = CONFIG.motion.choreo.settleFailSafeMs

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

    const pending = new Set<Element>()
    const show = (element: Element) => {
      element.setAttribute('data-inview', '')
      reveals.unobserve(element)
      pending.delete(element)
    }
    const reveals = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) show(entry.target)
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    for (const element of document.querySelectorAll('[data-reveal]')) {
      const box = element.getBoundingClientRect()
      const onScreen = box.top < window.innerHeight && box.bottom > 0
      if (onScreen) element.setAttribute('data-inview', '')
      else {
        pending.add(element)
        reveals.observe(element)
      }
    }
    document.documentElement.setAttribute('data-motion', '')
    // Reached and still hidden: shown anyway, so a list can never stay hidden where the visitor
    // is looking. Below the fold is not "reached", so the clock never runs ahead of the visitor.
    const showReached = () => {
      for (const element of pending) {
        if (element.getBoundingClientRect().top < window.innerHeight) show(element)
      }
      if (pending.size === 0) window.clearInterval(failSafe)
    }
    const failSafe = window.setInterval(showReached, REVEAL_FAIL_SAFE_MS)

    return () => {
      window.clearInterval(failSafe)
      views.disconnect()
      reveals.disconnect()
      document.documentElement.removeAttribute('data-motion')
    }
  }, [])

  return null
}
