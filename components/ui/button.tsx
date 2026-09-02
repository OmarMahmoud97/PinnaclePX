import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-brand/50'

const VARIANTS = {
  primary: 'bg-brand text-on-brand hover:bg-brand-deep',
  cta: 'bg-linear-to-b from-brand to-brand-deep text-on-brand shadow-cta ring-2 ring-brand-deep hover:from-brand-deep hover:to-brand-deeper',
  contrast: 'bg-on-surface text-surface hover:bg-on-surface/80',
  outline: 'border border-border bg-surface hover:bg-accent',
  ghost: 'border border-transparent hover:border-border hover:bg-accent',
} as const

const SIZES = {
  sm: 'h-8 px-4 text-sm',
  md: 'h-9 px-5 text-sm',
  lg: 'h-12 px-8 text-base',
  icon: 'size-8',
} as const

type StyleOptions = {
  variant?: keyof typeof VARIANTS | undefined
  size?: keyof typeof SIZES | undefined
  className?: string | undefined
}

// Class string for anything that should look like a button, including <Link>.
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: StyleOptions = {}): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className)
}

type Props = ComponentProps<'button'> & StyleOptions

export function Button({ variant, size, className, type = 'button', ...rest }: Props) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...rest} />
}
