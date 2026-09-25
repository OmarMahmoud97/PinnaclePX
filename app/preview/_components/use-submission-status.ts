'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'
import type { StatusView, SubmissionStatus } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'

// How a submission is coming along, asked of GET /api/status/{slug} (the route every done spec
// intercepts by its URL) until the designs are ready, or the submission turns out to be
// exhausted, failed or unknown. One poller per submission for the whole tab, however many
// components ask, so the done view and the pane inside it read the same answer from one request.
// A hidden tab keeps asking, only less often (docs/start-page-journey-plan.md, 7.6), and asks at
// once when it is shown again. The poller stops asking when the last component watching it goes;
// a request already out still lands, so a watcher that comes straight back (React mounts
// everything twice in development) shares it rather than sending another.

type Poller = {
  // The route's latest answer.
  answer: StatusView | undefined
  // What the first watcher already knew, which stands in until the first answer.
  seed: SubmissionStatus | undefined
  listeners: Set<() => void>
  timer: ReturnType<typeof setTimeout> | undefined
  asking: boolean
}

const pollers = new Map<string, Poller>()

const STATUSES = new Set(['missing', 'building', 'ready', 'partial', 'exhausted', 'failed'])

// The route's answer, checked for the one field every reader branches on.
function isStatus(value: unknown): value is StatusView {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    typeof value.status === 'string' &&
    STATUSES.has(value.status)
  )
}

async function fetchStatus(slug: string): Promise<StatusView> {
  const response = await fetch(`/api/status/${encodeURIComponent(slug)}`, { cache: 'no-store' })
  if (!response.ok) throw new Error(`The status route answered ${String(response.status)}`)
  const body: unknown = await response.json()
  if (!isStatus(body)) throw new Error('The status route answered with no status')
  return body
}

function interval(): number {
  return document.visibilityState === 'hidden'
    ? CONFIG.start.wait.hiddenPollMs
    : CONFIG.polling.statusMs
}

function schedule(slug: string, poller: Poller, delayMs: number): void {
  clearTimeout(poller.timer)
  poller.timer = setTimeout(() => {
    void poll(slug, poller)
  }, delayMs)
}

// Settled means there is nothing more to ask: every status but building.
function settled(poller: Poller): boolean {
  const known = poller.answer ?? poller.seed
  return known !== undefined && known.status !== 'building'
}

async function poll(slug: string, poller: Poller): Promise<void> {
  poller.asking = true
  try {
    poller.answer = await fetchStatus(slug)
    for (const listener of poller.listeners) listener()
  } catch {
    // A dropped request or a failed read is not the end: ask again next time.
  } finally {
    poller.asking = false
  }
  if (poller.listeners.size > 0 && !settled(poller)) schedule(slug, poller, interval())
}

// Coming back to a hidden tab asks at once rather than waiting out the slower clock.
function askWhenShown(): void {
  if (document.visibilityState === 'hidden') return
  for (const [slug, poller] of pollers) {
    if (poller.listeners.size > 0 && !poller.asking && !settled(poller)) {
      clearTimeout(poller.timer)
      void poll(slug, poller)
    }
  }
}

let watchingVisibility = false

// Watches one submission; `seed` stands in for the first answer when nobody has asked yet, as the
// server's own render does for a design or the designs page. Returns the way to stop watching.
export function watchStatus(
  slug: string,
  listener: () => void,
  seed?: SubmissionStatus,
): () => void {
  if (!watchingVisibility) {
    document.addEventListener('visibilitychange', askWhenShown)
    watchingVisibility = true
  }
  let poller = pollers.get(slug)
  if (poller === undefined) {
    poller = { answer: undefined, seed, listeners: new Set(), timer: undefined, asking: false }
    pollers.set(slug, poller)
  }
  const watched = poller
  watched.listeners.add(listener)
  if (watched.listeners.size === 1 && !watched.asking && !settled(watched)) {
    if ((watched.answer ?? watched.seed) === undefined) void poll(slug, watched)
    else schedule(slug, watched, interval())
  }
  return () => {
    watched.listeners.delete(listener)
    if (watched.listeners.size === 0) clearTimeout(watched.timer)
  }
}

// The route's latest answer for a submission, or undefined before the first.
export function latestStatus(slug: string): StatusView | undefined {
  return pollers.get(slug)?.answer
}

// The submission's status as it changes. With `initial`, what the caller already knows stands in
// until the first answer; without, it is undefined until then. Every answer is the route's full
// view (plan 8.2); a seed is whatever the caller had, so a caller that seeds with a view reads
// views throughout.
export function useSubmissionStatus<Seed extends SubmissionStatus>(
  slug: string,
  initial: Seed,
): Seed | StatusView
export function useSubmissionStatus(slug: string): StatusView | undefined
export function useSubmissionStatus(
  slug: string,
  initial?: SubmissionStatus,
): SubmissionStatus | undefined {
  // The first value only: a caller that builds its initial status afresh on every render must
  // not look like a new status each time.
  const [seed] = useState(initial)
  const subscribe = useCallback(
    (listener: () => void) => watchStatus(slug, listener, seed),
    [slug, seed],
  )
  return useSyncExternalStore(
    subscribe,
    () => latestStatus(slug) ?? seed,
    () => seed,
  )
}
