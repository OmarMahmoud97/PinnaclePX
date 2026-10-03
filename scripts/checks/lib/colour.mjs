// WCAG 2.2 contrast in 8-bit sRGB, as review/verify-templates/contrast.cjs computed it.

const linear = (channel) => {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const luminance = ([r, g, b]) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)

export function ratio(a, b) {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

// A colour with alpha (0 to 1) over an opaque one.
export const over = ([r, g, b, a], [R, G, B]) => [
  a * r + (1 - a) * R,
  a * g + (1 - a) * G,
  a * b + (1 - a) * B,
]

// The level a text needs: 3:1 when large (24 px, or 18.66 px at bold), else 4.5:1.
export const levelOf = (size, weight) => (size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5)

export const round2 = (x) => Math.round(x * 100) / 100
