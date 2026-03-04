import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // index.ts = MCP server wiring (no domain logic), types.ts = interfaces only
      exclude: ['src/tests/**', 'src/index.ts', 'src/types.ts'],
      thresholds: {
        lines: 99,
        branches: 99,
        functions: 100,
        statements: 99,
      },
      reporter: ['text', 'lcov', 'json-summary'],
    },
  },
})
