'use client'

import { useEffect, useRef } from 'react'
import { CONFIG } from '@/lib/config'
import type { InkColour } from '@/lib/motion/fluid'
import { whenIdle } from '@/lib/motion/idle'
import { useMotionAllowed } from '@/lib/motion/use-motion-allowed'

// The ink's colour is the `--ink` custom property (app/globals.css), read once from the canvas
// so the grounds it sits on and the ink are tuned in one place. A six-digit hex, or the page is
// misconfigured and the error says so.
function inkColourOf(canvas: HTMLCanvasElement): InkColour {
  const hex = getComputedStyle(canvas).getPropertyValue('--ink').trim()
  const value = Number.parseInt(hex.slice(1), 16)
  if (!/^#[0-9a-f]{6}$/i.test(hex) || Number.isNaN(value)) {
    throw new Error(`--ink must be a six-digit hex colour, not "${hex}"`)
  }
  return { r: ((value >> 16) & 255) / 255, g: ((value >> 8) & 255) / 255, b: (value & 255) / 255 }
}

// Ink over a section's ground: a small fluid simulation on the GPU (lib/motion/fluid.ts,
// explained in docs/fluid-hero-guide.md), in the hero (ADR 0031) and the closing section (ADR
// 0032). The canvas multiplies onto the ground, so it is invisible until the simulation draws,
// and the server sends only the empty canvas. A client that allows motion fetches the simulation
// as its own chunk once the browser is idle, the way GSAP and Lenis arrive (ADR 0005); reduced
// motion, JavaScript off, no WebGL and a chunk that never arrives all keep the still ground.
//
// Each canvas gets its own context, made at that same idle moment rather than when its section
// nears the screen: creating a context and compiling the shaders is a few frames of main-thread
// work, spent here before the visitor does anything instead of in the middle of a scroll. What
// it holds while off screen is a few megabytes of quarter-resolution textures, since the
// simulation itself requests frames only while its canvas is on screen.
export function Ink() {
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
          stop = startFluid(canvas, { colour, ...CONFIG.ink })
        })
        .catch(() => {
          // The chunk never arrived: the ground stands on its own, as it does for everyone who
          // never loads it.
        })
    })
    return () => {
      cancelled = true
      cancelIdle()
      stop?.()
    }
  }, [motionAllowed])

  return <canvas ref={ref} aria-hidden="true" className="ink" />
}
