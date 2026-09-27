import { CONFIG } from '@/lib/config'
import { sendEmail } from '@/lib/email/send'
import { env } from '@/lib/env'
import { AppError } from '@/lib/errors'

// Resend's client as the sender builds it, with one method: the send, answered by each test.
const resend = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock('server-only', () => ({}))
vi.mock('resend', () => ({
  Resend: class {
    readonly emails = { send: resend.send }
  },
}))

const EMAIL = {
  subject: 'Message from Sam Patel',
  text: 'Message from Sam Patel.',
  html: '<p>Message from Sam Patel.</p>',
}

beforeEach(() => {
  resend.send.mockReset().mockResolvedValue({ data: { id: 'email-id' }, error: null })
})

describe('sendEmail', () => {
  it('sends from the configured sender and returns the message id for the log', async () => {
    await expect(sendEmail('owner@example.com', EMAIL)).resolves.toBe('email-id')
    expect(resend.send).toHaveBeenCalledExactlyOnceWith({
      from: env.RESEND_FROM ?? CONFIG.email.testSender,
      to: 'owner@example.com',
      ...EMAIL,
    })
  })

  // Resend reads a key that is present as a reply address, so an email without one leaves the
  // key out rather than sending it undefined.
  it('names a reply address only when the email has one', async () => {
    await sendEmail('owner@example.com', EMAIL)
    expect(resend.send.mock.lastCall?.[0]).not.toHaveProperty('replyTo')
    await sendEmail('owner@example.com', { ...EMAIL, replyTo: 'sam@ashgrove.example' })
    expect(resend.send.mock.lastCall?.[0]).toMatchObject({ replyTo: 'sam@ashgrove.example' })
  })

  it('throws when Resend refuses, so the caller can say so', async () => {
    resend.send.mockResolvedValue({
      data: null,
      error: { name: 'validation_error', statusCode: 422, message: 'Invalid `to` field.' },
    })
    await expect(sendEmail('owner@example.com', EMAIL)).rejects.toThrow(AppError)
    await expect(sendEmail('owner@example.com', EMAIL)).rejects.toThrow('Resend refused the email')
  })
})
