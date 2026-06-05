const hostUrl = process.env.VITE_API_URL || 'http://localhost:5001';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: hostUrl,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: hostUrl,
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: hostUrl,
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
