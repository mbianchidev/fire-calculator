import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'handle-trailing-slash',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Handle /fire-calculator?params by rewriting to /fire-calculator/?params
          if (req.url) {
            const startsWithBase = req.url.startsWith('/fire-calculator');
            const hasTrailingSlash = req.url.startsWith('/fire-calculator/');
            const hasQuery = req.url.includes('?');
            
            if (startsWithBase && !hasTrailingSlash && hasQuery) {
              // Rewrite /fire-calculator?params to /fire-calculator/?params
              req.url = req.url.replace('/fire-calculator?', '/fire-calculator/?');
            } else if (startsWithBase && !hasTrailingSlash && !hasQuery) {
              // Rewrite /fire-calculator to /fire-calculator/
              req.url = '/fire-calculator/';
            }
          }
          next();
        });
      },
    },
  ],
  base: '/fire-calculator/',
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
