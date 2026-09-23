import { CONDITIONS, type SectionContext } from '@/app/_components/motion'
import { CONFIG } from '@/lib/config'

const { choreo } = CONFIG.motion

// The lane heads' clip: hidden at the left edge, then drawn on to the right.
const CLIPPED = 'inset(0 100% 0 0)'
const DRAWN = 'inset(0 0% 0 0)'

// #your-options (plan 7.5). From md up the four rows are an owned batch (the plain entrance), and
// the two lane heads draw on together in one clip-path tween as the visual header crosses
// enterStart: one tween with both targets, so neither lane leads (the CAP point made in motion).
// Below md every group takes the CSS reveal and the heads are never clipped. The heads are
// aria-hidden decoration, so the draw-on is not owned; it is created only when the rows were
// claimed, so a group already shown is never hidden again, and it clears its own inline style.
export function yourOptions({ gsap, ScrollTrigger, mm, root, own }: SectionContext): void {
  const section = root.querySelector<HTMLElement>('#your-options')
  if (section === null) return
  const rows = section.querySelector<HTMLElement>('[data-choreo="rows"]')
  const heads = [...section.querySelectorAll<HTMLElement>('.lane-head')]
  if (rows === null) return

  mm.add(CONDITIONS, (media) => {
    if (media.conditions?.scrubs !== true || ScrollTrigger === undefined) return
    if (!own(rows)) return
    const header = heads[0]?.parentElement
    if (header === undefined || header === null) return
    gsap.fromTo(
      heads,
      { clipPath: CLIPPED },
      {
        clipPath: DRAWN,
        duration: choreo.drawS,
        ease: 'power3.out',
        clearProps: 'clipPath',
        scrollTrigger: { trigger: header, start: choreo.enterStart, once: true },
      },
    )
  })
}
