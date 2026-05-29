import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    // Pin the API base URL for tests so results are independent of .env.local.
    // Must match the BASE constant in src/test/handlers.ts.
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://127.0.0.1:8080'),
    },
    test: {
      environment: 'happy-dom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
    },
  }),
)
