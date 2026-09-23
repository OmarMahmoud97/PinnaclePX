import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { SITE } from '@/lib/site'

export const alt = `${SITE.name}: ${SITE.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// The mark in its own gradient beside the name, on the page's white-to-wash ground, with the
// tagline in the site's navy: the same world as the page below the hero (ADR 0034). Hex is fine
// here: this is not a template, and an image cannot read CSS. The values are --surface,
// --surface-wash, --on-surface and --on-surface-muted from globals.css.
export default async function OpenGraphImage() {
  const mark = await readFile(join(process.cwd(), 'app', '_images', 'brand', 'px-mark-480.png'))
  const src = `data:image/png;base64,${mark.toString('base64')}`
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: 'linear-gradient(160deg, #ffffff 0%, #e2eef7 100%)',
        color: '#0f172a',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 40 }}>
        {/* next/og draws with satori, which knows only the plain img element. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={122} height={80} alt="" />
        <span style={{ fontWeight: 600, letterSpacing: -1 }}>{SITE.name}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: -3, lineHeight: 1.05 }}>
          {SITE.tagline}
        </div>
        <div style={{ fontSize: 30, color: '#475569', maxWidth: 900 }}>{SITE.description}</div>
      </div>
    </div>,
    size,
  )
}
