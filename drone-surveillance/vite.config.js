import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: process.env.VITE_WS_URL || 'ws://localhost:8080',
        ws: true,
        changeOrigin: true
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || ''),
    'process.env.VITE_WS_URL': JSON.stringify(process.env.VITE_WS_URL || ''),
    global: 'globalThis'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three']
  }
})
