import { CONDITIONS, type SectionContext } from '@/app/_components/motion'
import { CONFIG } from '@/lib/config'

const { choreo } = CONFIG.motion

// #straight-answers (plan 7.6): from md up the four cards are an owned batch that lands with a
// one-degree lean uprighting. The pivot is each card's own foot (app/_styles/straight-answers.css
// sets the origin, so nothing inline is left to sweep up after clearProps), which makes the lean
// read as a card set down rather than a card spun. Both landings are the executor's own: the
// entrance over tweenS, the pre-empt over --motion-settle, each cleared by name. No hover tilt:
// the cards are not focusable and a hover promises a click (ADR 0026). Below md `own` declines
// and the CSS reveal carries the list.
export function straightAnswers({ root, mm, own }: SectionContext): void {
  const section = root.querySelector<HTMLElement>('#straight-answers')
  if (section === null) return
  const group = section.querySelector<HTMLElement>('[data-choreo="answers"]')
  if (group === null) return

  mm.add(CONDITIONS, (media) => {
    if (media.conditions?.scrubs !== true) return
    own(group, {
      // scale is named so GSAP does not fold in whatever the CSS reveal's own scale was mid-
      // transition at arm time: the lean is a rise and a turn, nothing else.
      arm: ({ gsap, items }) => {
        gsap.set(items, {
          y: `${String(choreo.riseRem)}rem`,
          rotate: choreo.tiltDeg,
          scale: 1,
          opacity: 0,
        })
      },
      enter: ({ finish }) => {
        finish({ duration: choreo.tweenS, ease: 'power3.out', stagger: choreo.staggerS })
      },
    })
  })
}
