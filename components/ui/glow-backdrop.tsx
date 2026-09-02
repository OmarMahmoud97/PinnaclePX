// Two stacked radial glows that fade in toward the bottom. The parent must be positioned.
export function GlowBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 bg-radial-[at_45%_85%] from-glow/40 via-glow-secondary/4 mask-[linear-gradient(to_bottom,transparent,black_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 bg-radial-[at_45%_68%] from-glow/68 via-glow-secondary/3 mask-[linear-gradient(to_bottom,transparent,black_100%)] blur-[50px]"
      />
    </>
  )
}
