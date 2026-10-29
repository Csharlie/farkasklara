import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  // Deploy base: '/' by default (dev, final domain); '/farkasklara/' for the
  // pspro.hu preview (`vite build --mode pspro`, .env.pspro → DEPLOY_BASE).
  base: loadEnv(mode, process.cwd(), '').DEPLOY_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@spektra/components': path.resolve(__dirname, '../../sp-platform/packages/components/src/index.ts'),
      '@spektra/layouts': path.resolve(__dirname, '../../sp-platform/packages/layouts/src/index.ts'),
      '@spektra/types': path.resolve(__dirname, '../../sp-platform/packages/types/src/index.ts'),
    },
  },
  server: {
    port: 5177,
  },
}))
