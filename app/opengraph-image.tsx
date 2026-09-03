import { ImageResponse } from 'next/og'
import { LogoMark } from '@/components/brand/logo-mark'
import { SITE } from '@/lib/site'

export const alt = `${SITE.name}: ${SITE.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand blue ground, white wordmark and tagline. Hex is fine here: this is not a template, and
// an image cannot read CSS. The values are --brand to --brand-deeper from globals.css.
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: 'linear-gradient(160deg, #0ea5e9 0%, #0369a1 100%)',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 40 }}>
        <LogoMark size={64} />
        <span style={{ fontWeight: 600, letterSpacing: -1 }}>{SITE.name}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: -3, lineHeight: 1.05 }}>
          {SITE.tagline}
        </div>
        <div style={{ fontSize: 30, opacity: 0.9, maxWidth: 900 }}>{SITE.description}</div>
      </div>
    </div>,
    size,
  )
}
