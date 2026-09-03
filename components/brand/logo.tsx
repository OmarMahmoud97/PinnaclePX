import { LogoMark } from '@/components/brand/logo-mark'
import { SITE } from '@/lib/site'

type Props = { nameClassName?: string | undefined }

// Wordmark: mark plus name, inheriting the surrounding text colour. The name can be hidden by
// the caller (the phone header does, once the primary button needs the room).
export function Logo({ nameClassName }: Props) {
  return (
    <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
      <LogoMark size={28} />
      <span className={nameClassName}>{SITE.name}</span>
    </span>
  )
}
