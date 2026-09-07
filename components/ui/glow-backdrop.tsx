type Props = { tinted?: boolean | undefined }

// Two stacked radial glows that fade in toward the bottom, drawn as gradients with no filter: a
// blurred layer is rasterised on first paint, and this sits under the LCP viewport. With `tinted`
// a third layer in the sketch's colour (--sketch-glow, set by the stage's variables) shows while
// the nearest `group` carries data-tinted, and crossfades only once the group is data-live, so
// the rewind at hydration is instant. The parent must be positioned.
//
// The mask reaches full strength at 55% below md and at 100% from there. On a phone the section
// is far taller than the screen, so a mask that only arrives at its foot left the whole first
// screen white — the colour was there, under the fold, where the visitor who arrives on a phone
// never saw it. The stop is the fix, not more chroma.
//
// The second layer steps back to 45% while the sketch holds a client's colour, so the studio's
// cyan gives way to the brand being painted instead of stacking with it. That crossfade is the
// page's one authored payoff; opacity only, on the group's existing data-live/data-tinted
// contract, so reduced motion still receives it (WCAG 2.3.3 excludes opacity) and nothing new
// loads to draw it.
export function GlowBackdrop({ tinted = false }: Props) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 bg-radial-[at_45%_85%] from-glow/40 via-glow-secondary/10 mask-[linear-gradient(to_bottom,transparent,black_100%)] max-md:mask-[linear-gradient(to_bottom,transparent,black_55%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 bg-radial-[at_45%_70%] from-glow/55 via-glow-secondary/8 via-45% to-transparent to-75% mask-[linear-gradient(to_bottom,transparent,black_100%)] duration-700 ease-standard group-data-live:transition-opacity group-data-tinted:opacity-45 max-md:mask-[linear-gradient(to_bottom,transparent,black_55%)]"
      />
      {tinted && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-1 bg-radial-[at_45%_85%] from-(--sketch-glow) to-transparent to-65% mask-[linear-gradient(to_bottom,transparent,black_100%)] opacity-0 duration-700 ease-standard group-data-live:transition-opacity group-data-tinted:opacity-100"
        />
      )}
    </>
  )
}
