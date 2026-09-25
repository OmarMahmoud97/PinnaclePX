import { QUESTION_IDS } from '@/lib/brief/question-ids'

// Where the flow is, and how it moves (docs/start-page-journey-plan.md, 7.4 and 7.5). The address
// names a question (?q=1 to ?q=5) or a submission (?q=done&s={slug}); bare /start names neither
// and is resolved by the entry rules. Moves go through the History API rather than the router:
// Next.js follows pushState and replaceState into useSearchParams, the page never asks the
// server for anything, and each entry can keep state of its own beside Next's.

const PATH = '/start'
const DONE = 'done'

// What the flow shows: a question by its 0-based index, or the done view of one submission.
export type View =
  Readonly<{ kind: 'question'; index: number }> | Readonly<{ kind: 'done'; slug: string }>

// What the address asks for. An arrival is bare /start or, not bare, ?q=done without its slug, a
// link cut short; the entry rules decide what either shows (brief-reducer.ts, arrivalView).
export type Requested = View | Readonly<{ kind: 'arrival'; bare: boolean }>

// The search params as useSearchParams or URLSearchParams gives them.
export type Params = Readonly<{ get: (name: string) => string | null }>

// Any other value of q is the first question, as it always was.
export function requestedFrom(params: Params): Requested {
  const q = params.get('q')
  if (q === null) return { kind: 'arrival', bare: true }
  if (q === DONE) {
    const slug = params.get('s') ?? ''
    return slug === '' ? { kind: 'arrival', bare: false } : { kind: 'done', slug }
  }
  const n = Number(q)
  const known = Number.isInteger(n) && n >= 1 && n <= QUESTION_IDS.length
  return { kind: 'question', index: known ? n - 1 : 0 }
}

// What the tab's address asks for now, or null once the tab has left /start.
export function addressNow(): Requested | null {
  if (window.location.pathname !== PATH) return null
  return requestedFrom(new URLSearchParams(window.location.search))
}

export function hrefFor(view: View): string {
  return view.kind === 'done'
    ? `${PATH}?q=${DONE}&s=${encodeURIComponent(view.slug)}`
    : `${PATH}?q=${String(view.index + 1)}`
}

// The address to put in place of the one asked for when the flow shows something else: a
// question past what the answers allow, bare /start that resumes further on or opens a live
// submission, a done link cut short. Only bare /start at the first question keeps its address.
export function correctionFor(requested: Requested, view: View): string | null {
  const href = hrefFor(view)
  if (requested.kind !== 'arrival') return hrefFor(requested) === href ? null : href
  return requested.bare && view.kind === 'question' && view.index === 0 ? null : href
}

// What each /start entry in the tab's history keeps beside Next's own state: how deep into /start
// it is (1 for the entry the visitor arrived on), the question of the entry it was pushed from,
// and whether the tab had anything before /start. Read back after a reload too, since a browser
// keeps an entry's state with it.
type Entry = Readonly<{ depth: number; from: number | undefined; before: boolean }>

export function entryOf(state: unknown): Entry | null {
  if (typeof state !== 'object' || state === null) return null
  const depth = 'startDepth' in state ? state.startDepth : undefined
  if (typeof depth !== 'number') return null
  const from = 'startFrom' in state ? state.startFrom : undefined
  const before = 'startBefore' in state ? state.startBefore : undefined
  return { depth, from: typeof from === 'number' ? from : undefined, before: before === true }
}

// How far Back from a question entry must go on so that one Back from done leaves /start (plan
// D32): past every /start entry to whatever came before. With nothing before /start, as far as
// its first entry, which then takes the done address (0: go nowhere).
export function stepsOut(entry: Entry): number {
  return entry.before ? entry.depth : entry.depth - 1
}

function currentEntry(): Entry | null {
  return entryOf(window.history.state)
}

// Next's state for this entry, to keep when adding ours to it.
function nextState(): object {
  const state: unknown = window.history.state
  return typeof state === 'object' && state !== null ? state : {}
}

// Marks the entry the visitor arrived on, once: a reload or a return keeps the mark it has. Next's
// own state is carried in the same object, which Next passes through untouched.
export function markArrival(): void {
  if (currentEntry() !== null) return
  window.history.replaceState(
    { ...nextState(), startDepth: 1, startBefore: window.history.length > 1 },
    '',
    window.location.href,
  )
}

// A new entry for a move forward, from a question or from done. Next adds its own state and
// updates the search params.
export function pushView(view: View, from: number | undefined): void {
  const entry = currentEntry()
  window.history.pushState(
    { startDepth: (entry?.depth ?? 1) + 1, startFrom: from, startBefore: entry?.before ?? true },
    '',
    hrefFor(view),
  )
}

// This entry at another address: a corrected one, a send's done view, a missing one's way back
// to the first question.
export function replaceAddress(href: string): void {
  const entry = currentEntry()
  window.history.replaceState(
    { startDepth: entry?.depth ?? 1, startFrom: entry?.from, startBefore: entry?.before ?? true },
    '',
    href,
  )
}

export function replaceView(view: View): void {
  replaceAddress(hrefFor(view))
}

// In-app Back from a question: the browser's own Back when the entry behind is the question
// before, so the two Backs agree; otherwise the question before takes this entry's place.
export function stepBack(index: number): void {
  if (currentEntry()?.from === index - 1) window.history.back()
  else replaceView({ kind: 'question', index: index - 1 })
}

// The Backs already acted on. More than one listener can hear the same Back (see the cleanup
// below), and only the first may send the browser on.
const handled = new WeakSet<Event>()

// While done shows, a Back that lands on one of /start's questions goes on out of /start (plan
// D32). A Back is a move to a shallower entry; a Forward, to the question "Start a new brief"
// opened, goes deeper and is left to show that question. An entry the flow never marked has no
// depth, so from one every move counts as a Back. `onLeaving` holds done on screen while the
// browser travels, so no question is painted, and lets it go if the tab comes back from the
// back-forward cache. Returns the cleanup.
export function leaveOnBack(done: View, onLeaving: (leaving: boolean) => void): () => void {
  const doneDepth = currentEntry()?.depth ?? Number.POSITIVE_INFINITY
  const onPop = (event: PopStateEvent) => {
    if (handled.has(event)) return
    const entry = currentEntry()
    const requested = addressNow()
    if (entry === null || requested === null || requested.kind === 'done') return
    if (entry.depth >= doneDepth) return
    handled.add(event)
    const steps = stepsOut(entry)
    if (steps > 0) {
      onLeaving(true)
      window.history.go(-steps)
      return
    }
    replaceView(done)
    onLeaving(false)
  }
  const onShow = (event: PageTransitionEvent) => {
    if (event.persisted) onLeaving(false)
  }
  window.addEventListener('popstate', onPop)
  window.addEventListener('pageshow', onShow)
  return () => {
    window.removeEventListener('pageshow', onShow)
    // The Back itself takes the done view down before this listener's turn: Next's popstate
    // listener was added first, a window runs its listeners in that order, and React renders a
    // transition begun in a popstate at once, cleanup included. So the listener stays for the rest
    // of the task, and the Back that ends done still reaches it; it goes before any other can.
    setTimeout(() => {
      window.removeEventListener('popstate', onPop)
    }, 0)
  }
}
