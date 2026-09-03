'use client'

import { useEffect, useState } from 'react'

const TICK_MS = 1000

// Milliseconds left of a budget that starts when the component mounts. Measured from the clock,
// not counted in ticks, so a slow tab still shows the right time.
export function useCountdown(totalMs: number): number {
  const [remaining, setRemaining] = useState(totalMs)

  useEffect(() => {
    const startedAt = Date.now()
    const id = setInterval(() => {
      const left = Math.max(totalMs - (Date.now() - startedAt), 0)
      setRemaining(left)
      if (left === 0) clearInterval(id)
    }, TICK_MS)
    return () => {
      clearInterval(id)
    }
  }, [totalMs])

  return remaining
}
