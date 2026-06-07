import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  plugins: [react(), cesium()],
  server: {
    proxy: {
      '/api': {
        target: 'http://astrox.cn:8764',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/templates': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/schemes': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
