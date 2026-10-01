import { EASE } from './ease'
import type { Scene } from './scene'

// The source's questions open and shut smoothly rather than at once: an answer grows from
// nothing to its height while it fades in and settles 8px (0.4s), and shrinks back the same way
// before the row closes (0.3s), on the source's curve. A row ignores a press while it moves.
// Under reduced motion it opens and shuts at once.
export function easeAnswers(root: Element, scene: Scene, reduce: boolean): void {
  for (const row of root.querySelectorAll<HTMLDetailsElement>('details.lc-qa')) {
    const summary = row.querySelector('summary')
    const answer = row.querySelector<HTMLElement>(':scope > p')
    if (summary === null || answer === null) continue
    let busy = false
    scene.on(summary, 'click', (event) => {
      event.preventDefault()
      if (reduce) {
        row.open = !row.open
        return
      }
      if (busy) return
      busy = true
      if (row.open) {
        const height = answer.offsetHeight
        const animation = scene.track(
          answer.animate(
            [
              { height: `${String(height)}px`, opacity: 1, transform: 'translateY(0)' },
              { height: '0px', opacity: 0, transform: 'translateY(-8px)' },
            ],
            { duration: 300, easing: EASE },
          ),
        )
        animation.onfinish = () => {
          row.open = false
          busy = false
        }
      } else {
        row.open = true
        const height = answer.offsetHeight
        const animation = scene.track(
          answer.animate(
            [
              { height: '0px', opacity: 0, transform: 'translateY(-8px)' },
              { height: `${String(height)}px`, opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 400, easing: EASE },
          ),
        )
        animation.onfinish = () => {
          busy = false
        }
      }
    })
  }
}
