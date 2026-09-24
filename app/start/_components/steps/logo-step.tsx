'use client'

import { ImageUp, X } from 'lucide-react'
import type { LocalImage, StepProps } from '@/app/start/_components/step-props'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import { FilePicker } from '@/components/ui/file-picker'
import { acceptFor, UPLOAD_LIMIT_LABEL } from '@/lib/brief/uploads'

const ACCEPT = acceptFor('logos')

const STATUS_LINE = {
  uploading: 'Uploading your logo.',
  done: 'We check whether it is light or dark artwork and pick designs that suit it.',
  failed: 'That logo did not upload. Remove it and try again.',
} as const

type Props = StepProps & {
  logo: LocalImage | null
  onFile: (file: File | null) => void
}

// The visitor may skip this. The default answer is a wordmark of their company name, so the
// question is never a blocker.
//
// The chosen logo sits in a white card like the picker it replaces, its preview on a well of the
// wash, with no border on either. The error and the status line share one polite live region,
// so a screen reader hears the upload start, finish or fail, and a file refused for its size. A
// refused upload's error is the status line's own sentence (use-picture-uploads.ts), so the
// status line gives way rather than repeat it; after an unsupported file it stays, because its
// "Remove it and try again" is the only way back to the picker.
export function LogoStep({ answers, errors, logo, onFile }: Props) {
  const chosen = logo?.name ?? null
  const wordmark = answers.company.trim() === '' ? 'your company name' : answers.company.trim()
  const status =
    logo === null
      ? `No logo? Leave this and we will set ${wordmark} as a wordmark.`
      : STATUS_LINE[logo.status]

  return (
    <div className="flex flex-col gap-3">
      {chosen === null ? (
        <FilePicker
          accept={ACCEPT}
          onFiles={(files) => {
            onFile(files[0] ?? null)
          }}
          className="flex-col gap-2 py-8 text-center"
        >
          <span className="grid size-12 place-items-center rounded-full bg-surface-wash text-brand-ink">
            <ImageUp aria-hidden="true" className="size-6" />
          </span>
          <span className="text-sm font-medium">Choose your logo</span>
          <span className="text-sm text-on-surface-muted">
            PNG, JPEG, SVG or WebP, up to {UPLOAD_LIMIT_LABEL}
          </span>
        </FilePicker>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card">
          {/* A background image, not next/image: this is the visitor's own file in the browser's
              memory, so there is nothing to optimise and nothing to lazy-load. */}
          <span
            aria-hidden="true"
            style={logo === null ? undefined : { backgroundImage: `url(${logo.url})` }}
            className="size-14 shrink-0 rounded-xl bg-surface-wash bg-contain bg-center bg-no-repeat"
          />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{chosen}</span>
          {logo?.status === 'uploading' && (
            <span className="text-label text-on-surface-muted">uploading</span>
          )}
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => {
              onFile(null)
            }}
            aria-label="Remove this logo"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
      )}

      {/* One region for both lines, and no role="alert" on the error: the polite region already
          announces it, and an alert inside it would be heard twice. */}
      <div aria-live="polite" className="flex flex-col gap-3">
        {errors.logo !== undefined && <FieldError>{errors.logo}</FieldError>}
        {status !== errors.logo && <p className="text-sm text-on-surface-muted">{status}</p>}
      </div>
    </div>
  )
}
