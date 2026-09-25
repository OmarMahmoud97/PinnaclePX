// next.config.ts imports lib/env.ts, so a variable it refuses fails `next build`. The production
// deployment must name a verified sender, or every email the pages promise would reach only the
// Resend account's owner (docs/start-page-journey-plan.md, D23); a local build, the clean-copy
// gate and a preview deployment must still build without one.

// A fresh copy of the module, validated against the environment as it stands now.
async function load(): Promise<unknown> {
  vi.resetModules()
  return import('@/lib/env')
}

beforeEach(() => {
  // A developer's own .env.local may allow repeat templates, which production also refuses.
  vi.stubEnv('ALLOW_REPEAT_TEMPLATES', undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('RESEND_FROM', () => {
  it('is required on the production deployment', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('RESEND_FROM', undefined)
    await expect(load()).rejects.toThrow('Invalid environment variables')
  })

  it('lets the production deployment build once it is set', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('RESEND_FROM', 'PinnaclePX <hello@pinnaclepx.example>')
    await expect(load()).resolves.toBeDefined()
  })

  it.each([undefined, 'preview', 'development'])(
    'may be left unset where VERCEL_ENV is %s',
    async (vercelEnv) => {
      vi.stubEnv('VERCEL_ENV', vercelEnv)
      vi.stubEnv('RESEND_FROM', undefined)
      await expect(load()).resolves.toBeDefined()
    },
  )
})
