import { CONDITIONS, type SectionContext } from '@/app/_components/motion'
import { CONFIG } from '@/lib/config'

const { choreo } = CONFIG.motion

// #about (plan 7.7): from md up the studio tile scales in and its seal ring draws on as the
// column reveals. Neither is owned: the column's CSS reveal stays the truth for what is shown,
// carrying the tile's slot with its opacity and rise, and this module only adds the scale, on the
// tile inside the slot (never the slot itself: GSAP folds an element's CSS translate and scale
// into its transform, which would freeze the reveal; app/_styles/about.css keeps the reveal's
// own scale off the slot so the two never multiply below the cap) and the ring's stroke. Both
// fire once, from a plain trigger at enterStart, and again from the group's data-inview if
// PageMotion, its fail-safe or the a11y test reveals the column first, so nothing is left small
// or half-drawn. Below md and under reduced motion the server markup is the finished state and
// the CSS reveal alone runs.
export function about({ gsap, ScrollTrigger, mm, root, onInview, inview }: SectionContext): void {
  const section = root.querySelector<HTMLElement>('#about')
  if (section === null) return
  const tile = section.querySelector<HTMLElement>('.about-tile')
  const group = tile?.closest<HTMLElement>('[data-reveal]') ?? null
  if (tile === null || group === null) return
  const seal = tile.querySelector<SVGCircleElement>('.about-seal')
  // The ring's normalised length, from its markup: the dash the draw-on counts down from. GSAP
  // rounds a px value to whole pixels, so the markup keeps it at 100 for a step per per cent.
  const length = Number(seal?.getAttribute('pathLength'))
  const ring = seal !== null && Number.isFinite(length) && length > 0 ? seal : null

  mm.add(CONDITIONS, (media) => {
    if (media.conditions?.scrubs !== true || ScrollTrigger === undefined) return
    // A page opened at #about is already at rest; nothing already shown is ever pulled back.
    if (inview(group)) return
    gsap.set(tile, { scale: choreo.scaleFrom })
    if (ring !== null) gsap.set(ring, { strokeDasharray: length, strokeDashoffset: length })
    let entered = false
    const enter = () => {
      if (entered) return
      entered = true
      gsap.to(tile, {
        scale: 1,
        duration: choreo.tweenS,
        ease: 'power3.out',
        clearProps: 'transform',
      })
      // The tile fades in by CSS as the ring draws, so a slow start keeps the drawing for the
      // moment the tile is there to be seen.
      if (ring !== null) {
        gsap.to(ring, {
          strokeDashoffset: 0,
          duration: choreo.drawS,
          ease: 'power2.inOut',
          clearProps: 'strokeDasharray,strokeDashoffset',
        })
      }
    }
    ScrollTrigger.create({ trigger: group, start: choreo.enterStart, once: true, onEnter: enter })
    onInview(group, enter)
  })
}
