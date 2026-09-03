import { LogoMark } from '@/components/brand/logo-mark'
import { SITE } from '@/lib/site'

// Wordmark: mark plus name, inheriting the surrounding text colour.
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
      <LogoMark size={28} />
      {SITE.name}
    </span>
  )
}
