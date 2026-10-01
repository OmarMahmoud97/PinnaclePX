import { EASE, EASE_SOFT } from './ease'
import { allFinished, fontsReady, type Scene } from './scene'

// The source's heading entrances, each started once the fonts are in, as it measured lines only
// then: the section headings' lines rising out of a mask, the white card's lines and the picture
// card's caption rising out of a blur, and the footer's big ask sliding up line by line.

// How far below the screen's foot a block must come before its entrance plays: the source's
// observers took 12% off the bottom of the screen.
const MARGIN = '0px 0px -12% 0px'

type Mode = 'heading' | 'hero'

// The clip each line sits in and the block its words move in, as the source styled them: a
// heading's line has room below for its descenders, the hero's room above and below, since its
// lines are set tight.
const LINE_CLIP: Readonly<Record<Mode, string>> = {
  heading: 'display:block;overflow:hidden;padding-bottom:0.24em;margin-bottom:-0.24em;',
  hero: 'display:block;overflow:hidden;padding-top:0.2em;margin-top:-0.2em;padding-bottom:0.3em;margin-bottom:-0.3em;',
}
const LINE_START: Readonly<Record<Mode, string>> = {
  heading: 'display:block;transform:translate3d(0,140%,0);will-change:transform;',
  hero: 'display:block;transform:translate3d(0,110%,0);will-change:transform;',
}

// Builds over a heading the lines its words fall into, as the source split the heading itself:
// every word an inline block (a heading's coloured words keep their colour; the hero's stops
// stay with the word before them), grouped into one line wherever a word's top moves by more
// than four pixels, each line in its clip and its words in a block moved down out of it. The
// heading's own words stay in place under it, unseen, so nothing React drew is touched and the
// heading keeps its size and its text for readers.
export function buildLines(heading: HTMLElement, mode: Mode): readonly HTMLElement[] {
  const text = heading.querySelector<HTMLElement>(':scope > .lc-mask-text')
  const source = mode === 'hero' ? text?.querySelector<HTMLElement>('.lc-line > span') : text
  if (source == null) return []
  const ghost = document.createElement('span')
  ghost.className = 'lc-mask-ghost'
  ghost.setAttribute('aria-hidden', 'true')
  heading.append(ghost)

  const words: HTMLElement[] = []
  const push = (word: string, em: boolean) => {
    const previous = words.at(-1)
    if (mode === 'hero' && /^[.,!?;:…]+$/.test(word) && previous !== undefined) {
      const mark = document.createElement('span')
      mark.textContent = word
      previous.append(mark)
      return
    }
    const span = document.createElement('span')
    span.style.display = 'inline-block'
    if (em && mode === 'heading') span.style.color = 'var(--lc-orange)'
    span.textContent = word
    words.push(span)
    ghost.append(span, ' ')
  }
  for (const node of source.childNodes) {
    if (node instanceof HTMLBRElement) {
      if (mode === 'heading') ghost.append(document.createElement('br'))
      continue
    }
    const value = node.nodeType === Node.COMMENT_NODE ? '' : (node.textContent ?? '').trim()
    if (value === '') continue
    const em = node instanceof HTMLElement && node.tagName === 'EM'
    for (const word of value.split(/\s+/)) push(word, em)
  }

  const lines: HTMLElement[][] = []
  let top: number | null = null
  for (const word of words) {
    if (top === null || Math.abs(word.offsetTop - top) > 4) {
      lines.push([])
      top = word.offsetTop
    }
    lines.at(-1)?.push(word)
  }

  ghost.replaceChildren()
  return lines.map((group) => {
    const clip = document.createElement('span')
    clip.style.cssText = LINE_CLIP[mode]
    const inner = document.createElement('span')
    inner.style.cssText = LINE_START[mode]
    group.forEach((word, index) => {
      inner.append(word)
      if (index < group.length - 1) inner.append(' ')
    })
    clip.append(inner)
    ghost.append(clip)
    return inner
  })
}

export function removeLines(heading: HTMLElement): void {
  heading.querySelector(':scope > .lc-mask-ghost')?.remove()
}

// The section headings: hidden until the fonts are in, then split into lines held below their
// clips; when the heading comes into view the lines rise in turn, 0.8s each, a tenth of a second
// apart, and the heading's own words return when the last has landed.
export function maskHeadings(root: Element, scene: Scene): void {
  const headings = [...root.querySelectorAll<HTMLElement>('[data-mask]')]
  if (headings.length === 0) return
  void fontsReady().then(() => {
    if (scene.stopped()) return
    const built = new Map(headings.map((heading) => [heading, buildLines(heading, 'heading')]))
    scene.defer(() => {
      for (const heading of headings) {
        if (!heading.hasAttribute('data-masked')) removeLines(heading)
      }
    })
    scene.observe(
      headings,
      (entry, observer) => {
        if (!entry.isIntersecting) return
        const heading = entry.target as HTMLElement
        observer.unobserve(heading)
        const inners = built.get(heading) ?? []
        const animations = inners.map((inner, index) =>
          scene.track(
            inner.animate(
              [{ transform: 'translate3d(0,110%,0)' }, { transform: 'translate3d(0,0,0)' }],
              { duration: 800, delay: index * 100, easing: EASE, fill: 'both' },
            ),
          ),
        )
        void allFinished(animations).then(() => {
          heading.setAttribute('data-masked', '')
          removeLines(heading)
        })
      },
      { rootMargin: MARGIN },
    )
  })
}

// The source's rise out of a blur: each line from 30px down and blurred by 10px, 0.9s, an eighth
// of a second apart. The white card's heading is split at its line breaks and is whole again
// afterwards, so a phone runs its lines on; the caption's lines are its own and keep their place.
const RISE: Keyframe[] = [
  { opacity: 0, transform: 'translate3d(0,30px,0)', filter: 'blur(10px)' },
  { opacity: 1, transform: 'translate3d(0,0,0)', filter: 'blur(0px)' },
]

export function riseLines(root: Element, scene: Scene): void {
  const blocks = [...root.querySelectorAll<HTMLElement>('[data-rise]')]
  if (blocks.length === 0) return
  void fontsReady().then(() => {
    if (scene.stopped()) return
    scene.observe(
      blocks,
      (entry, observer) => {
        if (!entry.isIntersecting) return
        const block = entry.target as HTMLElement
        observer.unobserve(block)
        const selector = block.dataset.rise === 'lines' ? '.lc-jrn__line' : '.lc-rise-line'
        const lines = [...block.querySelectorAll<HTMLElement>(selector)]
        const animations = lines.map((line, index) =>
          scene.track(
            line.animate(RISE, {
              duration: 900,
              delay: index * 120,
              easing: EASE_SOFT,
              fill: 'both',
            }),
          ),
        )
        void allFinished(animations).then(() => {
          block.setAttribute('data-risen', '')
          for (const animation of animations) animation.cancel()
        })
      },
      { rootMargin: MARGIN },
    )
  })
}

// The footer's big ask: its two lines slide up out of their clips as it comes into view, 0.8s
// each, a tenth of a second apart; then the clips go.
export function revealAsk(root: Element, scene: Scene): void {
  const ask = root.querySelector<HTMLElement>('[data-cta]')
  if (ask === null) return
  const inners = [...ask.querySelectorAll<HTMLElement>(':scope > .lc-footer__cta-line > span')]
  scene.observe(
    [ask],
    (entry, observer) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const animations = inners.map((inner, index) =>
        scene.track(
          inner.animate(
            [{ transform: 'translate3d(0,110%,0)' }, { transform: 'translate3d(0,0,0)' }],
            { duration: 800, delay: index * 100, easing: EASE, fill: 'both' },
          ),
        ),
      )
      void allFinished(animations).then(() => {
        ask.setAttribute('data-shown', '')
        for (const animation of animations) animation.cancel()
      })
    },
    { rootMargin: MARGIN },
  )
}
