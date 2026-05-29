import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'
import { TEST_API_BASE } from './src/test/constants'

export default mergeConfig(
  viteConfig,
  defineConfig({
    // Pin the API base URL for tests so results are independent of .env.local.
    // Derived from src/test/constants.ts — the same value used in MSW handlers.
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(TEST_API_BASE),
    },
    test: {
      environment: 'happy-dom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
    },
  }),
)
