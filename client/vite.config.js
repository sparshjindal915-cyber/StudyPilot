import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In dev, /api is proxied to Express so the auth cookie stays same-origin.
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
