import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// The pipeline eval (tests/eval/*.eval.ts) runs only through `pnpm eval`: it calls the model
// and Pexels and spends money, so vitest.config.ts, the hooks and CI never pick its files up
// (their include is *.test.ts). It reads the local env files the way the unit config does.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    env: loadEnv('test', process.cwd(), ''),
    environment: 'node',
    include: ['tests/eval/**/*.eval.ts'],
    fileParallelism: false,
    testTimeout: 3_600_000,
    hookTimeout: 3_600_000,
  },
})
