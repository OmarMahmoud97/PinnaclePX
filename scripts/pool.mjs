// Reads the ground behind text in a screenshot: the check for the lamp, the ramp and the ink that
// axe cannot make, because the colours are painted by gradients and a glow rather than declared
// (docs/start-page-journey-plan.md, sections 5.4, 9.3 and gate 11.6).
//
//   pnpm measure:ground <shot.png> <box> [<box> ...] [--text <hex>]
//
// A box is `x,y` for one pixel or `x,y,width,height` for every pixel inside, in the shot's own
// pixels (a device-scale-2 shot doubles the CSS numbers). For each box it prints the lightest and
// the darkest pixel with their WCAG relative luminance. With --text it adds the contrast of that
// colour over the box, over its weakest pixel and its strongest: the first number is what a text
// box there must clear (4.5 for body text), and with the ink `#020a12` as the colour the second
// is how far the lamp's peak stands off the ground.
import sharp from 'sharp'

function fail(message) {
  console.error(`pool: ${message}`)
  process.exit(1)
}

function channel(value) {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance([r, g, b]) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(a, b) {
  const [light, dark] = a > b ? [a, b] : [b, a]
  return (light + 0.05) / (dark + 0.05)
}

function parseHex(value) {
  const match = /^#?([0-9a-f]{6})$/i.exec(value)
  if (match === null) fail(`--text takes a six-digit hex such as #e8f1f8, not "${value}"`)
  const n = Number.parseInt(match[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function parseBox(value, width, height) {
  const numbers = value.split(',').map(Number)
  if (![2, 4].includes(numbers.length) || numbers.some((n) => !Number.isInteger(n) || n < 0)) {
    fail(`a box is x,y or x,y,width,height in whole pixels, not "${value}"`)
  }
  const [x, y, w = 1, h = 1] = numbers
  if (x + w > width || y + h > height) fail(`box ${value} runs past the ${width} by ${height} shot`)
  return { x, y, w, h }
}

const args = process.argv.slice(2)
const textAt = args.indexOf('--text')
const text = textAt === -1 ? null : parseHex(args[textAt + 1] ?? '')
const [shot, ...boxes] =
  textAt === -1 ? args : args.filter((_, i) => i !== textAt && i !== textAt + 1)
if (shot === undefined || boxes.length === 0) {
  fail('usage: pnpm measure:ground <shot.png> <x,y[,width,height]> ... [--text <hex>]')
}

const { data, info } = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const rgb = (i) => `rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`
const textLuminance = text === null ? null : luminance(text)

for (const value of boxes) {
  const { x, y, w, h } = parseBox(value, info.width, info.height)
  let lightest = { at: -1, l: -1 }
  let darkest = { at: -1, l: 2 }
  // Per pixel, because a text colour between the box's lightest and darkest is weakest over a
  // pixel in the middle.
  let weakest = Infinity
  let strongest = 0
  for (let row = y; row < y + h; row++) {
    for (let column = x; column < x + w; column++) {
      const at = (row * info.width + column) * info.channels
      const l = luminance([data[at], data[at + 1], data[at + 2]])
      if (l > lightest.l) lightest = { at, l }
      if (l < darkest.l) darkest = { at, l }
      if (textLuminance !== null) {
        const ratio = contrast(textLuminance, l)
        weakest = Math.min(weakest, ratio)
        strongest = Math.max(strongest, ratio)
      }
    }
  }
  const parts = [
    value.padEnd(20),
    `lightest ${rgb(lightest.at)} L ${lightest.l.toFixed(4)}`,
    `darkest ${rgb(darkest.at)} L ${darkest.l.toFixed(4)}`,
  ]
  if (textLuminance !== null) parts.push(`text ${weakest.toFixed(2)} to ${strongest.toFixed(2)}:1`)
  console.log(parts.join('  '))
}
