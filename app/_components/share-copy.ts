// The not-ready path: send the page to whoever decides with you. It captures nothing, so the
// "No sign-up" promise stays true. The sentence is split so the middle can be the control. The
// subject is about the decision the two of them are making, not the free designs: it arrives
// from a colleague's address, and a subject that sells reads as forwarded advertising.
export const SHARE = {
  subject: 'A studio for our new website',
  body: 'I thought this might be worth a look. They show designs in our colours first, free.',
  action: 'Send this page',
  copied: 'Link copied.',
} as const

export const NOT_READY = {
  lead: 'Not ready?',
  tail: 'to whoever decides with you.',
} as const

// The whole sentence, for the copy test.
export const NOT_READY_SENTENCE = `${NOT_READY.lead} ${SHARE.action} ${NOT_READY.tail}`
