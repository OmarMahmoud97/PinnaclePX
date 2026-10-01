// Everything the page's motion sets going, kept so that one call undoes it: listeners, timers,
// frames, observers and animations. React runs an effect twice on mount in development, so the
// first run must leave nothing behind; and work that waits on a promise checks `stopped` before
// it touches the page.

type Stop = () => void

export type Scene = {
  readonly stopped: () => boolean
  on: (
    target: Window | Document | Element,
    type: string,
    handler: (event: Event) => void,
    options?: AddEventListenerOptions,
  ) => void
  timeout: (fn: () => void, ms: number) => void
  observe: (
    elements: readonly Element[],
    callback: (entry: IntersectionObserverEntry, observer: IntersectionObserver) => void,
    options?: IntersectionObserverInit,
  ) => void
  track: (animation: Animation) => Animation
  defer: (stop: Stop) => void
  stop: Stop
}

export function createScene(): Scene {
  const stops: Stop[] = []
  let stopped = false
  return {
    stopped: () => stopped,
    on(target, type, handler, options) {
      target.addEventListener(type, handler, options)
      stops.push(() => {
        target.removeEventListener(type, handler, options)
      })
    },
    timeout(fn, ms) {
      const id = window.setTimeout(() => {
        if (!stopped) fn()
      }, ms)
      stops.push(() => {
        window.clearTimeout(id)
      })
    },
    observe(elements, callback, options) {
      const observer = new IntersectionObserver((entries, self) => {
        if (stopped) return
        for (const entry of entries) callback(entry, self)
      }, options)
      for (const element of elements) observer.observe(element)
      stops.push(() => {
        observer.disconnect()
      })
    },
    track(animation) {
      stops.push(() => {
        animation.cancel()
      })
      return animation
    },
    defer(stop) {
      stops.push(stop)
    },
    stop() {
      stopped = true
      for (const stop of stops.splice(0).reverse()) stop()
    },
  }
}

// The page's fonts, as the source waited for them before measuring any line: at most three
// seconds, so a font that never arrives does not hold the page's words back for ever.
export function fontsReady(): Promise<unknown> {
  return Promise.race([
    document.fonts.ready,
    new Promise((resolve) => {
      window.setTimeout(resolve, 3000)
    }),
  ])
}

// Waits for every animation to finish; one cancelled on the way resolves nothing.
export function allFinished(animations: readonly Animation[]): Promise<void> {
  return Promise.all(animations.map((animation) => animation.finished)).then(
    () => undefined,
    () => new Promise<void>(() => undefined),
  )
}
