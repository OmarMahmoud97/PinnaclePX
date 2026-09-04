'use client'

import { useEffect, useState } from 'react'

const TICK_MS = 1000

// Milliseconds left until an instant the server set, so a refresh or a shared link shows the
// true time. Measured from the clock, not counted in ticks, so a slow tab still shows the right
// time.
export function useCountdown(deadlineAt: string): number {
  const deadline = new Date(deadlineAt).getTime()
  const [remaining, setRemaining] = useState(() => Math.max(deadline - Date.now(), 0))

  useEffect(() => {
    const tick = () => {
      const left = Math.max(deadline - Date.now(), 0)
      setRemaining(left)
      if (left === 0) clearInterval(id)
    }
    const id = setInterval(tick, TICK_MS)
    tick()
    return () => {
      clearInterval(id)
    }
  }, [deadline])

  return remaining
}
