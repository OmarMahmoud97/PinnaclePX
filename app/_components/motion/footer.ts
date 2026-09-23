import { CONDITIONS, type SectionContext } from '@/app/_components/motion'
import { CONFIG } from '@/lib/config'

const { choreo, scroll } = CONFIG.motion

// The footer (plan 7.10): from md up the wordmark rises the last parallaxRem into place as the
// sheet scrolls up over the closing, trailing the scroll by scrubLag so it feels weighted. It
// is the page's one <footer>, after <main> rather than inside root, so it is found from the
// document; the tween is still recorded by the context, because the context records whatever
// is made inside it, not only what sits under its scope. The wordmark is decoration that
// never hides content, so it is not owned and needs no settle.
//
// The tween's target is the span inside the wordmark, not the wordmark itself. Its cut is a CSS
// translate on the p (app/_styles/footer.css), and GSAP, before it writes a transform, folds an
// element's own translate, rotate and scale into that transform and sets them to none
// (CSSPlugin's _parseTransform, since 3.12), after which the tween's y replaces the lot and the
// cut is gone. On a child the p's translate is never read, so the two compose: the CSS keeps
// the cut and the transform adds the rise. Phones and reduced motion get the CSS alone: the
// condition never matches, so nothing is set and the server markup stands.
export function footer({ gsap, mm, px }: SectionContext): void {
  const section = document.querySelector<HTMLElement>('footer')
  if (section === null) return
  const wordmark = section.querySelector<HTMLElement>('.wordmark > span')
  if (wordmark === null) return
  mm.add(CONDITIONS, (media) => {
    if (media.conditions?.scrubs !== true) return
    gsap.fromTo(
      wordmark,
      { y: px(choreo.parallaxRem) },
      {
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: scroll.scrubLag,
        },
      },
    )
  })
}
