import sharp from 'sharp'
import { channelOf, STAND_IN_FILLS, type StandInFill } from '@/app/dev/_render/stand-in'
import { env } from '@/lib/env'

// A development-only stand-in picture: a flat PNG of one fill at the size its name asks for,
// such as /dev/picture/white/1600x1067-hero.png. The development routes put these in a
// template's image slots and logo (app/dev/_render), and next/image serves them as it serves a
// visitor's pictures. Outside development the route does not exist.

const FILE = /^(\d{1,4})x(\d{1,4})(?:-[a-z0-9-]+)?\.png$/

export async function GET(_request: Request, ctx: RouteContext<'/dev/picture/[fill]/[file]'>) {
  if (env.NODE_ENV !== 'development') return new Response(null, { status: 404 })
  const { fill, file } = await ctx.params
  const size = FILE.exec(file)
  if (!(STAND_IN_FILLS as readonly string[]).includes(fill) || size === null) {
    return new Response(null, { status: 404 })
  }
  const width = Number(size[1])
  const height = Number(size[2])
  if (width < 1 || height < 1) return new Response(null, { status: 404 })
  const value = channelOf(fill as StandInFill)
  const png = await sharp({
    create: { width, height, channels: 3, background: { r: value, g: value, b: value } },
  })
    .png()
    .toBuffer()
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
  })
}
