import { SITE } from '@/lib/site'

// About the studio, in two short paragraphs. No agency is characterised (a claim about a class
// of competitors cannot be substantiated, CAP 3.7); the one-person fact the privacy page already
// states is said plainly; the count of sites built is the owner's own figure. The six named
// clients sit in the work band at the top of the page (work-items.ts), each shown with their
// permission; "every one came to us through this site" is not said, because four of the six were
// engaged through their group. The owner is named once, here: a free offer with AI in it needs a
// person behind it, and the booking page already shows the name. Contract designers work on
// builds (owner, 21 September 2026), so the line says who runs the studio and stays on the
// build, not that one person does every task. The burn the visitor may have lived through is
// described once on the page, in the first paragraph, and never as a claim about anyone else.

export const ABOUT = {
  heading: 'About the studio',
  first: `${SITE.legalName} is a UK web design studio. If you have hired before, you may know the pattern. A quote, a deposit, a wait, then a first draft. We would rather show you first.`,
  // "since 2021" is the owner's own figure (21 September 2026); docs/claims-register.md row 31
  // carries the record.
  second: `Small on purpose. ${SITE.owner} runs the studio and stays on your build to launch. Contract designers join for builds; you keep one contact. More than thirty websites since 2021. Six of them are open above, with their owners' permission.`,
} as const
