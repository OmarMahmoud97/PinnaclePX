// The not-ready path: send the page to whoever decides with you. It captures nothing, so the
// "No sign-up" promise stays true. The sentence is split so the middle can be the control.
export const SHARE = {
  subject: 'Three homepage designs before you hire',
  body: 'I thought this might be worth a look.',
  action: 'Send this page',
  copied: 'Link copied.',
} as const

export const NOT_READY = {
  lead: 'Not ready?',
  tail: 'to whoever decides with you.',
} as const

// The whole sentence, for the copy test.
export const NOT_READY_SENTENCE = `${NOT_READY.lead} ${SHARE.action} ${NOT_READY.tail}`
