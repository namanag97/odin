import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['**/*.ts'],
      exclude: ['**/*.test.ts', 'vitest.config.ts', 'dist/**'],
    },
  },
});
