import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.{test,spec}.{js,ts}'],
    // Increase timeout for model parsing
    testTimeout: 10000
  }
})