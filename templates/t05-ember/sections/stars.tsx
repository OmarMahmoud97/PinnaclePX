import { Star } from 'lucide-react'

type Props = { size: 'size-3.5' | 'size-4' }

// The source's five filled stars, at the two sizes it draws them. The row that holds them is
// the caller's, since each row spaces and aligns them differently.
export function Stars({ size }: Props) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={`${size} fill-brand-deeper text-brand-deeper`}
        />
      ))}
    </>
  )
}
