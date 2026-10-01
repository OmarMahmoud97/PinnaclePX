import type { Scene } from './scene'

// The source's liquid glass (its port of rdev/liquid-glass-react, nav-glass.js), on the bar: the
// layer under the pill is blurred by the stylesheet, and this bends what it shows with an SVG
// filter. Two displacement maps are drawn from the distance to a rounded rectangle: one zooms the
// page under the glass to 0.4 of its size towards a fisheye edge that never samples past the
// pill, the other refracts the rim, three times over with the colours spread a little apart.
// The lens stops 14px short of the ask, whose orange it would otherwise drag along the pill, and
// a plain blurred strip carries on under the ask. Not in Firefox, and not on a screen under 700px
// in both directions and under 900px wide, where the filter costs too much on every frame of a
// scroll; the stylesheet's blur stands there.

const DISPLACE = 40
const ABERRATION = 3
const ZOOM = 0.4
const PAD = 0.02
const NS = 'http://www.w3.org/2000/svg'
const ID = 'lc-glass-nav'

const smoothStep = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)))
  return x * x * (3 - 2 * x)
}

const sdfPill = (x: number, y: number, w: number, h: number, r: number) => {
  const qx = Math.abs(x) - w + r
  const qy = Math.abs(y) - h + r
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r
}

type Maps = { zoomUrl: string; zoomMax: number; refrUrl: string }

function shaderMap(w: number, h: number): Maps | null {
  const px = Math.round(w * PAD)
  const py = Math.round(h * PAD)
  const W = w + 2 * px
  const H = h + 2 * py
  const fx = w / W
  const fy = h / H
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (ctx === null) return null
  const refr = new Float32Array(W * H * 2)
  const zoom = new Float32Array(W * H * 2)
  let maxRefr = 0
  let i = 0
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const sx = (x / W - 0.5) / fx
      const sy = (y / H - 0.5) / fy
      if (Math.abs(sx) > 0.52 || Math.abs(sy) > 0.52) {
        i += 2
        continue
      }
      const d = sdfPill(sx, sy, 0.3, 0.2, 0.6)
      const disp = smoothStep(0.8, 0, d - 0.15)
      const scaled = smoothStep(0, 1, disp)
      refr[i] = (sx * scaled - sx) * fx * W
      refr[i + 1] = (sy * scaled - sy) * fy * H
      const bx = sx * scaled
      const by = sy * scaled
      const kWant = 1 / ZOOM
      const tx = Math.min(1, Math.abs(bx) / 0.5)
      const ty = Math.min(1, Math.abs(by) / 0.5)
      const kx = kWant / (1 + (kWant - 1) * tx)
      const ky = kWant / (1 + (kWant - 1) * ty)
      zoom[i] = bx * (kx - 1) * fx * W
      zoom[i + 1] = by * (ky - 1) * fy * H
      maxRefr = Math.max(maxRefr, Math.abs(refr[i] ?? 0), Math.abs(refr[i + 1] ?? 0))
      i += 2
    }
  }
  maxRefr = Math.max(maxRefr, 1)

  const encode = (values: Float32Array, norm: number) => {
    const image = ctx.createImageData(W, H)
    let k = 0
    for (let p = 0; p < W * H; p++) {
      const x = p % W
      const y = (p / W) | 0
      const edge = Math.min(1, Math.min(x, y, W - x - 1, H - y - 1) / 2)
      const r = (((values[k++] ?? 0) * edge) / norm + 0.5) * 255
      const g = (((values[k++] ?? 0) * edge) / norm + 0.5) * 255
      const o = p * 4
      image.data[o] = r
      image.data[o + 1] = g
      image.data[o + 2] = g
      image.data[o + 3] = 255
    }
    ctx.putImageData(image, 0, 0)
    return canvas.toDataURL()
  }

  let maxZoom = 1
  for (const value of zoom) maxZoom = Math.max(maxZoom, Math.abs(value))
  return { zoomUrl: encode(zoom, maxZoom), zoomMax: maxZoom, refrUrl: encode(refr, maxRefr) }
}

const node = (tag: string, attributes: Readonly<Record<string, string | number>>) => {
  const element = document.createElementNS(NS, tag)
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value))
  return element
}

export function liquidGlass(root: Element, scene: Scene): void {
  const host = root.querySelector<HTMLElement>('[data-nav]')
  const layer = host?.querySelector<HTMLElement>('.lc-nav__glass')
  if (host == null || layer == null) return
  if (navigator.userAgent.toLowerCase().includes('firefox')) return
  if (Math.min(window.innerWidth, window.innerHeight) < 700 && window.innerWidth < 900) return

  const lens = layer.querySelector<HTMLElement>('i:not(.plain)')
  let plain: HTMLElement | null = null
  let svg: SVGSVGElement | null = null

  const build = () => {
    const w = Math.round(host.offsetWidth)
    const h = Math.round(host.offsetHeight)
    if (w === 0 || h === 0) return
    svg?.remove()

    const cta = host.querySelector<HTMLElement>(':scope > .lc-btn')
    const stop =
      cta === null
        ? w
        : Math.round(cta.getBoundingClientRect().left - host.getBoundingClientRect().left - 14)
    const wEff = cta === null ? w : Math.round(stop / (1 + PAD))
    const px = Math.round(wEff * PAD)
    const py = Math.round(h * PAD)
    const map = shaderMap(wEff, h)
    if (map === null) return

    const next = node('svg', {
      id: `${ID}-svg`,
      width: 0,
      height: 0,
      'aria-hidden': 'true',
    }) as SVGSVGElement
    next.style.position = 'absolute'
    const filter = node('filter', {
      id: ID,
      x: '0%',
      y: '0%',
      width: '100%',
      height: '100%',
      'color-interpolation-filters': 'sRGB',
    })
    // The zoom, in one pass with no spread of colour.
    const zoomImage = node('feImage', {
      x: 0,
      y: 0,
      width: '100%',
      height: '100%',
      result: 'MAPZ',
      preserveAspectRatio: 'xMidYMid slice',
    })
    zoomImage.setAttribute('href', map.zoomUrl)
    filter.append(
      zoomImage,
      node('feGaussianBlur', { in: 'MAPZ', stdDeviation: 2, result: 'MAPZ_S' }),
      node('feDisplacementMap', {
        in: 'SourceGraphic',
        in2: 'MAPZ_S',
        scale: map.zoomMax,
        xChannelSelector: 'R',
        yChannelSelector: 'B',
        result: 'ZOOMED',
      }),
    )
    // The rim's refraction, with its colours spread, over the zoom.
    const refrImage = node('feImage', {
      x: 0,
      y: 0,
      width: '100%',
      height: '100%',
      result: 'MAP',
      preserveAspectRatio: 'xMidYMid slice',
    })
    refrImage.setAttribute('href', map.refrUrl)
    const edge = node('feComponentTransfer', { in: 'EDGE_INT', result: 'EDGE_MASK' })
    edge.append(
      node('feFuncA', { type: 'discrete', tableValues: `0 ${String(ABERRATION * 0.05)} 1` }),
    )
    const solid = node('feComponentTransfer', { in: 'ZOOMED_B', result: 'ZOOMED_S' })
    solid.append(node('feFuncA', { type: 'table', tableValues: '0 1 1 1' }))
    filter.append(
      refrImage,
      node('feColorMatrix', {
        in: 'MAP',
        type: 'matrix',
        values: '0.3 0.3 0.3 0 0 0.3 0.3 0.3 0 0 0.3 0.3 0.3 0 0 0 0 0 1 0',
        result: 'EDGE_INT',
      }),
      edge,
      // The zoom shrinks the stylesheet's blur with the page, so the shrunk layer is blurred
      // again; its edge keeps full alpha so the unblurred page never shows round the rim.
      node('feGaussianBlur', { in: 'ZOOMED', stdDeviation: 4, result: 'ZOOMED_B' }),
      solid,
      node('feOffset', { in: 'ZOOMED_S', dx: 0, dy: 0, result: 'CENTER' }),
    )
    const channels: readonly [string, number, string][] = [
      ['R', DISPLACE, '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0'],
      ['G', DISPLACE * (1 - ABERRATION * 0.05), '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0'],
      ['B', DISPLACE * (1 - ABERRATION * 0.1), '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0'],
    ]
    for (const [name, scale, matrix] of channels) {
      filter.append(
        node('feDisplacementMap', {
          in: 'ZOOMED',
          in2: 'MAP',
          scale,
          xChannelSelector: 'R',
          yChannelSelector: 'B',
          result: `${name}_D`,
        }),
        node('feColorMatrix', {
          in: `${name}_D`,
          type: 'matrix',
          values: matrix,
          result: `${name}_C`,
        }),
      )
    }
    const invert = node('feComponentTransfer', { in: 'EDGE_MASK', result: 'INV_MASK' })
    invert.append(node('feFuncA', { type: 'table', tableValues: '1 0' }))
    filter.append(
      node('feBlend', { in: 'G_C', in2: 'B_C', mode: 'screen', result: 'GB' }),
      node('feBlend', { in: 'R_C', in2: 'GB', mode: 'screen', result: 'RGB_C' }),
      node('feGaussianBlur', {
        in: 'RGB_C',
        stdDeviation: Math.max(0.1, 0.5 - ABERRATION * 0.1),
        result: 'AB_BLUR',
      }),
      node('feComposite', { in: 'AB_BLUR', in2: 'EDGE_MASK', operator: 'in', result: 'EDGE_AB' }),
      invert,
      node('feComposite', {
        in: 'CENTER',
        in2: 'INV_MASK',
        operator: 'in',
        result: 'CENTER_CLEAN',
      }),
      node('feComposite', { in: 'EDGE_AB', in2: 'CENTER_CLEAN', operator: 'over' }),
    )
    next.append(filter)
    root.append(next)
    svg = next

    if (lens === null) return
    lens.style.filter = `url(#${ID})`
    if (cta !== null) {
      lens.style.inset = `${String(-py)}px ${String(w - stop)}px ${String(-py)}px ${String(-px)}px`
      if (plain === null) {
        plain = document.createElement('i')
        plain.className = 'plain'
        layer.insertBefore(plain, lens)
      }
      plain.style.inset = `${String(-py)}px ${String(-px)}px`
      plain.style.clipPath = `inset(0 0 0 ${String(stop - 40 + px)}px)`
      // The lens fades into the strip over its last 40px, so no edge of glass shows at the join.
      const mask = 'linear-gradient(to right, black calc(100% - 40px), transparent 100%)'
      lens.style.setProperty('-webkit-mask-image', mask)
      lens.style.maskImage = mask
    } else {
      lens.style.inset = `-${String(PAD * 100)}%`
    }
  }

  build()
  let timer = 0
  scene.on(window, 'resize', () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(build, 200)
  })
  scene.defer(() => {
    window.clearTimeout(timer)
    svg?.remove()
    plain?.remove()
    if (lens !== null) {
      lens.style.filter = ''
      lens.style.inset = ''
      lens.style.maskImage = ''
      lens.style.removeProperty('-webkit-mask-image')
    }
  })
}
