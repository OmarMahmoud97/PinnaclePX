'use client'

import { useSyncExternalStore } from 'react'

// Whether a moment, in ms since the epoch, has come: the build's deadline, or the minute after
// which the wait offers the call. Nothing ticks: one timer is set for the moment, when the answer
// changes. The server cannot know the time the page is read, so it renders the moment as still to
// come.
export function usePassed(at: number): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const timer = setTimeout(onChange, Math.max(at - Date.now(), 0))
      return () => {
        clearTimeout(timer)
      }
    },
    () => Date.now() >= at,
    () => false,
  )
}
