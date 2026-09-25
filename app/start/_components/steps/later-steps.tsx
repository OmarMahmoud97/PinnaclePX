'use client'

import { useEffect, useState } from 'react'
import { type QuestionId, QUESTION_IDS } from '@/lib/brief/question-ids'

// The steps after the first (docs/start-page-journey-plan.md, 9.6 and D27): one chunk of their own
// (later-steps-chunk.ts), fetched by a plain import() while the first question is answered, so
// /start's first scripts carry only the first question's step, which the page opens on. One chunk
// rather than one a step: with four, Turbopack regrouped the home page's own chunks around them and
// its scripts grew by 463 B (measured 25 September 2026). No next/dynamic and no Suspense: the page
// has no boundary (ADR 0035). A later question opens once the chunk is here, so it never shows
// without its controls, and once it is, every Next opens its question in the same commit.

export type LaterSteps = typeof import('@/app/start/_components/steps/later-steps-chunk')

let request: Promise<LaterSteps> | null = null
let loaded: LaterSteps | null = null

// Fetches the chunk, once. A failed fetch is forgotten, so the next call asks again.
function load(): Promise<LaterSteps> {
  request ??= import('@/app/start/_components/steps/later-steps-chunk').then(
    (steps) => {
      loaded = steps
      return steps
    },
    (error: unknown) => {
      request = null
      throw error instanceof Error ? error : new Error('The later questions did not load')
    },
  )
  return request
}

// The first question's step is in the page's own scripts; every other one is in the chunk.
function needsChunk(id: QuestionId): boolean {
  return id !== QUESTION_IDS[0]
}

// Fetched while the question before a later one is answered. A failure here is met again, and
// shown, when that question opens.
export function preloadAfter(index: number): void {
  const next = QUESTION_IDS[index + 1]
  if (next !== undefined && needsChunk(next)) load().catch(() => undefined)
}

// The later steps as a question has them: here (null for the first question, which needs none),
// on their way, or failed, with the way to ask again.
type StepChunk =
  | Readonly<{ kind: 'ready'; steps: LaterSteps | null }>
  | Readonly<{ kind: 'loading' }>
  | Readonly<{ kind: 'failed'; retry: () => void }>

// A later question the visit opens on, not reached from the first (the hero's hand-off, a refresh,
// a kept draft), asks for the chunk as it first renders rather than once it has committed, so the
// wait is one fetch and no more; load() asks once however often it is called.
export function useStepChunk(id: QuestionId): StepChunk {
  const needed = needsChunk(id)
  const [state, setState] = useState<'ready' | 'loading' | 'failed'>(() => {
    if (!needed || loaded !== null) return 'ready'
    load().catch(() => undefined)
    return 'loading'
  })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!needed) return
    let current = true
    load().then(
      () => {
        if (current) setState('ready')
      },
      () => {
        if (current) setState('failed')
      },
    )
    return () => {
      current = false
    }
  }, [needed, attempt])

  if (state === 'ready') return { kind: 'ready', steps: loaded }
  if (state === 'loading') return { kind: 'loading' }
  return {
    kind: 'failed',
    retry: () => {
      setState('loading')
      setAttempt((count) => count + 1)
    },
  }
}
