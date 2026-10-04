import { readPolarity } from '@/lib/logo/polarity'
import { channelOf, polarityOf, type StandInFill } from './stand-in'

// The stand-in logos are decision 23's marks: each must be the artwork its name says when the
// logo stage reads it (lib/logo/polarity.ts), or a check of "mixed" artwork measures dark or
// light artwork instead.

// A mark of one grey on a clear margin, so the stage reads the mark itself and not a box behind it.
function markOf(channel: number) {
  const size = 16
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inside = x >= 4 && y >= 4 && x < size - 4 && y < size - 4
      data.set(inside ? [channel, channel, channel, 255] : [0, 0, 0, 0], (y * size + x) * 4)
    }
  }
  return { data, width: size, height: size }
}

const EXPECTED: readonly (readonly [StandInFill, string])[] = [
  ['black', 'dark-artwork'],
  ['l034', 'dark-artwork'],
  ['l035', 'mixed'],
  ['l050', 'mixed'],
  ['l065', 'mixed'],
  ['l066', 'light-artwork'],
  ['white', 'light-artwork'],
]

describe('the stand-in marks', () => {
  it.each(EXPECTED)('%s is read as %s', (fill, polarity) => {
    expect(readPolarity(markOf(channelOf(fill)))?.polarity).toBe(polarity)
  })

  it.each(EXPECTED)(
    '%s is passed to the template as %s, as the stage reads it',
    (fill, polarity) => {
      expect(polarityOf(fill)).toBe(polarity)
    },
  )

  it('stays within a step of the lightness it is named for', () => {
    expect(channelOf('l035')).toBe(83)
    expect(channelOf('l050')).toBe(119)
    expect(channelOf('l065')).toBe(157)
    expect(channelOf('l034')).toBe(80)
    expect(channelOf('l066')).toBe(160)
  })
})
