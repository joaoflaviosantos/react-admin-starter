import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: '/',
  plugins: [react(), tsconfigPaths()],
  server: {
    host: '0.0.0.0',
    port: 3001,
  },
  build: {
    target: 'esnext',
  },
});
