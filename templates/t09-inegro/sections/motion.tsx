'use client'

import { useEffect } from 'react'
import { lightLetters } from './motion-lit'
import { travelNotes } from './motion-notes'
import { runRing } from './motion-ring'
import { stackCards } from './motion-stack'

// The page's scripted motion, started once the page is on the screen: the blocks that slide out
// from under the glass cards, the cards' letters that light with the scroll, the cards that
// travel the ribbons and the ring's cycling lines. Under reduced motion none of it runs, and the
// stylesheet shows every letter lit, the last card at rest and the ring's first line whole.
export function InegroMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector('.inegro')
    if (root === null) return
    const stops = [stackCards(root), lightLetters(root), travelNotes(root), runRing(root)]
    return () => {
      for (const stop of stops) stop()
    }
  }, [])
  return null
}
