import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from '@playwright/test'

function loadLocalEnvironment() {
  const path = resolve(process.cwd(), '.env.api.local')
  if (!existsSync(path)) return

  for (const sourceLine of readFileSync(path, 'utf8').split(/\r?\n/u)) {
    const line = sourceLine.trim()
    if (!line || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator < 1) continue

    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] ??= value
  }
}

loadLocalEnvironment()

export default defineConfig({
  testDir: './tests/api',
  globalSetup: './tests/api/support/global-setup.ts',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  projects: [
    { name: 'smoke', testMatch: 'smoke.spec.ts' },
    {
      name: 'flows',
      testMatch: ['admin-workflow.spec.ts', 'core-workflow.spec.ts'],
      dependencies: ['smoke'],
    },
  ],
  outputDir: 'test-results/api/artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/api', open: 'never' }],
    ['json', { outputFile: 'test-results/api/results.json' }],
  ],
  use: {
    baseURL: process.env.E2E_API_BASE_URL ?? 'http://localhost:1174',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    extraHTTPHeaders: { accept: 'application/json' },
  },
})
