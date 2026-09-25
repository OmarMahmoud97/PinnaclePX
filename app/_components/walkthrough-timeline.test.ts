import { describe, expect, it } from 'vitest'
import { glideSeconds } from '@/app/_components/walkthrough-timeline'
import { CONFIG } from '@/lib/config'

// The stops' labels as make() lays them, in seconds: the send's hold (s5) has no beats, so it
// shares its time with the colour's stop (s4), and the build ends at s6.
const LABELS = { s0: 0, s1: 3, s2: 4.6, s3: 5.7, s4: 6.6, s5: 6.6, s6: 8.8 }
const { catchUp } = CONFIG.walkthrough

describe('glideSeconds', () => {
  it('plays the next stop at its own speed', () => {
    const name = LABELS.s2 - LABELS.s1
    expect(glideSeconds(LABELS, LABELS.s1, LABELS.s2)).toBeCloseTo(name)
    expect(glideSeconds(LABELS, LABELS.s2, LABELS.s1)).toBeCloseTo(name)
  })

  it('plays the build at the same speed both ways, across the hold', () => {
    const build = LABELS.s6 - LABELS.s5
    expect(glideSeconds(LABELS, LABELS.s5, LABELS.s6)).toBeCloseTo(build)
    expect(glideSeconds(LABELS, LABELS.s6, LABELS.s5)).toBeCloseTo(build)
    expect(glideSeconds(LABELS, LABELS.s6, LABELS.s4)).toBeCloseTo(build)
  })

  it('caps a jump over several stops, a little more for each further stop', () => {
    const two = (catchUp.firstMs + catchUp.perStageMs) / 1000
    expect(glideSeconds(LABELS, LABELS.s0, LABELS.s2)).toBeCloseTo(two)
    expect(glideSeconds(LABELS, LABELS.s2, LABELS.s0)).toBeCloseTo(two)
    expect(glideSeconds(LABELS, LABELS.s0, LABELS.s6)).toBeCloseTo(catchUp.maxMs / 1000)
    expect(glideSeconds(LABELS, LABELS.s6, LABELS.s0)).toBeCloseTo(catchUp.maxMs / 1000)
  })

  it('never plays a jump slower than its own speed', () => {
    // A glide caught just short of the name's stop and sent on to the look crosses two stops.
    const from = LABELS.s2 - 0.1
    expect(glideSeconds(LABELS, from, LABELS.s3)).toBeCloseTo(LABELS.s3 - from)
  })
})
