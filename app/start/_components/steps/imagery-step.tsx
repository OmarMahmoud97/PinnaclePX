'use client'

import { Images, X } from 'lucide-react'
import Link from 'next/link'
import { IMAGERY, PICTURES_LINK, TRY_AGAIN } from '@/app/start/_components/start-copy'
import type { LocalImage, StepProps } from '@/app/start/_components/step-props'
import { Button } from '@/components/ui/button'
import { ChoiceCard } from '@/components/ui/choice-card'
import { FieldError } from '@/components/ui/field'
import { FilePicker } from '@/components/ui/file-picker'
import { textLinkStyles } from '@/components/ui/text-link'
import type { DraftImagery } from '@/lib/brief/schema'
import { STYLES } from '@/lib/brief/styles'
import { acceptFor } from '@/lib/brief/uploads'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

const ACCEPT = acceptFor('photos')

type Props = StepProps & {
  photos: readonly LocalImage[]
  onFiles: (files: readonly File[]) => void
  onRemovePhoto: (id: string) => void
  onRetry: (id: string) => void
  onPreview: (value: DraftImagery | null) => void
}

// The third question: a look is always chosen and photos are optional
// (docs/start-page-journey-plan.md, 4.6). The two sit side by side: the look is applied to the
// photos as a treatment, and without photos it guides the ones we find. With a fine pointer the
// digits 1 to 4 choose a look while the group has the focus (components/ui/choice-card.tsx).
//
// The looks sit two to a row wherever a card can be 14rem wide, which keeps each look's name on
// one line beside its picture; the column decides, not the screen, since from lg the question has
// under half the screen (app/_styles/start.css, .start-looks). Each look shows its mood art, the
// picture the draft draws for it until photos arrive, with "Aa" in its display face once that has
// loaded (.mood-art), and its check on the picture's corner.
//
// Nothing here is ruled off: the thumbnails sit on the badge shadow rather than a border. A
// photo's upload tag is dark words on a white band over the picture, a red dot marking a failure,
// since white on red at that size would fall under 4.5:1; a failed photo offers "Try again"
// beside its "Remove".
export function ImageryStep({
  answers,
  errors,
  dispatch,
  photos,
  onFiles,
  onRemovePhoto,
  onRetry,
  onPreview,
}: Props) {
  const { imagery } = answers
  const full = photos.length >= CONFIG.form.maxPhotos

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label={IMAGERY.group} className="start-looks">
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
                data-style={id}
                className="mood-art size-14 shrink-0 rounded-xl"
              >
                <span className="start-specimen">Aa</span>
              </span>
            }
          />
        ))}
      </div>

      {!full && (
        <FilePicker
          accept={ACCEPT}
          multiple
          onFiles={onFiles}
          className="justify-center gap-2 py-4 text-sm font-medium"
        >
          <Images aria-hidden="true" className="size-4 text-brand-ink" />
          {photos.length === 0 ? IMAGERY.addPhotos : IMAGERY.addMorePhotos}
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
              {photo.status === 'uploading' && (
                <span className="absolute inset-x-0 bottom-0 bg-surface/90 px-1.5 py-0.5 text-center text-label text-on-surface-muted">
                  {IMAGERY.uploading}
                </span>
              )}
              {photo.status === 'failed' && (
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-center bg-surface/90 px-1.5 py-0.5 text-center text-label text-on-surface">
                  <span className="flex items-center gap-1">
                    <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-danger" />
                    {IMAGERY.failed}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onRetry(photo.id)
                    }}
                    aria-label={`${TRY_AGAIN}: ${photo.name}`}
                    className={`${textLinkStyles} cursor-pointer`}
                  >
                    {TRY_AGAIN}
                  </button>
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 bg-surface/90 shadow-badge"
                onClick={() => {
                  onRemovePhoto(photo.id)
                }}
                aria-label={`${IMAGERY.remove} ${photo.name}`}
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* The look question has no control that carries aria-invalid, so after a failed Next or a
          refused photo the message announces itself. On the other questions the question pane
          moves focus to the first invalid control instead. */}
      {errors.imagery !== undefined && <FieldError role="alert">{errors.imagery}</FieldError>}

      <p className="text-sm text-on-surface-muted">
        {IMAGERY.caption}{' '}
        <Link href="/privacy" target="_blank" className={textLinkStyles}>
          {PICTURES_LINK}
          <span className="sr-only"> {SITE.newTab}</span>
        </Link>
      </p>
    </div>
  )
}
