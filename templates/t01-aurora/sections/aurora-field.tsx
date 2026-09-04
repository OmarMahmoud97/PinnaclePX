import type { CSSProperties } from 'react'

type Props = { variant: 'horizon' | 'glow' }

function drift(x: string, y: string): CSSProperties {
  return { '--drift-x': x, '--drift-y': y } as CSSProperties
}

// The light. Radial gradients only, no filter, so nothing is rasterised on first paint, and only
// the glow, brand and surface tokens, so a brand's set recolours it. The parent must be
// positioned and isolated. `horizon` is the hero's: centred on the parent's top edge, so the
// product frame rises out of it, with two clouds of the brand's hues that drift apart as the
// page scrolls. `glow` is a quieter pool along the bottom of a panel.
export function AuroraField({ variant }: Props) {
  if (variant === 'glow') {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-[-20%] -bottom-1/2 h-full bg-radial-[ellipse_50%_55%_at_50%_50%] from-glow/35 via-glow-secondary/15 via-45% to-transparent to-70%" />
      </div>
    )
  }
  return (
    <div
      aria-hidden="true"
      data-bloom
      className="pointer-events-none absolute inset-x-[-20%] top-0 bottom-0 -z-10"
    >
      <div className="absolute top-0 left-1/2 h-[70vh] w-full -translate-x-1/2 -translate-y-1/2 bg-radial-[ellipse_45%_50%_at_50%_50%] from-glow/60 via-glow-secondary/25 via-40% to-transparent to-70%" />
      <div
        data-drift
        style={drift('-6%', '-8%')}
        className="absolute top-[-20vh] left-[5%] h-[50vh] w-[45%] bg-radial from-brand/35 via-brand/10 via-40% to-transparent to-70%"
      />
      <div
        data-drift
        style={drift('6%', '-5%')}
        className="absolute top-[-15vh] right-[5%] h-[45vh] w-[40%] bg-radial from-glow-secondary/45 via-glow-secondary/12 via-40% to-transparent to-70%"
      />
    </div>
  )
}
