import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

const WEBAPI_TARGET = process.env.VITE_WEBAPI_TARGET || 'http://localhost:8764'

export default defineConfig({
  plugins: [react(), cesium()],
  server: {
    proxy: {
      '/api': {
        target: WEBAPI_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/auth': {
        target: WEBAPI_TARGET,
        changeOrigin: true,
      },
      '/templates': {
        target: WEBAPI_TARGET,
        changeOrigin: true,
      },
      '/schemes': {
        target: WEBAPI_TARGET,
        changeOrigin: true,
      },
    },
  },
})
