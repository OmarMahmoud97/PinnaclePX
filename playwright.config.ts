import { defineConfig, devices } from '@playwright/test'

// Five ways of looking at the page. The desktop project runs the behaviour suites; the others
// hold the page to its promises on a phone, on a tablet, under reduced motion, and with
// JavaScript off.
export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000' },
  projects: [
    {
      name: 'desktop',
      testMatch: ['home.spec.ts', 'brief.spec.ts', 'a11y.spec.ts'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      testMatch: ['mobile.spec.ts', 'a11y.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'tablet',
      testMatch: ['tablet.spec.ts', 'a11y.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'reduced-motion',
      testMatch: 'reduced-motion.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        contextOptions: { reducedMotion: 'reduce' },
      },
    },
    {
      name: 'no-script',
      testMatch: 'no-script.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        javaScriptEnabled: false,
      },
    },
  ],
})
