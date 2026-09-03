type Props = { tinted?: boolean | undefined }

// Two stacked radial glows that fade in toward the bottom, drawn as gradients with no filter: a
// blurred layer is rasterised on first paint, and this sits under the LCP viewport. With `tinted`
// a third layer in the sketch's colour (--sketch-glow, set by the stage's variables) shows while
// the nearest `group` carries data-tinted, and crossfades only once the group is data-live, so
// the rewind at hydration is instant. The parent must be positioned.
export function GlowBackdrop({ tinted = false }: Props) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 bg-radial-[at_45%_85%] from-glow/40 via-glow-secondary/4 mask-[linear-gradient(to_bottom,transparent,black_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 bg-radial-[at_45%_70%] from-glow/55 via-glow-secondary/3 via-45% to-transparent to-75% mask-[linear-gradient(to_bottom,transparent,black_100%)]"
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
