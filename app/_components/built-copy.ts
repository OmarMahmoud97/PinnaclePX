// Every word on the finished page the hero builds from the client's brief. The paragraph is the
// brief's own sentence and is not repeated here. The nav, button, eyebrow and headline are the
// hero copy of VetPres's live site; the three feature titles are the studio's. Shown as an
// illustration of a page, never as their site; if VetPres withdraws consent, this is the one file
// to rewrite.
export const BUILT_COPY = {
  nav: ['About', 'Pricing', 'Features'],
  cta: 'Join the waitlist',
  eyebrow: 'Elevating care with secure technology',
  headline: 'Secure and Efficient Pet Prescription Management',
  features: [
    // Each line fits one row of the narrowest card the browser frame draws, at 1024 px.
    { icon: 'shield', title: 'Secure prescribing', line: 'Signed, checked, logged.' },
    { icon: 'stethoscope', title: 'Built for the clinic', line: 'Fits how a practice works.' },
    { icon: 'clipboard', title: 'A full audit trail', line: 'Who did what, and when.' },
  ],
  footer: ['Privacy', 'Terms'],
} as const

export type FeatureIcon = (typeof BUILT_COPY.features)[number]['icon']
