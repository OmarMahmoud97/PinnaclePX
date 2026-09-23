import { CONDITIONS, type SectionContext, type Tools } from '@/app/_components/motion'
import { CONFIG } from '@/lib/config'

// #included (plan 7.2). From md up the four job cards are an owned batch: they rise as Work's
// tiles do, and each card's glyph draws itself on as the card lands. On a phone the cards keep
// the CSS reveal and only the draw-on is authored here, fired when PageMotion marks the list in
// view, because a stroke drawing on is the one entrance CSS cannot write. The draw-on decorates
// and never hides content, so it is not owned and needs no settle: the markup ships the glyphs
// whole, the dash is set only on a list not yet seen, and it is cleared by name once drawn.

const { choreo } = CONFIG.motion
const GLYPH = '.job-glyph'
const STROKES = 'path, circle, line, polyline, rect'
const DASH = 'strokeDasharray,strokeDashoffset'

type Gsap = Tools['gsap']
type Stroke = SVGGeometryElement

function strokesOf(card: HTMLElement): Stroke[] {
  return [...card.querySelectorAll<Stroke>(`${GLYPH} :is(${STROKES})`)]
}

// Each stroke hidden behind its own length, so bringing the offset to 0 draws it end to end.
function hide(gsap: Gsap, strokes: readonly Stroke[]): void {
  for (const stroke of strokes) {
    const length = stroke.getTotalLength()
    gsap.set(stroke, { strokeDasharray: length, strokeDashoffset: length })
  }
}

// One glyph draws over `duration` with its strokes a beat apart, `delay` after its card starts,
// and leaves nothing inline behind.
function draw(
  gsap: Gsap,
  strokes: readonly Stroke[],
  duration: number,
  stagger: number,
  delay: number,
): void {
  if (strokes.length === 0) return
  gsap.to(strokes, {
    strokeDashoffset: 0,
    duration,
    ease: 'power2.inOut',
    stagger,
    delay,
    clearProps: DASH,
  })
}

export function included({ gsap, root, mm, own, onInview, itemsOf }: SectionContext): void {
  const section = root.querySelector<HTMLElement>('#included')
  if (section === null) return
  const group = section.querySelector<HTMLElement>('[data-choreo="jobs"]')
  if (group === null) return

  mm.add(CONDITIONS, (media) => {
    const scrubs = media.conditions?.scrubs === true
    const entrances = media.conditions?.entrances === true
    const cards = itemsOf(group)
    const glyphs = cards.map(strokesOf)
    // The glyphs draw in the cards' own order, each as its card lands.
    const drawAll = (duration: number, stagger: number, cardStagger: number) => {
      glyphs.forEach((strokes, index) => {
        draw(gsap, strokes, duration, stagger, index * cardStagger)
      })
    }

    // From md up: the batch rise, with the glyphs drawing on inside it.
    const owned =
      scrubs &&
      own(group, {
        arm: ({ rise }) => {
          rise()
          for (const strokes of glyphs) hide(gsap, strokes)
        },
        enter: ({ finish }) => {
          drawAll(choreo.drawS, choreo.glyphStaggerS, choreo.staggerS)
          finish({ duration: choreo.tweenS, ease: 'power3.out', stagger: choreo.staggerS })
        },
        // Someone else showed the list first (the fail-safe, a fast flick): the cards finish at
        // the CSS settle and the glyphs complete in the same beat.
        preempt: ({ finish, settleS }) => {
          drawAll(settleS, 0, 0)
          finish({ duration: settleS, ease: 'power2.out' })
        },
      })
    if (owned || !entrances) return

    // A phone, or a list ScrollTrigger could not claim: the CSS reveal moves the cards, and the
    // glyphs draw on the moment the list is marked in view. The dash goes on only if that moment
    // is still to come, so a list already seen is never un-drawn.
    const waiting = onInview(group, () => {
      drawAll(choreo.drawS, choreo.glyphStaggerS, choreo.staggerS)
    })
    if (waiting) for (const strokes of glyphs) hide(gsap, strokes)
  })
}
