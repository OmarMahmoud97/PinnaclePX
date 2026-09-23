import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// The home-screen icon: the same design as app/icon.tsx at the size iOS asks for. iOS rounds the
// corners itself, so the square is left square.
export default async function AppleIcon() {
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
      }}
    >
      {/* next/og draws with satori, which knows only the plain img element. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={124} height={82} alt="" />
    </div>,
    size,
  )
}
