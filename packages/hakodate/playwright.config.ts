import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:8799",
    trace: "on-first-retry",
  },
  webServer: {
    command: process.env.CI
      ? "wrangler dev --local --port 8799"
      : "pnpm dev --port 8799",
    url: "http://localhost:8799",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
