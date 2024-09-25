import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/trpc/shared-export/trpc.ts'],
  dts: {
    only: true,
  },
  splitting: false,
  clean: true,
  outDir: '../app/app/generated/trpc',
})
