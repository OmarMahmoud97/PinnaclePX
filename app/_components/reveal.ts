import type { CSSProperties } from 'react'
import { CONFIG } from '@/lib/config'

// The wait before an item in a revealed list arrives, as a custom property the CSS multiplies
// by --motion-stagger. Items past the cap arrive together with the last staggered one.
export function revealDelay(index: number): CSSProperties {
  return { '--i': Math.min(index, CONFIG.motion.staggerMax - 1) } as CSSProperties
}
