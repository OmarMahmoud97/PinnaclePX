import type { Scene } from './scene'

// The source's buttons follow the pointer a little: while it moves over one, the button shifts
// by three tenths of the pointer's distance from its centre (its stylesheet's spring easing the
// move), and returns when it leaves. Only where there is a hovering pointer and motion is allowed.
export function magnetic(root: Element, scene: Scene): void {
  if (!window.matchMedia('(hover: hover)').matches) return
  const buttons = [...root.querySelectorAll<HTMLElement>('[data-magnetic]')]
  for (const button of buttons) {
    scene.on(button, 'mousemove', (event) => {
      const { clientX, clientY } = event as MouseEvent
      const r = button.getBoundingClientRect()
      const x = (clientX - r.left - r.width / 2) * 0.3
      const y = (clientY - r.top - r.height / 2) * 0.3
      button.style.transform = `translate(${String(x)}px, ${String(y)}px)`
    })
    scene.on(button, 'mouseleave', () => {
      button.style.transform = ''
    })
  }
  scene.defer(() => {
    for (const button of buttons) button.style.transform = ''
  })
}

// The source's links within the page: instead of the browser's jump, the page scrolls itself to
// the target, smoothly unless motion is reduced, the target's top at the top of the screen. Focus
// moves there too, as the jump would have moved it, without a ring, since the target is not a
// control.
export function pageLinks(root: Element, scene: Scene, reduce: boolean): void {
  scene.on(root, 'click', (event) => {
    const mouse = event as MouseEvent
    if (mouse.defaultPrevented || mouse.button !== 0) return
    if (mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.altKey) return
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
    if (link == null) return
    const id = link.getAttribute('href') ?? ''
    if (id.length < 2) return
    const target = document.getElementById(decodeURIComponent(id.slice(1)))
    if (target === null) return
    event.preventDefault()
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
    if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1')
      target.setAttribute('data-lc-focus', '')
      target.addEventListener(
        'blur',
        () => {
          target.removeAttribute('tabindex')
          target.removeAttribute('data-lc-focus')
        },
        { once: true },
      )
    }
    target.focus({ preventScroll: true })
  })
}
