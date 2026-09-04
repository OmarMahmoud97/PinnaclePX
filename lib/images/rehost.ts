import 'server-only'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { CONFIG } from '@/lib/config'
import type { SlotImage } from '@/lib/copy-slots/assets'
import { env } from '@/lib/env'

type Input = Readonly<{
  // The photograph's bytes, from Pexels or from the visitor's own upload.
  bytes: Buffer
  // What to name the stored copy by, so a retry overwrites itself.
  key: string
  alt: string
  credit: SlotImage['credit']
}>

// Makes one WebP no wider than the configured width from a photograph, and stores it on Blob
// under its key. One size is enough: next/image serves every viewport from it. The size is
// recorded so the layout never shifts.
export async function rehostImage({ bytes, key, alt, credit }: Input): Promise<SlotImage> {
  const { data, info } = await sharp(bytes)
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
    abortSignal: AbortSignal.timeout(CONFIG.timeoutMs.store),
  })
  return { src: stored.url, alt, width: info.width, height: info.height, credit }
}
