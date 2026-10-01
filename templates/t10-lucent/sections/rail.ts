import type { Scene } from './scene'

// The source's rail of feature cards. The browser scrolls and snaps it; this marks the dot of the
// card whose left edge is nearest the rail's own (its padding counted), moves the rail to a card
// when its dot is pressed, and moves it to a card a link names, since the browser scrolls the page
// to the card but the source's rail did not follow on its own: the bar's second link opens the
// last card. Under reduced motion the rail jumps rather than glides.
export function featureRail(root: Element, scene: Scene, reduce: boolean): void {
  const rail = root.querySelector<HTMLElement>('[data-rail]')
  const section = rail?.closest('section')
  if (rail == null || section == null) return
  const dots = [...section.querySelectorAll<HTMLButtonElement>('.lc-rail__dot')]
  const slides = [...rail.querySelectorAll<HTMLElement>('.lc-rail__slide')]
  if (dots.length < 2 || slides.length < 2) return
  const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth'

  const sync = () => {
    const pad = Number.parseFloat(getComputedStyle(rail).paddingLeft) || 0
    const base = rail.getBoundingClientRect().left + pad
    let best = 0
    let min = Number.POSITIVE_INFINITY
    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - base)
      if (distance < min) {
        min = distance
        best = index
      }
    })
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === best)
      if (index === best) dot.setAttribute('aria-current', 'true')
      else dot.removeAttribute('aria-current')
    })
  }

  const to = (index: number, how: ScrollBehavior) => {
    const slide = slides[index]
    const first = slides[0]
    if (slide === undefined || first === undefined) return
    rail.scrollTo({ left: slide.offsetLeft - first.offsetLeft, behavior: how })
  }

  const ids = new Map(slides.map((slide, index) => [slide.id, index] as const))
  const jump = (hash: string, how: ScrollBehavior) => {
    const index = ids.get(hash.replace('#', ''))
    if (index === undefined) return
    scene.timeout(() => {
      to(index, how)
    }, 60)
  }

  scene.on(rail, 'scroll', sync, { passive: true })
  scene.on(window, 'resize', sync, { passive: true })
  dots.forEach((dot, index) => {
    scene.on(dot, 'click', () => {
      to(index, behavior)
    })
  })
  scene.on(root, 'click', (event) => {
    const link = (event.target as Element | null)?.closest('a[href^="#"]')
    if (link) jump(link.getAttribute('href') ?? '', behavior)
  })
  scene.on(window, 'hashchange', () => {
    jump(window.location.hash, behavior)
  })
  if (window.location.hash !== '') jump(window.location.hash, 'auto')
  sync()
}
