import { CONDITIONS, type SectionContext } from '@/app/_components/motion'
import { CONFIG } from '@/lib/config'

const { choreo } = CONFIG.motion

// The plan's numbers for this band (7.9: the button from 16 px over 0.6 s, the phone from 40 px
// over 0.9 s) as shares of the choreo set, so nothing here is a number of its own: one rem is
// two fifths of riseRem, 0.6 s is three quarters of tweenS, and the phone takes tweenS whole
// (0.8 s, inside the 900 ms cap) rather than the plan's 0.9.
const ASK_RISE_SHARE = 0.4
const ASK_TWEEN_SHARE = 0.75

// #cta (plan 7.9, D3). From md up two opaque leaves rise into place as the band arrives: the ask
// button and the phone. Neither is owned and neither is a reveal group: the tweens run on plain
// triggers, once, and end by clearing transform and opacity by name, so the server markup is the
// rest state and the a11y scan can only ever catch a tween in flight, never a hidden leaf.
//
// What they must not touch: the H2, any .over-ink run, or an ancestor of one (constraint 41).
// Opacity or a transform on such an ancestor makes a stacking context, and the difference blend
// then reads its own group instead of the ink, so the run drops to its declared grey until the
// styles clear. The phone wrapper (div.max-md:order-first) is one of those ancestors: the sketch
// under the phone ends in a caption on the ink (closing-sketch.tsx). So the tween goes on the
// aria-hidden holder the frame sits in, the sketch root's first child, and the caption stays
// still. On phones the band is static for the same reason: a CSS reveal on the wrapper would
// hide that caption's parent.
//
// Neither leaf is owned, so the executor's fail-safe does not cover them; the module keeps its
// own on the same clock. Like the executor's sweep it guards what the viewport has reached and
// nothing lower: every tick, an unplayed leaf whose top is inside the viewport plays (a trigger
// that never fired, a refresh gone wrong), and a leaf still below the fold keeps its entrance.
//
// The tween and its trigger are built apart on purpose. A tween made with `scrollTrigger` vars
// is the trigger's animation, and ScrollTrigger.kill() kills that animation with it (GSAP 3.15,
// `allowAnimation || animation.kill()`), so a killed-then-played tween is a no-op that leaves the
// from() start state inline: a button at opacity 0 at the foot of the page. A paused tween played
// by a plain trigger's onEnter has nothing to lose when the trigger goes.
export function closing({ gsap, ScrollTrigger, mm, root, px }: SectionContext): void {
  const section = root.querySelector<HTMLElement>('#cta')
  if (section === null) return
  const ask = section.querySelector<HTMLElement>('[data-rise="ask"]')
  const phone = section.querySelector<HTMLElement>(
    '[data-rise="phone"] > div > div[aria-hidden="true"]',
  )

  mm.add(CONDITIONS, (media) => {
    if (media.conditions?.scrubs !== true || ScrollTrigger === undefined) return
    type Leaf = { target: HTMLElement; play: () => void; played: boolean }
    const leaves: Leaf[] = []
    const rise = (target: HTMLElement, y: number, duration: number) => {
      // from() renders its start state at once, paused: that is the arm.
      const tween = gsap.from(target, {
        y,
        opacity: 0,
        duration,
        ease: 'power3.out',
        paused: true,
        clearProps: 'transform,opacity',
      })
      const leaf: Leaf = {
        target,
        played: false,
        play: () => {
          if (leaf.played) return
          leaf.played = true
          tween.play()
        },
      }
      leaves.push(leaf)
      ScrollTrigger.create({
        trigger: target,
        start: choreo.enterStart,
        once: true,
        onEnter: leaf.play,
      })
    }
    if (ask !== null) {
      rise(ask, px(choreo.riseRem * ASK_RISE_SHARE), choreo.tweenS * ASK_TWEEN_SHARE)
    }
    if (phone !== null) rise(phone, px(choreo.riseRem), choreo.tweenS)
    const reached = (target: HTMLElement) => target.getBoundingClientRect().top < window.innerHeight
    const sweep = () => {
      for (const leaf of leaves) {
        if (!leaf.played && reached(leaf.target)) leaf.play()
      }
    }
    const failSafe = window.setInterval(sweep, choreo.settleFailSafeMs)
    return () => {
      window.clearInterval(failSafe)
    }
  })
}
