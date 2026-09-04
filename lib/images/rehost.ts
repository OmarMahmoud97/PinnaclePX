import 'server-only'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { CONFIG } from '@/lib/config'
import type { SlotImage } from '@/lib/copy-slots/assets'
import { env } from '@/lib/env'
import { AppError } from '@/lib/errors'

type Input = Readonly<{
  // Where the bytes are now: a Pexels source or the visitor's own upload on Blob.
  sourceUrl: string
  // What to name the stored copy by, so a retry overwrites itself.
  key: string
  alt: string
  credit: SlotImage['credit']
}>

// Fetches a photograph, makes one WebP no wider than the configured width, and stores it on
// Blob under its key. One size is enough: next/image serves every viewport from it. The size
// is recorded so the layout never shifts.
export async function rehostImage({ sourceUrl, key, alt, credit }: Input): Promise<SlotImage> {
  const response = await fetch(sourceUrl)
  if (!response.ok) throw new AppError(`Image source returned ${String(response.status)}`)
  const { data, info } = await sharp(Buffer.from(await response.arrayBuffer()))
    .rotate()
    .resize({ width: CONFIG.images.maxWidth, withoutEnlargement: true })
    .webp({ quality: CONFIG.images.quality })
    .toBuffer({ resolveWithObject: true })
  const stored = await put(`images/${key}.webp`, data, {
    access: 'public',
    token: env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'image/webp',
  })
  return { src: stored.url, alt, width: info.width, height: info.height, credit }
}
