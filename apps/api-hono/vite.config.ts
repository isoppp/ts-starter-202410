import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'vprisma',
    setupFiles: ['vitest-environment-vprisma/setup', './src/test/setup.ts'],
  },
})
