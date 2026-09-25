import { CONDITIONS, type SectionContext } from '@/app/_components/motion'
import { drive } from '@/app/_components/motion/liquid'
import { POOL, poolPath } from '@/lib/motion/pool-curve'

// The pooled curve under the ink stretch (app/globals.css .ink-pool, ADR 0034 amendments of 23
// and 25 September 2026). From md up it is liquid: a chain of two springs, the shoulders pulled
// by the scroll's speed and the belly following them (lib/motion/chain.ts; the drawing is
// lib/motion/pool-curve.ts), so the curve deepens while the page glides down, flattens while it
// glides up, and once the page stops it hangs, swings back through rest and settles with a
// wobble that starts busy and ends clean. Each frame writes the path's `d`, which repaints the
// pool's own layer (will-change keeps it on one) and nothing else on the page; a border-radius
// on the stretch would repaint the whole dark band. The loop (liquid.ts) sleeps at rest and
// writes the server's arc back. Phones (no ScrollTrigger) and reduced motion keep the server
// markup, the resting segment; the numbers are CONFIG.motion.choreo.pool.
export function inkPool({ ScrollTrigger, gsap, mm, root }: SectionContext): void {
  const lip = root.querySelector<SVGSVGElement>('.ink-stretch > .ink-pool')
  const path = lip?.querySelector('path') ?? null
  const restPath = path?.getAttribute('d') ?? null
  if (lip === null || path === null || restPath === null) return

  mm.add(CONDITIONS, (media) => {
    if (media.conditions?.scrubs !== true || ScrollTrigger === undefined) return
    return drive({
      gsap,
      ScrollTrigger,
      trigger: lip,
      chain: POOL,
      draw: (state) => {
        path.setAttribute('d', poolPath(state))
      },
      rest: () => {
        path.setAttribute('d', restPath)
      },
    })
  })
}
