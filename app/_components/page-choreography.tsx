'use client'

import { useEffect } from 'react'
import type { Motion } from '@/app/_components/motion'
import { loadGsap, loadScrollTrigger } from '@/lib/motion/gsap'
import { whenScrolled } from '@/lib/motion/idle'
import { useMotionAllowed } from '@/lib/motion/use-motion-allowed'

// From md up ScrollTrigger rides along; below it phones get GSAP core and entrances only (D5).
const WIDE = '(min-width: 48rem)'

// The one client leaf of the scroll choreography below the hero (ADR 0034). It is small on
// purpose, because it rides the initial bundle: the gate, the trigger and one dynamic import.
// Everything authored lives in app/_components/motion and arrives as a lazy chunk with GSAP.
// The trigger is the first sign of scrolling and nothing else: an observer on #work nearing
// the viewport was tried and fires at load on a tall phone, where the hero's content runs past
// one screen, and again when a tool resizes the viewport to the page's height for a capture,
// which is exactly the audit whose script total (lighthouserc.json) must never carry these
// chunks. A wheel tick or a touch lands a frame or two before the scroll it causes, so the
// chunks are usually in before the first owned group's trigger line; when they are not, the
// CSS reveal takes that group and the choreography begins with the next. A window that armed
// narrow and is widened past md later starts again with ScrollTrigger, so its groups are
// claimed rather than left to a CSS reveal the stylesheet has stepped back from. Reduced motion
// never mounts the leaf; a chunk that never arrives leaves the CSS reveal and the finished
// server markup to carry the page.
export function PageChoreography() {
  const motionAllowed = useMotionAllowed()

  useEffect(() => {
    if (!motionAllowed) return
    const main = document.getElementById('main')
    if (main === null) return
    let cancelled = false
    let stop: (() => void) | undefined
    let generation = 0
    let unwatch: (() => void) | undefined
    const boot = (wide: boolean) => {
      const mine = ++generation
      const motion: Promise<Motion> = wide
        ? loadScrollTrigger()
        : loadGsap().then((gsap) => ({ gsap, ScrollTrigger: undefined }))
      Promise.all([motion, import('@/app/_components/motion')])
        .then(([loaded, { start }]) => {
          if (cancelled || mine !== generation) return
          stop?.()
          stop = start(main, loaded)
        })
        .catch(() => {
          // GSAP never arrived: the CSS reveal and the finished states carry the page.
        })
    }
    const cancel = whenScrolled(() => {
      const query = window.matchMedia(WIDE)
      boot(query.matches)
      if (query.matches) return
      const onChange = () => {
        if (!query.matches) return
        unwatch?.()
        boot(true)
      }
      query.addEventListener('change', onChange)
      unwatch = () => {
        query.removeEventListener('change', onChange)
        unwatch = undefined
      }
    })
    return () => {
      cancelled = true
      cancel()
      unwatch?.()
      stop?.()
    }
  }, [motionAllowed])

  return null
}
