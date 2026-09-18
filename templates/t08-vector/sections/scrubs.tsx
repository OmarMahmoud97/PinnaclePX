'use client'

import { useEffect } from 'react'

// The source tied its entrances to the scroll with GSAP's ScrollTrigger: each ran between a
// start line and an end line of the viewport (measured against its trigger's top, the trigger
// being itself, its section or a grid), and with `scrub: 1` the entrance did not follow the
// scroll directly but chased it, a tween of one second on an expo curve restarted at every
// scroll step; the parts of a group followed one timeline with a stagger. This does the same
// for every [data-scrub] part: the block names its lines, its lag, its curve and its trigger,
// the part names its offset and scale as CSS variables, and each frame the chased progress is
// eased and written as opacity, translate and scale. The stylesheet's scroll-driven fallback
// (vector.css) is switched off on each part it takes over. Under reduced motion nothing runs
// and nothing is hidden.

// GSAP counts its powers from quad: power2.out is the cubic curve, power3.out the quartic.
type Ease = (t: number) => number
const power3: Ease = (t) => 1 - (1 - t) ** 4
const power2: Ease = (t) => 1 - (1 - t) ** 3
const ease = (name: string | undefined): Ease => (name === 'power2' ? power2 : power3)
const expoOut: Ease = (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t))
const clamp = (v: number) => Math.min(1, Math.max(0, v))

type Part = Readonly<{ el: HTMLElement; fromX: number; fromY: number; fromScale: number }>
type Item = {
  trigger: HTMLElement
  parts: readonly Part[]
  start: number
  end: number
  lag: number
  ease: Ease
  stagger: number
  duration: number
  measuredOffset: number
  startY: number
  endY: number
  value: number
  target: number
  tweenFrom: number
  tweenAt: number
}

// The distance from the page's top to an element's top, from layout alone, as the source's
// library measured its triggers (with the part's own offset, which sat on it when measured).
function pageTop(el: HTMLElement): number {
  let top = 0
  let node: HTMLElement | null = el
  while (node !== null) {
    top += node.offsetTop
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null
  }
  return top
}

function number(el: HTMLElement, name: string, fallback: number): number {
  const raw = el.dataset[name]
  const parsed = raw === undefined ? Number.NaN : Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

function fromValue(el: HTMLElement, name: string, fallback: number): number {
  const raw = getComputedStyle(el).getPropertyValue(name).trim()
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

function part(el: HTMLElement): Part {
  return {
    el,
    fromX: fromValue(el, '--from-x', 0),
    fromY: fromValue(el, '--from-y', 0),
    fromScale: fromValue(el, '--from-scale', 1),
  }
}

function paint(p: Part, eased: number) {
  p.el.style.opacity = String(eased)
  p.el.style.translate = `${String((1 - eased) * p.fromX)}px ${String((1 - eased) * p.fromY)}px`
  if (p.fromScale !== 1) p.el.style.scale = String(p.fromScale + (1 - p.fromScale) * eased)
}

function apply(item: Item) {
  if (item.parts.length === 1 || item.stagger === 0) {
    for (const p of item.parts) paint(p, item.ease(item.value))
    return
  }
  const total = item.duration + item.stagger * (item.parts.length - 1)
  const time = item.value * total
  item.parts.forEach((p, i) => {
    paint(p, item.ease(clamp((time - i * item.stagger) / item.duration)))
  })
}

export function VectorScrubs() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector('.vector')
    if (root === null) return
    const items: Item[] = []
    const seen = new Set<Element>()
    for (const el of root.querySelectorAll<HTMLElement>('[data-scrub], [data-scrub-group]')) {
      if (seen.has(el)) continue
      const group = el.hasAttribute('data-scrub-group')
      const parts = group
        ? [...el.querySelectorAll<HTMLElement>(':scope > [data-scrub]')].map(part)
        : [part(el)]
      for (const p of parts) seen.add(p.el)
      const triggerKind = el.dataset.trigger ?? (group ? 'self' : 'self')
      const trigger =
        triggerKind === 'section'
          ? (el.closest('section') ?? el)
          : triggerKind === 'parent'
            ? (el.parentElement ?? el)
            : el
      items.push({
        trigger,
        parts,
        start: number(el, 'start', 90) / 100,
        end: number(el, 'end', 70) / 100,
        lag: number(el, 'lag', 1),
        ease: ease(el.dataset.ease),
        stagger: group ? number(el, 'stagger', 0.1) : 0,
        duration: group ? number(el, 'dur', 0.8) : 1,
        measuredOffset: trigger === el && !group ? (parts[0]?.fromY ?? 0) : 0,
        startY: 0,
        endY: 0,
        value: 0,
        target: 0,
        tweenFrom: 0,
        tweenAt: 0,
      })
    }
    if (items.length === 0) return
    for (const item of items) {
      for (const p of item.parts) p.el.style.animation = 'none'
      apply(item)
    }

    const refresh = () => {
      const vh = window.innerHeight
      for (const item of items) {
        const top = pageTop(item.trigger) + item.measuredOffset
        item.startY = top - item.start * vh
        item.endY = top - item.end * vh
      }
      measure()
    }

    let frame = 0
    let running = false
    const tick = (now: number) => {
      let active = false
      for (const item of items) {
        if (item.value === item.target && item.tweenAt === 0) continue
        const t = clamp((now - item.tweenAt) / (item.lag * 1000))
        const next = item.tweenFrom + (item.target - item.tweenFrom) * expoOut(t)
        item.value = next
        apply(item)
        if (t >= 1) {
          item.value = item.target
          item.tweenAt = 0
        } else active = true
      }
      if (active) frame = requestAnimationFrame(tick)
      else running = false
    }
    const measure = () => {
      const y = window.scrollY
      let changed = false
      for (const item of items) {
        const span = item.endY - item.startY
        const target = span === 0 ? (y >= item.startY ? 1 : 0) : clamp((y - item.startY) / span)
        if (target !== item.target) {
          item.target = target
          item.tweenFrom = item.value
          item.tweenAt = performance.now()
          changed = true
        }
      }
      if (changed && !running) {
        running = true
        frame = requestAnimationFrame(tick)
      }
    }

    refresh()
    const later = window.setTimeout(refresh, 600)
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.clearTimeout(later)
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', refresh)
      window.removeEventListener('load', refresh)
    }
  }, [])
  return null
}
