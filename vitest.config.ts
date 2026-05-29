import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
      env: {
        VITE_API_BASE_URL: 'http://127.0.0.1:8080',
      },
    },
  }),
)
