'use client'

import { useSyncExternalStore } from 'react'
import { EXAMPLE_FILES } from '@/app/_components/photos'
import { getSentence, subscribeToSentence } from '@/app/_components/sentence-store'
import { SKETCH_CAPTION } from '@/components/sketch/captions'
import { PhoneSketch } from '@/components/sketch/phone-sketch'
import { type SketchFiles, sketchModelFrom } from '@/components/sketch/sketch-model'
import { captionStyles } from '@/components/ui/caption'
import { EXAMPLE_ANSWERS, FINAL_STAGE } from '@/lib/brief/example-brief'
import type { Answers } from '@/lib/brief/schema'

const NO_FILES: SketchFiles = { logo: null, photos: [] }

// A blank brief with only the visitor's own sentence in it.
const BLANK: Answers = { ...EXAMPLE_ANSWERS, description: '', company: '' }

const getServerSentence = () => ''

// The phone frame at the end of the page: the visitor's own sentence if they typed one at the
// top, otherwise the finished example brief. The server renders the example.
export function ClosingSketch() {
  const sentence = useSyncExternalStore(subscribeToSentence, getSentence, getServerSentence)
  const own = sentence.trim() !== ''
  const model = own
    ? sketchModelFrom({ ...BLANK, description: sentence }, 1, NO_FILES)
    : sketchModelFrom(EXAMPLE_ANSWERS, FINAL_STAGE, EXAMPLE_FILES)

  return (
    <div style={model.vars} className="flex flex-col items-center gap-3">
      <div aria-hidden="true">
        <PhoneSketch model={model} zoom={1.2} />
      </div>
      <p className={`${captionStyles} max-w-56 text-center`}>
        {own ? SKETCH_CAPTION.closing : `Example brief. ${SKETCH_CAPTION.closing}`}
      </p>
    </div>
  )
}
