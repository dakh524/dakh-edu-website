import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    // Proxy /api/* to Vercel Dev (port 3000) so serverless functions are
    // reachable from the Vite dev server (port 5173) during local development.
    // In production Vercel handles /api/* natively — this proxy is only active
    // during `npm run dev` and has no effect on the production build.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // No rewrite — keep the /api prefix so Vercel Dev serves the right handler
      }
    }
  }
})
