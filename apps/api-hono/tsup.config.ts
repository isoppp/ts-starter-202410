import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/trpc/index.export.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
})
