import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env['CI'] ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3010',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'pnpm dev:api',
      url: 'http://127.0.0.1:4000/health',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      command: 'pnpm dev:ui',
      url: 'http://127.0.0.1:3010',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      command: 'pnpm dev:portal',
      url: 'http://127.0.0.1:3001',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
