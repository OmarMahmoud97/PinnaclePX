import 'client-only'
import { about } from '@/app/_components/motion/about'
import { closing } from '@/app/_components/motion/closing'
import { footer } from '@/app/_components/motion/footer'
import { included } from '@/app/_components/motion/included'
import { inkPool } from '@/app/_components/motion/ink-pool'
import { realBuild } from '@/app/_components/motion/real-build'
import { sheetLip } from '@/app/_components/motion/sheet-lip'
import { straightAnswers } from '@/app/_components/motion/straight-answers'
import { work } from '@/app/_components/motion/work'
import { yourOptions } from '@/app/_components/motion/your-options'
import { CONFIG } from '@/lib/config'
import type { Gsap, ScrollTriggerStatic } from '@/lib/motion/gsap'
import { type LenisClass, onActiveLenis } from '@/lib/motion/lenis'

// The scroll choreography below the hero (ADR 0034, docs/home-page-redesign-plan.md section 6).
//
// This chunk arrives on the first scroll intent, after PageChoreography has loaded GSAP (and
// ScrollTrigger from md up). `start(main, motion)` makes one gsap.context scoped to <main>, one
// gsap.matchMedia, and hands every section module a SectionContext. Each module owns one
// section and touches nothing outside it.
//
// THE API A SECTION MODULE GETS (SectionContext)
//
//   gsap           the core, for tweens the module authors itself.
//   ScrollTrigger  the plugin from md up, undefined below md: phones get entrances only (D5).
//                  Create plain triggers with it (a scrub, a numeral's reached line) inside the
//                  `scrubs` condition; they are killed with the context on stop.
//   mm             gsap.matchMedia(). Wrap everything in `mm.add(CONDITIONS, (media) => ...)`
//                  and read `media.conditions?.scrubs` (md+ and motion allowed) or
//                  `media.conditions?.entrances` (any width, motion allowed). What the callback
//                  creates is reverted when the condition stops matching and made again when it
//                  matches, so a module never has to clean up after itself.
//   root           <main>. Find the section with `root.querySelector('#work')` and return if it
//                  is absent; never reach past the section.
//   own            claims a `[data-reveal][data-choreo]` group under the executor contract (D6,
//                  plan 6.4). It returns false and does nothing when the group already carries
//                  data-inview (on screen at boot, revealed by PageMotion, its fail-safe or the
//                  a11y test) or when ScrollTrigger is absent, so nothing already shown is ever
//                  hidden again. Otherwise it runs `arm` at once (the initial state), fires
//                  `enter` when the group's top crosses CONFIG.motion.choreo.enterStart, and
//                  fires `preempt` instead if anyone else sets data-inview first. Each handler
//                  gets Tools: the group, its direct children as `items`, `finish(vars)` (tweens
//                  the items to rest, clears transform and opacity by name, then settles),
//                  `clear(targets)`, `settle()`, `rise()` (the default arm: the items set to
//                  riseRem, scaleFrom and opacity 0, for a custom arm that adds to it) and
//                  `settleS` (the CSS settle in seconds, for a custom pre-empt). Every handler
//                  has a default (a rise from riseRem and scaleFrom over tweenS with staggerS;
//                  the pre-empt finishes over --motion-settle), so `own(group)` alone is the
//                  plain entrance. A custom `enter` must end by settling, through `finish` or
//                  `settle`.
//   settle         reports a group finished: its trigger and observer go, and once every owned
//                  group has settled <html> carries data-motion-settled, which e2e/a11y waits on.
//   onInview       a phone-only beat: runs the callback once when someone (PageMotion, normally)
//                  sets data-inview on the group. Returns false and does nothing when the group
//                  is already in view, so a module sets an initial state only when it returns
//                  true. Use it under `entrances` when `scrubs` is false.
//   px             rem to pixels at the root's current font size, for a distance in a tween.
//   itemsOf        a group's direct element children, the same list `items` is made from.
//   inview         whether a group already carries data-inview (shown by someone).
//
// The three helpers exist so no module measures the root's font size, filters a group's
// children or spells the attribute name itself: every number and every name reads from here.
//
// Rules every module keeps: numbers come from CONFIG.motion.choreo and stay inside
// CONFIG.motion.caps; clearProps by name, never 'all' (constraint 32); no pins, no scrubs below
// md, nothing on the H1, an .over-ink wrapper, or an ancestor of the walkthrough stage or a
// sticky column; a group that hides content is owned, a scrub or a draw-on that only decorates
// is not.
//
// One GSAP 3.15 fact every module lives with: CSSPlugin folds an element's own CSS `translate`,
// `rotate` and `scale` into the transform it writes and pins them to `none` inline, so a tween on
// an element the CSS reveal moves (a `[data-reveal] > *` child) loses the reveal's rise and snaps
// when its styles clear. Own the group, or tween an element inside the reveal child instead.

type TweenTarget = Parameters<Gsap['set']>[0]
type TweenVars = Parameters<Gsap['set']>[1]
type MatchMedia = ReturnType<Gsap['matchMedia']>
type Trigger = ReturnType<ScrollTriggerStatic['create']>

// What PageChoreography loads: ScrollTrigger only from md up.
export type Motion = Readonly<{ gsap: Gsap; ScrollTrigger: ScrollTriggerStatic | undefined }>

// The two media conditions, for `mm.add(CONDITIONS, ...)`. Reduced motion is the second belt:
// the leaf never mounts under it, and no condition matches if it somehow did.
export const CONDITIONS = {
  entrances: '(prefers-reduced-motion: no-preference)',
  scrubs: '(prefers-reduced-motion: no-preference) and (min-width: 48rem)',
} as const

export type Tools = Readonly<{
  gsap: Gsap
  group: HTMLElement
  items: HTMLElement[]
  finish: (vars?: TweenVars) => void
  clear: (targets: TweenTarget, props?: string) => void
  settle: () => void
  rise: () => void
  settleS: number
}>

export type Handlers = Readonly<{
  arm?: (tools: Tools) => void
  enter?: (tools: Tools) => void
  preempt?: (tools: Tools) => void
}>

export type SectionContext = Readonly<{
  gsap: Gsap
  ScrollTrigger: ScrollTriggerStatic | undefined
  mm: MatchMedia
  root: HTMLElement
  own: (group: HTMLElement, handlers?: Handlers) => boolean
  settle: (group: HTMLElement) => void
  onInview: (group: HTMLElement, callback: () => void) => boolean
  px: (rem: number) => number
  itemsOf: (group: HTMLElement) => HTMLElement[]
  inview: (group: HTMLElement) => boolean
}>

export type SectionModule = (ctx: SectionContext) => void

const { choreo } = CONFIG.motion
// One module per section that has choreography of its own, in page order. Two sections have
// none and no module: the walkthrough (#how-it-works, plan 7.3, D8), where nothing moves but
// the heading's CSS reveal and the active step's colour, and no trigger is ever made inside the
// section (constraint 36), because the stage measures its own geometry from the scroll and a
// tween on the steps would move the stop lines under it mid-entrance; its one contribution is
// the `walkthrough:ready` event HowItWorksTrack dispatches, which becomes a refresh below.
// Below md the docked step's words rise into place by CSS (app/_styles/how-it-works.css, ADR
// 0036): nothing measures them, and the section still has no trigger and no GSAP tween. And
// the FAQ (plan 7.8), whose entrance is the CSS reveal and whose light beat on an open card is
// CSS. Two shapes have modules of their own: the ink stretch's pooled curve (ink-pool.ts) and
// the footer sheet's lip (sheet-lip.ts), each not a section but the edge between two, sitting
// here where it sits in the DOM, after Included and after the footer; both drive one loop
// (liquid.ts) on the chain in lib/motion/chain.ts. A section that gains choreography gets a
// module here and nowhere else.
const MODULES: readonly SectionModule[] = [
  work,
  included,
  inkPool,
  realBuild,
  yourOptions,
  straightAnswers,
  about,
  closing,
  footer,
  sheetLip,
]

// The finished state is the server markup; these are the properties an entrance may have moved.
const REST = { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }
const CLEAR = 'transform,opacity'
const INVIEW = 'data-inview'
const READY_EVENT = 'walkthrough:ready'

type State = 'armed' | 'entered' | 'settled'
type Owned = {
  group: HTMLElement
  state: State
  observer: MutationObserver
  trigger: Trigger | undefined
}

function remPx(rem: number): number {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
}

// The CSS reveal's settle, in seconds, so a pre-empted group finishes at the speed CSS would.
function settleSeconds(): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--motion-settle')
  const number = parseFloat(value)
  if (Number.isNaN(number)) return 0.3
  return value.trim().endsWith('ms') ? number / 1000 : number
}

function children(group: HTMLElement): HTMLElement[] {
  return [...group.children].filter((child): child is HTMLElement => child instanceof HTMLElement)
}

function inview(group: HTMLElement): boolean {
  return group.hasAttribute(INVIEW)
}

// Reached: the group's top is inside the viewport. What the fail-safe shows, and nothing lower.
function reached(group: HTMLElement): boolean {
  return group.getBoundingClientRect().top < window.innerHeight
}

// Starts the choreography and returns the function that stops it: the context reverted (only its
// own tweens and triggers, only its own inline styles), every observer gone, both attributes off.
export function start(main: HTMLElement, { gsap, ScrollTrigger }: Motion): () => void {
  const html = document.documentElement
  const owned = new Map<HTMLElement, Owned>()
  const pending = new Set<HTMLElement>()
  const observers = new Set<MutationObserver>()
  const cleanups: (() => void)[] = []
  let stopped = false

  // Settled means every claimed group has settled, nothing less: the fail-safe below never
  // stands in for a group the viewport has not reached.
  const markSettled = () => {
    if (pending.size === 0) html.setAttribute('data-motion-settled', '')
  }

  const dispose = (record: Owned) => {
    record.observer.disconnect()
    observers.delete(record.observer)
    record.trigger?.kill()
    pending.delete(record.group)
    owned.delete(record.group)
  }

  const settle = (group: HTMLElement) => {
    const record = owned.get(group)
    if (record === undefined) return
    record.state = 'settled'
    dispose(record)
    markSettled()
  }

  const clear = (targets: TweenTarget, props = CLEAR) => {
    gsap.set(targets, { clearProps: props })
  }

  const toolsFor = (group: HTMLElement): Tools => {
    const items = children(group)
    const tools: Tools = {
      gsap,
      group,
      items,
      clear,
      settleS: settleSeconds(),
      rise: () => {
        gsap.set(items, { y: remPx(choreo.riseRem), scale: choreo.scaleFrom, opacity: 0 })
      },
      settle: () => {
        settle(group)
      },
      finish: (vars = {}) => {
        const { onComplete, ...rest } = vars
        gsap.to(items, {
          ...REST,
          ...rest,
          clearProps: CLEAR,
          onComplete: () => {
            onComplete?.()
            settle(group)
          },
        })
      },
    }
    return tools
  }

  const defaults: Required<Handlers> = {
    arm: ({ rise }) => {
      rise()
    },
    enter: ({ finish }) => {
      finish({ duration: choreo.tweenS, ease: 'power3.out', stagger: choreo.staggerS })
    },
    preempt: ({ finish, settleS }) => {
      finish({ duration: settleS, ease: 'power2.out' })
    },
  }

  const own = (group: HTMLElement, handlers: Handlers = {}): boolean => {
    if (ScrollTrigger === undefined || stopped || inview(group)) return false
    // A media condition that stopped matching reverted the last claim; the record it left is stale.
    const stale = owned.get(group)
    if (stale !== undefined) dispose(stale)
    const tools = toolsFor(group)
    const { arm = defaults.arm, enter = defaults.enter, preempt = defaults.preempt } = handlers
    const observer = new MutationObserver(() => {
      if (record.state !== 'armed' || !group.hasAttribute(INVIEW)) return
      record.state = 'entered'
      observer.disconnect()
      preempt(tools)
    })
    const record: Owned = { group, state: 'armed', observer, trigger: undefined }
    owned.set(group, record)
    pending.add(group)
    observers.add(observer)
    html.removeAttribute('data-motion-settled')
    // The initial state goes on before the trigger exists: a group the scroll has already passed
    // enters on the trigger's first update, and it must have something to enter from.
    arm(tools)
    observer.observe(group, { attributes: true, attributeFilter: [INVIEW] })
    record.trigger = ScrollTrigger.create({
      trigger: group,
      start: choreo.enterStart,
      once: true,
      onEnter: () => {
        if (record.state !== 'armed') return
        record.state = 'entered'
        // Disconnected before the attribute lands, so the pre-empt never sees the module's own set.
        observer.disconnect()
        group.setAttribute(INVIEW, '')
        enter(tools)
      },
    })
    return true
  }

  const onInview = (group: HTMLElement, callback: () => void): boolean => {
    if (stopped || inview(group)) return false
    const observer = new MutationObserver(() => {
      if (!group.hasAttribute(INVIEW)) return
      observer.disconnect()
      observers.delete(observer)
      callback()
    })
    observers.add(observer)
    observer.observe(group, { attributes: true, attributeFilter: [INVIEW] })
    return true
  }

  let mm: MatchMedia | undefined
  const context = gsap.context(() => {
    mm = gsap.matchMedia()
    const section: SectionContext = {
      gsap,
      ScrollTrigger,
      mm,
      root: main,
      own,
      settle,
      onInview,
      px: remPx,
      itemsOf: children,
      inview,
    }
    for (const setUp of MODULES) setUp(section)
  }, main)

  if (ScrollTrigger !== undefined) {
    const refresh = () => {
      if (!stopped) ScrollTrigger.refresh()
    }
    // ScrollTrigger follows Lenis's frames rather than the browser's, and the ticker stops
    // smoothing over a dropped frame, which with a scrubbed tween would read as a jump.
    const update = () => {
      ScrollTrigger.update()
    }
    let following: InstanceType<LenisClass> | undefined
    const unsubscribe = onActiveLenis((lenis) => {
      following?.off('scroll', update)
      lenis?.on('scroll', update)
      following = lenis
    })
    gsap.ticker.lagSmoothing(0)
    cleanups.push(() => {
      unsubscribe()
      following?.off('scroll', update)
      gsap.ticker.lagSmoothing(500, 33)
    })
    // Every start line moves when the fonts land, when the walkthrough's finished page is in the
    // DOM, and when <main> changes size; a resize refreshes once the window has settled.
    void document.fonts.ready.then(refresh)
    window.addEventListener(READY_EVENT, refresh)
    let settling: number | undefined
    const resizes = new ResizeObserver(() => {
      window.clearTimeout(settling)
      settling = window.setTimeout(refresh, choreo.resizeSettleMs)
    })
    resizes.observe(main)
    cleanups.push(() => {
      window.removeEventListener(READY_EVENT, refresh)
      window.clearTimeout(settling)
      resizes.disconnect()
    })
  }

  // Armed: from md, where a group can be owned, CSS steps back from the owned groups
  // (globals.css keys on the value) and GSAP carries them from here; on a phone the value says
  // no group is ever claimed and the CSS reveal keeps carrying them.
  html.setAttribute('data-choreo', ScrollTrigger === undefined ? 'entrances' : 'scrubs')
  markSettled()
  // The clock guards the groups the viewport has reached, never the page: every tick, an armed
  // group whose top is inside the viewport and whose trigger has not fired (a refresh gone
  // wrong, a group parked on the bottom edge) is shown the way PageMotion shows a list, by
  // setting data-inview, which runs its pre-empt. A group still below the fold keeps its
  // entrance for when the visitor gets there. The leaf starts only on a scroll intent, so the
  // clock can run from here; PageMotion's is the same clock, ticking over the same groups.
  const sweep = () => {
    for (const record of owned.values()) {
      if (record.state === 'armed' && reached(record.group)) record.group.setAttribute(INVIEW, '')
    }
  }
  const failSafe = window.setInterval(sweep, choreo.settleFailSafeMs)

  return () => {
    if (stopped) return
    stopped = true
    window.clearInterval(failSafe)
    for (const cleanup of cleanups) cleanup()
    for (const observer of observers) observer.disconnect()
    observers.clear()
    for (const record of owned.values()) record.trigger?.kill()
    owned.clear()
    pending.clear()
    mm?.revert()
    context.revert()
    html.removeAttribute('data-choreo')
    html.removeAttribute('data-motion-settled')
  }
}
