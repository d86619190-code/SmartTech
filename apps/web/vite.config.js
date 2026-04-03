import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    headers: {
      // GSI popup / FedCM: смягчает предупреждения о postMessage при same-origin COOP у прокси/CDN.
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },
  },
  preview: {
    host: true,
    allowedHosts: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: '',
  }
});
