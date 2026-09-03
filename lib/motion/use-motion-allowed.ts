'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: no-preference)'

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => {
    media.removeEventListener('change', onChange)
  }
}

function read(): boolean {
  return window.matchMedia(QUERY).matches
}

// Whether the visitor allows motion. False on the server and during hydration, so the finished
// state renders first and only a client that allows motion ever rewinds it.
export function useMotionAllowed(): boolean {
  return useSyncExternalStore(subscribe, read, () => false)
}
