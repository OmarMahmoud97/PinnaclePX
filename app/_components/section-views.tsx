'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics/events'
import { CONFIG } from '@/lib/config'

// The sections whose first appearance on screen is worth counting. Ids match app/page.tsx.
const SECTION_IDS = ['how-it-works', 'taster', 'straight-answers', 'about', 'faq'] as const

// Records each listed section once, the first time enough of it is on screen. Renders nothing.
export function SectionViews() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          trackEvent('section_view', { id: entry.target.id })
          observer.unobserve(entry.target)
        }
      },
      { threshold: CONFIG.analytics.sectionViewThreshold },
    )
    for (const id of SECTION_IDS) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}
