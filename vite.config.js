import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
<<<<<<< HEAD
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src/renderer') },
  },
  server: { port: 5173 },
=======
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    // Polyfill Node.js built-ins used by simple-peer (events, util, stream, buffer)
    nodePolyfills({
      include:  ['events', 'util', 'stream', 'buffer', 'process'],
      globals: { Buffer: true, global: true, process: true },
    }),
  ],
  root:  join(__dirname, 'src/renderer'),
  base:  './',
  build: {
    outDir:      join(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@shared':     join(__dirname, 'src/shared'),
      '@store':      join(__dirname, 'src/renderer/store'),
      '@hooks':      join(__dirname, 'src/renderer/hooks'),
      '@components': join(__dirname, 'src/renderer/components'),
      '@pages':      join(__dirname, 'src/renderer/pages'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['simple-peer'],
  },
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
});
