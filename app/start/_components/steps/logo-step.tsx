'use client'

import { ImageUp, X } from 'lucide-react'
import type { StepProps } from '@/app/start/_components/step-props'
import { Button } from '@/components/ui/button'
import { FilePicker } from '@/components/ui/file-picker'
import { UPLOAD_LIMIT_LABEL } from '@/lib/brief/uploads'

const ACCEPT = 'image/png,image/jpeg,image/svg+xml,image/webp'

type Props = StepProps & {
  preview: string | null
  onFile: (file: File | null) => void
}

// The visitor may skip this. The default answer is a wordmark of their company name, so the
// question is never a blocker.
export function LogoStep({ answers, errors, preview, onFile }: Props) {
  const chosen = answers.logo.kind === 'file' ? answers.logo.fileName : null
  const wordmark = answers.company.trim() === '' ? 'your company name' : answers.company.trim()

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
          <ImageUp aria-hidden="true" className="size-6 text-on-surface-muted" />
          <span className="text-sm font-medium">Choose your logo</span>
          <span className="text-sm text-on-surface-muted">
            PNG, JPEG, SVG or WebP, up to {UPLOAD_LIMIT_LABEL}
          </span>
        </FilePicker>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          {/* A background image, not next/image: this is the visitor's own file in the browser's
              memory, so there is nothing to optimise and nothing to lazy-load. */}
          <span
            aria-hidden="true"
            style={preview === null ? undefined : { backgroundImage: `url(${preview})` }}
            className="size-14 shrink-0 rounded-lg border border-border bg-surface-muted bg-contain bg-center bg-no-repeat"
          />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{chosen}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onFile(null)
            }}
            aria-label="Remove this logo"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
      )}

      {errors.logo !== undefined && (
        <p className="text-sm font-medium text-danger">{errors.logo}</p>
      )}

      <p className="text-sm text-on-surface-muted">
        {chosen === null
          ? `No logo? Leave this and we will set ${wordmark} as a wordmark.`
          : 'We check whether it is light or dark artwork and pick designs that suit it.'}
      </p>
    </div>
  )
}
