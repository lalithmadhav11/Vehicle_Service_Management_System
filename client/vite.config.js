import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy all /api/* calls to the Express backend so we never have CORS issues
// and hardcoded localhost:5000 URLs are no longer needed in components.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
