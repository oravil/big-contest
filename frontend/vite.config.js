/**
 * vite.config.js — dev server with API proxy to the Express backend.
 *
 * In dev: requests to /api/* are proxied to http://localhost:3001.
 * In production: set `base` (and VITE_API_URL) per the deployment target.
 *
 * To deploy under GitHub Pages, set BASE_PATH (or uncomment the base line):
 *   base: '/bigShawerma-contest/'
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // base: '/bigShawerma-contest/', // enable for GitHub Pages deploy
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
