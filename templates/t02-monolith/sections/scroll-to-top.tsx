import { ArrowUpToLine } from 'lucide-react'
import { button } from '../styles'

// The source's ScrollToTop: a filled icon button fixed at the lower right, shown once the page
// has scrolled 400px. A plain anchor revealed by the scroll (monolith.css), so no script.
export function ScrollToTop() {
  return (
    <a
      href="#top"
      aria-label="Back to top"
      className={`${button.icon} monolith-top fixed right-4 bottom-4 opacity-90 shadow-md`}
    >
      <ArrowUpToLine className="h-4 w-4" />
    </a>
  )
}
