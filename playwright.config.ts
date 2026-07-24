import { defineConfig, devices } from '@playwright/test';

// 本機驗證時可用 PW_EXECUTABLE 指定 Chromium 執行檔；CI 用 `playwright install` 取得
const executablePath = process.env.PW_EXECUTABLE;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:4173/travel/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  use: {
    baseURL: 'http://127.0.0.1:4173/travel/',
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
