import 'client-only'
import { CONFIG } from '@/lib/config'
import {
  advance,
  apply,
  beatLive,
  bloomAt,
  type Carry,
  carryAt,
  deviceStill,
  ease,
  type Ends,
  type Flying,
  frame,
  type Frame,
  frontPaths,
  type Geometry,
  glintAt,
  headFor,
  leaving,
  type MorphEvent,
  type MorphState,
  type Moving,
  type Pill,
  pillClip,
  type RestGeometry,
  rowAt,
  rowCurve,
  rowRaw,
  sampleAt,
  type Springs,
  springsFor,
  startState,
  type View,
} from '@/lib/motion/work-morph'

// The Work switch's controller (ADR 0039), a lazy chunk WorkMorph loads on the first intent. It
// writes what lib/motion/work-morph.ts computes; the CSS in app/_styles/work.css owns both rest
// states and every colour.
//
// The radios and :has() draw both states, with script or without. On a change the controller
// measures both (data-hold forces each for one read; the radios are never written), holds the
// old look inline in the same task, so the flipped CSS never paints, and runs one plain
// requestAnimationFrame loop for every tile in flight, each frame drawn from the flight sampled
// at its own time. The flight hands back in three parts, each by name: the pill once its thumb
// lands, the device's geometry the moment the chain is still (layout work ends there), and the
// landing beat's light and bloom, which are paint only, after it. The parts only a flight draws
// (the thumb and its dark words, the shade, the lit front, the size readout and the glint) are
// made here the first time a tile is reached for, so the page's HTML never carries them. React
// owns the tile's own inline style (its reveal delay and view timeline), so the li only ever
// loses `height`.
//
// A flying tile's height is its row's: every flying tile of a row writes the one height, the room
// its resting row-mates keep and each flying tile's curve taken by a rounded maximum (rowAt).
// Whenever a tile of the row starts or stops holding its own height (the room is read again
// then), or a flight in it changes its mind, each flight heads for the room, and the row carries
// its place and speed through the change from where it stood before its floor (rowRaw), so two
// row-mates switched together neither jump nor snap as either lands, and the row never turns in
// a frame where their curves cross. A flight keeps the row as it stood at the end it leaves
// (leaving), so a row-mate flying the other way cannot drop the row toward the room first.
//
// Under reduced motion, forced colours, or a browser without clip-path: path() or color-mix(),
// nothing flies: the old view is held until the new capture has decoded, then the device rises
// in by opacity alone. No gsap here: a spring chain carries its speed through a change of mind,
// which a tween cannot.

const N = CONFIG.motion.work
const { attribute: FLYING, endEvent: LANDED } = N.signal
const SVG = 'http://www.w3.org/2000/svg'
// The front's four strokes, back to front: two soaks on the old page, the halo and the rim.
const STROKES = ['soak-far', 'soak-near', 'halo', 'rim'] as const
// The resting pool's alpha (--backlight in app/globals.css), should its computed value not parse.
const POOL_ALPHA = 0.18

type Tile = Readonly<{
  li: HTMLLIElement
  fieldset: HTMLFieldSetElement
  phone: HTMLInputElement
  labels: readonly HTMLLabelElement[]
  device: HTMLElement
  chrome: HTMLElement
  dots: readonly HTMLElement[]
  tab: HTMLElement
  tabLabel: HTMLElement
  imgD: HTMLImageElement
  imgP: HTMLImageElement
  pour: HTMLElement // the phone layer, which the front clips
  pool: HTMLElement
  thumb: HTMLElement
  ink: HTMLElement
  shade: HTMLElement
  front: SVGSVGElement
  strokes: readonly SVGPathElement[]
  size: HTMLElement
  glint: HTMLElement
}>

type Flight = {
  readonly tile: Tile
  readonly g: Geometry
  readonly pill: Pill
  readonly pace: number
  readonly springs: Springs
  readonly a0: number // the pool's alpha when the flight began (the hover raises it)
  readonly row: readonly HTMLLIElement[] // the tiles sharing its row, itself among them
  s: MorphState
  room: number // the tallest resting row-mate's own height, as last read
  ends: Ends // the room its curve keeps at each end
  carry: Carry | null // what its row carries from its last change
  exact: boolean // the thumb has drawn its one frame on the label's own edges
  // Its device has handed back, and stays handed back until the next change: turned back within
  // its first few frames, a device still inside its rest window drifts out of it on its own
  // momentum, and it took its height again after its row-mates had let it go (they then stood up
  // to 1.7 px apart for a fifth of a second).
  handed: boolean
}

const px = (n: number): string => `${n.toFixed(2)}px`
const num = (n: number): string => n.toFixed(4)
const viewOf = (tile: Tile): View => (tile.phone.checked ? 1 : 0)
const nameOf = (view: View): 'desktop' | 'phone' => (view === 1 ? 'phone' : 'desktop')
const heightOf = (node: Element): number => parseFloat(getComputedStyle(node).height)

function need<T extends Element>(root: ParentNode, selector: string, type: new () => T): T {
  const node = root.querySelector(selector)
  if (!(node instanceof type)) throw new Error(`The work switch found no ${selector}`)
  return node
}

// A flight-only part: decoration, never in the accessibility tree.
function part(className: string): HTMLSpanElement {
  const node = document.createElement('span')
  node.className = className
  node.setAttribute('aria-hidden', 'true')
  return node
}

// A tile's parts, the flight-only ones made and placed, or undefined when the markup is not the
// device's (the CSS swap then carries that tile alone).
function resolve(li: HTMLLIElement): Tile | undefined {
  try {
    const fieldset = need(li, 'fieldset.work-seg', HTMLFieldSetElement)
    const labels = [...fieldset.querySelectorAll('label')]
    const [phoneLabel] = labels
    if (labels.length !== 2 || phoneLabel === undefined) return undefined
    const stage = need(li, '.work-stage', HTMLElement)
    const device = need(stage, '.work-device', HTMLElement)
    const chrome = need(device, '.work-chrome', HTMLElement)
    const tab = need(chrome, '.work-tab', HTMLElement)
    const layerD = need(device, ':scope > [data-frame="browser"]', HTMLElement)
    const pour = need(device, ':scope > [data-frame="phone"]', HTMLElement)
    const found = {
      li,
      fieldset,
      phone: need(fieldset, 'input[value="phone"]', HTMLInputElement),
      labels,
      device,
      chrome,
      dots: [...chrome.querySelectorAll<HTMLElement>('.work-chrome-dots > span')],
      tab,
      tabLabel: need(tab, '.work-tab-label', HTMLElement),
      imgD: need(layerD, 'img', HTMLImageElement),
      imgP: need(pour, 'img', HTMLImageElement),
      pour,
      pool: need(li, '.work-backlight', HTMLElement),
    }
    const thumb = part('work-seg-thumb')
    fieldset.insertBefore(thumb, phoneLabel)
    // The dark copy of the words: each takes its label's own classes, so it sets exactly as the
    // label does, and its word as generated content from the label's own text.
    const ink = part('work-seg-ink')
    for (const label of labels) {
      const word = document.createElement('span')
      word.className = label.className
      word.dataset.word = label.textContent.trim()
      ink.append(word)
    }
    fieldset.append(ink)
    const shade = part('work-shade')
    layerD.append(shade)
    const front = document.createElementNS(SVG, 'svg')
    front.setAttribute('class', 'work-front')
    front.setAttribute('aria-hidden', 'true')
    front.setAttribute('focusable', 'false')
    const strokes = STROKES.map((name) => {
      const path = document.createElementNS(SVG, 'path')
      path.dataset.part = name
      return path
    })
    front.append(...strokes)
    const size = part('work-size')
    device.append(front, size)
    const glint = part('work-glint')
    stage.append(glint)
    return { ...found, thumb, ink, shade, front, strokes, size, glint }
  } catch {
    return undefined
  }
}

// The rest state the hold is forcing. Computed sizes, never boxes: a transform never reaches
// them, so they are the layout's own even while the entrance still scales the tile. The tile is
// read top-aligned (data-measure), so its own height, never its row's.
function restOf(tile: Tile): RestGeometry {
  const device = getComputedStyle(tile.device)
  const tab = getComputedStyle(tile.tab)
  return {
    W: parseFloat(device.width),
    H: parseFloat(device.height),
    T: heightOf(tile.li),
    chromeH: heightOf(tile.chrome),
    tabW: parseFloat(tab.width),
    tabH: parseFloat(tab.height),
  }
}

// Both rest states, each forced by the hold for one read, two style and layout passes in the
// change's own task; the radios are never written. The resting row-mates are read in the first
// pass, top-aligned like the tile, for the room they keep the row.
function measure(
  tile: Tile,
  resting: readonly HTMLLIElement[],
): Readonly<{ g: Geometry; room: number }> {
  const { li } = tile
  const read = [li, ...resting]
  for (const node of read) node.setAttribute('data-measure', '')
  li.setAttribute('data-hold', 'desktop')
  const d = restOf(tile)
  const room = Math.max(0, ...resting.map(heightOf))
  // The desktop state's own places: the tab's top and the dots' centres in the chrome (each dot
  // sits in the dots' wrapper, which the chrome places).
  const tabTop = tile.tab.offsetTop
  const dots = tile.dots.map((dot) => {
    const wrap = dot.parentElement ?? dot
    return {
      x: wrap.offsetLeft + dot.offsetLeft + dot.offsetWidth / 2,
      y: wrap.offsetTop + dot.offsetTop + dot.offsetHeight / 2,
    }
  })
  li.setAttribute('data-hold', 'phone')
  const p = restOf(tile)
  li.removeAttribute('data-hold')
  for (const node of read) node.removeAttribute('data-measure')
  // The captures' own ratios, from their attributes: the IDL sizes are rounded rendered pixels.
  const aspect = (img: HTMLImageElement) =>
    Number(img.getAttribute('height')) / Number(img.getAttribute('width'))
  const focus = Number(tile.li.dataset.focus ?? '0.5')
  return {
    g: {
      d,
      p,
      border: parseFloat(getComputedStyle(tile.device).borderLeftWidth),
      tabTop,
      dots,
      aspectD: aspect(tile.imgD),
      aspectP: aspect(tile.imgP),
      focus: Number.isFinite(focus) ? focus : 0.5,
    },
    room,
  }
}

// The room a row's resting tiles keep: the tallest one's own height, each read top-aligned.
function roomOf(resting: readonly HTMLLIElement[]): number {
  for (const li of resting) li.setAttribute('data-measure', '')
  const room = Math.max(0, ...resting.map(heightOf))
  for (const li of resting) li.removeAttribute('data-measure')
  return room
}

// The pill's two rest positions from the labels' computed widths, which are exact fractions;
// offset sizes round, and the thumb would shift a third of a pixel at the hand-off.
function measurePill(tile: Tile): Pill {
  const pad = parseFloat(getComputedStyle(tile.fieldset).paddingLeft)
  const [wp = 0, wd = 0] = tile.labels.map((label) => parseFloat(getComputedStyle(label).width))
  return {
    pad,
    width: 2 * pad + wp + wd,
    phone: [pad, pad + wp],
    desktop: [pad + wp, pad + wp + wd],
  }
}

// The pool's alpha as computed: rgba(…, a), rgb(… / a) or color(srgb … / a).
function poolAlpha(pool: HTMLElement): number {
  const value = getComputedStyle(pool).getPropertyValue('--backlight')
  const match = /\/\s*([\d.]+)\s*\)\s*$/.exec(value) ?? /rgba\([^)]*,\s*([\d.]+)\s*\)/.exec(value)
  const alpha = Number(match?.[1])
  return Number.isFinite(alpha) ? alpha : POOL_ALPHA
}

// Removes inline properties by name, and the style attribute once it is empty.
function unset(node: HTMLElement | SVGElement, properties: readonly string[]): void {
  for (const property of properties) node.style.removeProperty(property)
  if (node.getAttribute('style') === '') node.removeAttribute('style')
}

function clearMorph(tile: Tile): void {
  tile.li.style.removeProperty('height')
  unset(tile.device, ['width', 'height', 'border-radius', '--work-lift', '--work-ring'])
  unset(tile.chrome, ['height', '--work-fold'])
  unset(tile.tab, [
    'width',
    'height',
    'padding',
    'border-radius',
    '--work-island',
    '--work-speaker',
  ])
  unset(tile.tabLabel, ['opacity', 'transform'])
  for (const dot of tile.dots) unset(dot, ['transform', 'opacity'])
  unset(tile.imgD, ['width', 'transform'])
  unset(tile.imgP, ['width', 'transform'])
  unset(tile.shade, ['opacity'])
  unset(tile.pour, ['clip-path'])
  unset(tile.front, ['--work-lit'])
  for (const stroke of tile.strokes) stroke.removeAttribute('d')
  unset(tile.size, ['opacity', 'top'])
  tile.size.textContent = ''
}

const clearPool = (tile: Tile) => {
  unset(tile.pool, ['--backlight', 'transform'])
}
const clearGlint = (tile: Tile) => {
  unset(tile.glint, ['opacity', 'left', 'width', 'height', 'border-radius', '--glint-at'])
}
const clearPill = (tile: Tile) => {
  unset(tile.thumb, ['clip-path'])
  unset(tile.ink, ['clip-path'])
}
const clipPill = (tile: Tile, clip: string) => {
  tile.thumb.style.clipPath = clip
  tile.ink.style.clipPath = clip
}

// Every layout and paint number of one moment, on the elements that read them; T is the row's.
function drawDevice(tile: Tile, f: Frame, T: number): void {
  tile.li.style.height = px(T)
  const device = tile.device.style
  device.width = px(f.W)
  device.height = px(f.H)
  device.borderRadius = px(f.radius)
  device.setProperty('--work-lift', num(f.breath))
  device.setProperty('--work-ring', num(f.ring))
  const chrome = tile.chrome.style
  chrome.height = px(f.chromeH)
  chrome.setProperty('--work-fold', num(f.fold))
  const tab = tile.tab.style
  tab.width = px(f.tabW)
  tab.height = px(f.tabH)
  tab.padding = '0'
  tab.borderRadius = px(f.tabRadius)
  tab.setProperty('--work-island', num(f.island))
  tab.setProperty('--work-speaker', num(f.speaker))
  tile.tabLabel.style.opacity = num(f.labelOpacity)
  tile.tabLabel.style.transform = `scale(${num(f.labelScale)})`
  f.dots.forEach((dot, i) => {
    const node = tile.dots[i]
    if (node === undefined) return
    node.style.transform = `translate(${px(dot.x)}, ${px(dot.y)}) scale(${num(dot.scale)})`
    node.style.opacity = num(dot.opacity)
  })
  // The screen: the leaving page at its desktop width under its shade, the new page pouring in
  // behind the front, the front's four strokes, and the readout. The captures move by plain 2D
  // translates, painted with the device, and the new page stretches by its width, never a
  // scale, so each is drawn as its rest state draws it: on layers of their own the captures
  // rasterised apart from the rest state and the first flight dropped a frame making them, and a
  // scaled capture sometimes kept a sharper draw to the end, so its text softened on the frame
  // it landed (3 of 8 flights; none of 8 by width).
  tile.imgD.style.width = px(f.dW)
  tile.imgD.style.transform = `translate(${px(f.oldX)}, ${px(f.oldTop)})`
  tile.shade.style.opacity = num(f.shade)
  tile.imgP.style.width = px(f.pW * f.scale)
  tile.imgP.style.transform = `translate(${px(f.newX)}, ${px(f.newY)})`
  const { clip, edge } = frontPaths(f)
  tile.pour.style.clipPath = clip
  for (const stroke of tile.strokes) stroke.setAttribute('d', edge)
  tile.front.style.setProperty('--work-lit', num(f.lit))
  tile.size.style.opacity = num(f.readout)
  tile.size.style.top = px(f.chromeH + N.readout.gapPx)
  // Checked against the readout itself, which a hand-back empties.
  const readout = `${String(f.readoutPx)}px`
  if (tile.size.textContent !== readout) tile.size.textContent = readout
}

// Three parts, each landing on its own: the pill, the device (the moment the chain is still, so
// layout work ends there) and the landing beat (paint only) after it. Each is drawn from `at`,
// the flight sampled at the frame's own time, and handed back on the stored flight's word. T is
// the row's height. Returns whether the device handed its geometry back here.
function draw(flight: Flight, at: MorphState, T: number): boolean {
  const { tile, s, g, pill, pace } = flight
  if (s.pillOn) {
    flight.exact = false
    tile.fieldset.setAttribute('data-pill', '')
    clipPill(tile, pillClip(at, pill))
  } else if (tile.fieldset.hasAttribute('data-pill')) {
    if (flight.exact) {
      // The checked label's own paint returns in this frame, with no transition (data-enhanced),
      // where the thumb stood.
      clearPill(tile)
      tile.fieldset.removeAttribute('data-pill')
    } else {
      // One frame on the label's own edges first, so the hand-back changes only how the edge is
      // drawn, never where it is.
      flight.exact = true
      clipPill(tile, pillClip(s, pill))
    }
  }
  const f = frame(at.p, at.v, at.lean, g)
  const moving = !flight.handed && !deviceStill(s)
  let handed = false
  if (moving) {
    tile.li.setAttribute('data-morph', '')
    drawDevice(tile, f, T)
  } else if (tile.li.hasAttribute('data-morph')) {
    clearMorph(tile)
    tile.li.removeAttribute('data-morph')
    flight.handed = true
    handed = true
  }
  // The beat's span, the bloom's tail included, keeps data-beat, which keeps the pool's own
  // transition off while the script writes it.
  const beat = beatLive(at, pace)
  if (moving || beat) {
    // The pool breathes with the flight and blooms as the device lands.
    const alpha = flight.a0 + N.breath.alpha * f.breath + N.bloom.alpha * bloomAt(at, pace)
    const pool = tile.pool.style
    pool.setProperty(
      '--backlight',
      `color-mix(in srgb, var(--glow) ${(alpha * 100).toFixed(2)}%, transparent)`,
    )
    const wide = num(1 + N.breath.scaleX * f.breath)
    const tall = num(1 + N.breath.scaleY * f.breath)
    pool.transform = `scale(${wide}, ${tall})`
  } else clearPool(tile)
  if (beat) tile.li.setAttribute('data-beat', at.beatDir > 0 ? 'left' : 'right')
  else tile.li.removeAttribute('data-beat')
  const u = glintAt(at, pace)
  if (u === null) {
    clearGlint(tile)
    return handed
  }
  // One light runs across the frame's edge as it squares up, from the pressed pill's side.
  const glint = tile.glint.style
  glint.opacity = num(Math.sin(Math.PI * u))
  glint.left = px((g.d.W - f.W) / 2)
  glint.width = px(f.W)
  glint.height = px(f.H)
  glint.borderRadius = px(f.radius)
  glint.setProperty('--glint-at', `${(-20 + 140 * ease(u, [0, 1])).toFixed(2)}%`)
  return handed
}

// Runs the callback once the browser is idle, as lib/motion/idle.ts does, and returns a cancel.
function onIdle(callback: () => void): () => void {
  const { requestIdleCallback, cancelIdleCallback } = window as Partial<
    Pick<Window, 'requestIdleCallback' | 'cancelIdleCallback'>
  >
  const idle = requestIdleCallback?.call(window, callback, { timeout: 1500 })
  const timer = idle === undefined ? window.setTimeout(callback, 200) : undefined
  return () => {
    if (idle !== undefined) cancelIdleCallback?.call(window, idle)
    if (timer !== undefined) window.clearTimeout(timer)
  }
}

// Starts the switch on the list of tiles and returns the function that stops it: every flight
// landed, every listener and the observer gone, and every part it made removed.
export function start(list: HTMLElement): () => void {
  const html = document.documentElement
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  const forced = window.matchMedia('(forced-colors: active)')
  // Feature detection: without a path clip or colour mixing the flight cannot be drawn, so the
  // still path carries it.
  const capable =
    CSS.supports('clip-path', "path('M0 0H1V1Z')") &&
    CSS.supports('color', 'color-mix(in srgb, red, blue 50%)')
  const still = () => reduce.matches || forced.matches || !capable
  const tiles = new Map<HTMLLIElement, Tile | undefined>()
  const flights = new Map<HTMLLIElement, Flight>()
  const warmed = new WeakSet<HTMLLIElement>()
  const holds = new WeakMap<HTMLLIElement, number>()
  const idles = new Set<() => void>()
  let raf = 0
  let width = window.innerWidth
  let stopped = false

  const tileOf = (li: HTMLLIElement): Tile | undefined => {
    if (!tiles.has(li)) tiles.set(li, resolve(li))
    return tiles.get(li)
  }
  const liOf = (target: EventTarget | null): HTMLLIElement | undefined => {
    const li = target instanceof Element ? target.closest('li') : null
    return li instanceof HTMLLIElement && li.parentElement === list ? li : undefined
  }

  // Armed, the labels lose their colour transition, so the thumb hands back to the checked
  // label's own paint in a single frame.
  const arm = () => {
    const on = !still()
    for (const fieldset of list.querySelectorAll('fieldset.work-seg')) {
      fieldset.toggleAttribute('data-enhanced', on)
    }
  }

  // A capture, fetched and decoded, or the gate's longest wait (decodeMs), whichever comes
  // first: a flight does not wait on a slow capture past that.
  const ready = (img: HTMLImageElement): Promise<void> => {
    if (img.loading === 'lazy') img.loading = 'eager'
    return Promise.race([
      img.decode().catch(() => {
        // A capture that will not decode lets the flight go all the same.
      }),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, N.decodeMs)
      }),
    ])
  }
  // Intent warms both captures, so a click never waits on them.
  const warm = (li: HTMLLIElement) => {
    if (warmed.has(li)) return
    warmed.add(li)
    const tile = tileOf(li)
    if (tile === undefined) return
    for (const img of [tile.imgP, tile.imgD]) {
      if (img.loading === 'lazy') img.loading = 'eager'
      void img.decode().catch(() => {
        // Warming is a head start, never a requirement.
      })
    }
  }

  // The tiles sharing a row with this one, itself among them: a grid row, or the whole rail.
  const rowOf = (li: HTMLLIElement): HTMLLIElement[] =>
    [...list.children].filter(
      (mate): mate is HTMLLIElement =>
        mate instanceof HTMLLIElement && mate.offsetTop === li.offsetTop,
    )
  // A row's flights that hold their own height, and the rest.
  const split = (row: readonly HTMLLIElement[]) => {
    const flying = row.flatMap((li) => {
      const flight = flights.get(li)
      return flight !== undefined && li.hasAttribute('data-morph') ? [flight] : []
    })
    const resting = row.filter((li) => !flying.some((flight) => flight.tile.li === li))
    return { flying, resting }
  }

  const sampled = (flight: Flight, now: number): MorphState =>
    sampleAt(flight.s, now, flight.pill, flight.springs, flight.pace)

  // The flights of a row holding their own height, in its order: the one given among them even
  // before its first frame has marked it.
  const holdingOf = (flight: Flight): Flight[] =>
    flight.row.flatMap((li) => {
      const mate = flights.get(li)
      return mate !== undefined && (mate === flight || li.hasAttribute('data-morph')) ? [mate] : []
    })
  const flyingAt = (members: readonly Flight[], now: number): Flying[] =>
    members.map((mate) => {
      const at = sampled(mate, now)
      return { g: mate.g, ends: mate.ends, p: at.p, speed: at.v }
    })

  // The row's height and speed now, the same for every flying tile of it (row), and the same
  // before its floor (raw), which a change carries on from.
  type Stood = Readonly<{ row: Moving; raw: Moving }>
  const rowHeight = (flight: Flight, now: number): Stood => {
    const flying = flyingAt(holdingOf(flight), now)
    const carried = carryAt(flight.carry, now, flight.pace)
    return { row: rowAt(flight.room, flying, carried), raw: rowRaw(flight.room, flying, carried) }
  }
  // The row as it stands with no flight holding it: the tallest of its tiles at rest.
  const atRest = (T: number): Stood => ({ row: { T, v: 0 }, raw: { T, v: 0 } })

  // A tile of the row started or stopped holding its own height, or a flight in it changed its
  // mind: every flight holding its height takes the room as it now stands at the end it heads
  // for, and the row carries on from `before`, its height and speed as they stood before its
  // floor.
  const shift = (members: readonly Flight[], room: number, before: Moving, now: number) => {
    for (const mate of members) {
      mate.room = room
      mate.ends = headFor(mate.ends, mate.s.pillGoal, room)
    }
    const { T, v } = rowCurve(room, flyingAt(members, now))
    const carry = { T: before.T - T, v: before.v - v, tMs: now }
    for (const mate of members) mate.carry = carry
  }

  const paint = (flight: Flight, now: number) => {
    const { row, raw } = rowHeight(flight, now)
    if (!draw(flight, sampled(flight, now), row.T)) return
    // It holds its own height no longer: its row-mates in flight take the room it keeps.
    const { flying, resting } = split(flight.row)
    if (flying.length > 0) shift(flying, roomOf(resting), raw, now)
  }

  const settle = () => {
    html.removeAttribute(FLYING)
    window.dispatchEvent(new Event(LANDED))
  }
  const land = (tile: Tile) => {
    clearMorph(tile)
    clearPool(tile)
    clearGlint(tile)
    clearPill(tile)
    tile.li.removeAttribute('data-morph')
    tile.li.removeAttribute('data-beat')
    tile.fieldset.removeAttribute('data-pill')
  }
  // Every flight to its CSS state at once: a resize, a change of media, a hidden page, or the
  // stop.
  const landAll = () => {
    if (flights.size === 0) return
    for (const flight of flights.values()) land(flight.tile)
    flights.clear()
    settle()
  }

  const kick = () => {
    if (raf === 0 && flights.size > 0 && !stopped) raf = window.requestAnimationFrame(tick)
  }
  const record = (flight: Flight, tMs: number, event: MorphEvent) => {
    flight.s = apply(advance(flight.s, tMs, flight.pill, flight.springs, flight.pace), event)
    // A change flies the device again, one that had handed back among them.
    if (event.kind === 'change') flight.handed = false
  }

  // Lets a still-path hold go at once, and the arrival waiting on it with it.
  const release = (li: HTMLLIElement) => {
    holds.set(li, (holds.get(li) ?? 0) + 1)
    li.removeAttribute('data-hold')
  }

  const begin = (tile: Tile, goal: View, tMs: number) => {
    // A hold the still path left, should the motion have come back before its media change was
    // heard, goes first: the flight starts from the view it showed, and no arrival fades a device
    // in flight. Should it show the goal already, there is nothing to fly.
    const held = tile.li.getAttribute('data-hold')
    release(tile.li)
    if (held === nameOf(goal)) return
    const pill = measurePill(tile)
    const read = parseFloat(getComputedStyle(list).getPropertyValue('--work-morph-pace'))
    const pace = read > 0 ? read : N.pace
    const row = rowOf(tile.li)
    const { flying, resting } = split(row)
    const { g, room } = measure(
      tile,
      resting.filter((li) => li !== tile.li),
    )
    const from: View = goal === 1 ? 0 : 1
    // The row as it stands: its flights' height, or the tallest of its tiles at rest.
    const [mate] = flying
    const rest = from === 1 ? g.p : g.d
    const stood = mate === undefined ? atRest(Math.max(room, rest.T)) : rowHeight(mate, tMs)
    const flight: Flight = {
      tile,
      g,
      pill,
      pace,
      springs: springsFor(pace),
      a0: poolAlpha(tile.pool),
      row,
      s: startState(tMs, from, pill),
      room,
      // The end it leaves keeps the row as it stands, which a row-mate in flight may hold.
      ends: leaving(from, room, stood.row),
      carry: null,
      exact: false,
      handed: false,
    }
    record(flight, tMs, { kind: 'change', goal })
    flights.set(tile.li, flight)
    // It and its row-mates in flight take the room the row keeps without it.
    shift(holdingOf(flight), room, stood.raw, tMs)
    html.setAttribute(FLYING, '')
    // The old look, inline, in this same task: the flipped CSS never paints.
    paint(flight, tMs)
    // The decode gate: the device holds where it is until the capture it reveals is ready, or
    // decodeMs at most.
    void ready(goal === 1 ? tile.imgP : tile.imgD).then(() => {
      if (flights.get(tile.li) !== flight || flight.s.open) return
      record(flight, performance.now(), { kind: 'open', goal: viewOf(tile) })
      kick()
    })
  }

  const end = (flight: Flight) => {
    const { tile } = flight
    land(tile)
    flights.delete(tile.li)
    // Every change is recorded, so the radio agrees with where the device landed; should it
    // ever not, the device flies again rather than showing a state it did not reach.
    const view = viewOf(tile)
    if (view !== flight.s.goal && !still()) begin(tile, view, performance.now())
    if (flights.size === 0) settle()
  }

  function tick(now: number) {
    raf = 0
    const live = [...flights.values()]
    // Every flight to this frame first, so a row's tiles share one height.
    for (const flight of live) {
      flight.s = advance(flight.s, now, flight.pill, flight.springs, flight.pace)
    }
    for (const flight of live) {
      paint(flight, now)
      // A pill still marked has its one frame on the label's own edges to show first.
      const pill = flight.s.pillOn || flight.tile.fieldset.hasAttribute('data-pill')
      if (!pill && deviceStill(flight.s) && !beatLive(flight.s, flight.pace)) end(flight)
    }
    kick()
  }

  // The still path: the old view held until the new capture has decoded, then the device rises
  // in by opacity alone. Only the latest change lets the hold go.
  const arrive = (tile: Tile, goal: View) => {
    const turn = (holds.get(tile.li) ?? 0) + 1
    holds.set(tile.li, turn)
    const held = tile.li.getAttribute('data-hold') ?? nameOf(goal === 1 ? 0 : 1)
    tile.li.setAttribute('data-hold', held)
    void ready(goal === 1 ? tile.imgP : tile.imgD).then(() => {
      if (stopped || holds.get(tile.li) !== turn) return
      tile.li.removeAttribute('data-hold')
      if (viewOf(tile) !== goal || held === nameOf(goal)) return
      const easing = getComputedStyle(html).getPropertyValue('--ease-standard').trim()
      tile.device.animate([{ opacity: N.reducedFade.fromOpacity }, { opacity: 1 }], {
        duration: N.reducedFade.ms,
        easing: easing === '' ? 'ease-out' : easing,
      })
    })
  }

  const onChange = (event: Event) => {
    const radio = event.target
    if (!(radio instanceof HTMLInputElement) || radio.type !== 'radio') return
    const li = liOf(radio)
    const tile = li === undefined ? undefined : tileOf(li)
    if (tile === undefined) return
    const goal = viewOf(tile)
    if (still()) {
      arrive(tile, goal)
      return
    }
    const now = performance.now()
    const flight = flights.get(tile.li)
    if (flight === undefined) {
      begin(tile, goal, now)
    } else {
      const { flying, resting } = split(flight.row)
      const [mate] = flying
      // Handed back already, in its landing beat: it holds its own height again, from the view it
      // landed on, and its row-mates in flight take the room the row keeps without it.
      const { handed } = flight
      const room = handed ? roomOf(resting.filter((li) => li !== tile.li)) : flight.room
      const landed = flight.s.goal
      // The row as it stands, before the change moves anything in it. Only a tile handed back
      // finds no flight holding it, and its height on the view it landed on comes from its flight:
      // its radio already shows the new view, and a read took the goal's height for the row as it
      // stood (the first row leapt from 562 to 791 px in one frame, Phone pressed in the beat).
      const at = landed === 1 ? flight.g.p : flight.g.d
      const stood = mate === undefined ? atRest(Math.max(room, at.T)) : rowHeight(mate, now)
      record(flight, now, { kind: 'change', goal })
      // The end it leaves keeps the row as it stands, as a new flight's does.
      if (handed) flight.ends = leaving(landed, room, stood.row)
      // A change of mind heads for the other end, with the room as it now stands.
      shift(holdingOf(flight), room, stood.raw, now)
      // Before the flipped CSS can paint, should the device have handed back already.
      paint(flight, now)
    }
    kick()
  }
  const onIntent = (event: Event) => {
    const li = liOf(event.target)
    if (li !== undefined) warm(li)
  }
  // A phone fires resize as its address bar hides, which must not end a flight; only a new width
  // does, since both rest states were measured at the old one.
  const onResize = () => {
    if (window.innerWidth === width) return
    width = window.innerWidth
    landAll()
  }
  // A change of media lands every flight and lets every hold go, each where its radio says: a
  // hold still waiting on its capture as the motion came back started the next flight from the
  // view it hid, and its arrival then faded the device in flight.
  const onMedia = () => {
    landAll()
    for (const li of tiles.keys()) release(li)
    arm()
  }
  // A hidden page draws no frames, and a flight left in one would replay every sub-step it
  // missed on the first frame back (hours of them, after a night in a background tab), so it
  // lands as the page hides, where its radio says.
  const onVisibility = () => {
    if (document.hidden) landAll()
  }

  // A tile mostly on screen is warmed while the browser is idle: on a touch screen the press
  // leads the click by a tenth of a second, and on the rail each tile scrolls in on its own.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const li = entry.target
        if (!entry.isIntersecting || !(li instanceof HTMLLIElement)) continue
        observer.unobserve(li)
        const cancel = onIdle(() => {
          idles.delete(cancel)
          warm(li)
        })
        idles.add(cancel)
      }
    },
    { threshold: N.warmShare },
  )
  for (const li of list.children) observer.observe(li)

  list.addEventListener('change', onChange)
  for (const type of ['pointerover', 'focusin', 'pointerdown'] as const) {
    list.addEventListener(type, onIntent, { passive: true })
  }
  window.addEventListener('resize', onResize)
  reduce.addEventListener('change', onMedia)
  forced.addEventListener('change', onMedia)
  document.addEventListener('visibilitychange', onVisibility)
  arm()

  return () => {
    if (stopped) return
    stopped = true
    window.cancelAnimationFrame(raf)
    raf = 0
    landAll()
    observer.disconnect()
    for (const cancel of idles) cancel()
    list.removeEventListener('change', onChange)
    for (const type of ['pointerover', 'focusin', 'pointerdown'] as const) {
      list.removeEventListener(type, onIntent)
    }
    window.removeEventListener('resize', onResize)
    reduce.removeEventListener('change', onMedia)
    forced.removeEventListener('change', onMedia)
    document.removeEventListener('visibilitychange', onVisibility)
    for (const fieldset of list.querySelectorAll('fieldset.work-seg')) {
      fieldset.removeAttribute('data-enhanced')
    }
    for (const [li, tile] of tiles) {
      li.removeAttribute('data-hold')
      if (tile === undefined) continue
      for (const node of [tile.thumb, tile.ink, tile.shade, tile.front, tile.size, tile.glint]) {
        node.remove()
      }
    }
  }
}
