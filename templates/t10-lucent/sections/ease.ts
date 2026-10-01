// The curves the source's motion ran on, for the Web Animations API.
//
// Its own Web Animations ran on two cubic beziers, kept as written. Its GSAP tweens ran on GSAP's
// power curves, which count from quad: power2.out is cubic, power3.out quartic and power4.out
// quintic, 1 - (1 - t)^n. No bezier follows a quartic or a quintic closely, so each is a CSS
// linear() easing sampled from the polynomial, with the closest bezier where the browser has no
// linear() (Chrome before 113, Safari before 17.2, Firefox before 112).

export const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
export const EASE_SOFT = 'cubic-bezier(0.22, 1, 0.36, 1)'

const out = (exponent: number) => (t: number) => 1 - (1 - t) ** exponent

// GSAP's out curves by their power, and the bezier to fall back on for each.
const POWERS = {
  power2: { curve: out(3), fallback: 'cubic-bezier(0.33, 1, 0.68, 1)' },
  power3: { curve: out(4), fallback: 'cubic-bezier(0.25, 1, 0.5, 1)' },
  power4: { curve: out(5), fallback: 'cubic-bezier(0.22, 1, 0.36, 1)' },
} as const

type Power = keyof typeof POWERS

// Enough points that the steep start of a quintic is followed to within a few thousandths.
const SAMPLES = 64

function sampled(curve: (t: number) => number): string {
  const points = Array.from({ length: SAMPLES + 1 }, (_, index) =>
    Number(curve(index / SAMPLES).toFixed(5)),
  )
  return `linear(${points.join(', ')})`
}

const cache = new Map<Power, string>()

// GSAP's `<power>.out` as a function, for motion written frame by frame.
export function powerOutFn(power: Power): (t: number) => number {
  return POWERS[power].curve
}

// The easing string for GSAP's `<power>.out`.
export function powerOut(power: Power): string {
  const known = cache.get(power)
  if (known !== undefined) return known
  const { curve, fallback } = POWERS[power]
  const value = CSS.supports('animation-timing-function', 'linear(0, 1)')
    ? sampled(curve)
    : fallback
  cache.set(power, value)
  return value
}

// GSAP's expo.out, the curve its scrub chases the scroll on: 1 - 2^(-10t), landing on 1 at the end.
export const expoOut = (t: number): number => (t >= 1 ? 1 : 1 - 2 ** (-10 * t))

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))
