// Two stacked radial glows that fade in toward the bottom, drawn as gradients with no filter: a
// blurred layer is rasterised on first paint, and this sits under the LCP viewport. The parent
// must be positioned.
//
// The mask reaches full strength at 55% below md and at 100% from there. On a phone the section
// is far taller than the screen, so a mask that only arrives at its foot left the whole first
// screen white — the colour was there, under the fold, where the visitor who arrives on a phone
// never saw it. The stop is the fix, not more chroma.
export function GlowBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 bg-radial-[at_45%_85%] from-glow/40 via-glow-secondary/10 mask-[linear-gradient(to_bottom,transparent,black_100%)] max-md:mask-[linear-gradient(to_bottom,transparent,black_55%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 bg-radial-[at_45%_70%] from-glow/55 via-glow-secondary/8 via-45% to-transparent to-75% mask-[linear-gradient(to_bottom,transparent,black_100%)] duration-700 ease-standard max-md:mask-[linear-gradient(to_bottom,transparent,black_55%)]"
      />
    </>
  )
}
