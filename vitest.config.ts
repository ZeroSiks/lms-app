import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 15000,
    hookTimeout: 30000,
    env: {
      BASE_URL: 'http://localhost:3001',
    },
  },
})
