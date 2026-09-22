# Hero gradient scroll animation

How the gradient in the hero moves up as the user scrolls.

## Summary

The gradient does not animate itself. It is a static SVG (`/svg/gradient-fade.svg`) translated upward by a scroll-linked transform on its wrapper element.

## The element

Hero section, first child after the `<canvas>`:

```html
<div
  class="pointer-events-none absolute inset-0 -z-10 origin-top scale-125 will-change-transform"
  style="transform: none"
>
  <img src="/svg/gradient-fade.svg" class="object-cover object-top dark:-scale-y-100" ... />
  <div
    class="from-background absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t to-transparent"
  ></div>
</div>
```

## What gives it away

| Detail                    | Why it matters                                                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `origin-top`              | Anchors the transform to the top of the section.                                                                                                                              |
| `scale-125`               | Overscan. The layer is 125% tall so it can slide up ~25% without exposing a gap at the bottom.                                                                                |
| `will-change-transform`   | Compositor hint you only add for a continuously updating transform.                                                                                                           |
| `style="transform: none"` | Framer Motion's serialisation of a `motion.div` whose transform MotionValue is at rest. scrollY was 0 in both captures, which is why it reads `none` rather than a translate. |

The inner `<div class="from-background ... bg-linear-to-t">` fades the bottom edge into the page background, so the sliding seam is never visible.

## Reconstruction

Speeds and offsets are a guess. The chunk is minified, so the actual values are not readable.

```jsx
const ref = useRef(null);
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start start", "end start"],
});
const y = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

<motion.div
  style={{ y }}
  className="pointer-events-none absolute inset-0 -z-10 origin-top scale-125 will-change-transform"
>
```

## The easing comes from Lenis

The "fun" part is not in the transform. `<html>` carries `class="dark lenis"` with `scroll-behavior: smooth`, so scroll position is lerped before the transform reads it. That is what makes the gradient glide and settle instead of tracking the wheel one to one.

## Caveats

- The stylesheet (`74eb12ccba9dbf15.css`) was not included, so a CSS scroll-driven animation (`animation-timeline: view()`) cannot be fully ruled out. The inline `transform: none` in the SSR output argues strongly against it.
- The `<canvas class="mix-blend-multiply blur">` sitting above the gradient is a separate grain/noise layer, not part of the parallax.

## How to confirm

Scroll a few hundred pixels and inspect the wrapper div. You should see `transform: translateY(-Npx)` on it, with the `<img>` inside untouched.

## In PinnaclePX

The hero's ground does the same thing without JavaScript (21 September 2026, ADR 0031's
amendments): `.hero-ground` in `app/globals.css` is a layer under the ink, moved by a CSS
scroll-driven animation on the section's view timeline. `animation-range: exit` is this
document's `["start start", "end start"]`, and `--hero-ground-rise` (20svh) is the `-20%`. The
overscan is the layer's overhang below the section's foot, with the gradient's ellipse written in
lengths so the overhang continues the ramp instead of re-shaping it, which is why there is no
fade at the seam. The glide comes from Lenis (ADR 0021), as here.
