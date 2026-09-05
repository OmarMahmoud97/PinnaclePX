# Smooth scrolling with Lenis, behind a lazy loader of its own

- Status: accepted
- Date: 5 September 2026
- Amends: ADR 0005 (item 6, scroll smoothing)

## Context

The owner asked for Lenis smooth scrolling across the site. ADR 0005 ruled scroll smoothing out, and the home page design plan (section 8, "Not adopted") gave two reasons: a smoothing wrapper would restructure the root layout around the fixed header and the fragment links, and the research read visitors as leaving over the effect. The first reason no longer holds: Lenis 1.3 drives the window's own scroll position and needs no wrapper, so the fixed header, `scroll-padding-top`, the header's scroll state and the intersection observers all keep working unchanged, and it reads the root's `scroll-padding-top` itself when it scrolls to an element. The second is the owner's call to make, and they have made it.

What had to stay true: a visitor who prefers reduced motion, or has JavaScript off, gets the browser's own scrolling and downloads nothing for the effect; the initial bundle of every page is unchanged; the skip link still moves focus; the nav's section links still work from another page and with the effect absent; the brief's per-question return to the top still lands.

## Decision

1. **Lenis loads the way GSAP does.** `loadLenis` in `lib/motion/lenis.ts` is a cached dynamic import, run by `whenIdle` (now in `lib/motion/idle.ts`, shared with GSAP) and only while `useMotionAllowed` is true, so the chunk (about 8 KB gzipped) is never in the initial script tags and never reaches a reduced-motion visitor. The ESLint rule that confined `gsap` to `lib/motion` now confines `lenis` too, and `scripts/bundle-budget.mjs` fails the build if either is referenced from the home page's initial script tags.
2. **One leaf in the root layout, `SmoothScroll` in `app/_components/smooth-scroll.tsx`,** owns the instance: `autoRaf`, `stopInertiaOnNavigate`, touch left native (Lenis's default, and the cheap choice on the phones the page is built for), the wheel and the link glides eased by `CONFIG.motion.scroll.lerp`. A failed load leaves native scrolling. Turning reduced motion on mid-visit destroys the instance, which strips its classes from `<html>`.
3. **Section links glide through the leaf, not through Lenis's `anchors` option.** A capture-phase click listener on the window handles a link to a fragment of the current page: it prevents the default, pushes the hash through `history.pushState` (which Next's patched `pushState` folds into its router) and asks Lenis to scroll to the element. `next/link` sees the prevented default and stands down, so its own instant `scrollIntoView` never fights the glide. A link to a fragment of another page is left to Next, which navigates and then jumps as before. Lenis's `anchors` option was not used because it does not prevent the default, so the browser's jump and the glide would both run.
4. **The skip link keeps the browser's jump.** It carries `data-lenis-ignore`, which the listener honours, because a fragment jump also moves the focus starting point to `#main` and only the native jump does that.
5. **A scroll to the top goes through `scrollToTop` in `lib/motion/lenis.ts`.** The brief's question pane used `window.scrollTo`, which Lenis overwrites on its next frame if a glide is still in flight; the helper asks Lenis when it is running and the window otherwise.
6. **The CSS is two rules in `app/globals.css`,** both under `html.lenis` so they apply only while Lenis runs: no height on `<html>` or `<body>`, and `scroll-behavior: auto` while Lenis is moving the page, so nothing else's scroll is eased twice.

## Consequences

- Wheel scrolling and the three nav links glide; touch, keyboard, the scrollbar and find-in-page are the browser's own, and so is everything for reduced-motion and no-script visitors, which the `reduced-motion` and `no-script` Playwright projects hold to.
- The initial script bytes of `/` and `/start` are unchanged; the budget script prints a `lenis stays a lazy chunk` line beside GSAP's.
- Playwright's `scrollIntoViewIfNeeded` and the header's scroll listener see native scroll events as before, because Lenis scrolls the window; no existing test changed.
- The design plan's "Not adopted" line for Lenis is superseded by this record; the plan is left as written, as a record of its day.
