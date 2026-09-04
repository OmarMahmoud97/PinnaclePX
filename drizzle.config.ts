import { existsSync } from 'node:fs'
import { defineConfig } from 'drizzle-kit'

// drizzle-kit runs outside Next.js, so nothing loads .env.local for it.
// Read only DATABASE_URL here; the full validated env in lib/env.ts is for the app.
if (!process.env.DATABASE_URL && existsSync('.env.local')) process.loadEnvFile('.env.local')

const url = process.env.DATABASE_URL
if (!url)
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env.local or run `vercel env pull`.',
  )

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './db',
  dbCredentials: { url },
})
