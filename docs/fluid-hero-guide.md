# How the ink hero is built

This guide explains the WebGL animation behind the Kraft hero and how it is wired into the page. It is written against `hero.html`. Every code block marked with line numbers was copied from that file by script when the guide was generated, so what you read here is the code that runs.

The simulation is the one recovered from the deployed site. The shaders are verbatim, and the passes and constants are unchanged except for one line, which is called out in section 5.

## 1. The idea in one minute

The ink is a small 2D fluid simulation that runs on the GPU. Two fields live in textures. The velocity field says which way the fluid is moving at each point. The dye field says how much ink is at each point. Every frame the pointer pushes some velocity and drops some dye into those textures, the velocity field is corrected so that it swirls instead of piling up, and then both fields are carried along by the velocity.

The dye field is drawn to a canvas inverted, so no dye is white and a lot of dye is dark. The canvas lies over the hero's gradient with `mix-blend-mode: multiply`. Multiplying by white changes nothing and multiplying by a dark colour darkens, so the canvas behaves like ink on paper. An 8px CSS blur on the canvas hides the fact that the simulation runs at a quarter of the canvas resolution.

There is no library involved. It is about 240 lines of JavaScript, one vertex shader and six fragment shaders on raw WebGL 1.

## 2. Where it sits in the page

The hero is a stack of layers. From the bottom up:

| Layer      | Element                                                                         | Blending                           | Job                                        |
| ---------- | ------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------ |
| Background | `.section_hero` (its CSS background)                                            | normal                             | The white to indigo to near-black gradient |
| Ink        | `canvas.hero_ink`                                                               | `multiply`, `blur(8px)`            | The simulation output                      |
| Content    | `.hero_content`: headline, prompt box, caption                                  | headline `difference`, rest normal | The hero itself                            |
| Nav        | `header.nav_component`, outside the section, absolutely positioned over its top | `difference`                       | Site navigation                            |

The markup, reduced to structure:

```html
<header class="nav_component">...</header>

<main>
  <section class="section_hero">
    <canvas class="hero_ink" aria-hidden="true"></canvas>
    <div class="hero_content">
      <h1 class="hero_heading">...</h1>
      <form class="prompt_component">...</form>
      <div class="hero_footer">...</div>
    </div>
  </section>
</main>

<script>
  /* shaders, fluidBackground(), boot */
</script>
```

The CSS for the section and the canvas:

_`hero.html`, lines 113 to 138_

```css
/* Fitted to the reference: white at the top, indigo through the middle, near-black at the
   bottom, bowed slightly so the centre runs darker than the edges. It has a fixed height and
   is pinned to the bottom, like the content, so the headline always lands on the light part
   and the caption on the dark part whatever the viewport height. The ink canvas multiplies
   onto it: the ink shows over the light half and disappears into the dark half. */
.section_hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 100svh;
  padding-block: 9rem clamp(3rem, 12.5vh, 7.75rem);
  background: #fff
    radial-gradient(
      ellipse 269% 310% at 50% 300%,
      #070813 65%,
      #0b0d1e 67%,
      #13162e 68.7%,
      #1e2245 70.2%,
      #282d58 71.2%,
      #34396b 72.2%,
      #474d87 73.9%,
      #6d75b1 76.6%,
      #949bcf 79.1%,
      #b1b7e0 81.1%,
      #d4d7f0 83.9%,
      #e9ebf8 86.3%,
      #fafafd 90.1%,
      #fefeff 92.1%,
      #ffffff 94.5%
    )
    bottom / 100% var(--gradient-height) no-repeat;
}

.hero_ink {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: multiply;
  filter: blur(8px);
}
```

Each property on `.hero_ink` does one job. `position: absolute` with `inset: 0` and 100% width and height makes the canvas box equal to the section box, whatever height the section ends up with. `pointer-events: none` lets clicks and hovers fall through to the content, which is also why the script listens for the pointer on `window` rather than on the canvas. `mix-blend-mode: multiply` turns the white canvas into nothing and the dye into darkening. `filter: blur(8px)` softens the quarter resolution output, and the section's `overflow: hidden` clips the part of the blur that would bleed outside.

`isolation: isolate` on the section makes it a blending group of its own. The canvas then multiplies against the section's gradient and nothing else on the page.

Two consequences follow from multiply. First, the animation needs a light surface. Over the dark lower half of the gradient the ink is still being simulated, but multiplying a near-black by anything stays near-black, so it is invisible there. That is the intended look: the ink fades out as it sinks into the dark. Second, the canvas is decorative and carries `aria-hidden="true"`.

## 3. Boot

The script at the end of the page has three parts in this order: the `shaders` object (seven GLSL strings), the `fluidBackground(canvas, color)` function, and the call that starts it.

_`hero.html`, lines 755 to 757_

```js
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  fluidBackground(document.querySelector('.hero_ink'))
}
```

People who ask their system for reduced motion get the static gradient and no simulation at all. The function takes the canvas and an optional colour and returns nothing. If the browser has no WebGL it returns quietly, because the background is decoration. A shader that fails to compile or link throws, because that is a programming error you want to see in the console.

## 4. GPU setup

### Context and float textures

_`hero.html`, lines 522 to 526_

```js
function fluidBackground(canvas, color = DEFAULT_COLOR) {
  const gl = canvas.getContext("webgl");
  if (!gl) return;

  gl.getExtension("OES_texture_float");
```

`OES_texture_float` lets textures hold floating point numbers instead of bytes. The simulation depends on that: velocities are negative as often as positive, and dye is allowed to pile up far beyond 1.

### Programs

_`hero.html`, lines 528 to 565_

```js
const compileShader = (source, type) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader))
  }
  return shader
}

const vertexShader = compileShader(shaders.vertex, gl.VERTEX_SHADER)

const makeProgram = (source) => {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, compileShader(source, gl.FRAGMENT_SHADER))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program))
  }

  const uniforms = {}
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < count; i++) {
    const { name } = gl.getActiveUniform(program, i)
    uniforms[name] = gl.getUniformLocation(program, name)
  }
  return { program, uniforms }
}

const programs = {
  splat: makeProgram(shaders.splat),
  divergence: makeProgram(shaders.divergence),
  pressure: makeProgram(shaders.pressure),
  gradientSubtract: makeProgram(shaders.gradientSubtract),
  advection: makeProgram(shaders.advection),
  output: makeProgram(shaders.output),
}
```

One vertex shader is shared by six fragment shaders. `makeProgram` links a pair and collects every active uniform location by name, so the frame loop can write `programs.splat.uniforms.u_point` instead of looking locations up each frame.

The vertex shader draws a quad that covers the whole target. For every pixel it hands the fragment shader its own texture coordinate, `vUv`, and the coordinates of its four neighbours one texel to the left, right, top and bottom. The divergence, pressure and gradient passes are all "look at my four neighbours" operations, so computing the neighbours once here keeps those shaders short.

_`shaders.vertex`, verbatim from the deployed bundle, indentation trimmed_

```glsl
precision highp float;
varying vec2 vUv;
attribute vec2 a_position;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 u_texel;

void main () {
  vUv = .5 * (a_position + 1.);
  vL = vUv - vec2(u_texel.x, 0.);
  vR = vUv + vec2(u_texel.x, 0.);
  vT = vUv + vec2(0., u_texel.y);
  vB = vUv - vec2(0., u_texel.y);
  gl_Position = vec4(a_position, 0., 1.);
}
```

### Geometry

_`hero.html`, lines 567 to 572_

```js
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
gl.enableVertexAttribArray(0)
```

Four corners and two triangles. Every pass in the simulation draws this same quad. The fragment shader does the work and the quad only makes sure it runs once per pixel of the target. The code feeds the corners to attribute location 0 without asking where `a_position` lives. That works because it is the only attribute in the shader.

### Textures you can render into

_`hero.html`, lines 574 to 614_

```js
const createFBO = (width, height, format = gl.RGBA) => {
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
    attach(textureUnit) {
      gl.activeTexture(gl.TEXTURE0 + textureUnit)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      return textureUnit
    },
  }
}

const createDoubleFBO = (width, height, format = gl.RGBA) => {
  let first = createFBO(width, height, format)
  let second = createFBO(width, height, format)
  return {
    texelSizeX: 1 / width,
    texelSizeY: 1 / height,
    read: () => first,
    write: () => second,
    swap() {
      ;[first, second] = [second, first]
    },
  }
}
```

`createFBO` makes a float texture and attaches it to a framebuffer, which is what allows a shader to draw into it. The object it returns remembers the framebuffer for writing and offers `attach(unit)` to bind the texture to a texture unit for reading. Filtering is `NEAREST` and wrapping is `CLAMP_TO_EDGE`, so reads never blend neighbouring texels and never wrap around the edges.

A shader cannot read from the texture it is writing to. `createDoubleFBO` solves that with a pair: read from one, write to the other, then swap the two references. This is usually called ping-pong rendering. The recovered `FluidBackground.tsx` declares the pair with `const`, which makes `swap()` throw on its first call. The deployed bundle uses `let`, as here.

The simulation keeps four targets, all at a quarter of the canvas size:

| Target             | Kind           | Format     | Holds                                                           |
| ------------------ | -------------- | ---------- | --------------------------------------------------------------- |
| `velocity`         | ping-pong pair | RGBA float | x and y velocity in the red and green channels                  |
| `dye`              | ping-pong pair | RGBA float | ink amount per colour channel                                   |
| `divergenceTarget` | single         | RGB float  | how much the velocity field compresses or expands at each point |
| `pressureTarget`   | ping-pong pair | RGB float  | the pressure that will cancel that compression                  |

### Drawing a pass

_`hero.html`, lines 616 to 625_

```js
const blit = (target) => {
  if (target) {
    gl.viewport(0, 0, target.width, target.height)
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
  } else {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
}
```

`blit(target)` points the GPU at a target, or at the visible canvas when the target is `null`, and draws the quad. Every step of the simulation is "set uniforms, then blit".

## 5. Sizing

_`hero.html`, lines 632 to 648_

```js
const resize = () => {
  const { clientWidth, clientHeight } = canvas
  if (canvas.width === clientWidth && canvas.height === clientHeight) return

  canvas.width = clientWidth
  canvas.height = clientHeight
  // Deployed value is 4 / height. On portrait screens that splat swamps the viewport,
  // so the radius follows the short side there. Landscape is unchanged (factor 1).
  pointSize = (4 / clientHeight) * Math.min(1, clientWidth / clientHeight) ** 2

  const width = Math.floor(0.25 * clientWidth)
  const height = Math.floor(0.25 * clientHeight)
  velocity = createDoubleFBO(width, height)
  dye = createDoubleFBO(width, height)
  divergenceTarget = createFBO(width, height, gl.RGB)
  pressureTarget = createDoubleFBO(width, height, gl.RGB)
}
```

The drawing buffer is set to the canvas's own size in CSS pixels. It does not use `devicePixelRatio`. On a high density screen the browser scales the canvas up, which is fine because the output is blurred anyway and rendering more pixels would buy nothing. The first line is a guard. The observer that calls `resize` always fires once when it starts observing, before anything has changed, and rebuilding the targets wipes the ink.

The four targets are created at `0.25` of the canvas size. They are created again on every real resize, which is why the ink clears when you resize the window. The old textures are not deleted by hand. They are released when the browser garbage collects them. The deployed code behaves the same way.

`pointSize` controls how wide a splat is, and this is the one line that differs from the deployed constant. The deployed value is `4 / height`. Because the splat is measured against the height only, on a tall narrow phone screen a single splat covered most of the viewport. The extra factor scales the radius by width over height on portrait screens and is exactly 1 on landscape screens, so desktop is unchanged.

## 6. The pointer

_`hero.html`, lines 650 to 662_

```js
const updatePointer = (x, y) => {
  pointer.moved = true
  pointer.dx = 5 * (x - pointer.x)
  pointer.dy = 5 * (y - pointer.y)
  pointer.x = x
  pointer.y = y
}

const onPointerInput = ({ clientX, clientY }) => {
  idle = false
  const rect = canvas.getBoundingClientRect()
  updatePointer(clientX - rect.left, clientY - rect.top)
}
```

`updatePointer` stores the new position and turns the movement since the last call into a velocity, multiplied by 5. A fast flick therefore shoves the fluid hard and a slow drag barely stirs it. Positions are in CSS pixels relative to the canvas. The original used `pageX` and `pageY`, which is only correct for a canvas that fills the window at scroll position zero. Subtracting the canvas's bounding rect makes it correct for a canvas inside a section.

Until the first real mouse or touch event, the ink moves by itself:

_`hero.html`, lines 666 to 680_

```js
if (idle) {
  const x =
    0.5 +
    0.25 * Math.sin(0.0017 * time) +
    0.12 * Math.sin(0.0031 * time + 1.3) +
    0.08 * Math.cos(0.0053 * time + 2.7) +
    0.05 * Math.sin(0.0079 * time + 4.1)
  const y =
    0.5 +
    0.18 * Math.sin(0.0023 * time + 0.5) +
    0.12 * Math.cos(0.0041 * time + 1.8) +
    0.08 * Math.sin(0.0067 * time + 3.2) +
    0.05 * Math.cos(0.0089 * time + 5)
  updatePointer(x * canvas.width, y * canvas.height)
}
```

The idle position is a sum of four sine waves per axis with unrelated frequencies, so the path wanders without visibly repeating. Adding up the amplitudes gives the reach: x covers the full width, 0 to 1, and y covers 0.07 to 0.93 of the height. Two details matter. While `idle` is true the `moved` flag is never cleared, so a splat lands every frame. And the pointer starts at (0, 0), so the first idle frame registers a jump from the top left corner to the middle of the canvas. That single huge velocity is what produces the bloom of ink when the page opens.

The first real pointer event sets `idle = false` for good. From then on ink appears only under the cursor. This is the deployed behaviour.

## 7. One frame, pass by pass

Every frame runs the same sequence. With the pointer moving that is eleven draw calls, ten of them at quarter resolution.

| #   | Pass                 | Reads                | Writes     | Purpose                                 |
| --- | -------------------- | -------------------- | ---------- | --------------------------------------- |
| 1   | Splat velocity       | velocity             | velocity   | Push the fluid where the pointer moved  |
| 2   | Splat dye            | dye                  | dye        | Drop ink at the pointer                 |
| 3   | Divergence           | velocity             | divergence | Measure where the flow compresses       |
| 4   | Pressure, 4 times    | divergence, pressure | pressure   | Find the pressure that cancels it       |
| 5   | Gradient subtraction | pressure, velocity   | velocity   | Remove the compressing part of the flow |
| 6   | Advect velocity      | velocity             | velocity   | Carry the flow along itself             |
| 7   | Advect dye           | velocity, dye        | dye        | Carry the ink along the flow            |
| 8   | Output               | dye                  | the canvas | Draw the ink, inverted                  |

Passes 1 and 2 run only when the pointer moved.

### 7.1 Splat

_`hero.html`, lines 682 to 699_

```js
if (pointer.moved) {
  if (!idle) pointer.moved = false

  const { program, uniforms } = programs.splat
  gl.useProgram(program)
  gl.uniform1i(uniforms.u_input_texture, velocity.read().attach(1))
  gl.uniform1f(uniforms.u_ratio, canvas.width / canvas.height)
  gl.uniform2f(uniforms.u_point, pointer.x / canvas.width, 1 - pointer.y / canvas.height)
  gl.uniform3f(uniforms.u_point_value, pointer.dx, -pointer.dy, 1)
  gl.uniform1f(uniforms.u_point_size, pointSize)
  blit(velocity.write())
  velocity.swap()

  gl.uniform1i(uniforms.u_input_texture, dye.read().attach(1))
  gl.uniform3f(uniforms.u_point_value, 1 - color.r, 1 - color.g, 1 - color.b)
  blit(dye.write())
  dye.swap()
}
```

_`shaders.splat`, verbatim from the deployed bundle, indentation trimmed_

```glsl
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D u_input_texture;
uniform float u_ratio;
uniform vec3 u_point_value;
uniform vec2 u_point;
uniform float u_point_size;

void main () {
  vec2 p = vUv - u_point.xy;
  p.x *= u_ratio;
  vec3 splat = pow(2., -dot(p, p) / u_point_size) * u_point_value;
  vec3 base = texture2D(u_input_texture, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.);
}
```

A splat adds a soft round blob of some value to a texture. The blob is `pow(2, -distance² / size)`, a bell shape that is 1 at the pointer and one half at a distance of `sqrt(size)`. With `size = 4 / height` and distances measured in units of the canvas height, that radius works out to `2 * sqrt(height)` pixels, about 60px on a 900px tall hero. Multiplying `p.x` by the aspect ratio keeps the blob round on a canvas that is not square.

The same program runs twice. The first run adds the pointer velocity to the velocity texture. The y component is negated, and the point is `1 - y / height`, because WebGL's origin is the bottom left corner while the DOM's is the top left. The second run adds dye. The value added is `1 - color`, not the colour itself, because the output pass inverts the texture at the end: adding (0.79, 0.82, 0.49) of dye yields the indigo (0.21, 0.18, 0.51) on screen.

### 7.2 Divergence

_`hero.html`, lines 703 to 706_

```js
gl.useProgram(divergence.program)
gl.uniform2f(divergence.uniforms.u_texel, velocity.texelSizeX, velocity.texelSizeY)
gl.uniform1i(divergence.uniforms.u_velocity_texture, velocity.read().attach(1))
blit(divergenceTarget)
```

_`shaders.divergence`, verbatim from the deployed bundle, indentation trimmed_

```glsl
precision highp float;
precision highp sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_velocity_texture;

void main () {
  float L = texture2D(u_velocity_texture, vL).x;
  float R = texture2D(u_velocity_texture, vR).x;
  float T = texture2D(u_velocity_texture, vT).y;
  float B = texture2D(u_velocity_texture, vB).y;
  float div = .6 * (R - L + T - B);
  gl_FragColor = vec4(div, 0., 0., 1.);
}
```

Divergence compares each texel's neighbours: if more fluid flows out to the right than comes in from the left, and the same vertically, the point is expanding. A positive value means a source, a negative value means a sink. Real liquid does neither, so the next two passes exist to get rid of it.

### 7.3 Pressure

_`hero.html`, lines 708 to 715_

```js
gl.useProgram(pressure.program)
gl.uniform2f(pressure.uniforms.u_texel, velocity.texelSizeX, velocity.texelSizeY)
gl.uniform1i(pressure.uniforms.u_divergence_texture, divergenceTarget.attach(1))
for (let i = 0; i < 4; i++) {
  gl.uniform1i(pressure.uniforms.u_pressure_texture, pressureTarget.read().attach(2))
  blit(pressureTarget.write())
  pressureTarget.swap()
}
```

_`shaders.pressure`, verbatim from the deployed bundle, indentation trimmed_

```glsl
precision highp float;
precision highp sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_pressure_texture;
uniform sampler2D u_divergence_texture;

void main () {
  float L = texture2D(u_pressure_texture, vL).x;
  float R = texture2D(u_pressure_texture, vR).x;
  float T = texture2D(u_pressure_texture, vT).x;
  float B = texture2D(u_pressure_texture, vB).x;
  float divergence = texture2D(u_divergence_texture, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0., 0., 1.);
}
```

This is a Jacobi iteration, a relaxation method: each texel's pressure becomes the average of its four neighbours, corrected by the local divergence. Every repetition spreads the solution one texel further. A textbook solver runs it 20 to 50 times. This one runs it 4 times, and it never clears the pressure texture, so each frame starts from the previous frame's answer. The result is only roughly incompressible, which is a large part of why the ink looks like smoke in water rather than a tight liquid.

### 7.4 Gradient subtraction

_`hero.html`, lines 717 to 722_

```js
gl.useProgram(gradientSubtract.program)
gl.uniform2f(gradientSubtract.uniforms.u_texel, velocity.texelSizeX, velocity.texelSizeY)
gl.uniform1i(gradientSubtract.uniforms.u_pressure_texture, pressureTarget.read().attach(1))
gl.uniform1i(gradientSubtract.uniforms.u_velocity_texture, velocity.read().attach(2))
blit(velocity.write())
velocity.swap()
```

_`shaders.gradientSubtract`, verbatim from the deployed bundle, indentation trimmed_

```glsl
precision highp float;
precision highp sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_pressure_texture;
uniform sampler2D u_velocity_texture;

void main () {
  float L = texture2D(u_pressure_texture, vL).x;
  float R = texture2D(u_pressure_texture, vR).x;
  float T = texture2D(u_pressure_texture, vT).x;
  float B = texture2D(u_pressure_texture, vB).x;
  vec2 velocity = texture2D(u_velocity_texture, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0., 1.);
}
```

Fluid flows from high pressure to low. Subtracting the pressure gradient from the velocity removes the part of the flow that was compressing, and what remains swirls. This pass and the two before it are together called projection.

### 7.5 Advection

_`hero.html`, lines 724 to 735_

```js
gl.useProgram(advection.program)
gl.uniform2f(advection.uniforms.u_texel, velocity.texelSizeX, velocity.texelSizeY)
gl.uniform1i(advection.uniforms.u_velocity_texture, velocity.read().attach(1))
gl.uniform1i(advection.uniforms.u_input_texture, velocity.read().attach(1))
gl.uniform1f(advection.uniforms.u_dt, 1 / 60)
blit(velocity.write())
velocity.swap()

gl.uniform2f(advection.uniforms.u_texel, dye.texelSizeX, dye.texelSizeY)
gl.uniform1i(advection.uniforms.u_input_texture, dye.read().attach(2))
blit(dye.write())
dye.swap()
```

_`shaders.advection`, verbatim from the deployed bundle, indentation trimmed_

```glsl
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D u_velocity_texture;
uniform sampler2D u_input_texture;
uniform vec2 u_texel;
uniform float u_dt;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
  vec2 coord = vUv - u_dt * bilerp(u_velocity_texture, vUv, u_texel).xy * u_texel;
  float dissipation = .96;
  gl_FragColor = dissipation * bilerp(u_input_texture, coord, u_texel);
  gl_FragColor.a = 1.;
}
```

Advection means carrying a quantity along the flow. The shader does it backwards: for each texel it asks where the fluid that is here now was one time step ago, `vUv - dt * velocity * texel`, and copies the value from that spot. Tracing backwards is unconditionally stable, which is why the simulation never blows up however hard you flick the mouse. Because the textures use `NEAREST` filtering, the shader interpolates between the four surrounding texels by hand in `bilerp`.

The program runs twice. First the velocity field is carried along itself, which is what makes swirls travel and curl. Then the dye is carried along. One detail of the deployed code is preserved here: the dye pass does not rebind the velocity texture. Texture unit 1 still holds the velocity from before the first advection pass, so the dye is moved by the projected velocity, not the freshly advected one.

`dissipation = .96` multiplies the result every frame, for both the velocity and the dye. That is the fade. At 0.96 per frame the dye halves every 17 frames, about 0.28 seconds at 60 Hz, and 8.6% is left after a second.

### 7.6 Output

_`hero.html`, lines 737 to 741_

```js
gl.useProgram(output.program)
gl.uniform1i(output.uniforms.u_output_texture, dye.read().attach(1))
blit(null)

raf = requestAnimationFrame(frame)
```

_`shaders.output`, verbatim from the deployed bundle, indentation trimmed_

```glsl
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D u_output_texture;

void main () {
  vec3 C = texture2D(u_output_texture, vUv).rgb;
  gl_FragColor = vec4(vec3(1.) - C, 1.);
}
```

The last pass draws the dye texture to the visible canvas as `1 - dye`. The quarter resolution texture is read with `NEAREST`, so the raw output is made of 4px blocks. The CSS blur is what hides them. Then the frame schedules the next one.

## 8. Why the ink looks the way it does

### The black core

Each splat adds up to (0.79, 0.82, 0.49) of dye at its centre and the output is `1 - dye`, clamped at zero by the canvas. Two overlapping splats already drive red and green to zero and leave almost no blue. While the pointer is moving, splats overlap many times over, so the fresh ink under the cursor is black. Further out and further back in time, where less than one splat's worth of dye remains, you see the indigo, then lavender, then nothing. Blue survives longest because its dye value is the smallest, which is why the fringe is blue-violet rather than grey.

### The trail

Its length is the dissipation constant. Raise `.96` towards 1 and ink lingers and builds up. Lower it and the ink becomes a tight comet.

### Refresh rate

The time step is fixed at `1 / 60` per frame and the fade is per frame, not per second, so the look depends on how often the display refreshes. I measured this by stepping the same four seconds of idle wander at 60 and at 120 frames per second on a 960 by 600 canvas. The dark area was about the same (30% against 33% of the canvas darker than mid grey), because twice as many splats offset the faster fade. The pale wash around it shrank: 60% of the canvas showed visible ink at 60 Hz and 48% at 120 Hz. On a 120 Hz display expect the same core with a shorter, tidier trail. This comes from the deployed code and I left it alone.

## 9. Start, stop and resize

_`hero.html`, lines 744 to 752_

```js
resize()
new ResizeObserver(resize).observe(canvas)
window.addEventListener('mousemove', onPointerInput)
window.addEventListener('touchmove', (event) => onPointerInput(event.targetTouches[0]), {
  passive: true,
})

new IntersectionObserver(([entry]) => {
  cancelAnimationFrame(raf)
  if (entry.isIntersecting) raf = requestAnimationFrame(frame)
}).observe(canvas)
```

`resize()` runs once by hand so the targets exist before the first frame, and the `ResizeObserver` keeps them in step with the canvas box from then on. Observing the element, rather than listening for window resizes, also covers the hero changing height for reasons other than the window, such as fonts loading or content wrapping.

The `IntersectionObserver` is the only thing that starts or stops the loop. It fires once when it begins observing, which starts the animation, and again whenever the canvas enters or leaves the viewport. Once the hero has scrolled away no frames are requested at all. In my test the count of animation frame callbacks dropped to zero with the hero off screen and resumed when it came back. The recovered `FluidBackground.tsx` starts two loops by calling `frame()` and `requestAnimationFrame(frame)` back to back. There is exactly one here.

The `touchmove` listener is passive. It never calls `preventDefault`, and a non-passive touch listener on `window` makes the browser wait for JavaScript before it scrolls.

## 10. Text that flips colour

Dark ink behind dark text would swallow it. The nav and the headline avoid that by blending with `difference`, which outputs the absolute difference between the element's colour and whatever is behind it, per channel.

### The nav

_`hero.html`, lines 46 to 52_

```css
.nav_component {
  position: absolute;
  inset: 0 0 auto;
  z-index: 2;
  color: #fff;
  mix-blend-mode: difference; /* white minus the white page = black; over dark ink it stays light */
}
```

The nav sits over the white top of the gradient. White minus white is black, so with no ink the nav reads as the black of the design. Over black ink, white minus black is white. Links, wordmark and logo inherit the white, and the divider uses `#4d4c4d` so that it reads as the design's `#b2b3b2` after blending. Hover changes opacity rather than colour, because any colour you set in here is shown inverted.

### The headline

_`hero.html`, lines 146 to 169_

```css
/* Colour flip. The fill matches the clean gradient behind the headline, and difference
   subtracts it from whatever is really there. No ink: gradient minus itself, so black.
   Dark ink behind: the fill shows, so the letters turn light. Blended elements need an
   unbroken path to the canvas: a stacking context (transform, opacity, filter, z-index)
   on any wrapper between them and .section_hero switches the effect off. */
.hero_heading {
  margin: 0;
  color: transparent;
  background: linear-gradient(to bottom, #d6d9f2, #949bd0);
  background-clip: text;
  mix-blend-mode: difference;
  font-size: clamp(2.25rem, 1.25rem + 3.7vw, 5.625rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

/* A darker fill reads as the softer #222433 of the design once subtracted. */
.hero_heading em {
  background: #969ab8;
  background-clip: text;
  font-weight: 400;
}
```

The headline sits on lavender, not white, and white minus lavender is an olive brown. So the letters are not filled with white. They are filled, through `background-clip: text`, with a gradient that matches the clean page gradient behind them. The arithmetic per pixel is:

| Behind the letter          | Result                              | Reads as                |
| -------------------------- | ----------------------------------- | ----------------------- |
| Clean gradient, no ink     | gradient minus itself               | black                   |
| Black ink                  | fill minus black, which is the fill | light lavender          |
| Ink at about half strength | both sides nearly equal             | low contrast, see below |

The two fill colours were measured, not guessed. I hid the headline, sampled the background behind its first and last line at eight viewport sizes, and extended those values to the top and bottom edges of the heading box:

| Viewport width | Behind first line | Behind last line |
| -------------- | ----------------- | ---------------- |
| 360            | `#bcc1e5`         | `#959ccf`        |
| 390            | `#bcc1e5`         | `#969dcf`        |
| 768            | `#b5bae2`         | `#9fa6d6`        |
| 992            | `#b4bae1`         | `#9aa1d3`        |
| 1280           | `#bcc1e5`         | `#9da4d5`        |
| 1440           | `#caceec`         | `#acb2dd`        |
| 1901           | `#d6d9f1`         | `#b3b9e1`        |
| 2560           | `#d6d9f1`         | `#b2b8e0`        |

A single pair, `#d6d9f2` to `#949bd0`, is close enough to all of them. With no ink the measured headline colour stays between (4, 4, 3) and (16, 15, 10) across seven viewport sizes from 360 to 2560 wide, against the design's `#03040a`. If you change the page gradient, move the headline, or change its size a lot, repeat that measurement and update the two colours. The italic word has its own darker fill so that it keeps the softer `#222433` of the design.

### The rule that breaks it

A blended element blends with what is behind it inside its nearest stacking context. The headline has to reach the canvas, so nothing between it and `.section_hero` may create a stacking context. `.hero_content` is `position: relative` without a `z-index`, which is safe. A `transform`, `opacity` below 1, `filter`, `will-change`, or a `z-index` on a positioned wrapper is not. If that happens the effect switches off and the headline shows in its lavender fill on a lavender background. The same applies to anything you wrap around the nav. Watch for this when you add entrance animations or Webflow interactions, because both work by animating `transform` and `opacity`.

### What is left alone

The caption and the scroll arrow are light text on the dark part of the gradient. Ink can only darken what is behind them, which raises their contrast, so they cannot disappear, and `difference` would only dull them. The prompt box is an opaque surface painted above the canvas, so the ink never shows through it.

### The limit of this technique

`difference` is a straight inversion, not a switch. Text is dark over light, light over dark, and weak over the middle. While a trail fades through half strength the text over it goes olive and loses contrast for a moment. On the 90px headline it is hard to notice. On the 20px nav links it is visible. CSS has no blend mode with a threshold, so there is no pure CSS fix.

The text selection and focus styles inside the blended layers are set in white for the same reason the text is:

_`hero.html`, lines 38 to 42_

```css
/* inside the difference-blended layers white reads as black, and flips with the text */
.nav_component ::selection,
.hero_heading::selection,
.hero_heading ::selection {
  background: #fff;
  color: #000;
}
.nav_component :focus-visible {
  outline-color: #fff;
}
```

## 11. The gradient

The background was fitted to the reference screenshot rather than eyeballed. I sampled the clean areas of the screenshot, searched for the centre and proportions of the ellipse that best explained those samples, and reduced the colour ramp to 15 stops. The rendered result differs from the screenshot by 1.2 levels out of 255 on average. The ellipse is centred far below the section, which is what makes the middle of the page run slightly darker than its edges.

The gradient has a fixed height, `--gradient-height`, 62rem and 52rem on small screens, and it is pinned to the bottom of the section with plain white above it. The content is anchored to the bottom as well. Tying both to the bottom keeps their relationship constant: at every viewport size I checked, from 390 by 844 to 2560 by 1440 and a 1080 by 1920 portrait screen, the headline lands between 26% and 59% of the way down the gradient, on the light part, and the caption between 82% and 94%, on the dark part. A gradient that stretched with the viewport would put the headline on dark indigo on a 1440px tall monitor.

## 12. Tuning

| Constant              | Where                                | Value                           | What it changes                                                                                |
| --------------------- | ------------------------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Simulation resolution | `resize()`                           | `0.25`                          | Detail of the swirls. Doubling it quadruples the GPU work, and the blur hides most of the gain |
| Splat size            | `resize()`                           | `4 / height`                    | Width of the brush. The radius in pixels is `2 * sqrt(height)`                                 |
| Velocity gain         | `updatePointer()`                    | `5`                             | How hard pointer movement pushes the fluid                                                     |
| Time step             | `frame()`, `u_dt`                    | `1 / 60`                        | How far the fields travel per frame                                                            |
| Dissipation           | advection shader                     | `.96`                           | Trail length and build-up, for velocity and dye alike                                          |
| Pressure iterations   | `frame()` loop                       | `4`                             | More makes the flow tighter and more liquid. Each costs one pass                               |
| Divergence scale      | divergence shader                    | `.6`                            | How hard the pressure step pushes back                                                         |
| Ink colour            | second argument of `fluidBackground` | `{ r: 0.21, g: 0.18, b: 0.51 }` | The colour a single splat reaches. Built-up ink still goes black                               |
| Idle path             | `frame()`                            | four sines per axis             | Where the ink wanders before the first input, and how fast                                     |
| Blur                  | `.hero_ink`                          | `8px`                           | Softness. The raw output is made of 4px blocks, so a much smaller blur lets them show          |
| Headline fill         | `.hero_heading`                      | `#d6d9f2`, `#949bd0`            | Must track the page gradient, see section 10                                                   |

## 13. What it costs

Per frame there are nine to eleven full screen passes, all but one over a quarter resolution target, which is one sixteenth of the pixels. For a 1920 by 1080 hero the grid is 480 by 270, and the seven float textures add up to about 12 MB of GPU memory. On top of that the browser blurs and blends a full size canvas every frame. I have not profiled which of the two dominates.

Three things already hold the cost down: the quarter resolution, ignoring `devicePixelRatio`, and stopping the loop when the hero is off screen.

## 14. How it fails

| Situation                                 | What happens                                                                                                                                                                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No WebGL                                  | `fluidBackground` returns at once. The page shows the static gradient                                                                                                                                                                    |
| Reduced motion requested                  | The simulation is never started                                                                                                                                                                                                          |
| A shader fails to compile or link         | An error is thrown with the driver's log. Nothing else on the page depends on the script                                                                                                                                                 |
| The GPU cannot render into float textures | The code never calls `checkFramebufferStatus`, so it would not notice. My reading of the code is that the passes would fail, the canvas would stay white, and white is invisible under multiply. I have not tested this on such a device |

## 15. Porting it

### React

Run `fluidBackground` from an effect on a canvas ref. The vanilla function never cleans up, because a static page never needs to. A component does: disconnect both observers, remove both window listeners, and cancel the pending animation frame. Keep the default colour in a module constant. The recovered component builds a new default object on every render and lists it as an effect dependency, so any re-render tears the simulation down and clears the ink. The recovered file also imports its shaders with `?raw`, which is a Vite feature, under a `"use client"` directive, which is Next.js. As far as I know Next.js does not resolve `?raw` without extra loader configuration. I have not verified that.

### Webflow

Put the canvas in an Embed element as the first child of the hero section, give it the `.hero_ink` styles, and place the script in the page's footer code. The class names in `hero.html` already follow Client-First custom class naming. The stacking context rule in section 10 is the part most likely to bite, since interactions animate `transform` and `opacity`.

## 16. What has been verified

Everything here was tested in Chromium with software WebGL, with frames stepped on a virtual 60 Hz clock, because the simulation depends on frame rate and the test machine renders far slower than real hardware. Confirmed: the simulation runs with no console errors, the loop stops off screen and resumes, reduced motion skips it, there is no horizontal overflow from 320 to 1901 pixels wide, the nav and headline flip over ink on desktop and mobile sizes, and the static page matches the reference screenshot to within about 7px in layout and 1.2 levels in background colour.

Not tested: Safari, Firefox, real GPUs, real 120 Hz displays, and devices without float render targets.
