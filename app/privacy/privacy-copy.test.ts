import { describe, expect, it } from 'vitest'
import { CONTACT_PRIVACY, RIGHTS_LINK } from '@/app/privacy/privacy-copy'

// The page links these words where they fall in the sentence (app/privacy/page.tsx), so a
// rewording that lost them would lose the way to the contact page with them, and silently.
describe('the privacy notice', () => {
  it('keeps the linked words inside the way to use the rights', () => {
    expect(CONTACT_PRIVACY.rightsRoute).toContain(RIGHTS_LINK)
  })
})
