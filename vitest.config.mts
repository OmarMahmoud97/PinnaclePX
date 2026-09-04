import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

// The integration tests under tests/integration reach the development database through
// lib/env, which validates every variable, so the local env files are loaded for tests. In CI
// the placeholders are set by the workflow and those tests skip themselves.
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
