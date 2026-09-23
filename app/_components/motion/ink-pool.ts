import { CONDITIONS, type SectionContext } from '@/app/_components/motion'
import { CONFIG } from '@/lib/config'

const { pool } = CONFIG.motion.choreo

// A frame lost to a hidden tab or a stall integrates as one long frame at most, so the spring
// keeps its shape on the way back rather than being kicked by the whole gap at once.
const MAX_FRAME_S = 0.064
// Under these, with the page still, the curve is at rest: the loop writes 1 and stops. The
// stretch is a share of the resting depth, so 0.002 is half a pixel at the deepest pool.
const REST_STRETCH = 0.002
const REST_SPEED = 0.02

// The pooled curve under the ink stretch (app/globals.css .ink-pool, ADR 0034 amendment). From md
// up it is a mass on a spring pulled by the scroll's speed: deeper while the page glides down,
// flatter while it glides up, and once the page stops it swings back through rest and settles,
// which is what reads as liquid. The pull is the speed through tanh, so a hard flick saturates
// instead of tearing the curve into the heading, and what is drawn eases toward a cap under the
// band's padding whatever the swing does. The spring is integrated by hand on GSAP's ticker from
// each frame's own length (semi-implicit Euler, stable while omega times the frame stays under
// 2, which 1 Hz at 64 ms clears by a wide margin): a tween restarted on every wheel tick would
// ring from its start each time rather than carry its momentum. Only scaleY moves, about the curve's
// flat top edge, so the compositor stretches the layer and nothing repaints. The loop runs only
// while the pool is on screen and something is moving: the trigger's onUpdate fires on every
// scroll while the pool is in the viewport and wakes it, and it puts itself to sleep once the
// spring has come to rest, so a still page costs nothing. Phones (no ScrollTrigger) and reduced
// motion keep the server markup, the resting segment; the numbers are CONFIG.motion.choreo.pool.
export function inkPool({ gsap, ScrollTrigger, mm, root }: SectionContext): void {
  const lip = root.querySelector<SVGSVGElement>('.ink-stretch > .ink-pool')
  if (lip === null) return

  mm.add(CONDITIONS, (media) => {
    if (media.conditions?.scrubs !== true || ScrollTrigger === undefined) return
    const setScaleY = gsap.quickSetter(lip, 'scaleY') as (value: number) => void
    const omega = 2 * Math.PI * pool.frequencyHz
    const stiffness = omega * omega
    const damping = 2 * pool.dampingRatio * omega
    let stretch = 0 // the apex's displacement, as a share of the resting depth
    let speed = 0 // its rate of change, per second
    let lastY = window.scrollY
    let ticking = false

    const sleep = () => {
      if (!ticking) return
      ticking = false
      gsap.ticker.remove(step)
    }
    const rest = () => {
      sleep()
      stretch = 0
      speed = 0
      lastY = window.scrollY
      setScaleY(1)
    }
    const wake = () => {
      if (ticking) return
      ticking = true
      gsap.ticker.add(step)
    }
    // What is drawn: the stretch itself up to the knee, and past it an ease toward the cap that
    // never arrives (tanh), so a strong flick has no wall to hit. A wall was tried: the spring
    // stopped dead against it on a six-notch flick, which read as a thud, not liquid. The
    // physics runs free; the pull is bounded by stretchMax and the spring by its damping, so
    // the ease is only ever asked for the top of a hard flick.
    const drawn = (value: number): number => {
      const size = Math.abs(value)
      if (size <= pool.stretchKnee) return value
      const room = pool.stretchCap - pool.stretchKnee
      return (
        Math.sign(value) * (pool.stretchKnee + room * Math.tanh((size - pool.stretchKnee) / room))
      )
    }
    const step = (_time: number, deltaMs: number) => {
      if (deltaMs <= 0) return
      const dt = Math.min(deltaMs / 1000, MAX_FRAME_S)
      const y = window.scrollY
      const velocity = (y - lastY) / dt
      lastY = y
      const pull = pool.stretchMax * Math.tanh(velocity / pool.fullSpeedPxS)
      speed += (stiffness * (pull - stretch) - damping * speed) * dt
      stretch += speed * dt
      if (!Number.isFinite(stretch) || !Number.isFinite(speed)) {
        rest()
        return
      }
      if (velocity === 0 && Math.abs(stretch) < REST_STRETCH && Math.abs(speed) < REST_SPEED) {
        rest()
        return
      }
      setScaleY(1 + drawn(stretch))
    }

    ScrollTrigger.create({
      trigger: lip,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: wake,
      onToggle: (self) => {
        if (!self.isActive) rest()
      },
    })
    return () => {
      sleep()
      gsap.set(lip, { clearProps: 'transform' })
    }
  })
}
