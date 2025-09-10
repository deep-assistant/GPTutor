import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '$/api': path.resolve(__dirname, 'src/api'),
      '$/components': path.resolve(__dirname, 'src/components'),
      '$/entity': path.resolve(__dirname, 'src/entity'),
      '$/hooks': path.resolve(__dirname, 'src/hooks'),
      '$/icons': path.resolve(__dirname, 'src/icons'),
      '$/panels': path.resolve(__dirname, 'src/panels'),
      '$/modals': path.resolve(__dirname, 'src/modals'),
      '$/services': path.resolve(__dirname, 'src/services'),
      '$/utility': path.resolve(__dirname, 'src/utility'),
      '$/NavigationContext': path.resolve(__dirname, 'src/NavigationContext'),
      '$/TabbarApp': path.resolve(__dirname, 'src/TabbarApp'),
    },
  },
  server: {
    port: 10888,
    https: true,
  },
  build: {
    sourcemap: false,
  },
  define: {
    global: 'globalThis',
  },
})