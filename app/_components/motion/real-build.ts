import { CONDITIONS, type SectionContext } from '@/app/_components/motion'
import { CONFIG } from '@/lib/config'
import type { ScrollTriggerStatic } from '@/lib/motion/gsap'

type Trigger = ReturnType<ScrollTriggerStatic['create']>

const { choreo, scroll } = CONFIG.motion

// The numeral's finished state. It is in the server markup, so every path that never runs this
// module (reduced motion, no JavaScript, a phone) shows the rows reached; the module takes it off
// only the rows the visitor has not passed and gives it back as they pass.
const REACHED = 'data-reached'
// Where the module finds a numeral once the attribute is off it.
const NUMERAL = '.step-numeral'

// #real-build (plan 7.4), from md up only. Three things, none of which touches the section's
// copy: the rail fill behind the numerals is a scrub over the list, so it fills as the steps are
// passed and empties on the way back up; each numeral is reached when its row's top crosses the
// same line the rail reads, and the colour change itself is the CSS transition on the span; and
// the rows are an owned batch with the plain entrance. Below md nothing here runs: the rail is
// hidden, the numerals ship reached, and the CSS reveal carries the rows.
export function realBuild({ gsap, ScrollTrigger, mm, root, own }: SectionContext): void {
  const section = root.querySelector<HTMLElement>('#real-build')
  if (section === null) return
  const steps = section.querySelector<HTMLElement>('[data-choreo="steps"]')
  if (steps === null) return
  const fill = section.querySelector<HTMLElement>('.rail-fill')
  const numerals = [...steps.querySelectorAll<HTMLElement>(NUMERAL)]

  mm.add(CONDITIONS, (media) => {
    if (media.conditions?.scrubs !== true || ScrollTrigger === undefined) return

    if (fill !== null) {
      gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: steps,
            start: choreo.railStart,
            end: choreo.railEnd,
            scrub: scroll.scrubLag,
            invalidateOnRefresh: true,
          },
        },
      )
    }

    // One trigger per row at the rail's own line. A row already passed at arm time keeps its
    // reached state (progress is past the start), one still to come loses it; onRefresh keeps
    // the two in step when a start line moves, since a refresh fires no enter or leave.
    for (const row of steps.children) {
      const target = row.querySelector<HTMLElement>(NUMERAL)
      if (target === null) continue
      const sync = (self: Trigger) => {
        target.toggleAttribute(REACHED, self.progress > 0)
      }
      const trigger = ScrollTrigger.create({
        trigger: row,
        start: choreo.railStart,
        onEnter: sync,
        onLeaveBack: sync,
        onRefresh: sync,
      })
      sync(trigger)
    }

    own(steps)

    // The condition stops matching (the window narrows under md, or the choreography stops):
    // the triggers go with the context, so the finished state goes back on by hand.
    return () => {
      for (const target of numerals) target.setAttribute(REACHED, '')
    }
  })
}
