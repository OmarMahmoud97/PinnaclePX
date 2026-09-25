'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import { useId } from 'react'
import { BRAND, LOGO_STATUS, PICTURES_LINK, TRY_AGAIN } from '@/app/start/_components/start-copy'
import type { LocalLogo, Mark, StepProps } from '@/app/start/_components/step-props'
import { Button } from '@/components/ui/button'
import { ChoiceCard } from '@/components/ui/choice-card'
import { FieldError, Field, fieldStyles } from '@/components/ui/field'
import { FilePicker } from '@/components/ui/file-picker'
import { textLinkStyles } from '@/components/ui/text-link'
import { acceptFor } from '@/lib/brief/uploads'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

const ACCEPT = acceptFor('logos')

type Props = StepProps & {
  logo: LocalLogo | null
  mark: Mark
  // The last logo picked could not be read, so the name stands in.
  unreadable: boolean
  onMark: (mark: Mark) => void
  onFile: (file: File | null) => void
  onRetry: (id: string) => void
}

// What the line under the mark says, if anything: the logo's upload, or why the name stands in.
function statusOf(logo: LocalLogo | null, unreadable: boolean): string | null {
  if (unreadable) return LOGO_STATUS.unreadable
  return logo === null ? null : LOGO_STATUS[logo.status]
}

// The second question (docs/start-page-journey-plan.md, 4.6 and 4.7): the business name, then the
// mark beside it as a choice, their name or their logo. The name is the default, so the question
// never waits on a file; choosing the logo shows the file picker after the group, which an arrow
// never opens. Enter in the name field goes on, as the phone's Next key says.
//
// The chosen logo sits in a tile like the picker it replaces, its preview on white, or on the ink
// when the artwork is light, as the designs will set it; no border on either.
// The error and the status line share one polite live region, so a screen reader hears the
// upload start, finish or fail, and a file refused for its size. A failed upload's error is the
// status line's own sentence, so the status line gives way rather than repeat it, and keeps its
// "Try again".
export function BrandStep({
  answers,
  errors,
  dispatch,
  logo,
  mark,
  unreadable,
  onMark,
  onFile,
  onRetry,
}: Props) {
  const id = useId()
  const groupId = `${id}-mark`
  const status = statusOf(logo, unreadable)

  return (
    <div className="flex flex-col gap-4">
      <Field id={id} label={BRAND.label} error={errors.company}>
        {(attributes) => (
          <input
            {...attributes}
            type="text"
            autoComplete="organization"
            enterKeyHint="next"
            maxLength={CONFIG.start.names.companyMax}
            value={answers.company}
            onChange={(e) => {
              dispatch({ type: 'set-text', field: 'company', value: e.target.value })
            }}
            className={fieldStyles}
          />
        )}
      </Field>

      <div className="flex flex-col gap-1.5">
        <p id={groupId} className="text-sm font-medium">
          {BRAND.mark}
        </p>
        <div role="radiogroup" aria-labelledby={groupId} className="grid gap-2 sm:grid-cols-2">
          <ChoiceCard
            selected={mark === 'name'}
            tabbable={mark === 'name'}
            onSelect={() => {
              onMark('name')
            }}
            title={BRAND.useName}
            detail={BRAND.useNameDetail}
          />
          <ChoiceCard
            selected={mark === 'logo'}
            tabbable={mark === 'logo'}
            onSelect={() => {
              onMark('logo')
            }}
            title={BRAND.useLogo}
            detail={BRAND.useLogoDetail}
          />
        </div>
      </div>

      {mark === 'logo' &&
        (logo === null ? (
          <FilePicker
            accept={ACCEPT}
            onFiles={(files) => {
              onFile(files[0] ?? null)
            }}
            className="justify-center py-4 text-sm font-medium"
          >
            {BRAND.chooseFile}
          </FilePicker>
        ) : (
          <div className="start-tile flex items-center gap-3 rounded-2xl p-3">
            {/* An <img>, so the draft's frames keep the only marks drawn as backgrounds (plan
                5.8), and a plain one, not next/image: this is the visitor's own file in the
                browser's memory, so there is nothing to optimise and nothing to lazy-load. The
                name beside it says what it is. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              src={logo.url}
              data-artwork={logo.polarity ?? undefined}
              data-theme={logo.polarity === 'light-artwork' ? 'dark' : undefined}
              className="size-14 shrink-0 rounded-xl bg-surface object-contain"
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{logo.name}</span>
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => {
                onFile(null)
              }}
              aria-label={BRAND.removeLogo}
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </div>
        ))}

      {/* One region for both lines, and no role="alert" on the error: the polite region already
          announces it, and an alert inside it would be heard twice. */}
      <div aria-live="polite" className="flex flex-col gap-3">
        {errors.logo !== undefined && <FieldError>{errors.logo}</FieldError>}
        {status !== null && status !== errors.logo && (
          <p className="text-sm text-on-surface-muted">{status}</p>
        )}
        {logo?.status === 'failed' && (
          <button
            type="button"
            onClick={() => {
              onRetry(logo.id)
            }}
            className={`${textLinkStyles} cursor-pointer self-start text-sm`}
          >
            {TRY_AGAIN}
          </button>
        )}
      </div>

      <p className="text-sm text-on-surface-muted">
        <Link href="/privacy" target="_blank" className={textLinkStyles}>
          {PICTURES_LINK}
          <span className="sr-only"> {SITE.newTab}</span>
        </Link>
      </p>
    </div>
  )
}
