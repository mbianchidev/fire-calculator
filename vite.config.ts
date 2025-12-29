import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'handle-trailing-slash',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Handle /fire-tools?params by rewriting to /fire-tools/?params
          // Only process exact /fire-tools or /fire-tools? paths
          if (req.url === '/fire-tools') {
            req.url = '/fire-tools/';
          } else if (req.url?.startsWith('/fire-tools?')) {
            req.url = '/fire-tools/' + req.url.slice('/fire-tools'.length);
          }
          next();
        });
      },
    },
  ],
  base: mode === 'production' ? '/fire-tools/' : '/',
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
}))
