'use client'

import { Images, X } from 'lucide-react'
import type { LocalImage, StepProps } from '@/app/start/_components/step-props'
import { Button } from '@/components/ui/button'
import { ChoiceCard } from '@/components/ui/choice-card'
import { FilePicker } from '@/components/ui/file-picker'
import type { DraftImagery } from '@/lib/brief/schema'
import { STYLES, type VisualStyle } from '@/lib/brief/styles'
import { acceptFor } from '@/lib/brief/uploads'
import { CONFIG } from '@/lib/config'

const ACCEPT = acceptFor('photos')

// A swatch per style. Literal classes so Tailwind can see them.
const SWATCH: Readonly<Record<VisualStyle, string>> = {
  warm: 'bg-linear-to-br from-warning/70 to-danger/50',
  minimal: 'bg-linear-to-br from-surface-muted to-border',
  bold: 'bg-linear-to-br from-brand to-glow-secondary/70',
  dark: 'bg-linear-to-br from-on-surface-muted to-scrim',
}

type Props = StepProps & {
  photos: readonly LocalImage[]
  onFiles: (files: readonly File[]) => void
  onRemovePhoto: (id: string) => void
  onPreview: (value: DraftImagery | null) => void
}

// A style is always chosen and photos are optional. The two sit side by side: the style is
// applied to the photos as a treatment, and without photos it guides the ones we find.
export function ImageryStep({
  answers,
  errors,
  dispatch,
  photos,
  onFiles,
  onRemovePhoto,
  onPreview,
}: Props) {
  const { imagery } = answers
  const max = CONFIG.form.maxPhotos
  const full = photos.length >= max

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Visual style" className="grid gap-2 sm:grid-cols-2">
        {STYLES.map(({ id, label, detail }) => (
          <ChoiceCard
            key={id}
            selected={imagery.style === id}
            onSelect={() => {
              dispatch({ type: 'set-style', value: id })
            }}
            onPreview={(active) => {
              onPreview(active ? { ...imagery, style: id } : null)
            }}
            title={label}
            detail={detail}
            media={
              <span
                aria-hidden="true"
                className={`size-10 shrink-0 rounded-lg border border-border ${SWATCH[id]}`}
              />
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-3 text-sm text-on-surface-muted">
        <span className="h-px flex-1 bg-border" />
        and your own photos, if you have them
        <span className="h-px flex-1 bg-border" />
      </div>

      {!full && (
        <FilePicker
          accept={ACCEPT}
          multiple
          onFiles={onFiles}
          className="justify-center gap-2 py-4 text-sm font-medium"
        >
          <Images aria-hidden="true" className="size-4 text-on-surface-muted" />
          {photos.length === 0 ? 'Add your own photos' : 'Add more photos'}
        </FilePicker>
      )}

      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              <span
                role="img"
                aria-label={photo.name}
                style={{ backgroundImage: `url(${photo.url})` }}
                className="absolute inset-0 bg-cover bg-center"
              />
              {photo.status !== 'done' && (
                <span
                  className={`absolute inset-x-0 bottom-0 px-1.5 py-0.5 text-center font-mono text-[10px] ${photo.status === 'failed' ? 'bg-danger text-on-brand' : 'bg-surface/90 text-on-surface-muted'}`}
                >
                  {photo.status === 'failed' ? 'failed' : 'uploading'}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 size-6 bg-surface/90 shadow-badge"
                onClick={() => {
                  onRemovePhoto(photo.id)
                }}
                aria-label={`Remove ${photo.name}`}
              >
                <X aria-hidden="true" className="size-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {errors.imagery !== undefined && (
        <p className="text-sm font-medium text-danger">{errors.imagery}</p>
      )}

      <p className="text-sm text-on-surface-muted">
        {full ? `That is the full ${String(max)}.` : `Up to ${String(max)} photos.`} Your style is
        applied to them. Without any, we find photos to match your style and credit every
        photographer.
      </p>
    </div>
  )
}
