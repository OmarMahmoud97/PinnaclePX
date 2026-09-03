import { ImageResponse } from 'next/og'
import { LogoMark } from '@/components/brand/logo-mark'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

// The mark on brand blue. Hex is fine here: this is not a template, and an image cannot read
// CSS. The values are --brand and --on-brand from globals.css.
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0ea5e9',
        color: '#ffffff',
        borderRadius: 8,
      }}
    >
      <LogoMark size={22} />
    </div>,
    size,
  )
}
