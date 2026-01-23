import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
      clientPort: 3000
    },
    watch: {
      usePolling: false
    },
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    }
  },
  build: {
    target: 'esnext'
  }
});
