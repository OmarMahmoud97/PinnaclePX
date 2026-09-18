'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'

// The source drew its hero's background with a shader: three sinuous bands, each three colours
// a hair apart so their edges fringe, drifting along their length, turning from -55 to -120
// degrees as the page scrolls its first screen, swept in one after another over three and a
// half seconds, lit by passing beams, lined and vignetted like an old screen, and faded out
// over the foot of the screen; additive on a dark page, multiplied on a light one. This runs
// the same shader, word for word, on a canvas of its own (no library), with the source's
// buffer scale (the device's pixel ratio held between 1 and 1.5), its start colours (the
// glow, the second glow and the brand) and its end colours (the same three the other way
// round), its easing of the scroll, and its blending. Where the browser has no WebGL, three
// drawn bands stand in. Decoration only, hidden from readers; it pauses while off screen.

const FRAGMENT = `
precision highp float;
uniform float iTime,isDark,iScroll;
uniform vec2 iResolution;
uniform vec3 color1Start,color2Start,color3Start,color1End,color2End,color3End;
#define W vec3(1)
#define D .08
#define O1 vec2(D*.25,0)
#define O2 vec2(.015,.005)
#define O3 vec2(D*.5,.015)
float h(float n){return fract(sin(n)*43758.5453123);}
float wave(vec2 p,float d,float o){return 1.-smoothstep(0.,d,distance(p.x,.5+sin(o+p.y*3.)*.15));}
vec4 bD(vec2 p,float o,float s){
  vec3 c1=mix(color1Start,color1End,s),c2=mix(color2Start,color2End,s),c3=mix(color3Start,color3End,s);
  return vec4(c1*wave(p+O1,D,o)+c2*wave(p-O2,D,o)+c3*wave(p-O3,D,o),1);
}
vec4 bDG(vec2 p,float o,float s){
  vec3 c1=mix(color1Start,color1End,s),c2=mix(color2Start,color2End,s),c3=mix(color3Start,color3End,s);
  float d=D*2.5;
  return vec4(c1*wave(p+O1,d,o)+c2*wave(p-O2,d,o)+c3*wave(p-O3,d,o),1);
}
vec4 bL(vec2 p,float o,float s){
  vec3 c1=mix(color1Start,color1End,s),c2=mix(color2Start,color2End,s),c3=mix(color3Start,color3End,s);
  return vec4(mix(W,c1,wave(p+O1,D,o))*mix(W,c2,wave(p-O2,D,o))*mix(W,c3,wave(p-O3,D,o)),1);
}
vec4 bLG(vec2 p,float o,float s){
  vec3 c1=mix(color1Start,color1End,s),c2=mix(color2Start,color2End,s),c3=mix(color3Start,color3End,s);
  float d=D*2.5;
  return vec4(mix(W,c1,wave(p+O1,d,o))*mix(W,c2,wave(p-O2,d,o))*mix(W,c3,wave(p-O3,d,o)),1);
}
vec2 rot(vec2 p,float a){float s=sin(a),c=cos(a);return vec2(p.x*c-p.y*s,p.x*s+p.y*c);}
float crt(vec2 u,float t){
  float sc=.95+.05*sin((u.y+t*.05)*iResolution.y*1.5);
  float fl=.99+.01*sin(t*8.);
  vec2 ct=u-vec2(iResolution.x/iResolution.y*.5,.5);
  return sc*fl*(1.-dot(ct,ct)*.15);
}
float ease(float t){float m=1.-t;return 1.-m*m*m*m;}
float prog(float i,float t){return ease(clamp((t-i*.2)/3.5,0.,1.));}
float mask(vec2 p,float pr){float th=mix(2.5,-1.,(p.x+p.y)*.5);return smoothstep(mix(2.5,-1.,pr)-.4,mix(2.5,-1.,pr),(p.x+p.y)*.5);}
float beam(float y,float t,float i){
  float sp=.08+h(i*7.3)*.06,ph=h(i*13.7)*10.,by=fract(t*sp+ph),dw=min(abs(y-by),1.-abs(y-by));
  return exp(-dw*dw*25.)*.8;
}
void main(){
  vec2 uv=gl_FragCoord.xy/iResolution.y,su=gl_FragCoord.xy/iResolution.xy;
  float sc=1.1;
  float ar=iResolution.x/iResolution.y;
  float xOffset=0.7;
  uv=uv*sc-vec2(ar*xOffset*sc,.5*sc);
  uv=rot(uv,radians(mix(-55.,-120.,iScroll)));
  uv.y+=.5*sc;
  float bf=smoothstep(0.,.25,su.y),t=iTime*.1;
  float p1=prog(0.,iTime),p2=prog(1.,iTime),p3=prog(2.,iTime);
  float m1=mask(uv,p1),m2=mask(uv+vec2(.3,0),p2),m3=mask(uv+vec2(.6,0),p3);
  float cr=crt(su,iTime);
  float b1=beam(su.y,iTime,0.),b2=beam(su.y,iTime,1.),b3=beam(su.y,iTime,2.);
  vec2 u2=uv+vec2(.3,0),u3=uv+vec2(.6,0);
  if(isDark>.5){
    vec4 w1=bD(uv,t,iScroll)*m1,w2=bD(u2,t,iScroll)*m2,w3=bD(u3,t,iScroll)*m3;
    float l1=min(1.,w1.r+w1.g+w1.b),l2=min(1.,w2.r+w2.g+w2.b),l3=min(1.,w3.r+w3.g+w3.b);
    w1.rgb+=vec3(1,.9,.95)*b1*l1;w2.rgb+=vec3(.9,.85,1)*b2*l2;w3.rgb+=vec3(.85,.9,1)*b3*l3;
    vec4 wv=(w1+w2+w3)*.5;
    vec4 g1=bDG(uv,t,iScroll)*m1,g2=bDG(u2,t,iScroll)*m2,g3=bDG(u3,t,iScroll)*m3;
    vec4 gl=(g1+g2+g3)*.5;
    vec3 fc=wv.rgb+gl.rgb*.35;
    float wi=min(1.,wv.r+wv.g+wv.b),gi=min(1.,gl.r+gl.g+gl.b);
    float a=smoothstep(0.,.15,gi)*smoothstep(.05,.4,wi+gi*.5)*bf;
    fc*=mix(1.,cr,smoothstep(0.,.5,wi));
    gl_FragColor=vec4(fc,a);
  }else{
    vec4 r1=bL(uv,t,iScroll),r2=bL(u2,t,iScroll),r3=bL(u3,t,iScroll);
    vec3 w1=mix(W,r1.rgb,m1),w2=mix(W,r2.rgb,m2),w3=mix(W,r3.rgb,m3);
    float l1=1.-r1.r*r1.g*r1.b,l2=1.-r2.r*r2.g*r2.b,l3=1.-r3.r*r3.g*r3.b;
    w1=mix(w1,W,b1*l1*.5);w2=mix(w2,W,b2*l2*.5);w3=mix(w3,W,b3*l3*.5);
    vec3 wv=w1*w2*w3;
    vec4 g1=bLG(uv,t,iScroll),g2=bLG(u2,t,iScroll),g3=bLG(u3,t,iScroll);
    vec3 gl=mix(W,g1.rgb,m1)*mix(W,g2.rgb,m2)*mix(W,g3.rgb,m3);
    vec3 fc=mix(wv,gl,.2);
    fc*=mix(1.,cr,1.-fc.r*fc.g*fc.b);
    fc=mix(W,fc,bf);
    gl_FragColor=vec4(fc,1);
  }
}
`

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

// A token's hex, as the source's hex parser read its colours: three floats from 0 to 1, or
// white when the value is not a six-digit hex.
function rgb(value: string): [number, number, number] {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value.trim())
  if (match === null) return [1, 1, 1]
  return [
    Number.parseInt(match[1] ?? 'ff', 16) / 255,
    Number.parseInt(match[2] ?? 'ff', 16) / 255,
    Number.parseInt(match[3] ?? 'ff', 16) / 255,
  ]
}

// Whether a surface is dark, from its token's hex: the source asked its theme.
function isDark(surface: string): boolean {
  const [r, g, b] = rgb(surface)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5
}

export function compile(
  gl: WebGLRenderingContext,
  vertex: string,
  fragment: string,
): WebGLProgram | null {
  const program = gl.createProgram()
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type)
    if (shader === null) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null
}

// A quad over the whole clip space, bound to `position`.
export function quad(gl: WebGLRenderingContext, program: WebGLProgram) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  )
  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
}

export function VectorWaves() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const el = canvas.current
    if (el === null) return
    const gl = el.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    })
    const program = gl === null ? null : compile(gl, VERTEX, FRAGMENT)
    if (gl === null || program === null) {
      setFallback(true)
      return
    }
    // The context is left to go with the canvas: losing it on purpose would break a remount of
    // the same canvas, which React does in development.
    gl.useProgram(program)
    quad(gl, program)
    const u = (name: string) => gl.getUniformLocation(program, name)
    const tokens = getComputedStyle(el.closest('.vector') ?? el)
    const token = (name: string) => rgb(tokens.getPropertyValue(name))
    const [glow, second, brand] = [token('--glow'), token('--glow-secondary'), token('--brand')]
    gl.uniform3fv(u('color1Start'), glow)
    gl.uniform3fv(u('color2Start'), second)
    gl.uniform3fv(u('color3Start'), brand)
    gl.uniform3fv(u('color1End'), brand)
    gl.uniform3fv(u('color2End'), second)
    gl.uniform3fv(u('color3End'), glow)
    gl.uniform1f(u('isDark'), isDark(tokens.getPropertyValue('--surface')) ? 1 : 0)
    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)

    const iTime = u('iTime')
    const iScroll = u('iScroll')
    const iResolution = u('iResolution')
    const size = () => {
      const ratio = Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.5)
      const width = Math.max(1, Math.round(el.clientWidth * ratio))
      const height = Math.max(1, Math.round(el.clientHeight * ratio))
      if (el.width !== width || el.height !== height) {
        el.width = width
        el.height = height
      }
      gl.viewport(0, 0, width, height)
      gl.uniform2f(iResolution, width, height)
    }
    let scroll = 0
    const onScroll = () => {
      const t = Math.min(1, window.scrollY / window.innerHeight)
      scroll = t * t * (3 - 2 * t)
    }
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const draw = (seconds: number) => {
      gl.uniform1f(iTime, seconds)
      gl.uniform1f(iScroll, scroll)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    size()
    onScroll()
    if (still) {
      draw(10)
      return
    }
    let frame = 0
    let started = 0
    let visible = true
    const tick = (now: number) => {
      if (started === 0) started = now
      draw((now - started) / 1000)
      if (visible) frame = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver((entries) => {
      const seen = entries.some((entry) => entry.isIntersecting)
      if (seen && !visible) {
        visible = true
        frame = requestAnimationFrame(tick)
      } else if (!seen) visible = false
    })
    observer.observe(el)
    let debounce = 0
    const onResize = () => {
      window.clearTimeout(debounce)
      debounce = window.setTimeout(size, 150)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    frame = requestAnimationFrame(tick)
    return () => {
      visible = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.clearTimeout(debounce)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  if (fallback) return <WavesFallback />
  return (
    <div
      className="h-full w-full opacity-50 saturate-125 md:opacity-85"
      style={{ position: 'relative', overflow: 'hidden', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <div style={{ width: '100%', height: '100%' }}>
        <canvas ref={canvas} className="h-full w-full" style={{ display: 'block' }} />
      </div>
    </div>
  )
}

// Without WebGL: three drawn bands in the shader's colours with bright cores, wiped in one
// after another, drifting, turning with the scroll, lined and faded at the foot (vector.css).
const BANDS = [
  { colour: 'var(--glow)', edge: 'var(--glow-secondary)', offset: 0, wait: 0 },
  { colour: 'var(--glow-secondary)', edge: 'var(--brand)', offset: 330, wait: 0.2 },
  { colour: 'var(--brand)', edge: 'var(--glow)', offset: 660, wait: 0.4 },
] as const

const PATH = Array.from({ length: 7 }, (_, i) => {
  const y = i * 400
  return `C 660 ${String(y + 100)} 540 ${String(y + 300)} 600 ${String(y + 400)}`
}).join(' ')

function WavesFallback() {
  return (
    <div className="h-full w-full opacity-50 saturate-125 md:opacity-85" aria-hidden="true">
      <div className="vector-waves">
        {BANDS.map((band) => (
          <svg
            key={band.offset}
            className="vector-wave"
            style={
              { '--delay': String(band.wait), left: `${String(band.offset)}px` } as CSSProperties
            }
            viewBox="0 0 1200 2000"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d={`M 600 -400 ${PATH}`}
              stroke={band.edge}
              strokeWidth="170"
              strokeLinecap="round"
              opacity="0.4"
            />
            <path
              d={`M 600 -400 ${PATH}`}
              stroke={band.colour}
              strokeWidth="100"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d={`M 600 -400 ${PATH}`}
              stroke="white"
              strokeWidth="36"
              strokeLinecap="round"
              opacity="0.75"
            />
          </svg>
        ))}
        <div className="vector-scanlines" />
      </div>
    </div>
  )
}
