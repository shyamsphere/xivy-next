import { defineConfig, devices } from "@playwright/test"

const PORT = process.env.E2E_PORT ?? "3000"
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

/**
 * Runs against an already-running dev/preview server by default. Set
 * E2E_START_SERVER=1 to have Playwright boot `next dev` itself (used in CI).
 *
 * These specs need the commerce backend up as well — they exercise the real
 * cart, checkout and auth flows rather than mocks.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // shared inventory and one seeded catalog
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? "list" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  ...(process.env.E2E_START_SERVER
    ? {
        webServer: {
          command: `pnpm exec next dev -p ${PORT}`,
          url: BASE_URL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }
    : {}),
})
