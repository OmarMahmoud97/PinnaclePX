import { describe, expect, it } from 'vitest'
import { stageAt, stagesFrom } from '@/app/_components/walkthrough-stops'

// Three beats, laid out as How it works lays them: the first paints stages 1 and 2, the second
// stage 3, the third stages 4, 5 and 6.
const BEATS = [
  { top: 100, height: 200, stages: [1, 2] },
  { top: 340, height: 100, stages: [3] },
  { top: 480, height: 300, stages: [4, 5, 6] },
]

describe('stageAt', () => {
  it('is the empty frame before the first beat reaches the anchor', () => {
    expect(stageAt(0, BEATS)).toBe(0)
    expect(stageAt(99, BEATS)).toBe(0)
  })

  it('paints a stage the moment its line passes the anchor', () => {
    expect(stageAt(100, BEATS)).toBe(1)
    expect(stageAt(199, BEATS)).toBe(1)
    expect(stageAt(200, BEATS)).toBe(2)
  })

  it('spreads several stages evenly down one beat', () => {
    expect(stageAt(480, BEATS)).toBe(4)
    expect(stageAt(579, BEATS)).toBe(4)
    expect(stageAt(580, BEATS)).toBe(5)
    expect(stageAt(680, BEATS)).toBe(6)
  })

  it('holds the last stage past the end of the beats', () => {
    expect(stageAt(5_000, BEATS)).toBe(6)
  })

  it('keeps the furthest stage reached even if a beat is out of order', () => {
    expect(stageAt(400, [...BEATS].reverse())).toBe(3)
  })

  it('is stage 0 with no beats at all', () => {
    expect(stageAt(400, [])).toBe(0)
  })
})

describe('stagesFrom', () => {
  it('reads the stages a beat paints from its attribute', () => {
    expect(stagesFrom('4 5 6')).toEqual([4, 5, 6])
    expect(stagesFrom(' 3 ')).toEqual([3])
  })

  it('ignores a missing or malformed attribute', () => {
    expect(stagesFrom(undefined)).toEqual([])
    expect(stagesFrom('two')).toEqual([])
  })
})
