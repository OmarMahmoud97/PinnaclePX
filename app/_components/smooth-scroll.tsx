'use client'

import { useEffect } from 'react'
import { CONFIG } from '@/lib/config'
import { whenIdle } from '@/lib/motion/idle'
import { type LenisClass, loadLenis, setActiveLenis } from '@/lib/motion/lenis'
import { useMotionAllowed } from '@/lib/motion/use-motion-allowed'

// A link that keeps the browser's own jump: the skip link, whose job is to move focus, which
// only the native fragment jump does.
const NATIVE_LINK = 'data-lenis-ignore'

// Smooth scrolling for the whole site (ADR 0021). Lenis arrives as a lazy chunk once the browser
// is idle, and only for a visitor who allows motion: everyone else keeps native scrolling, which
// is also what a failed load leaves behind. Touch stays native (Lenis's default); the wheel and
// the anchor links glide. With JavaScript off none of this runs.
export function SmoothScroll() {
  const motionAllowed = useMotionAllowed()

  useEffect(() => {
    if (!motionAllowed) return
    let cancelled = false
    let stop: (() => void) | undefined
    const cancelIdle = whenIdle(() => {
      loadLenis()
        .then((Lenis) => {
          if (!cancelled) stop = start(Lenis)
        })
        .catch(() => {
          // Native scrolling stays.
        })
    })
    return () => {
      cancelled = true
      cancelIdle()
      stop?.()
    }
  }, [motionAllowed])

  return null
}

function start(Lenis: LenisClass): () => void {
  const lenis = new Lenis({
    lerp: CONFIG.motion.scroll.lerp,
    autoRaf: true,
    // A glide still in flight when a link leads to another page would carry on there.
    stopInertiaOnNavigate: true,
  })

  // A link to a fragment of this page glides instead of jumping. The listener captures, so it
  // runs before React reaches next/link, which then sees the default prevented and stands down;
  // the history entry is pushed here instead, which Next's patched pushState folds into its
  // router. Lenis reads the root's scroll-padding-top, so the target clears the fixed header.
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = event
      .composedPath()
      .find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement)
    if (link === undefined || link.hasAttribute(NATIVE_LINK) || link.hasAttribute('download')) {
      return
    }
    if (link.target !== '' && link.target !== '_self') return
    const url = new URL(link.href)
    if (url.origin !== location.origin || url.pathname !== location.pathname) return
    if (url.hash.length < 2) return
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)))
    if (target === null) return
    event.preventDefault()
    if (url.hash !== location.hash) history.pushState(null, '', url.hash)
    lenis.scrollTo(target)
  }
  window.addEventListener('click', onClick, true)
  setActiveLenis(lenis)

  return () => {
    window.removeEventListener('click', onClick, true)
    setActiveLenis(undefined)
    lenis.destroy()
  }
}
