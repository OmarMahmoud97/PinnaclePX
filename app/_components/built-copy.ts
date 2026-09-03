// Every word on the finished page the hero builds from the example brief. The paragraph is the
// brief's own sentence and is not repeated here. The rest is the hero copy of the reference
// site the example is drawn from; if VetPres is treated as an invented example, this is the one
// file to rewrite.
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
