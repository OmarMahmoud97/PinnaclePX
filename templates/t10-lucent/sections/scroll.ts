import { clamp01, expoOut, powerOut, powerOutFn } from './ease'
import type { Scene } from './scene'

// The source's scroll-tied motion, which it ran with GSAP's ScrollTrigger, in one frame loop.
//
// Entrances that play once when a block's top crosses a line on the screen (GSAP's default
// toggle actions, "play none none none"): measured, as ScrollTrigger measured them, from the
// block's box as it stands, its starting offset included, and played at once for any block
// already past its line when the page loads. Scrubbed motion follows the scroll between a block's
// start and end lines; the promo's frame chases it with GSAP's half-second lag (a tween on expo.out
// restarted from where it stands at every scroll step). Each frame reads every box first and
// writes after, and carries a running chase on to the frame's own time before reading the scroll,
// as GSAP's ticker did.

type Entrance = { element: HTMLElement; line: number; play: () => void }

type Scrub = {
  // The scroll positions where the motion starts and ends, measured from the layout.
  measure: () => void
  // Writes the frame; true while a chase is still running.
  render: (y: number, vh: number, now: number) => boolean
}

// Where a block's top sits on the page, from its box as it stands, borders included, as
// ScrollTrigger measured it; only for blocks this never moves.
const boxTop = (element: Element): number => element.getBoundingClientRect().top + window.scrollY

// Where a block's top sits on the page as laid out, ignoring the transform this gives it: the
// promo's frame, which grows as the page scrolls.
const layoutTop = (element: HTMLElement): number => {
  let top = 0
  for (
    let node: HTMLElement | null = element;
    node !== null;
    node = node.offsetParent as HTMLElement | null
  ) {
    top += node.offsetTop
  }
  return top
}

// A block's progress between "top bottom" (its top at the screen's foot) and an end line.
const progress = (y: number, start: number, end: number) =>
  end === start ? (y >= end ? 1 : 0) : clamp01((y - start) / (end - start))

// Under reduced motion only the tint, the bar and the button to the top run, as the source's did:
// its GSAP block, which held every entrance and scrub, ran only for a visitor who allowed motion.
export function scrollMotion(root: Element, scene: Scene, reduce: boolean): void {
  const entrances: Entrance[] = []
  const scrubs: Scrub[] = []
  if (!reduce) collect(root, scene, entrances, scrubs)
  chrome(root, scene, entrances, scrubs)
}

function collect(root: Element, scene: Scene, entrances: Entrance[], scrubs: Scrub[]): void {
  // Every small line, paragraph, picture and card with data-reveal: from 40px down and clear,
  // 1s on power4.out, when its top reaches 90% of the screen.
  for (const element of root.querySelectorAll<HTMLElement>('[data-reveal]')) {
    entrances.push({
      element,
      line: 0.9,
      play: () => {
        element.setAttribute('data-revealed', '')
        scene.track(
          element.animate(
            [
              { opacity: 0, transform: 'translateY(40px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 1000, easing: powerOut('power4'), fill: 'backwards' },
          ),
        )
      },
    })
  }

  // The steps' pills: each out of a 10px blur from 12px down, 0.9s on power3.out, 0.12s apart,
  // when the list's top reaches 88%.
  const steps = root.querySelector<HTMLElement>('[data-steps]')
  if (steps !== null) {
    entrances.push({
      element: steps,
      line: 0.88,
      play: () => {
        steps.setAttribute('data-shown', '')
        ;[...steps.children].forEach((item, index) => {
          scene.track(
            item.animate(
              [
                { opacity: 0, filter: 'blur(10px)', transform: 'translateY(12px)' },
                { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' },
              ],
              { duration: 900, delay: index * 120, easing: powerOut('power3'), fill: 'backwards' },
            ),
          )
        })
      },
    })
  }

  // The plans: each out of a 14px blur from 24px down, 1.1s on power3.out, 0.14s apart, when
  // their row's top reaches 85%. Written frame by frame as GSAP wrote them, into the cards' own
  // style: each card's stylesheet eases every change of its transform over half a second on a
  // spring, so the rise trails the fade and settles with a slight overshoot, as the source's did.
  const plans = root.querySelector<HTMLElement>('[data-plans]')
  if (plans !== null) {
    const cards = [...plans.children] as HTMLElement[]
    const ease = powerOutFn('power3')
    const write = (card: HTMLElement, p: number) => {
      const e = ease(p)
      card.style.opacity = String(e)
      card.style.filter = `blur(${String(14 * (1 - e))}px)`
      card.style.transform = `translate(0px, ${String(24 * (1 - e))}px)`
    }
    let frame = 0
    scene.defer(() => {
      cancelAnimationFrame(frame)
      for (const card of cards) {
        card.style.opacity = ''
        card.style.filter = ''
        card.style.transform = ''
      }
    })
    entrances.push({
      element: plans,
      line: 0.85,
      play: () => {
        for (const card of cards) write(card, 0)
        plans.setAttribute('data-shown', '')
        const start = performance.now()
        const tick = (now: number) => {
          let running = false
          for (const [index, card] of cards.entries()) {
            const p = clamp01((now - start - index * 140) / 1100)
            write(card, p)
            if (p < 1) running = true
          }
          frame = running ? requestAnimationFrame(tick) : 0
        }
        frame = requestAnimationFrame(tick)
      },
    })
  }

  // The statement's words: each up from 110% of its height inside its clip, 0.9s on power4.out,
  // a fiftieth of a second apart, when the paragraph's top reaches 82%.
  const words = root.querySelector<HTMLElement>('[data-words]')
  if (words !== null) {
    entrances.push({
      element: words,
      line: 0.82,
      play: () => {
        words.setAttribute('data-shown', '')
        words.querySelectorAll<HTMLElement>('.lc-word > *').forEach((word, index) => {
          scene.track(
            word.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], {
              duration: 900,
              delay: index * 20,
              easing: powerOut('power4'),
              fill: 'backwards',
            }),
          )
        })
      },
    })
  }

  // The overview's and the white card's pictures: from 7% up to 7% down across the frame's
  // whole passage through the screen, held at 112% so no edge shows.
  for (const frame of root.querySelectorAll<HTMLElement>('[data-parallax]')) {
    const picture = frame.firstElementChild as HTMLElement | null
    if (picture === null || picture.classList.contains('lc-placeholder')) continue
    let start = 0
    let end = 0
    let last = Number.NaN
    scrubs.push({
      measure: () => {
        start = boxTop(frame) - window.innerHeight
        end = boxTop(frame) + frame.offsetHeight
      },
      render: (y) => {
        const p = progress(y, start, end)
        if (p !== last) {
          last = p
          picture.style.transform = `translate(0%, ${String(-7 + 14 * p)}%) scale(1.12, 1.12)`
        }
        return false
      },
    })
  }

  // The promo: its frame grows from 100% to 120% between its section's top reaching the screen's
  // foot and reaching 18% of the screen, chasing the scroll with a 0.5s lag; the picture inside
  // grows from 100% to 116% across the frame's whole passage, with no lag.
  const media = root.querySelector<HTMLElement>('[data-promo]')
  const promo = media?.closest('section')
  if (media != null && promo != null) {
    const film = media.firstElementChild as HTMLElement | null
    let start = 0
    let end = 0
    let filmStart = 0
    let filmEnd = 0
    let value = Number.NaN
    let target = 0
    let from = 0
    let at = 0
    let lastFilm = Number.NaN
    const LAG = 500
    scrubs.push({
      measure: () => {
        const vh = window.innerHeight
        start = boxTop(promo) - vh
        end = boxTop(promo) - 0.18 * vh
        filmStart = layoutTop(media) - vh
        filmEnd = layoutTop(media) + media.offsetHeight
      },
      render: (y, _vh, now) => {
        if (Number.isNaN(value)) {
          value = target = progress(y, start, end)
        } else if (value !== target) {
          const t = clamp01((now - at) / LAG)
          value = t >= 1 ? target : from + (target - from) * expoOut(t)
        }
        const next = progress(y, start, end)
        if (next !== target) {
          target = next
          from = value
          at = now
        }
        media.style.transform = `scale(${String(1 + 0.2 * value)})`
        if (film !== null && !film.classList.contains('lc-placeholder')) {
          const p = progress(y, filmStart, filmEnd)
          if (p !== lastFilm) {
            lastFilm = p
            film.style.transform = `scale(${String(1 + 0.16 * p)})`
          }
        }
        return value !== target
      },
    })
  }

  // The reminder: its picture drifts from 6% up to 6% down, held at 110%, and the notice from 42%
  // to 58% of the card's height, across the card's whole passage through the screen.
  const card = root.querySelector<HTMLElement>('[data-reminder]')
  if (card !== null) {
    const picture = card.querySelector<HTMLElement>('.lc-reminder__bg:not(.lc-placeholder)')
    const notice = card.querySelector<HTMLElement>('.lc-notice')
    let start = 0
    let end = 0
    let last = Number.NaN
    scrubs.push({
      measure: () => {
        start = boxTop(card) - window.innerHeight
        end = boxTop(card) + card.offsetHeight
      },
      render: (y) => {
        const p = progress(y, start, end)
        if (p !== last) {
          last = p
          if (picture !== null) {
            picture.style.transform = `translate(0%, ${String(-6 + 12 * p)}%) scale(1.1, 1.1)`
          }
          if (notice !== null) notice.style.top = `${String(42 + 16 * p)}%`
        }
        return false
      },
    })
    // The notice drops in once a third of the card is on the screen (the stylesheet's
    // transition, 0.7s and 0.8s on the source's curve).
    scene.observe(
      [card],
      (entry, observer) => {
        if (!entry.isIntersecting) return
        card.classList.add('is-in')
        observer.disconnect()
      },
      { threshold: 0.35 },
    )
  }
}

function chrome(root: Element, scene: Scene, entrances: Entrance[], scrubs: Scrub[]): void {
  // The tint that warms the page around the wide picture, which the source drove from every scroll
  // event. On a desktop it rises over 85% of a screen as the block's top comes up from the foot
  // and falls over 85% as its foot goes up past the top. On a phone or a tablet (900px and
  // narrower) it starts only once the hero's phone has gone 5% of a screen above the top, rises
  // over 35% of a screen, and falls over half a screen as the block's foot goes up past the top.
  const tint = root.querySelector<HTMLElement>('.lc-tint')
  const widgets = root.querySelector<HTMLElement>('[data-widgets]')
  const device = root.querySelector<HTMLElement>('.lc-hero__device')
  let lastTint = ''
  const tintFor = (vh: number): string => {
    if (widgets === null) return '0.000'
    const block = widgets.getBoundingClientRect()
    if (window.innerWidth <= 900) {
      const fadeIn =
        device === null
          ? clamp01((0.55 * vh - block.top) / (0.35 * vh))
          : clamp01((-0.05 * vh - device.getBoundingClientRect().bottom) / (0.35 * vh))
      const fadeOut = clamp01(block.bottom / (vh * 0.5))
      return Math.min(fadeIn, fadeOut).toFixed(3)
    }
    const fadeIn = clamp01((vh - block.top) / (vh * 0.85))
    const fadeOut = clamp01(block.bottom / (vh * 0.85))
    return Math.min(fadeIn, fadeOut).toFixed(3)
  }

  // The bar thickens its tint once the page has scrolled 30px; the button to the top shows once
  // it has scrolled a screen.
  const nav = root.querySelector<HTMLElement>('[data-nav]')
  const toTop = root.querySelector<HTMLElement>('[data-to-top]')

  const measure = () => {
    for (const scrub of scrubs) scrub.measure()
  }

  // The frame: every box read first, then every write.
  let frame = 0
  const tick = (now: number) => {
    frame = 0
    const y = window.scrollY
    const vh = window.innerHeight
    const shade = tintFor(vh)
    const due: Entrance[] = []
    for (let index = entrances.length - 1; index >= 0; index -= 1) {
      const entrance = entrances[index]
      if (entrance === undefined) continue
      if (entrance.element.getBoundingClientRect().top <= entrance.line * vh) {
        due.unshift(entrance)
        entrances.splice(index, 1)
      }
    }
    for (const entrance of due) entrance.play()
    if (tint !== null && shade !== lastTint) {
      lastTint = shade
      tint.style.opacity = shade
    }
    nav?.classList.toggle('is-scrolled', y > 30)
    toTop?.classList.toggle('is-on', y > vh)
    let chasing = false
    for (const scrub of scrubs) {
      if (scrub.render(y, vh, now)) chasing = true
    }
    if (chasing) frame = requestAnimationFrame(tick)
  }
  const request = () => {
    if (frame === 0) frame = requestAnimationFrame(tick)
  }

  measure()
  tick(performance.now())
  scene.on(window, 'scroll', request, { passive: true })
  scene.on(window, 'resize', () => {
    measure()
    request()
  })
  // The layout moves when the fonts arrive and when an answer opens: measure again then.
  const observer = new ResizeObserver(() => {
    measure()
    request()
  })
  observer.observe(root)
  scene.defer(() => {
    observer.disconnect()
    cancelAnimationFrame(frame)
    const moved = root.querySelectorAll<HTMLElement>(
      '[data-parallax] > *, [data-promo], [data-promo] > *, .lc-reminder__bg, .lc-notice',
    )
    for (const element of moved) {
      element.style.transform = ''
      element.style.top = ''
    }
    if (tint !== null) tint.style.opacity = ''
  })
}
