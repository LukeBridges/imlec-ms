/// <reference types="vitest" />
import { defineConfig } from 'vite';

import angular from '@analogjs/vite-plugin-angular';

export default defineConfig(({ mode }) => ({
  plugins: [angular()],
  test: {
    setupFiles: ['setupVitest.ts'],
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/test/**', 'src/main.ts', 'src/polyfills.ts', 'src/environments/**'],
      reporter: ['text', 'html'],
      thresholds: {
        100: true,
        perFile: true,
      },
    },
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
