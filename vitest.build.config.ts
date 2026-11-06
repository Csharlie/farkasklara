import { defineConfig } from 'vitest/config'

/**
 * `pnpm test:build` — slow tests that run real `vite build`s (production and
 * staging) and check the output files. Kept apart so `pnpm test` stays fast;
 * the default include pattern (*.test.ts) does not match *.build-test.ts.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.build-test.ts'],
    testTimeout: 240_000,
    hookTimeout: 240_000,
  },
})
