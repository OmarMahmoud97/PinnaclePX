import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

// The light mark on the ink card colour, in a rounded square: a tab icon sits on light and dark
// browser chrome alike, and the dark ground carries the mark either way. Hex is fine here: this
// is not a template, and an image cannot read CSS (--ink-card in globals.css). The artwork is
// the pre-filled light version in app/_images/brand, read at build time.
export default async function Icon() {
  const mark = await readFile(
    join(process.cwd(), 'app', '_images', 'brand', 'px-mark-light-480.png'),
  )
  const src = `data:image/png;base64,${mark.toString('base64')}`
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#021b2c',
        borderRadius: 7,
      }}
    >
      {/* next/og draws with satori, which knows only the plain img element. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={24} height={16} alt="" />
    </div>,
    size,
  )
}
