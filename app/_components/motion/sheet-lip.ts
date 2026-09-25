import { CONDITIONS, type SectionContext } from '@/app/_components/motion'
import { drive } from '@/app/_components/motion/liquid'
import { type LipGeometry, lipPath, restLipPath, SHEET } from '@/lib/motion/lip-curve'

// The footer sheet's lip (app/_components/site-footer.tsx; .sheet-lip in app/globals.css; ADR
// 0034, amendment of 25 September 2026). The server markup is the sheet with its CSS corners,
// which phones and reduced motion keep. From md up, with motion allowed, this takes the edge
// over: it marks the sheet (data-lip, which drops the CSS corners, leaves the top strip of the
// sheet unpainted and shows the lip), measures the sheet's width and its corners' radius, and
// draws the same corners as one path in those pixels, which the chain then moves with the
// scroll (lib/motion/chain.ts, lib/motion/lip-curve.ts): the flat top sags as the page glides
// down, swells past rest once it stops and settles with a wobble, the corners pinned. The
// viewBox is the sheet's own pixels, so a corner is a true circle at every width; a settled
// resize refreshes every trigger and the refresh re-measures. Each frame writes the path's `d`,
// which repaints the lip's own layer and nothing else. The footer is the page's one <footer>,
// after <main>, so it is found from the document as footer.ts finds it.
export function sheetLip({ ScrollTrigger, gsap, mm }: SectionContext): void {
  const sheet = document.querySelector<HTMLElement>('footer.sheet')
  const lip = sheet?.querySelector<SVGSVGElement>(':scope > .sheet-lip') ?? null
  const path = lip?.querySelector('path') ?? null
  if (sheet === null || lip === null || path === null) return

  mm.add(CONDITIONS, (media) => {
    if (media.conditions?.scrubs !== true || ScrollTrigger === undefined) return
    let geometry: LipGeometry = { width: 0, radius: 0 }
    const measure = () => {
      const { width, height } = lip.getBoundingClientRect()
      geometry = { width, radius: height }
      lip.setAttribute('viewBox', `0 0 ${String(width)} ${String(height)}`)
    }
    const rest = () => {
      path.setAttribute('d', restLipPath(geometry))
    }
    // The mark shows the lip, so it is measured once marked, and drawn at rest in the same
    // frame the CSS corners go, so nothing flashes.
    sheet.setAttribute('data-lip', '')
    measure()
    rest()
    const stop = drive({
      gsap,
      ScrollTrigger,
      trigger: sheet,
      chain: SHEET,
      draw: (state) => {
        path.setAttribute('d', lipPath(state, geometry))
      },
      rest,
      onRefresh: measure,
    })
    return () => {
      stop()
      sheet.removeAttribute('data-lip')
      path.removeAttribute('d')
    }
  })
}
