import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    ANTHROPIC_API_KEY: z.string().min(1),
    // Required only for an identity-linked (personal or service account) key, which must name
    // the workspace on every request. A key created inside one workspace needs none.
    ANTHROPIC_WORKSPACE_ID: z.string().min(1).optional(),
    PEXELS_API_KEY: z.string().min(1),
    HMAC_SECRET: z.string().min(32),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
    INNGEST_EVENT_KEY: z.string().min(1),
    INNGEST_SIGNING_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    // The sender, "Name <address>", on a domain verified in Resend. Unset, Resend's test sender
    // is used, which reaches only the account owner's own address.
    RESEND_FROM: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
})
