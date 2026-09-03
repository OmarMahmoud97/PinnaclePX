import { describe, expect, it } from 'vitest'
import { INITIAL_ANSWERS } from '@/app/start/_components/brief-reducer'
import { sketchModelFrom } from '@/app/start/_components/sketch-model'
import type { Answers } from '@/lib/brief/schema'

const NONE = { logo: null, photos: [] }
const ANSWERS: Answers = {
  ...INITIAL_ANSWERS,
  company: ' Ashgrove Physio ',
  imagery: { style: 'dark', fileNames: ['shop.jpg'] },
  colours: { kind: 'custom', hex: '#abc' },
}

describe('sketchModelFrom', () => {
  it('draws the company from the answers as soon as it is typed', () => {
    const model = sketchModelFrom(ANSWERS, 2, NONE)
    expect(model.company).toBe('Ashgrove Physio')
    expect(model.initials).toBe('AP')
  })

  it('holds the style and the photos back until the imagery question', () => {
    const files = { logo: null, photos: ['blob:shop'] }
    expect(sketchModelFrom(ANSWERS, 3, files).imageStyle).toBeNull()
    expect(sketchModelFrom(ANSWERS, 3, files).photos).toEqual([])
    expect(sketchModelFrom(ANSWERS, 4, files).imageLabel).toBe('Dark and moody')
    expect(sketchModelFrom(ANSWERS, 4, files).photos).toEqual(['blob:shop'])
  })

  it('stays grey until the colour question, then tints from the chosen hex', () => {
    expect(sketchModelFrom(ANSWERS, 4, NONE).vars).toMatchObject({ '--sketch-glow': 'transparent' })
    expect(sketchModelFrom(ANSWERS, 5, NONE).vars).toMatchObject({
      '--sketch-strong': expect.stringContaining('#aabbcc') as string,
    })
  })

  it('swaps the surfaces for the dark style', () => {
    expect(sketchModelFrom(ANSWERS, 4, NONE).vars).toMatchObject({ '--sketch-bg': 'var(--scrim)' })
    expect(sketchModelFrom(INITIAL_ANSWERS, 4, NONE).vars).toMatchObject({
      '--sketch-bg': 'var(--surface)',
    })
  })
})
