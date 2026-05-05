import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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
});
