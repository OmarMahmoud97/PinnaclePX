// The seven GLSL programs of the hero's ink, verbatim from the reference build
// (docs/fluid-hero-guide.md, sections 4 and 7), so the guide's explanation is the code that
// runs. Two tuning constants live in the shaders because GLSL cannot read lib/config.ts: the
// fade, `dissipation` in `advection` (0.96 a frame, so the ink halves every 17 frames), and the
// divergence scale in `divergence` (0.6, how hard the pressure step pushes back).

// A quad over the whole target. Every pixel gets its own texture coordinate and those of its
// four neighbours, so the three "look at my neighbours" passes stay short.
const vertex = `
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
`

// Adds a soft round blob of a value at the pointer: 1 at the centre, a half at sqrt(size).
const splat = `
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
`

// How much the flow compresses or expands at each point: positive is a source, negative a sink.
const divergence = `
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
`

// One Jacobi step: each texel's pressure becomes the mean of its neighbours less the divergence.
const pressure = `
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
`

// Takes the pressure gradient out of the velocity, so what remains swirls instead of piling up.
const gradientSubtract = `
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
`

// Carries a field along the flow by asking where each texel's fluid was one step ago and
// copying from there, which never blows up however hard the pointer flicks.
const advection = `
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
`

// Draws the dye inverted: no dye is white, which multiply leaves alone, and a lot is dark.
const output = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D u_output_texture;

void main () {
  vec3 C = texture2D(u_output_texture, vUv).rgb;
  gl_FragColor = vec4(vec3(1.) - C, 1.);
}
`

export const SHADERS = {
  vertex,
  splat,
  divergence,
  pressure,
  gradientSubtract,
  advection,
  output,
} as const
