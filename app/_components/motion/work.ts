import { CONDITIONS, type SectionContext } from '@/app/_components/motion'
import { CONFIG } from '@/lib/config'

const { choreo } = CONFIG.motion

// #work (plan 7.1). From md up the six tiles are one owned batch: each rises into place from
// riseRem and scaleFrom over tweenS, staggerS apart, and the cyan pool behind its phone fades in
// one beat behind it, so the tile lands first and then lights. Phones keep the CSS reveal, and
// the pools' finished state is the class state data-inview sets (app/_styles/work.css), which is
// what the fade clears to.
export function work({ mm, own, root }: SectionContext): void {
  const section = root.querySelector<HTMLElement>('#work')
  if (section === null) return
  const tiles = section.querySelector<HTMLElement>('[data-choreo="tiles"]')
  if (tiles === null) return

  mm.add(CONDITIONS, (media) => {
    if (media.conditions?.scrubs !== true) return
    const pools = [...tiles.querySelectorAll<HTMLElement>('.work-backlight')]
    own(tiles, {
      enter: ({ gsap, finish }) => {
        // A from-tween paints its start at once, so the pools never flash to their class state
        // in the frame before the tween begins; they clear by name to that state when it ends.
        gsap.from(pools, {
          opacity: 0,
          duration: choreo.tweenS,
          delay: choreo.staggerS,
          stagger: choreo.staggerS,
          ease: 'power2.out',
          clearProps: 'opacity',
        })
        finish({ duration: choreo.tweenS, ease: 'power3.out', stagger: choreo.staggerS })
      },
    })
  })
}
