import { ImageResponse } from 'next/og'
import { readPreview } from '@/lib/preview/read'
import { statusOf } from '@/lib/preview/status'
import { SITE } from '@/lib/site'
import { contractFor } from '@/templates/registry'

export const alt = 'Homepage designs by PinnaclePX'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Params = Promise<{ slug: string }>

// The card a shared link shows: the company's name and first headline in its own colours, and
// who made it. Rendered from the row, like the page; a submission that is not ready shows the
// studio's own colours and no headline.
export default async function Image({ params }: { params: Params }) {
  const { slug } = await params
  const found = await readPreview(slug)
  const status = found === null ? null : statusOf(found.row)
  const company = found?.answers.company ?? SITE.name
  const templateId = found?.row.templateIds?.[0] ?? null
  const headline =
    found !== null &&
    (status?.status === 'ready' || status?.status === 'partial') &&
    templateId !== null
      ? contractFor(templateId).headlineOf(found.row.copy[templateId])
      : null
  const tokens = found?.row.tokens ?? null
  const surface = tokens?.surface ?? '#ffffff'
  const onSurface = tokens?.['on-surface'] ?? '#0f172a'
  const muted = tokens?.['on-surface-muted'] ?? '#475569'
  const brand = tokens?.['brand-deeper'] ?? '#0369a1'

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: surface,
        color: onSurface,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 20, height: 20, borderRadius: 999, background: brand }} />
        <div style={{ fontSize: 36, fontWeight: 600 }}>{company}</div>
      </div>
      <div
        style={{
          fontSize: headline === null ? 56 : 64,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: -2,
          maxWidth: 1000,
        }}
      >
        {headline ?? `${company}, your homepage designs.`}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, color: muted }}>
        <div>Built from five answers</div>
        <div style={{ color: brand, fontWeight: 600 }}>{SITE.name}</div>
      </div>
    </div>,
    size,
  )
}
