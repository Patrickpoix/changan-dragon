import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: { port: 5180, host: '0.0.0' },
  preview: { port: 4899, host: '127.0.0.1' },
  build: { target: 'esnext', outDir: 'dist' }
});
