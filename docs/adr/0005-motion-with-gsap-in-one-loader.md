# Motion: CSS first, GSAP behind one lazy loader

- Status: accepted
- Date: 3 September 2026

## Context

The home page had no motion beyond hover colours, and the owner asked for it to become engaging, naming GSAP. The research (`docs/home-page-design-research.md`, sections 4 and 5) found that for a page asking a wary visitor to act, motion earns its place only as feedback or as one authored moment, that GSAP 3.15 is free for commercial use with every plugin, and that a static import of GSAP in any client component would land in the initial bundle of a page whose principle is a mid-range phone on 4G.

## Decision

1. **CSS is the default.** Button feedback, the FAQ height transition, the mobile menu, the header's scrolled state and the three list reveals are CSS transitions and keyframes. The reveals hide nothing until JavaScript sets `data-motion` on `<html>`, so the page is complete without it.
2. **GSAP is loaded through one function, `loadGsap` in `lib/motion/gsap.ts`.** It is a cached dynamic import of the core only, run after the browser is idle or the first scroll (`whenIdle`), and only when `prefers-reduced-motion: no-preference` matches. An ESLint rule allows only `lib/motion` to import `gsap`. Plugins join the same loader when an effect earns them; none does today. `@gsap/react` is not used because its `useGSAP` imports GSAP statically, which would defeat the lazy load.
3. **One leaf uses it:** the hero sketch demo (`app/_components/hero-stage.tsx`), a timeline that types an example brief, advances the sketch through its stages and re-tints the frame. The How it works walkthrough switches discrete stages with an IntersectionObserver instead of a scrubbed ScrollTrigger, because its stages are discrete and the observer costs nothing.
4. **The server renders the finished state of every animated element.** A leaf rewinds only on a client that allows motion, so JavaScript off and reduced motion both see the finished sketch, and a failed GSAP load falls back to the finished frame.
5. **Numbers have two homes.** Durations and easings that CSS reads are `--motion-*` and `--ease-*` in `app/globals.css`; timings JavaScript reads are `CONFIG.demo` and `CONFIG.motion` in `lib/config.ts`. CSS cannot read TypeScript, so this is the smallest honest split of the standards' "every tunable number in config" rule.
6. **Never:** pinning, scroll snapping or smoothing, SplitText on the H1 or subhead (one of them is the LCP element at every size), motion on the glow's layers, autoplay loops.

## Consequences

- The GSAP chunk (about 28 KB gzipped for the core) is never referenced from the initial script tags of `/`; `scripts/bundle-budget.mjs` fails the build if it is.
- Reduced-motion visitors never download GSAP; the Playwright `reduced-motion` project asserts it.
- Adding a scrubbed or pinned effect later means extending `loadGsap` to register the plugin and re-reading this record's "never" list.
