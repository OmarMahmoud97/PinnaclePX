import 'client-only'
import { SHADERS } from '@/lib/motion/fluid-shaders'

export type InkColour = Readonly<{ r: number; g: number; b: number }>

// A term of the idle path: amplitude, frequency per millisecond and phase, of one sine.
type Wave = readonly [amplitude: number, frequency: number, phase: number]

// The tunables, from CONFIG.hero.ink: the simulation grid as a share of the canvas, the splat
// radius factor (4 / height is about 2 * sqrt(height) pixels across), how hard pointer movement
// pushes the fluid, the pressure passes a frame, the fixed time step, and where the ink
// wanders before the first pointer event.
export type FluidOptions = Readonly<{
  colour: InkColour
  resolution: number
  splat: number
  gain: number
  pressureIterations: number
  dt: number
  idle: Readonly<{ x: readonly Wave[]; y: readonly Wave[] }>
}>

type Target = Readonly<{
  fbo: WebGLFramebuffer
  width: number
  height: number
  attach: (unit: number) => number
}>

type DoubleTarget = Readonly<{
  texelSizeX: number
  texelSizeY: number
  read: () => Target
  write: () => Target
  swap: () => void
}>

type Program = Readonly<{
  program: WebGLProgram
  uniform: (name: string) => WebGLUniformLocation | null
}>

const NOTHING_TO_STOP = () => {
  // Nothing was started.
}

// A sum of sines around the centre, so the path never visibly repeats.
const wander = (waves: readonly Wave[], time: number): number =>
  waves.reduce((sum, [amplitude, frequency, phase]) => {
    return sum + amplitude * Math.sin(frequency * time + phase)
  }, 0.5)

// Runs the ink on the canvas and returns the function that stops it: it cancels the frame,
// disconnects both observers, removes both window listeners and releases the GPU context.
//
// Two fields live in float textures at a quarter of the canvas resolution: velocity and dye.
// Every frame the pointer pushes velocity and drops dye where it moved, the velocity is
// projected so it swirls instead of piling up (divergence, a few pressure passes, gradient
// subtraction), and both fields are carried along the flow. The dye is drawn inverted, so no
// dye is white, which the canvas's multiply blend leaves alone. docs/fluid-hero-guide.md walks
// through every pass.
//
// Without WebGL, float textures or a framebuffer that takes them it returns at once and the
// gradient stands alone: the ink is decoration. A shader that fails to compile or link throws,
// because that is a programming error.
export function startFluid(canvas: HTMLCanvasElement, options: FluidOptions): () => void {
  const gl = canvas.getContext('webgl')
  if (gl === null) return NOTHING_TO_STOP
  if (gl.getExtension('OES_texture_float') === null) return NOTHING_TO_STOP
  const { colour, resolution, splat, gain, pressureIterations, dt, idle: idlePath } = options
  const release = () => gl.getExtension('WEBGL_lose_context')?.loseContext()

  const compileShader = (source: string, type: number): WebGLShader => {
    const shader = gl.createShader(type)
    if (shader === null) throw new Error('WebGL gave no shader object')
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    const compiled: unknown = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (compiled !== true) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader did not compile')
    return shader
  }

  const vertexShader = compileShader(SHADERS.vertex, gl.VERTEX_SHADER)

  // One vertex shader shared by six fragment shaders, each with its uniform locations gathered
  // once so a frame never looks one up.
  const makeProgram = (source: string): Program => {
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, compileShader(source, gl.FRAGMENT_SHADER))
    gl.linkProgram(program)
    const linked: unknown = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (linked !== true) throw new Error(gl.getProgramInfoLog(program) ?? 'program did not link')
    const uniforms = new Map<string, WebGLUniformLocation>()
    const count: unknown = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; typeof count === 'number' && i < count; i++) {
      const info = gl.getActiveUniform(program, i)
      if (info === null) continue
      const location = gl.getUniformLocation(program, info.name)
      if (location !== null) uniforms.set(info.name, location)
    }
    return { program, uniform: (name) => uniforms.get(name) ?? null }
  }

  const programs = {
    splat: makeProgram(SHADERS.splat),
    divergence: makeProgram(SHADERS.divergence),
    pressure: makeProgram(SHADERS.pressure),
    gradientSubtract: makeProgram(SHADERS.gradientSubtract),
    advection: makeProgram(SHADERS.advection),
    output: makeProgram(SHADERS.output),
  }

  // Four corners and two triangles. Every pass draws this quad and the fragment shader does the
  // work; a_position is the only attribute, so it is location 0.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(0)

  // A float texture a shader can draw into. NEAREST and CLAMP_TO_EDGE: a read never blends
  // neighbouring texels and never wraps around the edge.
  const createTarget = (width: number, height: number, format: number): Target => {
    gl.activeTexture(gl.TEXTURE0)
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.FLOAT, null)
    const fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.viewport(0, 0, width, height)
    gl.clear(gl.COLOR_BUFFER_BIT)
    return {
      fbo,
      width,
      height,
      attach(unit) {
        gl.activeTexture(gl.TEXTURE0 + unit)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        return unit
      },
    }
  }

  // A shader cannot read the texture it is writing, so a field is a pair: read from one, write
  // to the other, then swap.
  const createDoubleTarget = (width: number, height: number, format: number): DoubleTarget => {
    let first = createTarget(width, height, format)
    let second = createTarget(width, height, format)
    return {
      texelSizeX: 1 / width,
      texelSizeY: 1 / height,
      read: () => first,
      write: () => second,
      swap() {
        const read = first
        first = second
        second = read
      },
    }
  }

  // Points the GPU at a target, or at the canvas when the target is null, and draws the quad.
  const blit = (target: Target | null) => {
    if (target === null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    } else {
      gl.viewport(0, 0, target.width, target.height)
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  }

  // The drawing buffer takes the canvas's own size in CSS pixels, not devicePixelRatio, since
  // the output is blurred anyway. The four fields are made afresh at every real size, which
  // clears the ink. The reference splat is 4 / height; on a portrait screen that swamps the
  // viewport, so the radius follows the short side there and is unchanged on landscape.
  let pointSize = 0
  const fit = () => {
    const { clientWidth, clientHeight } = canvas
    canvas.width = clientWidth
    canvas.height = clientHeight
    pointSize = (splat / clientHeight) * Math.min(1, clientWidth / clientHeight) ** 2
    const width = Math.floor(resolution * clientWidth)
    const height = Math.floor(resolution * clientHeight)
    return {
      velocity: createDoubleTarget(width, height, gl.RGBA),
      dye: createDoubleTarget(width, height, gl.RGBA),
      divergence: createTarget(width, height, gl.RGB),
      pressure: createDoubleTarget(width, height, gl.RGB),
    }
  }
  let fields = fit()
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    release()
    return NOTHING_TO_STOP
  }
  // The observer fires once as it starts observing, before anything changed; the guard keeps
  // that from wiping the ink.
  const resize = () => {
    if (canvas.width === canvas.clientWidth && canvas.height === canvas.clientHeight) return
    fields = fit()
  }

  // Positions in CSS pixels relative to the canvas. Movement since the last call becomes the
  // velocity added, times the gain: a flick shoves the fluid, a slow drag barely stirs it.
  const pointer = { x: 0, y: 0, dx: 0, dy: 0, moved: false }
  let idle = true
  const updatePointer = (x: number, y: number) => {
    pointer.moved = true
    pointer.dx = gain * (x - pointer.x)
    pointer.dy = gain * (y - pointer.y)
    pointer.x = x
    pointer.y = y
  }
  const onPointer = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
    idle = false
    const rect = canvas.getBoundingClientRect()
    updatePointer(clientX - rect.left, clientY - rect.top)
  }
  const onMouse = (event: MouseEvent) => {
    onPointer(event)
  }
  const onTouch = (event: TouchEvent) => {
    const touch = event.targetTouches.item(0)
    if (touch !== null) onPointer(touch)
  }

  let raf = 0
  const frame = (time: number) => {
    // Until the first real pointer event the ink moves by itself. While idle the moved flag is
    // never cleared, so a splat lands every frame; and the pointer starts at (0, 0), so the
    // first idle frame is a jump from the corner to the middle, which is the bloom of ink when
    // the page opens.
    if (idle) {
      updatePointer(
        wander(idlePath.x, time) * canvas.width,
        wander(idlePath.y, time) * canvas.height,
      )
    }
    const { velocity, dye, divergence, pressure } = fields

    // Push the fluid where the pointer moved, then drop ink there. The y axis is flipped
    // because WebGL's origin is the bottom left; the dye added is 1 - colour because the output
    // pass inverts it.
    if (pointer.moved) {
      if (!idle) pointer.moved = false
      const { program, uniform } = programs.splat
      gl.useProgram(program)
      gl.uniform1i(uniform('u_input_texture'), velocity.read().attach(1))
      gl.uniform1f(uniform('u_ratio'), canvas.width / canvas.height)
      gl.uniform2f(uniform('u_point'), pointer.x / canvas.width, 1 - pointer.y / canvas.height)
      gl.uniform3f(uniform('u_point_value'), pointer.dx, -pointer.dy, 1)
      gl.uniform1f(uniform('u_point_size'), pointSize)
      blit(velocity.write())
      velocity.swap()

      gl.uniform1i(uniform('u_input_texture'), dye.read().attach(1))
      gl.uniform3f(uniform('u_point_value'), 1 - colour.r, 1 - colour.g, 1 - colour.b)
      blit(dye.write())
      dye.swap()
    }

    // Projection: measure where the flow compresses, find the pressure that cancels it (a few
    // Jacobi passes, starting from last frame's answer), and take that pressure's gradient out
    // of the velocity.
    gl.useProgram(programs.divergence.program)
    gl.uniform2f(programs.divergence.uniform('u_texel'), velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(programs.divergence.uniform('u_velocity_texture'), velocity.read().attach(1))
    blit(divergence)

    gl.useProgram(programs.pressure.program)
    gl.uniform2f(programs.pressure.uniform('u_texel'), velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(programs.pressure.uniform('u_divergence_texture'), divergence.attach(1))
    for (let i = 0; i < pressureIterations; i++) {
      gl.uniform1i(programs.pressure.uniform('u_pressure_texture'), pressure.read().attach(2))
      blit(pressure.write())
      pressure.swap()
    }

    const { gradientSubtract } = programs
    gl.useProgram(gradientSubtract.program)
    gl.uniform2f(gradientSubtract.uniform('u_texel'), velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(gradientSubtract.uniform('u_pressure_texture'), pressure.read().attach(1))
    gl.uniform1i(gradientSubtract.uniform('u_velocity_texture'), velocity.read().attach(2))
    blit(velocity.write())
    velocity.swap()

    // Carry the velocity along itself, then the dye along the velocity. The dye pass keeps the
    // velocity bound from before the first pass, as the reference does.
    const { advection } = programs
    gl.useProgram(advection.program)
    gl.uniform2f(advection.uniform('u_texel'), velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(advection.uniform('u_velocity_texture'), velocity.read().attach(1))
    gl.uniform1i(advection.uniform('u_input_texture'), velocity.read().attach(1))
    gl.uniform1f(advection.uniform('u_dt'), dt)
    blit(velocity.write())
    velocity.swap()

    gl.uniform2f(advection.uniform('u_texel'), dye.texelSizeX, dye.texelSizeY)
    gl.uniform1i(advection.uniform('u_input_texture'), dye.read().attach(2))
    blit(dye.write())
    dye.swap()

    gl.useProgram(programs.output.program)
    gl.uniform1i(programs.output.uniform('u_output_texture'), dye.read().attach(1))
    blit(null)

    raf = requestAnimationFrame(frame)
  }

  const sizes = new ResizeObserver(resize)
  sizes.observe(canvas)
  window.addEventListener('mousemove', onMouse)
  window.addEventListener('touchmove', onTouch, { passive: true })

  // The only thing that starts or stops the loop: it fires once as it begins observing, and
  // again whenever the canvas enters or leaves the viewport, so a hero that has scrolled away
  // requests no frames at all.
  const visibility = new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(raf)
    if (entry?.isIntersecting === true) raf = requestAnimationFrame(frame)
  })
  visibility.observe(canvas)

  return () => {
    cancelAnimationFrame(raf)
    visibility.disconnect()
    sizes.disconnect()
    window.removeEventListener('mousemove', onMouse)
    window.removeEventListener('touchmove', onTouch)
    release()
  }
}
