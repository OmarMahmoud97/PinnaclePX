import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

// Modules under test import lib/env, which validates every variable on import, so the local env
// files are loaded for tests. In CI the workflow sets placeholders. No test reaches the database.
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    env: loadEnv('test', process.cwd(), ''),
    globals: true,
    environment: 'node', // default; component tests override with a per-file docblock
    include: ['**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '.next/**', 'e2e/**'],
  },
})
