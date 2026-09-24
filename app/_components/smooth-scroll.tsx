'use client'

import { useEffect } from 'react'
import { CONFIG } from '@/lib/config'
import { whenIdle } from '@/lib/motion/idle'
import { type LenisClass, loadLenis, setActiveLenis } from '@/lib/motion/lenis'
import { useMotionAllowed } from '@/lib/motion/use-motion-allowed'

// A link that keeps the browser's own jump: the skip link, so that it lands on #main at once
// rather than gliding there.
const NATIVE_LINK = 'data-lenis-ignore'

// The glide prevents the browser's jump, and with it the jump's move of the Tab order's start to
// the target: without this, a keyboard visitor's next Tab starts from the link, and a phone-menu
// link has just left the page with the sheet. A target that takes no focus of its own is made
// focusable just this once, gives it back on blur, and draws no ring (app/globals.css), because it
// is not a control. The open phone menu leaves the page inert (mobile-nav.tsx) and a menu link's
// click reaches this listener before React has let it go, which it does in the click's own effect
// flush, and focus() does nothing inside an inert tree; so while the target is still inside one,
// the focus waits a frame, and gives up after CONFIG.motion.scroll.focusFrames.
const FOCUS_TARGET = 'data-glide-focus'

function focusTarget(target: HTMLElement, frames: number = CONFIG.motion.scroll.focusFrames) {
  if (target.closest('[inert]') !== null) {
    if (frames > 0) {
      requestAnimationFrame(() => {
        focusTarget(target, frames - 1)
      })
    }
    return
  }
  if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1')
    target.setAttribute(FOCUS_TARGET, '')
    target.addEventListener(
      'blur',
      () => {
        target.removeAttribute('tabindex')
        target.removeAttribute(FOCUS_TARGET)
      },
      { once: true },
    )
  }
  target.focus({ preventScroll: true })
}

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
  // Focus moves to the target as the browser's jump would have moved it (focusTarget above),
  // without a second scroll.
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
    focusTarget(target)
  }
  window.addEventListener('click', onClick, true)
  setActiveLenis(lenis)

  return () => {
    window.removeEventListener('click', onClick, true)
    setActiveLenis(undefined)
    lenis.destroy()
  }
}
