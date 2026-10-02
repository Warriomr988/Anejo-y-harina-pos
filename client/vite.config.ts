import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, las llamadas a /api se redirigen al servidor Express.
export default defineConfig({
  // Rutas relativas: el build funciona servido por Express y también
  // empaquetado con Capacitor (esquema capacitor://).
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        changeOrigin: true,
        target: 'http://localhost:3001',
      },
    },
  },
});
