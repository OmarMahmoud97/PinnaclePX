'use client'

import { useEffect } from 'react'
import { whenScrolled } from '@/lib/motion/idle'

// The pointer, a focus or a touch inside the section: each says the visitor is about to reach
// for a switch.
const INTENT = ['pointerover', 'focusin', 'touchstart'] as const

// The Work switch's one client leaf (ADR 0039). It rides the initial bundle, so it holds only
// the trigger: the controller arrives as a lazy chunk on the first scroll intent or the first
// pointer, focus or touch inside #work, never on idle alone (Lighthouse must not load it). A
// change made before it arrives is the plain CSS swap, which is complete on its own. It is not
// gated on reduced motion: there the controller runs its still path (a decode hold and an
// opacity arrival), which is allowed motion.
export function WorkMorph() {
  useEffect(() => {
    const section = document.getElementById('work')
    const list = section?.querySelector<HTMLElement>('[data-choreo="tiles"]')
    if (section === null || list === null || list === undefined) return
    let cancelled = false
    let stop: (() => void) | undefined
    const load = () => {
      cancelScroll()
      for (const type of INTENT) section.removeEventListener(type, load)
      import('@/app/_components/work-morph-controller')
        .then(({ start }) => {
          if (!cancelled) stop = start(list)
        })
        .catch(() => {
          // The chunk never arrived: the CSS swap carries the switch.
        })
    }
    const cancelScroll = whenScrolled(load)
    for (const type of INTENT) section.addEventListener(type, load, { passive: true })
    return () => {
      cancelled = true
      cancelScroll()
      for (const type of INTENT) section.removeEventListener(type, load)
      stop?.()
    }
  }, [])
  return null
}
