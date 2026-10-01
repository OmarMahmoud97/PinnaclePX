'use client'

import { useEffect } from 'react'
import { easeAnswers } from './faq'
import { liquidGlass } from './glass'
import { heroEntrance, runLoader } from './hero-entrance'
import { maskHeadings, revealAsk, riseLines } from './mask'
import { particleHeadline } from './particles'
import { magnetic, pageLinks } from './pointer'
import { featureRail } from './rail'
import { createScene } from './scene'
import { scrollMotion } from './scroll'

// The page's scripted motion, started once the page is on the screen, in the order the source's
// scripts set theirs going. Under reduced motion only what the source kept runs: the splash shows
// the name still for a moment, the bar's glass and tint, the page's tint, the rail, the questions
// (opening at once), the heading of particles shown whole, and the links that scroll the page;
// every entrance and scrub stays still, and the stylesheet shows each block at rest.
export function LucentMotion() {
  useEffect(() => {
    const root = document.querySelector('.lucent')
    if (root === null) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = createScene()

    const splash = runLoader(root, scene, reduce)
    pageLinks(root, scene, reduce)
    if (!reduce) magnetic(root, scene)
    featureRail(root, scene, reduce)
    easeAnswers(root, scene, reduce)
    particleHeadline(root, scene, reduce)
    liquidGlass(root, scene)
    scrollMotion(root, scene, reduce)
    if (!reduce) {
      maskHeadings(root, scene)
      revealAsk(root, scene)
      riseLines(root, scene)
      heroEntrance(root, scene, splash)
    }

    const toTop = root.querySelector('[data-to-top]')
    if (toTop !== null) {
      scene.on(toTop, 'click', () => {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
      })
    }

    return () => {
      scene.stop()
    }
  }, [])
  return null
}
