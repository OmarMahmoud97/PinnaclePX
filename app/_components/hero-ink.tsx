'use client'

import { useEffect, useRef } from 'react'
import { CONFIG } from '@/lib/config'
import type { InkColour } from '@/lib/motion/fluid'
import { whenIdle } from '@/lib/motion/idle'
import { useMotionAllowed } from '@/lib/motion/use-motion-allowed'

// The ink's colour is the hero's `--hero-ink` custom property (app/globals.css), read once from
// the canvas so the gradient and the ink that sits on it are tuned in one place. A six-digit
// hex, or the page is misconfigured and the error says so.
function inkColourOf(canvas: HTMLCanvasElement): InkColour {
  const hex = getComputedStyle(canvas).getPropertyValue('--hero-ink').trim()
  const value = Number.parseInt(hex.slice(1), 16)
  if (!/^#[0-9a-f]{6}$/i.test(hex) || Number.isNaN(value)) {
    throw new Error(`--hero-ink must be a six-digit hex colour, not "${hex}"`)
  }
  return { r: ((value >> 16) & 255) / 255, g: ((value >> 8) & 255) / 255, b: (value & 255) / 255 }
}

// The ink over the hero's gradient: a small fluid simulation on the GPU (lib/motion/fluid.ts,
// explained in docs/fluid-hero-guide.md). The canvas multiplies onto the gradient, so it is
// invisible until the simulation draws, and the server sends only the empty canvas. A client
// that allows motion fetches the simulation as its own chunk once the browser is idle, the way
// GSAP and Lenis arrive (ADR 0005); reduced motion, JavaScript off, no WebGL and a chunk that
// never arrives all keep the still gradient. The simulation itself runs only while the hero is
// on screen.
export function HeroInk() {
  const ref = useRef<HTMLCanvasElement>(null)
  const motionAllowed = useMotionAllowed()

  useEffect(() => {
    const canvas = ref.current
    if (!motionAllowed || canvas === null) return
    let cancelled = false
    let stop: (() => void) | undefined
    const cancelIdle = whenIdle(() => {
      const colour = inkColourOf(canvas)
      import('@/lib/motion/fluid')
        .then(({ startFluid }) => {
          if (cancelled) return
          stop = startFluid(canvas, { colour, ...CONFIG.hero.ink })
        })
        .catch(() => {
          // The chunk never arrived: the gradient stands on its own, as it does for everyone
          // who never loads it.
        })
    })
    return () => {
      cancelled = true
      cancelIdle()
      stop?.()
    }
  }, [motionAllowed])

  return <canvas ref={ref} aria-hidden="true" className="hero-ink" />
}
