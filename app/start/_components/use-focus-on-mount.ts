'use client'

import { type RefObject, useEffect, useRef } from 'react'

// Each question starts at the top of the page with its heading focused, so a screen reader hears
// what is being asked before Tab reaches the control. The pane is remounted per question.
export function useFocusOnMount<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null)
  useEffect(() => {
    window.scrollTo({ top: 0 })
    ref.current?.focus({ preventScroll: true })
  }, [])
  return ref
}
