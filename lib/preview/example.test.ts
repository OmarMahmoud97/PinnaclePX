import { describe, expect, it } from 'vitest'
import { CONFIG } from '@/lib/config'
import type { SlotImage } from '@/lib/copy-slots/assets'
import { exampleView } from '@/lib/preview/example'

const photo = (templateId: string): SlotImage => ({
  src: `https://store.public.blob.vercel-storage.com/photos/${templateId}.jpg`,
  alt: '',
  width: 1920,
  height: 1280,
  credit: { photographer: 'Ana Ruiz', url: 'https://www.pexels.com/@ana-ruiz' },
})

const OPTIONS = {
  slug: 'example',
  conceptCount: 3,
  deadlineAt: new Date(Date.now() + CONFIG.deadline.totalMs),
  brief: { company: 'Kestrel', description: 'Garden design studio in Bath.' },
  photo,
} as const

describe('exampleView', () => {
  it('fills every photo once the imagery stage has finished', () => {
    const view = exampleView('ready', OPTIONS)
    expect(view.status).toBe('ready')
    expect(view.concepts.map((concept) => concept.photo !== null)).toEqual([true, true, true])
  })

  // A partial build's note says some photo spaces were left plain, so the example shows one.
  it('leaves the second design plain when the imagery stage fell back', () => {
    const view = exampleView('partial', OPTIONS)
    expect(view.status).toBe('partial')
    expect(view.concepts.map((concept) => concept.photo !== null)).toEqual([true, false, true])
    expect(view.concepts.every((concept) => concept.href !== null)).toBe(true)
  })
})
