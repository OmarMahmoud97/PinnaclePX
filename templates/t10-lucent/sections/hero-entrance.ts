import { EASE, EASE_SOFT, powerOut } from './ease'
import { buildLines, removeLines } from './mask'
import { allFinished, fontsReady, type Scene } from './scene'

// The source's splash. Its wordmark's letters rose, left to right, from 12.15% of their height
// below out of a 14px blur, 0.6s each on GSAP's power2.out, 0.04s apart, in a timeline it played
// at twice its speed on a desktop and three times on a phone or a touch screen; when the last had
// risen the sheet faded (0.4s, 0.3s on a phone, by the stylesheet). Under reduced motion it showed
// the wordmark still for 0.7s. Whatever happened, the sheet went after 1.8s.
export function runLoader(root: Element, scene: Scene, reduce: boolean): Promise<void> {
  const loader = root.querySelector<HTMLElement>('.lc-loader')
  const logo = loader?.querySelector<HTMLElement>('.lc-loader__logo')
  if (loader == null || logo == null) return Promise.resolve()
  return new Promise<void>((resolve) => {
    let gone = false
    const dismiss = () => {
      if (gone) return
      gone = true
      loader.classList.add('is-done')
      resolve()
    }
    scene.defer(() => {
      loader.classList.remove('is-done')
      logo.style.opacity = ''
    })
    scene.timeout(dismiss, 1800)
    logo.style.opacity = '1'
    if (reduce) {
      scene.timeout(dismiss, 700)
      return
    }
    const touch = !window.matchMedia('(hover: hover)').matches
    const speed = touch || window.matchMedia('(max-width: 900px)').matches ? 3 : 2
    const letters = [...logo.children] as HTMLElement[]
    const animations = letters.map((letter, index) =>
      scene.track(
        letter.animate(
          [
            { transform: 'translateY(12.15%)', opacity: 0, filter: 'blur(14px)' },
            { transform: 'translateY(0)', opacity: 1, filter: 'blur(0px)' },
          ],
          {
            duration: 600 / speed,
            delay: (index * 40) / speed,
            easing: powerOut('power2'),
            fill: 'backwards',
          },
        ),
      ),
    )
    void allFinished(animations).then(dismiss)
  })
}

// The source's hero entrance, once the fonts are in and the splash has begun to fade: the
// headline's lines slide up out of their clips (0.62s each, 0.07s apart), the phone fades in out
// of a 10px blur (1.1s after 0.3s), and the lead and the buttons rise 14px out of a 10px blur
// (1.1s each, 0.18s and 0.3s after the last line starts). The headline's own words come back at
// the first resize after, not at once, as the source restored them then: a line that the
// browser broke differently would otherwise jump.
const RISE: Keyframe[] = [
  { opacity: 0, transform: 'translate3d(0,14px,0)', filter: 'blur(10px)' },
  { opacity: 1, transform: 'translate3d(0,0,0)', filter: 'blur(0px)' },
]

export function heroEntrance(root: Element, scene: Scene, splash: Promise<void>): void {
  const hero = root.querySelector<HTMLElement>('[data-hero]')
  const title = hero?.querySelector<HTMLElement>('.lc-hero__title')
  if (hero == null || title == null) return
  const lead = hero.querySelector<HTMLElement>('.lc-hero__lead')
  const cta = hero.querySelector<HTMLElement>('.lc-hero__cta')
  const device = hero.querySelector<HTMLElement>('.lc-hero__device')

  void fontsReady().then(() => {
    if (scene.stopped()) return
    const lines = buildLines(title, 'hero')
    scene.defer(() => {
      if (!title.hasAttribute('data-shown')) removeLines(title)
      hero.removeAttribute('data-shown')
    })
    void splash.then(() => {
      if (scene.stopped()) return
      const played: Animation[] = []
      const play = (element: HTMLElement | null, keyframes: Keyframe[], delay: number) => {
        if (element === null) return
        played.push(
          scene.track(
            element.animate(keyframes, {
              duration: 1100,
              delay,
              easing: EASE_SOFT,
              fill: 'both',
            }),
          ),
        )
      }
      play(
        device,
        [
          { opacity: 0, filter: 'blur(10px)' },
          { opacity: 1, filter: 'blur(0px)' },
        ],
        300,
      )
      const slides = lines.map((line, index) =>
        scene.track(
          line.animate(
            [{ transform: 'translate3d(0,140%,0)' }, { transform: 'translate3d(0,0,0)' }],
            { duration: 620, delay: index * 70, easing: EASE, fill: 'both' },
          ),
        ),
      )
      const last = (lines.length - 1) * 70
      play(lead, RISE, last + 180)
      play(cta, RISE, last + 300)
      hero.setAttribute('data-shown', '')
      void allFinished(played).then(() => {
        for (const animation of played) animation.cancel()
      })
      void allFinished(slides).then(() => {
        scene.on(
          window,
          'resize',
          () => {
            title.setAttribute('data-shown', '')
            removeLines(title)
          },
          { once: true, passive: true },
        )
      })
    })
  })
}
