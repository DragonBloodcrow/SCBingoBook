import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only proxy (production uses nginx → backend via Docker network)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_TARGET || 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/health': {
        target: process.env.VITE_DEV_API_TARGET || 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});