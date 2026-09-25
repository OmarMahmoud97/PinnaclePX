import { describe, expect, it } from 'vitest'
import { sketchModelFrom } from '@/components/sketch/sketch-model'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'

// The stage, counted from 1, at which each question is reached.
const LOOK = QUESTION_IDS.indexOf('imagery') + 1
const COLOUR = QUESTION_IDS.indexOf('colours') + 1

const NONE = { logo: null, photos: [] }
const BLANK: Answers = {
  description: '',
  name: '',
  company: '',
  email: '',
  logo: { kind: 'wordmark' },
  imagery: { style: 'minimal', photos: [] },
  colours: { kind: 'palette', paletteId: 'forest' },
}
const ANSWERS: Answers = {
  ...BLANK,
  company: ' Ashgrove Physio ',
  imagery: { style: 'dark', photos: [{ id: 'p1', fileName: 'shop.jpg', url: null }] },
  colours: { kind: 'custom', hex: '#abc' },
}

describe('sketchModelFrom', () => {
  // The name stands in for a logo, as it does in every template, so the model carries no
  // initials for the mark: none of the designs would draw them.
  it('draws the company from the answers as soon as it is typed', () => {
    const model = sketchModelFrom(ANSWERS, 2, NONE)
    expect(model.company).toBe('Ashgrove Physio')
    expect(model).not.toHaveProperty('initials')
  })

  it('holds the style and the photos back until the imagery question', () => {
    const files = { logo: null, photos: ['blob:shop'] }
    expect(sketchModelFrom(ANSWERS, LOOK - 1, files).imageStyle).toBeNull()
    expect(sketchModelFrom(ANSWERS, LOOK - 1, files).photos).toEqual([])
    expect(sketchModelFrom(ANSWERS, LOOK, files).imageLabel).toBe('Dark and moody')
    expect(sketchModelFrom(ANSWERS, LOOK, files).photos).toEqual(['blob:shop'])
  })

  it('stays grey until the colour question, then tints from the chosen hex', () => {
    expect(sketchModelFrom(ANSWERS, COLOUR - 1, NONE).vars).toMatchObject({
      '--sketch-glow': 'transparent',
    })
    expect(sketchModelFrom(ANSWERS, COLOUR, NONE).vars).toMatchObject({
      '--sketch-strong': expect.stringContaining('#aabbcc') as string,
    })
  })

  it('is coloured only once the colour question is reached', () => {
    expect(sketchModelFrom(ANSWERS, COLOUR - 1, NONE).coloured).toBe(false)
    expect(sketchModelFrom(ANSWERS, COLOUR, NONE).coloured).toBe(true)
  })

  it('swaps the surfaces for the dark style', () => {
    expect(sketchModelFrom(ANSWERS, LOOK, NONE).vars).toMatchObject({
      '--sketch-bg': 'var(--scrim)',
    })
    expect(sketchModelFrom(BLANK, LOOK, NONE).vars).toMatchObject({
      '--sketch-bg': 'var(--surface)',
    })
  })
})
