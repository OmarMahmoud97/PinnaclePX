'use client'

import { Images, X } from 'lucide-react'
import type { LocalImage, StepProps } from '@/app/start/_components/step-props'
import { Button } from '@/components/ui/button'
import { captionStyles } from '@/components/ui/caption'
import { ChoiceCard } from '@/components/ui/choice-card'
import { FieldError } from '@/components/ui/field'
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
  bold: 'bg-linear-to-br from-brand to-glow-secondary',
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
//
// The styles sit two to a row only once the question's column is 30rem wide, because a card
// narrower than about 240 px breaks its title and detail word by word. The column decides, not
// the screen, since from lg the question has under half the screen.
//
// Nothing here is ruled off: the photos are introduced by a quiet caption line with air above
// it, and the swatches and thumbnails sit on the badge shadow rather than a border. A photo's
// upload tag is dark words on a white band over the picture, a red dot marking a failure, since
// white on red at that size would fall under 4.5:1.
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
    <div className="@container flex flex-col gap-4">
      <div
        role="radiogroup"
        aria-label="Visual style"
        className="grid gap-2 @min-[30rem]:grid-cols-2"
      >
        {STYLES.map(({ id, label, detail }) => (
          <ChoiceCard
            key={id}
            selected={imagery.style === id}
            // The schema always holds a style, so the chosen card always holds the Tab stop.
            tabbable={imagery.style === id}
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
                className={`size-10 shrink-0 rounded-xl shadow-badge ${SWATCH[id]}`}
              />
            }
          />
        ))}
      </div>

      <p className={`${captionStyles} pt-2`}>and your own photos, if you have them</p>

      {!full && (
        <FilePicker
          accept={ACCEPT}
          multiple
          onFiles={onFiles}
          className="justify-center gap-2 py-4 text-sm font-medium"
        >
          <Images aria-hidden="true" className="size-4 text-brand-ink" />
          {photos.length === 0 ? 'Add your own photos' : 'Add more photos'}
        </FilePicker>
      )}

      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-xl shadow-badge"
            >
              <span
                role="img"
                aria-label={photo.name}
                style={{ backgroundImage: `url(${photo.url})` }}
                className="absolute inset-0 bg-cover bg-center"
              />
              {photo.status !== 'done' && (
                <span
                  className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-surface/90 px-1.5 py-0.5 text-label ${photo.status === 'failed' ? 'text-on-surface' : 'text-on-surface-muted'}`}
                >
                  {photo.status === 'failed' && (
                    <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-danger" />
                  )}
                  {photo.status === 'failed' ? 'failed' : 'uploading'}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 bg-surface/90 shadow-badge"
                onClick={() => {
                  onRemovePhoto(photo.id)
                }}
                aria-label={`Remove ${photo.name}`}
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Question four has no control that carries aria-invalid, so after a failed Next or a
          refused photo the message announces itself. On the other questions the question pane
          moves focus to the first invalid control instead. */}
      {errors.imagery !== undefined && <FieldError role="alert">{errors.imagery}</FieldError>}

      <p className="text-sm text-on-surface-muted">
        {full ? `That is the full ${String(max)}.` : `Up to ${String(max)} photos.`} Your style is
        applied to them. Without any, we find photos to match your style and credit every
        photographer.
      </p>
    </div>
  )
}
