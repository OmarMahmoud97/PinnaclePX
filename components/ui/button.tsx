import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

// Focus ring at full opacity with an offset, so it reads on filled and unfilled surfaces alike.
// Hover changes colour only; a press scales the button down a touch (never under reduced
// motion), which is the feedback a slow tap on 4G needs so the visitor does not tap twice.
const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[color,background-color,border-color,transform] duration-(--motion-tap) ease-standard outline-none focus-visible:ring-2 focus-visible:ring-brand-deeper focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'

// Fills that carry white text start at --brand-deeper (5.93:1). --brand is decoration only.
const VARIANTS = {
  primary: 'bg-brand-deeper text-on-brand hover:bg-brand-deepest',
  cta: 'bg-linear-to-b from-brand-deeper to-brand-deepest text-on-brand shadow-cta ring-2 ring-brand-deepest hover:from-brand-deepest hover:to-brand-deepest',
  contrast: 'bg-on-surface text-surface hover:bg-on-surface/80',
  outline: 'border border-border bg-surface hover:bg-accent',
  ghost: 'border border-transparent hover:border-border hover:bg-accent',
} as const

// No text button is under 40px tall; anything that opens /start or the booking page is lg.
const SIZES = {
  sm: 'h-8 px-4 text-sm',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-8 text-base',
  icon: 'size-8',
  'icon-lg': 'size-10', // 40px: a comfortable touch target on a phone
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
