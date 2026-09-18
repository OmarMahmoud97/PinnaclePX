import { Star } from 'lucide-react'

// The source's five filled stars beside the hero's portraits, 15px with a light stroke, in its
// orange: the glow here, since they are decoration, never text.
export function Stars() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          aria-hidden="true"
          size={15}
          strokeWidth={1.5}
          className="fill-glow text-glow"
        />
      ))}
    </>
  )
}
