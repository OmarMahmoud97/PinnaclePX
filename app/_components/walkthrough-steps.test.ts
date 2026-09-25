import { describe, expect, it } from 'vitest'
import { HOW_IT_WORKS } from '@/app/_components/section-copy'
import { BUILT_STAGE, EMPTY_STAGE } from '@/app/_components/walkthrough-brand'
import {
  answeredAt,
  questionNumberAt,
  SKETCHED_STAGE,
  stagesOf,
  WALKTHROUGH_LABELS,
  WALKTHROUGH_STEPS,
  WALKTHROUGH_STOPS,
} from '@/app/_components/walkthrough-steps'
import { QUESTIONS } from '@/app/start/_components/start-copy'
import { QUESTION_IDS } from '@/lib/brief/question-ids'

// Every stop the scroll can reach, the empty frame first.
const ALL = Array.from({ length: BUILT_STAGE + 1 }, (_, stage) => stage)

describe('the walkthrough steps', () => {
  it("are /start's questions, titled with its own headings and in its order", () => {
    expect(WALKTHROUGH_STEPS).toHaveLength(QUESTION_IDS.length)
    expect(HOW_IT_WORKS.steps.map((step) => step.title)).toEqual(
      QUESTION_IDS.map((id) => QUESTIONS[id].title),
    )
  })

  it('paint every stop once, in order, from the first answer to the finished page', () => {
    expect(EMPTY_STAGE).toBe(0)
    expect(WALKTHROUGH_STEPS.flatMap(stagesOf)).toEqual(ALL.slice(1))
    expect(WALKTHROUGH_STOPS).toHaveLength(BUILT_STAGE)
  })

  it('build the page at the last stop alone, and hold the finished sketch at the one before', () => {
    const built = WALKTHROUGH_STOPS.flatMap((beats, index) =>
      beats.includes('build') ? [index + 1] : [],
    )
    expect(built).toEqual([BUILT_STAGE])
    expect(SKETCHED_STAGE).toBe(BUILT_STAGE - 1)
  })

  it("give only the last step a second stop, which is the room the phone's dock keeps", () => {
    expect(WALKTHROUGH_STEPS.map((step) => stagesOf(step).length)).toEqual([1, 1, 1, 1, 2])
  })

  it('land the name and then the logo on one stop, hold for the send, and build last', () => {
    expect(WALKTHROUGH_STOPS).toEqual([
      ['sentence'],
      ['name', 'logo'],
      ['look'],
      ['colour'],
      [],
      ['build'],
    ])
  })

  it('hand the page the stages each step paints', () => {
    expect(HOW_IT_WORKS.steps.map((step) => step.stages)).toEqual(WALKTHROUGH_STEPS.map(stagesOf))
  })
})

describe('answeredAt', () => {
  it('counts every step painted so far, the one being painted included', () => {
    expect(ALL.map(answeredAt)).toEqual([0, 1, 2, 3, 4, 5, 5])
  })
})

describe('questionNumberAt', () => {
  it('counts the step being painted, and the first while the frame is empty', () => {
    expect(ALL.map(questionNumberAt)).toEqual([1, 1, 2, 3, 4, 5, 5])
  })
})

describe('WALKTHROUGH_LABELS', () => {
  it("names the example brand's answers in the walkthrough's own order", () => {
    expect(WALKTHROUGH_LABELS).toEqual([
      'Sentence',
      'Fernbrook Gardens, logo',
      'Warm and natural, 4 photos',
      'Forest',
      'Your details',
    ])
  })
})
