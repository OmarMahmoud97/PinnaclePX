import { fontsReady, type Scene } from './scene'

// The source's headline of particles on its black card (initParticleHeadline, after the app's
// own ParticleView): the heading's words are drawn into a hidden canvas in the heading's own
// face, size and place, and every second pixel of their ink becomes a dot. Until a tap the dots
// drift as a cloud over the heading's box, each on its own slow wobble, bouncing off its edges;
// a tap anywhere on the card's text sends each dot to its place on a spring whose stiffness and
// snapping thresholds grow as the gathering goes on, and once 86% of them have landed the real
// heading takes over and the canvas goes. It plays once.
//
// Two changes from the source, neither visible: the cloud rests while its card is off the
// screen (in the source it drifted all along), and focus arriving in the card's text gathers it
// as a tap does, so a visitor on a keyboard gets the heading too.

const GAP = 2
const SIZE = [0.7, 1.15] as const
const SPRING = 74

type Particle = {
  x: number
  y: number
  tx: number
  ty: number
  vx: number
  vy: number
  r: number
  phase: number
  wob: number
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

// The heading's text as lines, split where it breaks by hand, each a list of words.
function linesOf(heading: HTMLElement): string[][] {
  const text = heading.querySelector(':scope > .lc-mask-text') ?? heading
  const lines: string[] = ['']
  for (const node of text.childNodes) {
    if (node instanceof HTMLBRElement) lines.push('')
    else if (node.nodeType !== Node.COMMENT_NODE) {
      lines[lines.length - 1] = `${lines.at(-1) ?? ''}${node.textContent ?? ''}`
    }
  }
  return lines.map((line) => line.trim().split(/\s+/).filter(Boolean))
}

export function particleHeadline(root: Element, scene: Scene, reduce: boolean): void {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas.lc-particles')
  const host = canvas?.nextElementSibling
  if (canvas == null || !(host instanceof HTMLElement)) return
  if (reduce) {
    host.classList.add('is-assembled')
    scene.defer(() => {
      host.classList.remove('is-assembled')
    })
    return
  }
  const ctx = canvas.getContext('2d')
  if (ctx === null) return

  let particles: Particle[] = []
  let dpr = Math.min(window.devicePixelRatio || 1, 2)
  let color = ''
  let assembling = false
  let done = false
  let elapsed = 0
  let last = 0
  let raf = 0
  let onScreen = false
  let booted = false

  const build = (): boolean => {
    const rect = host.getBoundingClientRect()
    const style = getComputedStyle(host)
    const w = Math.ceil(rect.width)
    const h = Math.ceil(rect.height)
    if (w === 0 || h === 0) return false
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${String(w)}px`
    canvas.style.height = `${String(h)}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    color = style.color

    const off = document.createElement('canvas')
    off.width = w
    off.height = h
    const octx = off.getContext('2d', { willReadFrequently: true })
    if (octx === null) return false
    octx.fillStyle = 'white'
    octx.textBaseline = 'alphabetic'
    const size = Number.parseFloat(style.fontSize)
    octx.font = `${style.fontWeight} ${String(size)}px ${style.fontFamily}`

    // The words are laid out where the heading lays them, in a copy over it, and drawn at their
    // own places: a fixed split into lines would drift from a column whose breaks depend on the
    // screen's width. The baseline is the word box's foot less the room for descenders.
    const measure = document.createElement('span')
    measure.style.cssText = 'position:absolute;inset:0;visibility:hidden;pointer-events:none;'
    linesOf(host).forEach((words, index) => {
      if (index > 0) measure.append(document.createElement('br'))
      words.forEach((word, at) => {
        const span = document.createElement('span')
        span.textContent = word
        measure.append(span)
        if (at < words.length - 1) measure.append(' ')
      })
    })
    host.append(measure)
    const box = host.getBoundingClientRect()
    for (const span of measure.querySelectorAll('span')) {
      const b = span.getBoundingClientRect()
      const baseline = b.bottom - box.top - (b.height - size) / 2 - size * 0.09
      octx.fillText(span.textContent, b.left - box.left, baseline)
    }
    measure.remove()

    const data = octx.getImageData(0, 0, w, h).data
    particles = []
    for (let y = 0; y < h; y += GAP) {
      for (let x = 0; x < w; x += GAP) {
        if ((data[(y * w + x) * 4 + 3] ?? 0) < 96) continue
        particles.push({
          x: rand(0, w),
          y: rand(0, h),
          tx: x,
          ty: y,
          vx: rand(-60, 60),
          vy: rand(-60, 60),
          r: rand(SIZE[0], SIZE[1]),
          phase: rand(0, Math.PI * 2),
          wob: rand(1.2, 2.6),
        })
      }
    }
    return particles.length > 0
  }

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = color
    ctx.beginPath()
    for (const p of particles) {
      ctx.moveTo(p.x + p.r, p.y)
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    }
    ctx.fill()
  }

  const step = (now: number) => {
    raf = 0
    const dt = Math.min((now - last) / 1000 || 0, 1 / 30)
    last = now
    const t = now / 1000
    if (assembling) elapsed += dt

    // The spring stiffens and the snapping thresholds widen as the gathering goes on, so the last
    // dots do not trail behind the rest.
    const spring = SPRING * (1 + elapsed * 3)
    const snapD = 0.6 + elapsed * 3
    const snapV = 1.2 + elapsed * 10
    const damping = (assembling ? 0.7 : 0.985) ** (dt * 60)
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    let placed = 0
    for (const p of particles) {
      if (assembling) {
        p.vx += (p.tx - p.x) * spring * dt
        p.vy += (p.ty - p.y) * spring * dt
      } else {
        p.vx += Math.cos(t * p.wob + p.phase) * 70 * dt
        p.vy += Math.sin(t * p.wob * 1.3 + p.phase) * 70 * dt
      }
      p.vx *= damping
      p.vy *= damping
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (assembling) {
        const dx = p.tx - p.x
        const dy = p.ty - p.y
        if (
          Math.abs(dx) < snapD &&
          Math.abs(dy) < snapD &&
          Math.abs(p.vx) < snapV &&
          Math.abs(p.vy) < snapV
        ) {
          p.x = p.tx
          p.y = p.ty
          p.vx = 0
          p.vy = 0
          placed++
        }
      } else {
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        p.x = Math.min(Math.max(p.x, 0), w)
        p.y = Math.min(Math.max(p.y, 0), h)
      }
    }
    draw()

    // The real heading takes over once most dots have landed, before a grainy frame of the last
    // few can show.
    if (assembling && placed >= particles.length * 0.86) {
      done = true
      host.classList.add('is-assembled')
      canvas.hidden = true
      return
    }
    if (onScreen || assembling) raf = requestAnimationFrame(step)
  }

  const run = () => {
    if (raf !== 0 || done || !booted) return
    last = performance.now()
    raf = requestAnimationFrame(step)
  }

  const trigger = host.closest<HTMLElement>('.lc-ai__text') ?? host
  const start = () => {
    if (assembling || done || !booted) return
    assembling = true
    elapsed = 0
    // The cloud's own drift stops, and every dot sets off towards its place at once, so the tap
    // reads as an instant response.
    for (const p of particles) {
      p.vx = (p.tx - p.x) * 2.6
      p.vy = (p.ty - p.y) * 2.6
    }
    run()
  }

  void fontsReady().then(() => {
    if (scene.stopped() || !build()) return
    booted = true
    host.classList.add('is-cloud')
    canvas.hidden = false
    trigger.style.cursor = 'pointer'
    scene.on(trigger, 'click', start, { once: true })
    scene.on(trigger, 'focusin', start, { once: true })
    scene.observe([canvas], (entry) => {
      onScreen = entry.isIntersecting
      if (onScreen) run()
    })
    draw()
  })

  scene.on(
    window,
    'resize',
    () => {
      if (done || !booted) return
      cancelAnimationFrame(raf)
      raf = 0
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (build()) run()
    },
    { passive: true },
  )

  scene.defer(() => {
    cancelAnimationFrame(raf)
    host.classList.remove('is-cloud', 'is-assembled')
    canvas.hidden = true
    trigger.style.cursor = ''
  })
}
