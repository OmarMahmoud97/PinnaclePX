'use client'

import { useEffect, useEffectEvent, useLayoutEffect, useRef } from 'react'
import { SENDING } from '@/app/start/_components/start-copy'

// Where the ink is: held while the brief is on its way, run on over the page once it has gone,
// or drained back to the question when it did not.
export type Bloom = 'hold' | 'complete' | 'drain'

type Props = Readonly<{ phase: Bloom; onEnd: () => void }>

// The send as a held breath (docs/start-page-journey-plan.md, D16, 4.8 and 6.2): the ink blooms
// from the ask, the phone menu's disc (header.css), to 38 per cent of its reach
// (CONFIG.start.send.holdShare) and holds there until the server answers; then it runs on to
// cover the page, which the done view's own ink takes over, or drains in 450 ms. "Off it goes."
// rises on it in the serif italic. It is decoration, hidden from assistive technology: the ask
// keeps the focus and says "Sending", and the status line says it once.
//
// It sits in the region, under the draft and over main (start-done.css), and outside the keyed
// question, so it runs on across the question's change to the done view. It blooms from the ask,
// which has the focus when the brief is sent (question-pane.tsx), measured once as it starts; the
// sheet's own point, the foot of the page's middle, stands in for a press without one. The run-on
// is the done view's, so its rules load with that view's chunk (start-done-view.css); a phase
// with nothing to play, as when that chunk never came, ends at once rather than holding the page.
export function SendBloom({ phase, onEnd }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const end = useEffectEvent(onEnd)

  useLayoutEffect(() => {
    const layer = ref.current
    const ask = document.activeElement
    if (layer === null || !(ask instanceof HTMLElement)) return
    const from = ask.getBoundingClientRect()
    const box = layer.getBoundingClientRect()
    layer.style.setProperty(
      '--press-at',
      `${String(from.left + from.width / 2 - box.left)}px ${String(from.top + from.height / 2 - box.top)}px`,
    )
  }, [])

  useEffect(() => {
    if (phase !== 'hold' && ref.current?.getAnimations().length === 0) end()
  }, [phase])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-phase={phase}
      className="send-bloom"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && phase !== 'hold') onEnd()
      }}
    >
      <p className="send-words emphasis">
        <em>{SENDING.ink}</em>
      </p>
    </div>
  )
}
