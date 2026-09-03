import { describe, expect, it } from 'vitest'
import { flipDelta } from '@/lib/motion/flip'

const FROM = { left: 100, top: 50, width: 50, height: 20 }
const TO = { left: 200, top: 150, width: 100, height: 40 }

describe('flipDelta', () => {
  it('moves and scales the target back onto the source box', () => {
    expect(flipDelta(FROM, TO)).toEqual({ x: -100, y: -100, scaleX: 0.5, scaleY: 0.5 })
  })

  it('divides translations, and only translations, by an ancestor zoom', () => {
    expect(flipDelta(FROM, TO, 2)).toEqual({ x: -50, y: -50, scaleX: 0.5, scaleY: 0.5 })
  })

  it('keeps scale 1 for a target with no size', () => {
    const delta = flipDelta(FROM, { ...TO, width: 0, height: 0 })
    expect(delta.scaleX).toBe(1)
    expect(delta.scaleY).toBe(1)
  })

  it('is identity when the boxes already match', () => {
    expect(flipDelta(TO, TO)).toEqual({ x: 0, y: 0, scaleX: 1, scaleY: 1 })
  })
})
