import { defineConfig, devices } from '@playwright/test'

// Five ways of looking at the page. The desktop project runs the behaviour suites; the others
// hold the page to its promises on a phone, on a tablet, under reduced motion, and with
// JavaScript off. Each project takes its files by prefix, so a new spec joins the right project
// by its name alone (mobile-work.spec.ts runs on the phone, brief-shell.spec.ts on the desktop)
// and the axe scans in every a11y*.spec.ts run at all three widths.
// No spec sends a brief: a send runs the paid pipeline, writes the database and emails the
// owner. The done state is reached through its address with the status poll intercepted
// (e2e/helpers/start.ts, ADR 0037).
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
      testMatch: ['home*.spec.ts', 'brief*.spec.ts', 'a11y*.spec.ts'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      testMatch: ['mobile*.spec.ts', 'a11y*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'tablet',
      testMatch: ['tablet*.spec.ts', 'a11y*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'reduced-motion',
      testMatch: 'reduced-motion*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        contextOptions: { reducedMotion: 'reduce' },
      },
    },
    {
      name: 'no-script',
      testMatch: 'no-script*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        javaScriptEnabled: false,
      },
    },
  ],
})
