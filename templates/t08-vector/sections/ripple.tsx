'use client'

import Image from 'next/image'
import { type RefObject, useEffect, useRef, useState } from 'react'
import type { VectorImage } from '../copy-slots'
import { compile, quad } from './waves'

type Props = { image: VectorImage; maskRadius: RefObject<number> }

// The source drew each project picture with a shader: the picture covering its frame, run
// through a duotone (contrast up, greys mapped from a deep violet to a pale pink, colour
// leaning by the picture's own warmth, then pushed), shown through a circle whose edge is
// feathered over 35px and roughened by drifting noise, and displaced by ripples: each move of
// the pointer of more than four pixels dropped a soft disc at the pointer into a half-size
// buffer, where the discs grew, turned, faded and blended additively, and the buffer's red
// bent the picture's sampling. This runs the same two passes, word for word, on a canvas of
// its own (no library) at the source's buffer scale of one, then encodes the colour as the
// source's renderer did. The source also bloomed the result (a third of its lights above two
// thirds luminance, blurred); that pass is not here. Where the browser has no WebGL the
// picture is shown in grey under two blend layers, opened by the stylesheet's scroll-driven
// mask (vector.css). The circle's radius comes from the card (projects.tsx).

const VERTEX = `
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }
`

const FRAGMENT = `
precision highp float;
uniform sampler2D uTexture, uDisplacement;
uniform vec2 uResolution, uTextureSize, uMaskCenter;
uniform float uMaskRadius, uTime;
varying vec2 vUv;
const float PI = 3.141592653589793238;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y) * 2.0 - 1.0;
}

vec2 getCoverUV(vec2 uv, vec2 texSize) {
  float scale = max(uResolution.x / texSize.x, uResolution.y / texSize.y);
  vec2 offset = (uResolution - texSize * scale) * 0.5;
  return (uv * uResolution - offset) / (texSize * scale);
}

vec3 applyDuotone(vec3 c) {
  c = clamp((c - 0.5) * 1.2 + 0.5, 0.0, 1.0);
  float lum = pow(dot(c, vec3(0.299, 0.587, 0.114)), 0.9);
  vec3 shadow = vec3(0.08, 0.02, 0.18), highlight = vec3(0.98, 0.65, 0.85);
  vec3 duo = mix(shadow, highlight, smoothstep(0.0, 1.0, lum));
  float shift = (c.r - c.b) * 0.1;
  duo.r += shift; duo.b -= shift * 0.5;
  return clamp(mix(vec3(dot(duo, vec3(0.299, 0.587, 0.114))), duo, 1.3), 0.0, 1.0);
}

vec3 toSRGB(vec3 v) {
  return mix(pow(v, vec3(0.41666)) * 1.055 - vec3(0.055), v * 12.92, vec3(lessThanEqual(v, vec3(0.0031308))));
}

void main() {
  vec4 disp = texture2D(uDisplacement, vUv);
  float theta = disp.r * 2.0 * PI;
  vec2 finalUv = getCoverUV(vUv, uTextureSize) + vec2(sin(theta), cos(theta)) * disp.r * 0.05;
  vec3 color = applyDuotone(texture2D(uTexture, finalUv).rgb);

  vec2 px = vUv * uResolution;
  float dist = distance(px, uMaskCenter * uResolution);
  float n = noise(px * 0.01 + uTime * 0.15) * 50.0;
  float mask = 1.0 - smoothstep(uMaskRadius - 35.0 + n, uMaskRadius + n, dist);

  gl_FragColor = vec4(toSRGB(color), mask);
}
`

// A ripple disc: a unit quad placed, sized and turned in the buffer's own pixels, carrying
// the soft disc texture at an opacity, added onto what is there.
const DISC_VERTEX = `
attribute vec2 position;
uniform vec2 uCenter, uResolution;
uniform float uSize, uRotation;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  float s = sin(uRotation), c = cos(uRotation);
  vec2 p = vec2(position.x * c - position.y * s, position.x * s + position.y * c) * uSize * 0.5 + uCenter;
  gl_Position = vec4(p / (uResolution * 0.5), 0.0, 1.0);
}
`

const DISC_FRAGMENT = `
precision mediump float;
uniform sampler2D uDisc;
uniform float uOpacity;
varying vec2 vUv;
void main() { vec4 t = texture2D(uDisc, vUv); gl_FragColor = vec4(1.0, 1.0, 1.0, t.a * uOpacity); }
`

const DISCS = 30
// The source's turn for each disc, from its own hash of the index.
const TURNS = Array.from({ length: DISCS }, (_, i) => {
  const v = 1e4 * Math.sin(9999 * (i + 1))
  return (v - Math.floor(v)) * Math.PI * 2
})

// The soft disc the source painted onto a 128px canvas: white, fading out by its edge.
function discTexture(): HTMLCanvasElement {
  const canvas = Object.assign(document.createElement('canvas'), { width: 128, height: 128 })
  const context = canvas.getContext('2d')
  if (context === null) return canvas
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.5)')
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.1)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)
  return canvas
}

type Disc = {
  visible: boolean
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
}

export function VectorRipple({ image, maskRadius }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<'css' | 'gl'>('css')

  useEffect(() => {
    const el = canvas.current
    if (el === null) return
    const gl = el.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    })
    if (gl === null) return
    const main = compile(gl, VERTEX, FRAGMENT)
    const disc = compile(gl, DISC_VERTEX, DISC_FRAGMENT)
    if (main === null || disc === null) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // The picture, flipped as the source's loader flipped it, clamped and never mipmapped.
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    let textureSize: [number, number] = [1, 1]
    let loaded = false
    const picture = new window.Image()
    picture.decoding = 'async'
    picture.src = image.src
    void picture
      .decode()
      .then(() => {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, picture)
        textureSize = [picture.naturalWidth, picture.naturalHeight]
        loaded = true
      })
      .catch(() => undefined)

    // The soft disc.
    const discTex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, discTex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, discTexture())

    // The half-size buffer the ripples are drawn into.
    const target = gl.createTexture()
    const framebuffer = gl.createFramebuffer()
    gl.bindTexture(gl.TEXTURE_2D, target)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    let bufferSize: [number, number] = [1, 1]
    const size = () => {
      const width = Math.max(1, Math.floor(el.clientWidth))
      const height = Math.max(1, Math.floor(el.clientHeight))
      if (el.width !== width || el.height !== height) {
        el.width = width
        el.height = height
      }
      bufferSize = [Math.max(1, Math.floor(width / 2)), Math.max(1, Math.floor(height / 2))]
      gl.bindTexture(gl.TEXTURE_2D, target)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        bufferSize[0],
        bufferSize[1],
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      )
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }
    size()

    const discs: Disc[] = Array.from({ length: DISCS }, (_, i) => ({
      visible: false,
      x: 0,
      y: 0,
      scale: 1,
      rotation: TURNS[i] ?? 0,
      opacity: 0,
    }))
    let next = 0
    let lastX = 0
    let lastY = 0
    const onMove = (event: PointerEvent) => {
      const box = el.getBoundingClientRect()
      const x = event.clientX - box.left - box.width / 2
      const y = -(event.clientY - box.top - box.height / 2)
      if (Math.abs(x - lastX) > 4 || Math.abs(y - lastY) > 4) {
        next = (next + 1) % DISCS
        const d = discs[next]
        if (d !== undefined) {
          d.x = x
          d.y = y
          d.visible = true
          d.opacity = 1
          d.scale = 1.5
        }
        lastX = x
        lastY = y
      }
    }

    const u = (program: WebGLProgram, name: string) => gl.getUniformLocation(program, name)
    const mainUniforms = {
      texture: u(main, 'uTexture'),
      displacement: u(main, 'uDisplacement'),
      resolution: u(main, 'uResolution'),
      textureSize: u(main, 'uTextureSize'),
      radius: u(main, 'uMaskRadius'),
      center: u(main, 'uMaskCenter'),
      time: u(main, 'uTime'),
    }
    const discUniforms = {
      disc: u(disc, 'uDisc'),
      center: u(disc, 'uCenter'),
      resolution: u(disc, 'uResolution'),
      size: u(disc, 'uSize'),
      rotation: u(disc, 'uRotation'),
      opacity: u(disc, 'uOpacity'),
    }
    // One quad for both passes, made once; each pass points its own attribute at it.
    quad(gl, disc)
    const run = (program: WebGLProgram) => {
      gl.useProgram(program)
      const position = gl.getAttribLocation(program, 'position')
      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    }

    let time = 0
    let last = 0
    let frame = 0
    let visible = true
    let shown = false
    const draw = (now: number) => {
      const dt = last === 0 ? 0 : Math.min((now - last) / 1000, 0.05)
      last = now
      time += dt
      const d = 60 * dt
      for (const item of discs) {
        if (!item.visible) continue
        item.rotation += 0.02 * d
        item.opacity *= 0.96 ** d
        item.scale = 0.982 * item.scale + 0.108
        if (item.opacity < 0.002) item.visible = false
      }
      // The ripples, added into the half-size buffer.
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.viewport(0, 0, bufferSize[0], bufferSize[1])
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      run(disc)
      gl.enable(gl.BLEND)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.SRC_ALPHA, gl.ONE)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, discTex)
      gl.uniform1i(discUniforms.disc, 0)
      gl.uniform2f(discUniforms.resolution, el.width, el.height)
      for (const item of discs) {
        if (!item.visible) continue
        gl.uniform2f(discUniforms.center, item.x, item.y)
        gl.uniform1f(discUniforms.size, 100 * item.scale)
        gl.uniform1f(discUniforms.rotation, item.rotation)
        gl.uniform1f(discUniforms.opacity, item.opacity)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }
      // The picture, bent by the buffer and shown through the circle.
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, el.width, el.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      run(main)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(mainUniforms.texture, 0)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, target)
      gl.uniform1i(mainUniforms.displacement, 1)
      gl.uniform2f(mainUniforms.resolution, el.width, el.height)
      gl.uniform2f(mainUniforms.textureSize, textureSize[0], textureSize[1])
      gl.uniform1f(mainUniforms.radius, still ? 1200 : maskRadius.current)
      gl.uniform2f(mainUniforms.center, 0.5, 0.5)
      gl.uniform1f(mainUniforms.time, time)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      if (loaded && !shown) {
        shown = true
        setMode('gl')
      }
    }
    const tick = (now: number) => {
      draw(now)
      if (visible && !still) frame = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver((entries) => {
      const seen = entries.some((entry) => entry.isIntersecting)
      if (seen && !visible) {
        visible = true
        last = 0
        frame = requestAnimationFrame(tick)
      } else if (!seen) visible = false
    })
    observer.observe(el)
    const onResize = () => {
      size()
    }
    if (!still) el.addEventListener('pointermove', onMove)
    window.addEventListener('resize', onResize)
    frame = requestAnimationFrame(tick)
    // Under reduced motion the picture is drawn once the texture is in, and left.
    const settle = still
      ? window.setInterval(() => {
          if (loaded) {
            draw(performance.now())
            window.clearInterval(settle)
          }
        }, 100)
      : 0
    return () => {
      visible = false
      cancelAnimationFrame(frame)
      window.clearInterval(settle)
      observer.disconnect()
      el.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
    }
  }, [image.src, maskRadius])

  return (
    <>
      <canvas
        ref={canvas}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full ${mode === 'gl' ? '' : 'invisible'}`}
        style={{ width: '100%', height: '100%' }}
      />
      {mode === 'css' && (
        <div className="vector-mask vector-duotone-light absolute inset-0 h-full w-full">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover mix-blend-multiply contrast-125 grayscale"
          />
          <div className="vector-duotone-dark absolute inset-0 mix-blend-lighten" />
        </div>
      )}
    </>
  )
}
