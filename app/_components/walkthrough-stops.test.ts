import { describe, expect, it } from 'vitest'
import { stackedBeats, stageAt, stagesFrom } from '@/app/_components/walkthrough-stops'

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

describe('stackedBeats', () => {
  // Five steps docked one after another, as the phone lays them: 144 px each (9rem), the last
  // holding the finished sketch and then building the page.
  const DOCKED = stackedBeats(
    0,
    [[1], [2], [3], [4], [5, 6]].map((stages) => ({ height: 144, stages })),
  )

  it('lays each step below the ones before it', () => {
    expect(DOCKED.map(({ top }) => top)).toEqual([0, 144, 288, 432, 576])
  })

  it('gives the last step a step of scroll for each stage it paints', () => {
    expect(DOCKED.map(({ height }) => height)).toEqual([144, 144, 144, 144, 288])
  })

  it('reaches one stop per step of scroll, and the build one step after the colour', () => {
    expect(stageAt(-1, DOCKED)).toBe(0)
    expect(stageAt(0, DOCKED)).toBe(1)
    expect(stageAt(144, DOCKED)).toBe(2)
    expect(stageAt(719, DOCKED)).toBe(5)
    expect(stageAt(720, DOCKED)).toBe(6)
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
