// vitest.workspace.{ts,tsx}
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    plugins: [tsconfigPaths()],
    test: {
      include: ['tests/unit/**/*.{test,spec}.{ts,tsx}', '**/*.n.{test,spec}.{ts,tsx}'],
      name: 'node',
      environment: 'node',
      globals: true,
    },
  },
  {
    plugins: [tsconfigPaths()],
    test: {
      include: ['tests/browser/**/*.{test,spec}.{ts,tsx}', '**/*.b.{test,spec}.{ts,tsx}'],
      name: 'browser',
      browser: {
        provider: 'playwright', // or 'webdriverio'
        enabled: true,
        name: 'chromium', // browser name is required
        headless: true,
        screenshotFailures: false,
      },
      environment: 'browser',
      globals: true,
    },
  },
])
