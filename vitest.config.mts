import { defineConfig } from 'vitest/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/test/**', 'playwright-report/**, test-results/**'],
    deps: {
      inline: ['wagmi', 'wagmi/core']
    }
  }
})