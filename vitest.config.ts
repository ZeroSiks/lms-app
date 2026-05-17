import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 15000,
    hookTimeout: 30000,
    include: ['tests/**/*.test.ts'],
    env: {
      BASE_URL: 'http://localhost:3001',
    },
  },
})
